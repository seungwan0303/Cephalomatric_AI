package kr.ac.wku.cephalometricai.properties;

import kr.ac.wku.cephalometricai.dto.Angle;
import kr.ac.wku.cephalometricai.dto.Line;
import kr.ac.wku.cephalometricai.dto.Point;
import kr.ac.wku.cephalometricai.dto.PointsDTO;
import kr.ac.wku.cephalometricai.entity.Image;
import lombok.Getter;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import org.springframework.boot.context.properties.ConfigurationProperties;

import java.io.*;
import java.util.UUID;

@ConfigurationProperties("privatecloud")
@Getter
public class PrivateCloudProperties {
    private String path = "cloud";


    private JSONObject pointToJson(Point point){
        JSONObject pointObj = new JSONObject();
        pointObj.put("x", point.getX());
        pointObj.put("y", point.getY());
        pointObj.put("name", point.getName() == null ? "" : point.getName());
        pointObj.put("type", point.getType());
        return pointObj;
    }

    private Point jsonToPoint(JSONObject pointObj){
        return new Point(
                pointObj.get("name") == null ? "" : pointObj.get("name").toString(),
                Float.parseFloat(pointObj.get("x").toString()),
                Float.parseFloat(pointObj.get("y").toString()),
                pointObj.get("type") == null ? "" : pointObj.get("type").toString()
        );
    }

    private JSONObject lineToJson(Line line){
        JSONObject lineObj = new JSONObject();
        lineObj.put("start", line.getStart());
        lineObj.put("end", line.getEnd());
        lineObj.put("name", line.getName() == null ? "" : line.getName());
        lineObj.put("color", line.getColor());
        lineObj.put("type", line.getType());
        lineObj.put("display", line.isDisplay());
        return lineObj;
    }

    private Line jsonToLine(JSONObject lineObj){
        return new Line(
                lineObj.get("name") == null ? "" : lineObj.get("name").toString(),
                lineObj.get("start").toString(),
                lineObj.get("end").toString(),
                lineObj.get("color").toString(),
                lineObj.get("type") == null ? "" : lineObj.get("type").toString(),
                lineObj.get("display") != null && Boolean.parseBoolean(lineObj.get("display").toString())
        );
    }

    private JSONObject angleToJson(Angle angle){
        JSONObject angleObj = new JSONObject();
        JSONObject centerObj = new JSONObject();
        JSONObject p1Obj = new JSONObject();
        centerObj.put("x", angle.getCenter().getX());
        centerObj.put("y", angle.getCenter().getY());
        p1Obj.put("x", angle.getP1().getX());
        p1Obj.put("y", angle.getP1().getY());
        angleObj.put("center", centerObj);
        angleObj.put("p1", p1Obj);
        angleObj.put("type", angle.getType());
        angleObj.put("angle", angle.getAngle());
        return angleObj;
    }

    private Angle jsonToAngle(JSONObject angleObj){
        JSONObject centerObj = (JSONObject) angleObj.get("center");
        JSONObject p1Obj = (JSONObject) angleObj.get("p1");
        Point center = new Point(null,
                Float.parseFloat(centerObj.get("x").toString()),
                Float.parseFloat(centerObj.get("y").toString()),
                null);
        Point p1 = new Point(null,
                Float.parseFloat(p1Obj.get("x").toString()),
                Float.parseFloat(p1Obj.get("y").toString()),
                null);
        return new Angle(
                center,
                p1,
                Double.parseDouble(angleObj.get("angle").toString()),
                angleObj.get("type") == null ? "" : angleObj.get("type").toString()
        );
    }

    public void setPoints(Image image, PointsDTO dto) throws IOException {
        UUID uuid = image.getOwner();
        String fileUUID = image.getSystemPath().substring(0, image.getSystemPath().indexOf('.'));
        File jsonFile = new File(path + "/" + uuid.toString() + "/" + fileUUID + ".json");
        if(!jsonFile.exists()) return;
        JSONObject object = new JSONObject();
        JSONArray predictedArray = new JSONArray();
        JSONArray normalArray = new JSONArray();
        JSONArray userArray = new JSONArray();
        JSONArray lineArray = new JSONArray();
        JSONArray angleArray = new JSONArray();
        for(Point point : dto.getPredicted())
            predictedArray.add(pointToJson(point));
        for(Point point : dto.getNormal())
            normalArray.add(pointToJson(point));
        for(Point point : dto.getUser())
            userArray.add(pointToJson(point));
        for(Line line : dto.getLines())
            lineArray.add(lineToJson(line));
        for(Angle angle : dto.getAngles())
            angleArray.add(angleToJson(angle));
        object.put("predicted", predictedArray);
        object.put("normal", normalArray);
        object.put("user", userArray);
        object.put("line", lineArray);
        object.put("angle", angleArray);
        FileWriter file = new FileWriter(jsonFile);
        file.write(object.toJSONString());
        file.flush();
        file.close();
    }

    public PointsDTO getPoints(Image image){
        try{
            UUID uuid = image.getOwner();
            String fileUUID = image.getSystemPath().substring(0, image.getSystemPath().indexOf('.'));
            File jsonFile = new File(path + "/" + uuid.toString() + "/" + fileUUID + ".json");
            if(!jsonFile.exists()) return PointsDTO.empty();
            String line;
            BufferedReader br = new BufferedReader(new FileReader(jsonFile));
            StringBuilder sb = new StringBuilder();
            while((line = br.readLine()) != null) sb.append(line);
            br.close();
            if(sb.isEmpty()) return PointsDTO.empty();
            JSONObject object = (JSONObject) new JSONParser().parse(sb.toString());

            JSONArray predictedArray = (JSONArray) object.get("predicted");
            JSONArray normalArray = (JSONArray) object.get("normal");
            JSONArray userArray = (JSONArray) object.get("user");
            JSONArray lineArray = (JSONArray) object.get("line");
            JSONArray angleArray = (JSONArray) object.get("angle");

            Point[] predicted = predictedArray != null ? new Point[predictedArray.size()] : new Point[0];
            Point[] normal = normalArray != null ? new Point[normalArray.size()] : new Point[0];
            Point[] user = userArray != null ? new Point[userArray.size()] : new Point[0];
            Line[] lines = lineArray != null ? new Line[lineArray.size()] : new Line[0];
            Angle[] angles = angleArray != null ? new Angle[angleArray.size()] : new Angle[0];

            if(predictedArray != null)
                for(int i = 0; i < predicted.length; i ++){
                    JSONObject pointObj = (JSONObject) predictedArray.get(i);
                    predicted[i] = jsonToPoint(pointObj);
                }
            if(normalArray != null)
                for(int i = 0; i < normal.length; i ++){
                    JSONObject pointObj = (JSONObject) normalArray.get(i);
                    normal[i] = jsonToPoint(pointObj);
                }
            if(userArray != null)
                for(int i = 0; i < user.length; i ++){
                    JSONObject pointObj = (JSONObject) userArray.get(i);
                    user[i] = jsonToPoint(pointObj);
                }
            if(lineArray != null){
                for(int i = 0; i < lines.length; i ++){
                    JSONObject lineObj = (JSONObject) lineArray.get(i);
                    lines[i] = jsonToLine(lineObj);
                }
            }
            if(angleArray != null){
                for(int i = 0; i < angles.length; i ++){
                    JSONObject angleObj = (JSONObject) angleArray.get(i);
                    angles[i] = jsonToAngle(angleObj);
                }
            }
            return new PointsDTO(predicted, normal, user, lines, angles);
        } catch(IOException | ParseException e){
            e.printStackTrace();
        }
        return null;
    }
}
