package com.pranjal.boutique.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class ImageService {

    @Value("${app.upload.dir:uploads/images}")
    private String uploadDir;

    @Value("${app.upload.max-size:5242880}")
    private long maxFileSize;

    private static final String[] ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "gif", "webp", "heic", "heif"};
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
            throw new IllegalArgumentException("Invalid file type. Allowed types: jpg, jpeg, png, gif, webp, heic, heif");
        }

        // Create upload directory if it doesn't exist
        Path uploadPath = Paths.get(uploadDir);
        Files.createDirectories(uploadPath);

        // Generate unique filename
        String fileExtension = getFileExtension(originalFileName);
        String newFileName = UUID.randomUUID().toString() + "." + fileExtension;
        Path filePath = uploadPath.resolve(newFileName);

        // Save file
        Files.write(filePath, file.getBytes());

        // Return relative path for storage in database
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
            // Extract filename from URL (handle both full paths and relative paths)
            String fileName = extractFileName(imageUrl);
            Path filePath = Paths.get(uploadDir, fileName);

            if (Files.exists(filePath)) {
                Files.delete(filePath);
            }
        } catch (IOException e) {
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

    /**
     * Extract filename from image URL
     */
    private String extractFileName(String imageUrl) {
        // Handle paths like "uploads/images/filename.jpg"
        int lastSlash = imageUrl.lastIndexOf('/');
        return lastSlash >= 0 ? imageUrl.substring(lastSlash + 1) : imageUrl;
    }
}
