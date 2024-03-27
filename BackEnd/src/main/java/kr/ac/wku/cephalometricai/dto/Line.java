package kr.ac.wku.cephalometricai.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Line {
    private String name;
    private String start;
    private String end;
    private String color;
    private String type;
    private boolean display;
}
