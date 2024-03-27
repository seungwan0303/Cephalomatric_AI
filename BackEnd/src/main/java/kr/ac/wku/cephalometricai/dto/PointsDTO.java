package kr.ac.wku.cephalometricai.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PointsDTO {
    private UUID sessionKey;
    private Long imageId;
    private Point[] predicted;
    private Point[] normal;
    private Point[] user;
    private Line[] lines;
    private Angle[] angles;

    public PointsDTO(Point[] predicted, Point[] normal, Point[] user, Line[] lines, Angle[] angles) {
        this.predicted = predicted;
        this.normal = normal;
        this.user = user;
        this.lines = lines;
        this.angles = angles;
    }

    public static PointsDTO empty(){
        return new PointsDTO(new Point[0],new Point[0],new Point[0], new Line[0], new Angle[0]);
    }
}
