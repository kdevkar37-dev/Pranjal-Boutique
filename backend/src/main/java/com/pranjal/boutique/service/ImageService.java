package com.pranjal.boutique.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class ImageService {

    private static final Logger logger = LoggerFactory.getLogger(ImageService.class);

    @Value("${app.upload.dir:uploads/images}")
    private String uploadDir;

    @Value("${app.upload.max-size:5242880}")
    private long maxFileSize;

    private static final String[] ALLOWED_EXTENSIONS = { "jpg", "jpeg", "png", "gif", "webp", "heic", "heif" };
    private static final String[] ALLOWED_MIME_TYPES = {
            "image/jpeg", "image/png", "image/gif", "image/webp", "image/heic", "image/heif"
    };

    /**
     * Upload an image file and return the file path
     */
    public String uploadImage(MultipartFile file) throws IOException {
        // Validate file
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        if (file.getSize() > maxFileSize) {
            throw new IllegalArgumentException("File size exceeds maximum allowed size of " + maxFileSize + " bytes");
        }

        // Validate file type
        String originalFileName = file.getOriginalFilename();
        if (originalFileName == null || !isValidFile(originalFileName, file.getContentType())) {
            throw new IllegalArgumentException(
                    "Invalid file type. Allowed types: jpg, jpeg, png, gif, webp, heic, heif");
        }

        // Create upload directory if it doesn't exist
        Path uploadPath = Paths.get(uploadDir).toAbsolutePath();
        Files.createDirectories(uploadPath);

        // Generate unique filename
        String fileExtension = getFileExtension(originalFileName);
        String newFileName = UUID.randomUUID().toString() + "." + fileExtension;
        Path filePath = uploadPath.resolve(newFileName);

        // Save file
        Files.write(filePath, file.getBytes());

        logger.info("Image uploaded successfully");
        logger.info("Upload directory: {}", uploadPath.toAbsolutePath());
        logger.info("File saved at: {}", filePath.toAbsolutePath());
        logger.info("File exists: {}", Files.exists(filePath));
        logger.info("Filename returned: uploads/images/{}", newFileName);

        // Return the relative path that can be accessed via static resource handler
        return "uploads/images/" + newFileName;
    }

    /**
     * Delete an image file
     */
    public void deleteImage(String imageUrl) {
        if (imageUrl == null || imageUrl.isEmpty()) {
            return;
        }

        try {
            // Extract filename from both old format (uploads/images/uuid.jpg) and new
            // format (uuid.jpg)
            String fileName = imageUrl.contains("/")
                    ? imageUrl.substring(imageUrl.lastIndexOf('/') + 1)
                    : imageUrl;

            Path uploadPath = Paths.get(uploadDir).toAbsolutePath();
            Path filePath = uploadPath.resolve(fileName);

            if (Files.exists(filePath)) {
                Files.delete(filePath);
                logger.info("Image deleted: {}", filePath.toAbsolutePath());
            } else {
                logger.warn("Image file not found for deletion: {}", filePath.toAbsolutePath());
            }
        } catch (IOException e) {
            logger.error("Failed to delete image: {}", imageUrl, e);
            throw new RuntimeException("Failed to delete image: " + e.getMessage(), e);
        }
    }

    /**
     * Check if file is valid based on extension and MIME type
     */
    private boolean isValidFile(String fileName, String contentType) {
        String extension = getFileExtension(fileName).toLowerCase();

        // Check extension
        boolean extensionValid = false;
        for (String ext : ALLOWED_EXTENSIONS) {
            if (ext.equals(extension)) {
                extensionValid = true;
                break;
            }
        }

        if (!extensionValid) {
            return false;
        }

        // Check MIME type if available
        if (contentType != null) {
            for (String mimeType : ALLOWED_MIME_TYPES) {
                if (contentType.equals(mimeType)) {
                    return true;
                }
            }
            return false;
        }

        return true;
    }

    /**
     * Extract file extension from filename
     */
    private String getFileExtension(String fileName) {
        int lastDot = fileName.lastIndexOf('.');
        return lastDot > 0 ? fileName.substring(lastDot + 1) : "";
    }
}
