package com.pranjal.boutique.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record ReviewRequest(
        @NotBlank String reviewerName,
        @NotBlank String message,
        @Min(1) @Max(5) int stars
) {
}