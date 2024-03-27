package kr.ac.wku.cephalometricai.dto;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FileModifyDTO {
    private UUID sessionKey;
    private Long id;
    private String name;
    private String date;
    private String patient;
}
