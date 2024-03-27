import json
import sys
import time

import net
from net import *
import torch
from func import argsoftmax
import math

data = {
  "normal": [], # 정상 범주의 점들을 표시함. 녹색으로 표시될 점들임.
  "user": [], #사용자가 찍는 점, 오랜지색으로 표시되며 인공지능에서 생성하지 않아도 됨.
  "predicted": [ #인공지능이 예측한 점, 빨간색으로 표시됨.
    # {
    #   "x": 3000.6936, #사진의 해상도 기준 x 좌표
    #   "y": 3000.3784, #사진의 해상도 기준 y 좌표
    #   "name": "p1", #점의 이름, 직선을 연결할 점이 아니라면 ""로 공백처리 가능.
    #   "type": 'U1NA'
    # },
    # {
    #   "x": 1000.6936,
    #   "y": 1000.3784,
    #   "name": "p2",
    # }
  ],
  "line":[ #점과 점 사이를 잇는 직선을 표시함.
    # {
  #     "name":"distance", # 거리를 이름으로
  #     "start":"p1", #점1의 이름
  #     "end":"p2", #점2의 이름
  #     "color":"red", #직선의 색 (red, blue, green, orange 중 택 1),
  #     "type":"필터 번호" # upper case
  #     # "distance":''
  #   }
  ],
  "angle":[
  #   {
  #     "center":
  #     {
	#     "x":'1440',
	#     "y":'1200'
	#   },
	#   "p1": {
	# 	    "x":'1740',
	# 	    "y":'1200'
	#     },
  #       "angle": 130
  #       }
    ]
}


class Line:
    def __init__(self, point1, point2):
        self.point1 = point1
        self.point2 = point2

        self.m = (self.point1[0] - self.point2[0]) / (self.point1[1] - self.point2[1])
        self.n = (self.point2[0] - (self.m * self.point2[1]))

    @staticmethod
    def get_center(l1_m, l2_m, l1_n, l2_n):
        cx = (l2_n - l1_n) / (l1_m - l2_m)
        cy = l1_m * ((l2_n - l1_n) / (l1_m - l2_m)) + l1_n

        return [cx, cy]

    @staticmethod
    def angle_between_lines(l1_m, l2_m, types):
        rad = abs(math.atan((l2_m - l1_m) / (1 + l1_m * l2_m)))

        return math.degrees(rad) if types != 'u1l1' else 180 - math.degrees(rad)

    def get_line_points(self, cx, name):
        return [[cx - 200, self.get_y(cx - 200), f'{name}_p1'], [cx + 200, self.get_y(cx + 200), f'{name}_p2']]

    def get_y(self, x):
        return self.m * x + self.n

    def get_x(self, y):
        return (y - self.n) / self.m


class Model:
    def __init__(self):
        self.orig_W = None
        self.orig_H = None

        self.device_txt = 'cuda:0' if torch.cuda.is_available() else 'cpu'

        self.landmark_combi = [['u1', 'u1_c', 'l1', 'l1_c', 'u1l1'], ['u1_c', 'u1', 'n', 'point_a', 'u1na'],
                               ['l1_c', 'l1', 'n', 'point_b', 'l1nb']]

        # upper case
        self.landmark_name = [['', 'n', '', '', 'point_a', 'point_b', '', '', '', '', 'l1', 'u1', '', '',
                              '', '', '', '', '', '', 'u1_c', 'l1_c', '', '', '', '', '',
                              '', '', '', '', '', '', '', '', '', '', ''],
                              ['', 'u1na,l1nb', '', '', 'u1na', 'l1nb', '', '', '', '', 'u1l1,l1nb', 'u1l1,u1na', '', '',
                              '', '', '', '', '', '', 'u1l1,u1na', 'u1l1,l1nb', '', '', '', '', '',
                              '', '', '', '', '', '', '', '', '', '', '']]

        # self.landmark_name = ['s', 'n', 'or', 'po', 'pointA', 'pointB', 'pog', 'co', 'gn', 'go', 'L1', 'u1', '13', 'Li',
        #                       'sn', 'softpog', '17', 'ans', '19', '20', 'u1_c', 'L1_c', '23', '24', '25', 'prn', '27',
        #                       '28', '29', '30', 'sm', 'softgn', 'gn2', 'GLA', 'SoftN', '36', 'u6', 'L6']

        self.model = net.UNet(1, 38).to(self.device_txt)
        self.model.load_state_dict(torch.load('./model/model.pth', map_location=self.device_txt))

        self.H, self.W = [800, 640]

    def predict(self, fileDir):
        time.sleep(0.5)
        self.test_data = DataLoader(dataload(path=fileDir, H=self.H, W=self.W, aug=False, mode='img'),
                                    batch_size=1, shuffle=False, num_workers=0)

        img = cv2.imread(fr'{fileDir}')

        self.orig_H = img.shape[0]
        self.orig_W = img.shape[1]

        y_map, x_map = np.mgrid[0:self.H:1, 0:self.W:1]
        y_map, x_map = torch.tensor(y_map.flatten(), dtype=torch.float).unsqueeze(1).to(self.device_txt), \
            torch.tensor(x_map.flatten(), dtype=torch.float).unsqueeze(1).to(self.device_txt)

        with torch.no_grad():
            for inputs in self.test_data:
                inputs = inputs.to(self.device_txt)

                outputs = self.model(inputs)
                # print(outputs.detach().cpu().numpy().shape)
                pred = torch.cat([argsoftmax(outputs[0].view(-1, self.H * self.W), y_map, beta=1e-3) * (self.orig_H / self.H),
                                  argsoftmax(outputs[0].view(-1, self.H * self.W), x_map, beta=1e-3) * (self.orig_W / self.W)],
                                 dim=1).detach().cpu()

            self.pred = list(pred.detach().cpu().numpy())

    def write_json(self, path):  # 클래스 분리?
        json_name = path + 'json'
        # path =
        with open(json_name, 'w') as outfile:
            # 이름 필터링 출력할 애만
            data["predicted"] = [{"x": float(self.pred[i][1]), "y": float(self.pred[i][0]), "name": f"{name.upper()}", "type": types.upper()}
                                 for i, name, types in zip(range(len(self.pred)), self.landmark_name[0], self.landmark_name[1])]

            data["angle"] = []
            data["line"] = []
            for point1, point2, point3, point4, types in self.landmark_combi:
                line1 = Line(self.pred[self.landmark_name[0].index(point1)], self.pred[self.landmark_name[0].index(point2)])
                line2 = Line(self.pred[self.landmark_name[0].index(point3)], self.pred[self.landmark_name[0].index(point4)])

                center_x, center_y = Line.get_center(line1.m, line2.m, line1.n, line2.n)
                # print(center_x, center_y)
                # print('----------------------------------------------')

                line_point = line1.get_line_points(center_x, f'{types}_l1') + line2.get_line_points(center_x, f'{types}_l2')
                # print(line_point)
                data["predicted"] += [{"x": float(x), "y": float(y), "name": name, "type": types.upper()} for x, y, name in line_point]
                data["line"] += [{"start": line_point[i][2], "end": line_point[i+1][2], "type": types.upper(), "color": "green"} for i in range(0, len(line_point), 2)]

                if types == 'u1na':
                    angle_point = [line2.get_x(center_y - 150), center_y - 150]
                elif types == 'l1nb':
                    angle_point = [line1.get_x(center_y - 150), center_y - 150]
                else:
                    angle_point = [line1.get_x(center_y + 150), center_y + 150]

                # print("angle", angle_point)
                # print(f'{types}   m:', line1.m, line2.m)
                angle = Line.angle_between_lines(line1.m, line2.m, types)
                data["angle"].append({"center": {"x": float(center_x), "y": float(center_y)}, "p1": {"x": float(angle_point[0]), "y": float(angle_point[1])}, "angle": angle, "type": types.upper()})

                # print(data["angle"])
            # print('----------------------------------------------')
            # print(line_point)
            json.dump(data, outfile)
