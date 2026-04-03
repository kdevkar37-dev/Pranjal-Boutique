package com.pranjal.boutique.dto;

import jakarta.validation.constraints.NotBlank;

public record ServiceRequest(
                @NotBlank String title,
                @NotBlank String category,
                @NotBlank String description,
                @NotBlank String imageUrl) {
}
