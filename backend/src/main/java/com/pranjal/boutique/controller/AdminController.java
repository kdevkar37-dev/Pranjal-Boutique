package com.pranjal.boutique.controller;

import com.pranjal.boutique.dto.InquiryResponseRequest;
import com.pranjal.boutique.dto.InquiryStatusUpdateRequest;
import com.pranjal.boutique.dto.RentalCategoryCountResponse;
import com.pranjal.boutique.dto.RentalProductRequest;
import com.pranjal.boutique.dto.ServiceCategoryCountResponse;
import com.pranjal.boutique.dto.ServiceRequest;
import com.pranjal.boutique.dto.SiteSettingsRequest;
import com.pranjal.boutique.model.BoutiqueService;
import com.pranjal.boutique.model.Inquiry;
import com.pranjal.boutique.model.RentalProduct;
import com.pranjal.boutique.model.Review;
import com.pranjal.boutique.model.SiteSettings;
import com.pranjal.boutique.service.BoutiqueServiceManager;
import com.pranjal.boutique.service.ImageService;
import com.pranjal.boutique.service.InquiryService;
import com.pranjal.boutique.service.RentalProductService;
import com.pranjal.boutique.service.ReviewService;
import com.pranjal.boutique.service.SiteSettingsService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final BoutiqueServiceManager boutiqueServiceManager;
    private final InquiryService inquiryService;
    private final ReviewService reviewService;
    private final ImageService imageService;
    private final SiteSettingsService siteSettingsService;
    private final RentalProductService rentalProductService;

    public AdminController(BoutiqueServiceManager boutiqueServiceManager, InquiryService inquiryService,
            ReviewService reviewService, ImageService imageService,
            SiteSettingsService siteSettingsService,
            RentalProductService rentalProductService) {
        this.boutiqueServiceManager = boutiqueServiceManager;
        this.inquiryService = inquiryService;
        this.reviewService = reviewService;
        this.imageService = imageService;
        this.siteSettingsService = siteSettingsService;
        this.rentalProductService = rentalProductService;
    }

    @PostMapping("/services")
    public BoutiqueService createService(@Valid @RequestBody ServiceRequest request) {
        return boutiqueServiceManager.create(request);
    }

    @PutMapping("/services/{id}")
    public BoutiqueService updateService(@PathVariable String id, @Valid @RequestBody ServiceRequest request) {
        return boutiqueServiceManager.update(id, request);
    }

    @DeleteMapping("/services/{id}")
    public void deleteService(@PathVariable String id) {
        boutiqueServiceManager.delete(id);
    }

    @GetMapping("/services/category-counts")
    public List<ServiceCategoryCountResponse> getServiceCategoryCounts() {
        return boutiqueServiceManager.getServiceCategoryCounts();
    }

    @GetMapping("/rental-products")
    public List<RentalProduct> getRentalProducts(
            @RequestParam(required = false) String section,
            @RequestParam(required = false) String category) {
        return rentalProductService.getProducts(section, category);
    }

    @PostMapping("/rental-products")
    public RentalProduct createRentalProduct(@Valid @RequestBody RentalProductRequest request) {
        return rentalProductService.create(request);
    }

    @PutMapping("/rental-products/{id}")
    public RentalProduct updateRentalProduct(@PathVariable String id,
            @Valid @RequestBody RentalProductRequest request) {
        return rentalProductService.update(id, request);
    }

    @DeleteMapping("/rental-products/{id}")
    public void deleteRentalProduct(@PathVariable String id) {
        rentalProductService.delete(id);
    }

    @GetMapping("/rental-products/category-counts")
    public List<RentalCategoryCountResponse> getRentalCategoryCounts() {
        return rentalProductService.getCategoryCounts();
    }

    @GetMapping("/inquiries")
    public List<Inquiry> getInquiries() {
        return inquiryService.getAll();
    }

    @PutMapping("/inquiries/{id}/status")
    public Inquiry updateInquiryStatus(@PathVariable String id,
            @Valid @RequestBody InquiryStatusUpdateRequest request) {
        return inquiryService.updateStatus(id, request.status());
    }

    @PutMapping("/inquiries/{id}/respond")
    public Inquiry respondToInquiry(@PathVariable String id,
            @Valid @RequestBody InquiryResponseRequest request) {
        return inquiryService.respondToInquiry(id, request.getAdminResponse());
    }

    @DeleteMapping("/inquiries/{id}")
    public ResponseEntity<Map<String, String>> deleteInquiry(@PathVariable String id) {
        try {
            inquiryService.delete(id);
            return ResponseEntity.ok(Map.of("message", "Inquiry deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/reviews")
    public List<Review> getReviews() {
        return reviewService.getAll();
    }

    @DeleteMapping("/reviews/{id}")
    public ResponseEntity<Map<String, String>> deleteReview(@PathVariable String id) {
        try {
            reviewService.delete(id);
            return ResponseEntity.ok(Map.of("message", "Review deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/site-settings")
    public SiteSettings getSiteSettings() {
        return siteSettingsService.getSettings();
    }

    @PutMapping("/site-settings")
    public SiteSettings updateSiteSettings(@Valid @RequestBody SiteSettingsRequest request) {
        return siteSettingsService.updateSettings(request);
    }

    /**
     * Upload an image file
     */
    @PostMapping("/images/upload")
    public ResponseEntity<Map<String, String>> uploadImage(@RequestParam("file") MultipartFile file) {
        try {
            String imageUrl = imageService.uploadImage(file);
            Map<String, String> response = new HashMap<>();
            response.put("imageUrl", imageUrl);
            response.put("message", "Image uploaded successfully");
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            return ResponseEntity.badRequest().body(
                    Map.of("error", "Failed to upload image: " + e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(
                    Map.of("error", e.getMessage()));
        }
    }

    /**
     * Delete an image file
     */
    @DeleteMapping("/images")
    public ResponseEntity<Map<String, String>> deleteImage(@RequestParam("imageUrl") String imageUrl) {
        try {
            imageService.deleteImage(imageUrl);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Image deleted successfully");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(
                    Map.of("error", e.getMessage()));
        }
    }

    /**
     * Update service with image
     */
    @PutMapping("/services/{id}/with-image")
    public ResponseEntity<?> updateServiceWithImage(
            @PathVariable String id,
            @RequestParam(value = "file", required = false) MultipartFile imageFile,
            @RequestParam("title") String title,
            @RequestParam("category") String category,
            @RequestParam("description") String description) {
        try {
            BoutiqueService existing = boutiqueServiceManager.getById(id);
            String imageUrl = existing.getImageUrl();

            // Handle image upload if provided
            if (imageFile != null && !imageFile.isEmpty()) {
                // Upload new image
                imageUrl = imageService.uploadImage(imageFile);

                // Delete old image if it exists
                if (existing.getImageUrl() != null && !existing.getImageUrl().isEmpty()) {
                    try {
                        imageService.deleteImage(existing.getImageUrl());
                    } catch (Exception e) {
                        // Log but don't fail if old image deletion fails
                    }
                }
            }

            // Create service request with image URL
            ServiceRequest request = new ServiceRequest(title,
                    category,
                    description,
                    imageUrl);

            // Update service
            BoutiqueService updatedService = boutiqueServiceManager.update(id, request);
            return ResponseEntity.ok(updatedService);
        } catch (IOException e) {
            return ResponseEntity.badRequest().body(
                    Map.of("error", "Failed to process image: " + e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(
                    Map.of("error", e.getMessage()));
        }
    }
}
