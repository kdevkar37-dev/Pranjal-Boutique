package com.pranjal.boutique.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ReviewRequest(
                @NotBlank @Size(min = 2, max = 80) String reviewerName,
                @NotBlank @Size(min = 5, max = 1200) String message,
                @Min(1) @Max(5) int stars) {
}