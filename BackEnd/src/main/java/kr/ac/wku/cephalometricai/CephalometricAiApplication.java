package kr.ac.wku.cephalometricai;

import kr.ac.wku.cephalometricai.properties.EncryptorProperties;
import kr.ac.wku.cephalometricai.properties.FileWatchServiceProperties;
import kr.ac.wku.cephalometricai.properties.PrivateCloudProperties;
import kr.ac.wku.cephalometricai.properties.SessionManager;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;

import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.UUID;

@SpringBootApplication
@EnableConfigurationProperties({EncryptorProperties.class, PrivateCloudProperties.class, SessionManager.class, FileWatchServiceProperties.class})
public class CephalometricAiApplication {

	public static void main(String[] args) throws Exception {
		SpringApplication.run(CephalometricAiApplication.class, args);
	}
	@Bean
	CommandLineRunner init(PrivateCloudProperties properties) {
		return (args) -> Files.createDirectories(Paths.get(properties.getPath()));
	}
}
