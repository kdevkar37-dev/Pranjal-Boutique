package com.pranjal.boutique.dto;

public record ServiceCategoryCountResponse(
        String category,
        long itemCount,
        long imageCount) {
}
