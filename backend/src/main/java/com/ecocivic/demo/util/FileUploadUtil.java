package com.ecocivic.demo.util;

import com.ecocivic.demo.exception.BadRequestException;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

/**
 * Handles saving uploaded images to the local filesystem.
 */
public final class FileUploadUtil {

    private FileUploadUtil() {}

    /**
     * Saves a multipart image file to the uploads directory.
     *
     * @param file the uploaded file
     * @return the unique filename saved (stored in Report.imagePath)
     */
    public static String saveImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return null;
        }

        String originalName = file.getOriginalFilename();
        if (originalName == null || originalName.isBlank()) {
            throw new BadRequestException("Invalid file name");
        }

        String extension = originalName
                .substring(originalName.lastIndexOf('.'))
                .toLowerCase();

        if (!extension.matches("\\.(jpg|jpeg|png|webp|gif)")) {
            throw new BadRequestException(
                    "Only image files (jpg, png, webp, gif) are allowed");
        }

        if (file.getSize() > AppConstants.MAX_FILE_SIZE) {
            throw new BadRequestException("File size exceeds 5 MB limit");
        }

        String uniqueName = UUID.randomUUID() + extension;

        try {
            Path uploadPath = Paths.get(AppConstants.UPLOAD_DIR).toAbsolutePath().normalize();
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            Path targetFile = uploadPath.resolve(uniqueName);
            try (var inputStream = file.getInputStream()) {
                Files.copy(inputStream, targetFile, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
            }
        } catch (IOException e) {
            throw new BadRequestException("Failed to save uploaded file: " + e.getMessage());
        }

        return uniqueName;
    }
}
