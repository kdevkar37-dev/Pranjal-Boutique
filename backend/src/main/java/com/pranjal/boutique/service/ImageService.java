package com.pranjal.boutique.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.UUID;

@Service
public class ImageService {

    private static final Logger logger = LoggerFactory.getLogger(ImageService.class);

    @Value("${app.upload.dir:uploads/images}")
    private String uploadDir;

    @Value("${app.upload.max-size:5242880}")
    private long maxFileSize;

    @Value("${app.upload.file-upload-enabled:true}")
    private boolean fileUploadEnabled;

    @Value("${app.upload.provider:local}")
    private String uploadProvider;

    @Value("${app.upload.cloudinary.cloud-name:}")
    private String cloudinaryCloudName;

    @Value("${app.upload.cloudinary.api-key:}")
    private String cloudinaryApiKey;

    @Value("${app.upload.cloudinary.api-secret:}")
    private String cloudinaryApiSecret;

    @Value("${app.upload.cloudinary.folder:boutique-services}")
    private String cloudinaryFolder;

    private final OpsAlertService opsAlertService;

    public ImageService(OpsAlertService opsAlertService) {
        this.opsAlertService = opsAlertService;
    }

    private static final String[] ALLOWED_EXTENSIONS = { "jpg", "jpeg", "png", "gif", "webp", "heic", "heif" };
    private static final String[] ALLOWED_MIME_TYPES = {
            "image/jpeg", "image/png", "image/gif", "image/webp", "image/heic", "image/heif"
    };

    /**
     * Upload an image file and return the file path
     */
    public String uploadImage(MultipartFile file) throws IOException {
        if (!fileUploadEnabled) {
            throw new IllegalArgumentException(
                    "File upload is disabled in this environment. Use image URLs for services.");
        }

        // Validate file
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        if (file.getSize() > maxFileSize) {
            opsAlertService.notifyWarning("IMAGE_UPLOAD_REJECTED", "Upload rejected: file too large",
                    Map.of("sizeBytes", file.getSize(), "maxAllowedBytes", maxFileSize));
            throw new IllegalArgumentException("File size exceeds maximum allowed size of " + maxFileSize + " bytes");
        }

        // Validate file type
        String originalFileName = file.getOriginalFilename();
        if (originalFileName == null || !isValidFile(originalFileName, file.getContentType())) {
            opsAlertService.notifyWarning("IMAGE_UPLOAD_REJECTED", "Upload rejected: invalid image type",
                    Map.of("filename", String.valueOf(originalFileName), "contentType",
                            String.valueOf(file.getContentType())));
            throw new IllegalArgumentException(
                    "Invalid file type. Allowed types: jpg, jpeg, png, gif, webp, heic, heif");
        }

        if (isCloudinaryProvider()) {
            return uploadToCloudinary(file);
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

        logger.info("Image uploaded: uploads/images/{}", newFileName);

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

        if (isCloudinaryProvider() && imageUrl.startsWith("http")) {
            deleteFromCloudinary(imageUrl);
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
            opsAlertService.notifyWarning("IMAGE_DELETE_FAILED", "Failed to delete local image",
                    Map.of("imageUrl", imageUrl, "reason", e.getMessage()));
            logger.error("Failed to delete image: {}", imageUrl, e);
            throw new RuntimeException("Failed to delete image: " + e.getMessage(), e);
        }
    }

    private boolean isCloudinaryProvider() {
        return "cloudinary".equalsIgnoreCase(uploadProvider);
    }

    private String uploadToCloudinary(MultipartFile file) throws IOException {
        ensureCloudinaryConfig();

        try {
            Cloudinary cloudinary = new Cloudinary(ObjectUtils.asMap(
                    "cloud_name", cloudinaryCloudName,
                    "api_key", cloudinaryApiKey,
                    "api_secret", cloudinaryApiSecret,
                    "secure", true));

            Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                    "folder", cloudinaryFolder,
                    "resource_type", "image",
                    "unique_filename", true,
                    "overwrite", false));

            Object secureUrl = uploadResult.get("secure_url");
            if (secureUrl == null) {
                throw new IllegalStateException("Cloudinary upload succeeded but secure_url was missing");
            }

            String imageUrl = String.valueOf(secureUrl);
            logger.info("Image uploaded to Cloudinary: {}", imageUrl);
            return imageUrl;
        } catch (Exception ex) {
            opsAlertService.notifyWarning("IMAGE_UPLOAD_FAILED", "Cloudinary image upload failed",
                    Map.of("reason", ex.getMessage()));
            throw new IOException("Cloud upload failed: " + ex.getMessage(), ex);
        }
    }

    private void deleteFromCloudinary(String imageUrl) {
        ensureCloudinaryConfig();

        try {
            String publicId = extractCloudinaryPublicId(imageUrl);
            if (publicId == null || publicId.isBlank()) {
                logger.warn("Could not resolve Cloudinary public ID from URL: {}", imageUrl);
                return;
            }

            Cloudinary cloudinary = new Cloudinary(ObjectUtils.asMap(
                    "cloud_name", cloudinaryCloudName,
                    "api_key", cloudinaryApiKey,
                    "api_secret", cloudinaryApiSecret,
                    "secure", true));

            cloudinary.uploader().destroy(publicId, ObjectUtils.asMap(
                    "resource_type", "image",
                    "invalidate", true));
            logger.info("Image deleted from Cloudinary: {}", publicId);
        } catch (Exception ex) {
            opsAlertService.notifyWarning("IMAGE_DELETE_FAILED", "Cloudinary image delete failed",
                    Map.of("imageUrl", imageUrl, "reason", ex.getMessage()));
            throw new RuntimeException("Failed to delete cloud image: " + ex.getMessage(), ex);
        }
    }

    private String extractCloudinaryPublicId(String imageUrl) {
        int uploadMarkerIndex = imageUrl.indexOf("/upload/");
        if (uploadMarkerIndex < 0) {
            return null;
        }

        String afterUpload = imageUrl.substring(uploadMarkerIndex + "/upload/".length());
        afterUpload = afterUpload.replaceFirst("^v\\d+/", "");

        int queryIndex = afterUpload.indexOf('?');
        if (queryIndex >= 0) {
            afterUpload = afterUpload.substring(0, queryIndex);
        }

        int lastDot = afterUpload.lastIndexOf('.');
        if (lastDot > 0) {
            afterUpload = afterUpload.substring(0, lastDot);
        }

        return afterUpload;
    }

    private void ensureCloudinaryConfig() {
        if (cloudinaryCloudName == null || cloudinaryCloudName.isBlank()
                || cloudinaryApiKey == null || cloudinaryApiKey.isBlank()
                || cloudinaryApiSecret == null || cloudinaryApiSecret.isBlank()) {
            throw new IllegalStateException("Cloudinary is selected but credentials are missing");
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
