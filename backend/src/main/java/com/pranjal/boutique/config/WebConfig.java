package com.pranjal.boutique.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private static final Logger logger = LoggerFactory.getLogger(WebConfig.class);

    @Value("${app.upload.dir:uploads/images}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        try {
            // Resolve the upload directory to absolute path
            Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();

            // Create directory if it doesn't exist
            Files.createDirectories(uploadPath);

            // Log configuration for debugging
            logger.info("========================================");
            logger.info("Image Serving Configuration:");
            logger.info("Configured dir: {}", uploadDir);
            logger.info("Absolute path: {}", uploadPath);
            logger.info("Directory exists: {}", Files.exists(uploadPath));
            logger.info("Files in directory: ");
            Files.list(uploadPath)
                    .limit(10)
                    .forEach(p -> logger.info("  - {}", p.getFileName()));
            logger.info("========================================");

            // Register resource handler with proper file:// URI.
            // Uploaded files are stored directly under uploads/images/, so the URL pattern
            // must also start at /uploads/images/** to avoid an extra "images" path
            // segment.
            String fileUri = "file:///" + uploadPath.toString().replace("\\", "/") + "/";
            registry.addResourceHandler("/uploads/images/**")
                    .addResourceLocations(fileUri)
                    .setCachePeriod(31536000); // 1 year cache

            logger.info("✓ Resource handler: /uploads/images/** → {}", fileUri);
        } catch (Exception e) {
            logger.error("✗ Failed to configure static resource handler", e);
            throw new RuntimeException("Static resource handler configuration failed", e);
        }
    }
}
