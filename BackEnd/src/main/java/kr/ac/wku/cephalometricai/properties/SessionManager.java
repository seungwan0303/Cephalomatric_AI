package kr.ac.wku.cephalometricai.properties;

import lombok.Getter;
import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@ConfigurationProperties("sessionmanager")
@Getter
public class SessionManager {
    private ConcurrentHashMap<UUID, UUID> sessionKey = new ConcurrentHashMap<>();
}