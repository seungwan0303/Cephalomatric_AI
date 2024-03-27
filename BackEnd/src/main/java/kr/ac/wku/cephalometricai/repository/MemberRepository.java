package kr.ac.wku.cephalometricai.repository;

import kr.ac.wku.cephalometricai.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface MemberRepository extends JpaRepository<Member, UUID> {
    Optional<Member> findByUserId(String userId);

}
