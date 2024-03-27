package kr.ac.wku.cephalometricai.controller;

import kr.ac.wku.cephalometricai.dto.SessionDTO;
import kr.ac.wku.cephalometricai.dto.SetMemberScaleDTO;
import kr.ac.wku.cephalometricai.dto.SignInDTO;
import kr.ac.wku.cephalometricai.dto.SignUpDTO;
import kr.ac.wku.cephalometricai.entity.Member;
import kr.ac.wku.cephalometricai.exception.AlreadyExistUserIdException;
import kr.ac.wku.cephalometricai.properties.SessionManager;
import kr.ac.wku.cephalometricai.service.MemberService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;
import java.util.UUID;

@RestController
@AllArgsConstructor
public class AuthController {

    private final MemberService memberService;
    private final SessionManager sessionManager;

    @PostMapping("api/auth/signin")
    public ResponseEntity<Object> signInProcess(@RequestBody SignInDTO dto){
        Optional<UUID> optionalUUID = memberService.signInProcess(dto);
        return optionalUUID.
                <ResponseEntity<Object>>map(uuid -> ResponseEntity.ok().body(uuid))
                .orElseGet(() -> ResponseEntity.status(401).body("Incorrect ID or PW."));
    }

    @PostMapping("api/auth/signup")
    public ResponseEntity<Object> signUpProcess(@RequestBody SignUpDTO dto){
        try {
            memberService.signUpProcess(dto);
            return ResponseEntity.ok().build();
        } catch (AlreadyExistUserIdException e) {
            return ResponseEntity.status(304).body(e.getMessage());
        }
    }

    @PostMapping("api/auth/logout")
    public ResponseEntity<Object> logOutProcess(@RequestBody SessionDTO dto){
        memberService.logOutProcess(dto.getSessionKey());
        return ResponseEntity.ok().build();
    }

    @PostMapping("api/auth/scale")
    public ResponseEntity<Object> setScale(@RequestBody SetMemberScaleDTO dto){
        UUID memberId = sessionManager.getSessionKey().get(dto.getSessionKey());
        if(memberId == null) return ResponseEntity.status(401).build();
        Optional<Member> optionalMember = memberService.findById(memberId);
        if(optionalMember.isEmpty()) return ResponseEntity.status(401).build();
        Member member = optionalMember.get();
        member.setScaleByPixel(dto.getScale());
        memberService.save(member);
        return ResponseEntity.ok().build();
    }

    @PostMapping("api/auth/getscale")
    public ResponseEntity<Object> getScale(@RequestBody SessionDTO dto){
        UUID memberId = sessionManager.getSessionKey().get(dto.getSessionKey());
        if(memberId == null) return ResponseEntity.status(401).build();
        Optional<Member> optionalMember = memberService.findById(memberId);
        if(optionalMember.isEmpty()) return ResponseEntity.status(401).build();
        Member member = optionalMember.get();
        Float scale = member.getScaleByPixel();
        scale = scale == null ? 0.0f : scale;
        return ResponseEntity.ok(scale);
    }
}
