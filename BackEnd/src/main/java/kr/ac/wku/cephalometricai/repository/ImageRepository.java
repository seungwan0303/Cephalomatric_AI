package kr.ac.wku.cephalometricai.repository;

import kr.ac.wku.cephalometricai.entity.Image;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ImageRepository extends JpaRepository<Image, Long> {
    List<Image> findByOwner(UUID owner);
    Optional<Image> findBySystemPath(String systemPath);

    Optional<Image> findBySystemPathContaining(String systemPath);
}
