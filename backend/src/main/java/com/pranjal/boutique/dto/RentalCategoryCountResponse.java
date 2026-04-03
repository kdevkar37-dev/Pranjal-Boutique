package com.pranjal.boutique.dto;

public record RentalCategoryCountResponse(
        String section,
        String category,
        long itemCount,
        long imageCount) {
}
