package kr.ac.wku.cephalometricai.properties;

import kr.ac.wku.cephalometricai.entity.Image;
import kr.ac.wku.cephalometricai.enums.ProcessStatus;
import kr.ac.wku.cephalometricai.repository.ImageRepository;
import kr.ac.wku.cephalometricai.service.ImageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;

import java.io.File;
import java.io.IOException;
import java.net.URI;
import java.nio.file.*;
import java.util.HashMap;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@ConfigurationProperties("watchservice")
public class FileWatchServiceProperties {

    private static final String DIRECTORY = "cloud";
    private HashMap<UUID, Thread> watchServices = new HashMap<>();
    private Thread rootWatchService;

    @Autowired
    private ImageRepository imageRepository;

    public FileWatchServiceProperties(){
        for(File file : new File(DIRECTORY).listFiles()){
            if(!file.isDirectory()) continue;
            if(file.isHidden()) continue;
            UUID uuid = UUID.fromString(file.getName());
            if(watchServices.containsKey(uuid)) continue;
            Thread thread = getThread(uuid);
            watchServices.put(uuid, thread);
        }
        rootWatchService = getThread(null);

    }

    private Thread getThread(UUID uuid) {
        Thread thread = new Thread(() -> {
            try {
                WatchService service = FileSystems.getDefault().newWatchService();
                Path path = Paths.get(DIRECTORY + (uuid == null ? "" : ("/" + uuid)));
                path.register(service,
                        StandardWatchEventKinds.ENTRY_CREATE,
                        StandardWatchEventKinds.ENTRY_DELETE,
                        StandardWatchEventKinds.ENTRY_MODIFY);
                while(true){
                    WatchKey key = service.take();
                    List<WatchEvent<?>> list = key.pollEvents();
                    for(WatchEvent<?> event : list){
                        WatchEvent.Kind<?> kind = event.kind();
                        Path pth = (Path) event.context();
                        if(uuid == null){
                            if(kind.equals(StandardWatchEventKinds.ENTRY_CREATE)){
                                UUID created = UUID.fromString(pth.getFileName().toString());
                                if(!watchServices.containsKey(created)){
                                    watchServices.put(created, getThread(created));
                                }
                            } else if(kind.equals(StandardWatchEventKinds.ENTRY_DELETE)){
                                UUID deleted = UUID.fromString(pth.getFileName().toString());
                                if(watchServices.containsKey(deleted)){
                                    watchServices.get(deleted).interrupt();
                                    watchServices.remove(deleted);
                                }
                            }
                        } else {
                            if(!new UrlResource(pth.toUri()).isFile()) continue;
                            String fileName = pth.getFileName().toString();
                            String extension = fileName.substring(fileName.indexOf('.'));
                            fileName = fileName.substring(0, fileName.indexOf('.'));
                            if(!extension.equalsIgnoreCase(".json")) continue;
                            if(kind.equals(StandardWatchEventKinds.ENTRY_CREATE)){
                                Optional<Image> imageOptional = imageRepository.findBySystemPathContaining(fileName);
                                if(imageOptional.isPresent()){
                                    Image image = imageOptional.get();
                                    image.setStatus(ProcessStatus.COMPLETED);
                                    imageRepository.save(image);
                                }
                            } else if(kind.equals(StandardWatchEventKinds.ENTRY_DELETE)){
                                Optional<Image> imageOptional = imageRepository.findBySystemPathContaining(fileName);
                                if(imageOptional.isPresent()){
                                    Image image = imageOptional.get();
                                    image.setStatus(ProcessStatus.PROCESSING);
                                    imageRepository.save(image);
                                }
                            }
                        }
                    }
                    if(!key.reset()) break; //키 리셋
                }
                service.close();
            } catch (IOException | InterruptedException ignore) {}
        });
        thread.start();
        return thread;
    }
}
