package cn.edu.fudan.redcarpet.controller;

import cn.edu.fudan.redcarpet.dto.MyResponse;
import cn.edu.fudan.redcarpet.service.StorageService;
import cn.edu.fudan.redcarpet.serviceImpl.StorageFileNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping(path = "/image")
public class ImageController {

    private final StorageService storageService;

    @Autowired
    public ImageController(StorageService storageService) {
        this.storageService = storageService;
    }

    @GetMapping
    public List<String> listUploadedFiles() {
        return storageService.loadAll().map(path -> path.getFileName().toString()).collect(Collectors.toList());
    }

    @PostMapping(headers = "Content-Type= multipart/form-data")
    public MyResponse handleFileUpload(@RequestParam("file") MultipartFile file) {
        String filename = UUID.randomUUID().toString();
        String[] splits = StringUtils.cleanPath(file.getOriginalFilename()).split("\\.");
        filename += "." + splits[splits.length - 1];
        storageService.store(file, filename);
        return MyResponse.success("上传成功", filename);
    }

    @GetMapping("/{filename}")

    public ResponseEntity<Resource> serveFile(@PathVariable String filename) {
        Resource file = storageService.loadAsResource(filename);
        return ResponseEntity.ok().header(HttpHeaders.CONTENT_DISPOSITION,
                "attachment; filename=\"" + file.getFilename() + "\"").body(file);
    }

    @PostMapping(path = "/banner1", headers = "Content-Type= multipart/form-data")
    public MyResponse handleBanner1Upload(@RequestParam("file") MultipartFile file) {
        storageService.store(file, "banner1");
        return MyResponse.success("上传成功");
    }

    @PostMapping(path = "/banner2", headers = "Content-Type= multipart/form-data")
    public MyResponse handleBanner2Upload(@RequestParam("file") MultipartFile file) {
        storageService.store(file, "banner2");
        return MyResponse.success("上传成功");
    }


    @PostMapping(path = "/banner2Detail", headers = "Content-Type= multipart/form-data")
    public MyResponse handleBanner2DetailUpload(@RequestParam("file") MultipartFile file) {
        storageService.store(file, "banner2Detail");
        return MyResponse.success("上传成功");
    }

    @Deprecated
    @PostMapping(path = "/share", headers = "Content-Type= multipart/form-data")
    public MyResponse handleShareUpload(@RequestParam("file") MultipartFile file) {
        storageService.store(file, "share");
        return MyResponse.success("上传成功");
    }

    @ExceptionHandler(StorageFileNotFoundException.class)
    public ResponseEntity<?> handleStorageFileNotFound(StorageFileNotFoundException exc) {
        return ResponseEntity.notFound().build();
    }

}
