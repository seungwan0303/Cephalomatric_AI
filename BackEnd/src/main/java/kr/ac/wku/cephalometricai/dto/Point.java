package kr.ac.wku.cephalometricai.dto;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Point {
    private String name;
    private float x;
    private float y;
    private String type;
}
