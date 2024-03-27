package kr.ac.wku.cephalometricai.service;

import kr.ac.wku.cephalometricai.dto.FileModifyDTO;
import kr.ac.wku.cephalometricai.dto.SessionDTO;
import kr.ac.wku.cephalometricai.entity.Image;
import kr.ac.wku.cephalometricai.entity.Member;
import kr.ac.wku.cephalometricai.enums.ProcessStatus;
import kr.ac.wku.cephalometricai.properties.PrivateCloudProperties;
import kr.ac.wku.cephalometricai.properties.SessionManager;
import kr.ac.wku.cephalometricai.repository.ImageRepository;
import kr.ac.wku.cephalometricai.repository.MemberRepository;
import lombok.AllArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.*;

@Service
@AllArgsConstructor
public class ImageService {

    private final ImageRepository imageRepository;
    private final MemberRepository memberRepository;
    private final SessionManager sessionManager;
    private final PrivateCloudProperties privateCloudProperties;

    public List<Image> uploadFiles(MultipartFile[] files, SessionDTO dto) throws IOException {
        UUID memberId = sessionManager.getSessionKey().get(dto.getSessionKey());
        if(memberId == null) return new LinkedList<>();
        Optional<Member> memberOptional = memberRepository.findById(memberId);
        if(memberOptional.isEmpty()) return new LinkedList<>();
        Member member = memberOptional.get();
        List<Image> uploaded = new LinkedList<>();

        Path destinationFolder = Paths.get(privateCloudProperties.getPath()+"/"+member.getId().toString())
                .normalize().toAbsolutePath();
        if(!Files.exists(destinationFolder)) Files.createDirectory(destinationFolder);

        for(MultipartFile file : files){
            if(file.isEmpty()) continue;
            String path = file.getOriginalFilename();
            String[] pathsplit = Objects.requireNonNull(path).split("/");
            String fileName = pathsplit[pathsplit.length-1];
            String fileExtension = Objects.requireNonNull(fileName).substring(fileName.lastIndexOf("."));
            if(!fileExtension.endsWith("jpg")
                && !fileExtension.endsWith("jpeg")
                && !fileExtension.endsWith("png")){
                continue;
            }
            String systemPath = UUID.randomUUID().toString().replaceAll("-","") + fileExtension;

            Path destinationFile = Paths.get(privateCloudProperties.getPath()+"/"+member.getId().toString()).resolve(
                            Paths.get(systemPath))
                    .normalize().toAbsolutePath();
            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, destinationFile,
                        StandardCopyOption.REPLACE_EXISTING);
            }
            Image image = Image.builder()
                    .originName(fileName)
                    .systemPath(systemPath)
                    .owner(member.getId())
                    .name(fileName)
                    .status(ProcessStatus.PROCESSING)
                    .build();
            imageRepository.save(image);
            uploaded.add(image);
        }
        return uploaded;
    }

    public List<Image> getFiles(UUID memberId){
        return imageRepository.findByOwner(memberId);
    }

    public Resource loadAsResource(String filename, Member member){
        try {
            Path file = Paths.get(privateCloudProperties.getPath()+"/"+member.getId().toString()).resolve(filename);
            Resource resource = new UrlResource(file.toUri());
            if (resource.exists() || resource.isReadable()) {
                return resource;
            }else {
                return null;
            }
        } catch (MalformedURLException e) {
            return null;
        }
    }

    public Resource loadAsResource(String filename, UUID sessionKey){
        UUID memberId = sessionManager.getSessionKey().get(sessionKey);
        if(memberId == null) return null;
        Optional<Member> memberOptional = memberRepository.findById(memberId);
        return memberOptional.map(member -> loadAsResource(filename, member)).orElse(null);
    }

    public Optional<Image> findById(Long id){
        return imageRepository.findById(id);
    }

    public Optional<Image> findBySystemPath(String systemPath){
        return imageRepository.findBySystemPath(systemPath);
    }

    public void modifyImageData(FileModifyDTO dto){
        Optional<Image> imageOptional = findById(dto.getId());
        if(imageOptional.isEmpty()) return;
        Image image = imageOptional.get();
        image.setName(dto.getName());
        image.setPatient(dto.getPatient());
        image.setCreateAt(dto.getDate());
        imageRepository.save(image);
    }

    public void deleteImage(Long id) throws IOException {
        Optional<Image> imageOptional = imageRepository.findById(id);
        if(imageOptional.isEmpty()) return;
        Image image = imageOptional.get();
        Path path = Paths.get(privateCloudProperties.getPath()+"/"+image.getOwner().toString()).resolve(image.getSystemPath());
        if(Files.exists(path))  Files.delete(path);
        String jsonName = image.getSystemPath().substring(0, image.getSystemPath().lastIndexOf('.'));
        Path jsonPath = Paths.get(privateCloudProperties.getPath()+"/"+image.getOwner().toString()).resolve(jsonName + ".json");
        if(Files.exists(jsonPath)) Files.delete(jsonPath);
        imageRepository.delete(image);
    }
}
