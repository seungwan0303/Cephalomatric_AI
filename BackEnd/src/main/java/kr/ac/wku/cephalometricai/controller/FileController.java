package kr.ac.wku.cephalometricai.controller;

import jakarta.servlet.http.HttpServletRequest;
import kr.ac.wku.cephalometricai.dto.*;
import kr.ac.wku.cephalometricai.entity.Image;
import kr.ac.wku.cephalometricai.entity.Member;
import kr.ac.wku.cephalometricai.enums.ProcessStatus;
import kr.ac.wku.cephalometricai.properties.PrivateCloudProperties;
import kr.ac.wku.cephalometricai.properties.SessionManager;
import kr.ac.wku.cephalometricai.service.ImageService;
import kr.ac.wku.cephalometricai.service.MemberService;
import lombok.AllArgsConstructor;
import org.json.simple.parser.ParseException;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Optional;
import java.util.UUID;

@RestController
@AllArgsConstructor
public class FileController {

    private final SessionManager sessionManager;
    private final MemberService memberService;
    private final ImageService imageService;
    private final PrivateCloudProperties privateCloudProperties;

    @PostMapping("api/file/upload")
    public ResponseEntity<Object> uploadFiles(MultipartFile[] files, SessionDTO sessionDTO){
        try {
            imageService.uploadFiles(files, sessionDTO);
            return getImageList(sessionDTO);
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("api/file/points")
    public ResponseEntity<Object> getImagePoints(@RequestBody GetPointDTO dto) throws IOException, ParseException {
        UUID memberId = sessionManager.getSessionKey().get(dto.getSessionKey());
        if(memberId == null)
            return ResponseEntity.status(401).body("Session Expired.");
        Optional<Member> memberOptional = memberService.findById(memberId);
        if(memberOptional.isEmpty())
            return ResponseEntity.status(401).body("Unknown Account.");
        Optional<Image> imageOptional = imageService.findById(dto.getImageId());
        if(imageOptional.isEmpty())
            return ResponseEntity.notFound().build();
        Member member = memberOptional.get();
        Image image = imageOptional.get();
        if(!member.getId().equals(image.getOwner()))
            return ResponseEntity.status(403).body("Permission Denied.");
        return ResponseEntity.ok().body(privateCloudProperties.getPoints(image));
    }

    @PostMapping("api/file/pointedit")
    public ResponseEntity<Object> setImagePoints(@RequestBody PointsDTO dto) throws IOException {
        UUID memberId = sessionManager.getSessionKey().get(dto.getSessionKey());
        if(memberId == null)
            return ResponseEntity.status(401).body("Session Expired.");
        Optional<Member> memberOptional = memberService.findById(memberId);
        if(memberOptional.isEmpty())
            return ResponseEntity.status(401).body("Unknown Account.");
        Optional<Image> imageOptional = imageService.findById(dto.getImageId());
        if(imageOptional.isEmpty())
            return ResponseEntity.notFound().build();
        Member member = memberOptional.get();
        Image image = imageOptional.get();
        if(!member.getId().equals(image.getOwner()))
            return ResponseEntity.status(403).body("Permission Denied.");
        privateCloudProperties.setPoints(image, dto);
        return ResponseEntity.ok().build();
    }

    @PostMapping("api/file/list")
    public ResponseEntity<Object> getImageList(@RequestBody SessionDTO dto){
        UUID memberId = sessionManager.getSessionKey().get(dto.getSessionKey());
        if(memberId == null)
            return ResponseEntity.status(401).body("Session Expired.");
        Optional<Member> memberOptional = memberService.findById(memberId);
        if(memberOptional.isEmpty())
            return ResponseEntity.status(401).body("Unknown Account.");
        return ResponseEntity.ok().body(imageService.getFiles(memberId));
    }

    @PostMapping("api/file/delete")
    public ResponseEntity<Object> deleteImage(@RequestBody FileDeleteDTO dto){
        UUID memberId = sessionManager.getSessionKey().get(dto.getSessionKey());
        if(memberId == null)
            return ResponseEntity.status(401).body("Session Expired.");
        Optional<Member> memberOptional = memberService.findById(memberId);
        if(memberOptional.isEmpty())
            return ResponseEntity.status(401).body("Unknown Account.");
        Optional<Image> imageOptional = imageService.findById(dto.getImageId());
        if(imageOptional.isEmpty())
            return ResponseEntity.notFound().build();
        Member member = memberOptional.get();
        Image image = imageOptional.get();
        if(!image.getOwner().equals(member.getId()))
            return ResponseEntity.status(403).body("Permission Denied.");
        try {
            imageService.deleteImage(dto.getImageId());
        } catch (IOException e) {
            e.printStackTrace();
        }
        return ResponseEntity.ok().body(imageService.getFiles(member.getId()));
    }

    @PostMapping("api/file/modify")
    public ResponseEntity<Object> modifyImageData(@RequestBody FileModifyDTO dto){
        UUID memberId = sessionManager.getSessionKey().get(dto.getSessionKey());
        if(memberId == null) return ResponseEntity.status(401).body("Session Expired.");
        Optional<Member> optionalMember = memberService.findById(memberId);
        if(optionalMember.isEmpty()) return ResponseEntity.status(401).body("Unknown Account.");
        Optional<Image> optionalImage = imageService.findById(dto.getId());
        if(optionalImage.isEmpty()) return ResponseEntity.notFound().build();
        Member member = optionalMember.get();
        Image image = optionalImage.get();
        if(!image.getOwner().equals(member.getId())) return ResponseEntity.status(403).body("Permission denied.");
        imageService.modifyImageData(dto);
        return ResponseEntity.ok().build();
    }

    @GetMapping("api/files/{session}/{filename:.+}")
    public ResponseEntity<Resource> serveFile(HttpServletRequest request, @PathVariable String filename, @PathVariable String session) {
        Optional<Image> imageOptional = imageService.findBySystemPath(filename);
        if(imageOptional.isEmpty())
            return ResponseEntity.notFound().build();

        Image image = imageOptional.get();
        String extension = image.getOriginName().substring(image.getOriginName().indexOf('.'));
        String fileName = image.getName();
        if(image.getPatient() != null && !image.getPatient().isBlank())
            fileName += "_" + image.getPatient();
        if(image.getCreateAt() != null && !image.getCreateAt().isBlank())
            fileName += "_" + image.getCreateAt();
        fileName += extension;

        Resource file = imageService.loadAsResource(filename, UUID.fromString(session));
        String userAgent = request.getHeader("User-Agent");
        if(userAgent.contains("Trident"))
            return ResponseEntity.ok().header(HttpHeaders.CONTENT_DISPOSITION,
                    "attachment; filename=\"" + URLEncoder.encode(fileName, StandardCharsets.UTF_8).replaceAll("\\+", "%20") + "\"").body(file);
        else
            return ResponseEntity.ok().header(HttpHeaders.CONTENT_DISPOSITION,
                    "attachment; filename=\"" + new String(fileName.getBytes(StandardCharsets.UTF_8), StandardCharsets.ISO_8859_1) + "\"").body(file);
    }
}
