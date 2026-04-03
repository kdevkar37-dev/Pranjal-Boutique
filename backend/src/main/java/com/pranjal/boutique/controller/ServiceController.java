package com.pranjal.boutique.controller;

import com.pranjal.boutique.dto.InquiryRequest;
import com.pranjal.boutique.dto.ReviewAnalyticsResponse;
import com.pranjal.boutique.dto.ReviewRequest;
import com.pranjal.boutique.model.BoutiqueService;
import com.pranjal.boutique.model.Inquiry;
import com.pranjal.boutique.model.Review;
import com.pranjal.boutique.service.BoutiqueServiceManager;
import com.pranjal.boutique.service.InquiryService;
import com.pranjal.boutique.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/services")
public class ServiceController {

    private final BoutiqueServiceManager boutiqueServiceManager;
    private final InquiryService inquiryService;
    private final ReviewService reviewService;

    public ServiceController(BoutiqueServiceManager boutiqueServiceManager,
            InquiryService inquiryService,
            ReviewService reviewService) {
        this.boutiqueServiceManager = boutiqueServiceManager;
        this.inquiryService = inquiryService;
        this.reviewService = reviewService;
    }

    @GetMapping
    public List<BoutiqueService> getAll(@RequestParam(required = false) String category) {
        return boutiqueServiceManager.getServices(category);
    }

    @GetMapping("/{id}")
    public BoutiqueService getById(@PathVariable String id) {
        return boutiqueServiceManager.getById(id);
    }

    @PostMapping("/inquiries")
    public Inquiry createInquiry(@Valid @RequestBody InquiryRequest request) {
        return inquiryService.create(request);
    }

    @GetMapping("/reviews")
    public List<Review> getReviews() {
        return reviewService.getAll();
    }

    @PostMapping("/reviews")
    public Review createReview(@Valid @RequestBody ReviewRequest request) {
        return reviewService.create(request);
    }

    @GetMapping("/reviews/analytics")
    public ReviewAnalyticsResponse getReviewAnalytics() {
        return reviewService.getAnalytics();
    }
}
