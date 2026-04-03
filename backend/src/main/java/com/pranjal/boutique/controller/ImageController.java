package com.pranjal.boutique.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api/images")
public class ImageController {

    private static final Logger logger = LoggerFactory.getLogger(ImageController.class);

    @Value("${app.upload.dir:uploads/images}")
    private String uploadDir;

    /**
     * Serve image file by filename
     * Supports both local and remote image loading
     */
    @GetMapping("/{filename}")
    public ResponseEntity<Resource> getImage(@PathVariable String filename) {
        try {
            // Security: Prevent directory traversal
            if (filename.contains("..") || filename.contains("/") || filename.contains("\\")) {
                logger.warn("Invalid filename requested: {}", filename);
                return ResponseEntity.badRequest().build();
            }

            // Try multiple possible locations for the file
            Path filePath = findImageFile(filename);
            
            if (filePath == null) {
                logger.error("Image file not found: {}", filename);
                return ResponseEntity.notFound().build();
            }

            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                logger.error("Image file not readable: {}", filePath);
                return ResponseEntity.notFound().build();
            }

            logger.info("Serving image: {} from {}", filename, filePath);

            // Determine content type based on file extension
            MediaType contentType = determineMediaType(filename);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_TYPE, contentType.toString())
                    .header(HttpHeaders.CACHE_CONTROL, "public, max-age=31536000") // Cache for 1 year
                    .body(resource);
        } catch (MalformedURLException e) {
            logger.error("Error serving image: {}", filename, e);
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            logger.error("Unexpected error serving image: {}", filename, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Find image file in multiple possible locations
     */
    private Path findImageFile(String filename) {
        // List of possible locations to search for the image
        String[] possibleLocations = {
            // 1. Configured upload directory (relative to working directory)
            uploadDir,
            // 2. Absolute path to configured directory
            new File(uploadDir).getAbsolutePath(),
            // 3. Project root uploads/images folder
            "uploads/images",
            // 4. Backend folder uploads/images
            "backend/uploads/images",
            // 5. User's temp directory location
            System.getProperty("java.io.tmpdir")
        };

        for (String location : possibleLocations) {
            try {
                Path filePath = Paths.get(location, filename);
                File file = filePath.toFile();
                
                if (file.exists() && file.isFile() && file.canRead()) {
                    logger.debug("Found image at: {}", filePath.toAbsolutePath());
                    return filePath;
                }
            } catch (Exception e) {
                logger.debug("Checked location: {} - not found", location);
            }
        }

        logger.warn("Image not found in any location: {}", filename);
        return null;
    }

    /**
     * Determine media type from file extension
     */
    private MediaType determineMediaType(String filename) {
        if (filename == null || !filename.contains(".")) {
            return MediaType.APPLICATION_OCTET_STREAM;
        }

        String extension = filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
        return switch (extension) {
            case "jpg", "jpeg" -> MediaType.IMAGE_JPEG;
            case "png" -> MediaType.IMAGE_PNG;
            case "gif" -> MediaType.IMAGE_GIF;
            case "webp" -> new MediaType("image", "webp");
            case "heic" -> new MediaType("image", "heic");
            case "heif" -> new MediaType("image", "heif");
            case "svg" -> new MediaType("image", "svg+xml");
            default -> MediaType.APPLICATION_OCTET_STREAM;
        };
    }
}
