package kr.ac.wku.cephalometricai.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SessionDTO {
    private String sessionKey;
    public String getRawSessionKey(){
        return sessionKey;
    }
    public UUID getSessionKey(){
        return UUID.fromString(sessionKey);
    }
}
