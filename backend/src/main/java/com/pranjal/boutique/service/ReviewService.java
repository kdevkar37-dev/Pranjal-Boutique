package com.pranjal.boutique.service;

import com.pranjal.boutique.dto.ReviewAnalyticsResponse;
import com.pranjal.boutique.dto.ReviewRequest;
import com.pranjal.boutique.model.Review;
import com.pranjal.boutique.repository.ReviewRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;

    public ReviewService(ReviewRepository reviewRepository) {
        this.reviewRepository = reviewRepository;
    }

    public Review create(ReviewRequest request) {
        Review review = new Review();
        review.setReviewerName(request.reviewerName());
        review.setMessage(request.message());
        review.setStars(request.stars());
        review.setCreatedAt(Instant.now());
        return reviewRepository.save(review);
    }

    public List<Review> getAll() {
        return reviewRepository.findAllByOrderByCreatedAtDesc();
    }

    public ReviewAnalyticsResponse getAnalytics() {
        List<Review> reviews = getAll();
        long totalReviews = reviews.size();

        Map<Integer, Long> distribution = new LinkedHashMap<>();
        for (int i = 5; i >= 1; i--) {
            distribution.put(i, 0L);
        }

        long totalStars = 0;
        for (Review review : reviews) {
            int stars = review.getStars();
            if (stars >= 1 && stars <= 5) {
                distribution.put(stars, distribution.get(stars) + 1);
                totalStars += stars;
            }
        }

        double averageRating = totalReviews == 0 ? 0.0 : (double) totalStars / totalReviews;

        return new ReviewAnalyticsResponse(totalReviews, averageRating, distribution);
    }

    public void delete(String id) {
        if (!reviewRepository.existsById(id)) {
            throw new RuntimeException("Review not found");
        }
        reviewRepository.deleteById(id);
    }
}