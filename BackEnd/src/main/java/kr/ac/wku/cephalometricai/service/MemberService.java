package kr.ac.wku.cephalometricai.service;

import kr.ac.wku.cephalometricai.dto.SignInDTO;
import kr.ac.wku.cephalometricai.dto.SignUpDTO;
import kr.ac.wku.cephalometricai.entity.Member;
import kr.ac.wku.cephalometricai.exception.AlreadyExistUserIdException;
import kr.ac.wku.cephalometricai.properties.EncryptorProperties;
import kr.ac.wku.cephalometricai.properties.SessionManager;
import kr.ac.wku.cephalometricai.repository.MemberRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@Service
@AllArgsConstructor
public class MemberService {

    private final MemberRepository memberRepository;
    private final EncryptorProperties encryptorProperties;
    private final SessionManager sessionManager;

    public Optional<Member> findById(UUID id){
        return memberRepository.findById(id);
    }

    public Optional<Member> findByUserId(String userId){
        return memberRepository.findByUserId(userId);
    }

    public Optional<UUID> signInProcess(SignInDTO dto){
        Optional<Member> optionalMember = findByUserId(dto.getUserId());
        if(optionalMember.isEmpty()) return Optional.empty();
        Member member = optionalMember.get();
        String encryptedPassword = encryptorProperties.encryptPassword(dto.getUserPw());
        if(!member.getUserPassword().equals(encryptedPassword)) return Optional.empty();
        UUID sessionKey = UUID.randomUUID();
        sessionManager.getSessionKey().put(sessionKey, member.getId());
        sessionManager.getSessionKey().put(member.getId(), sessionKey);
        return Optional.of(sessionKey);
    }

    public Member signUpProcess(SignUpDTO dto)
            throws AlreadyExistUserIdException {
        if(findByUserId(dto.getUserId()).isPresent())
            throw new AlreadyExistUserIdException("Already Using User Id");
        Member member = Member.builder()
                .id(UUID.randomUUID())
                .userId(dto.getUserId())
                .userPassword(encryptorProperties.encryptPassword(dto.getUserPw()))
                .name(dto.getName())
                .build();
        memberRepository.save(member);
        return member;
    }

    public void logOutProcess(UUID sessionKey){
        if(sessionManager.getSessionKey().containsKey(sessionKey)){
            UUID memberId = sessionManager.getSessionKey().get(sessionKey);
            sessionManager.getSessionKey().remove(sessionKey);
            sessionManager.getSessionKey().remove(memberId);
        }
    }

    public void save(Member member){
        memberRepository.save(member);
    }
}
