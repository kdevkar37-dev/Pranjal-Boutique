package com.pranjal.boutique.dto;

import java.util.Map;

public record ReviewAnalyticsResponse(
        long totalReviews,
        double averageRating,
        Map<Integer, Long> starDistribution
) {
}