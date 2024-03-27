package kr.ac.wku.cephalometricai.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Angle {
    private Point center;
    private Point p1;
    private double angle;
    private String type;
}
