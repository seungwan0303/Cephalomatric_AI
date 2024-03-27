package kr.ac.wku.cephalometricai.entity;

import jakarta.persistence.*;
import kr.ac.wku.cephalometricai.enums.ProcessStatus;
import lombok.*;

import java.util.UUID;

@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Image {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String systemPath;

    @Column(nullable = false)
    private String originName;

    @Column(nullable = false)
    private UUID owner;

    @Column(nullable = false)
    private ProcessStatus status;

    @Column
    private String patient;

    @Column
    private String createAt;

    @Column(nullable = false)
    private String name;
}
