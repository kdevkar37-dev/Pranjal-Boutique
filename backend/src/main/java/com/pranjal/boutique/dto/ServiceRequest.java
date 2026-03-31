package com.pranjal.boutique.dto;

import com.pranjal.boutique.model.ServiceCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ServiceRequest(
        @NotBlank String title,
        @NotNull ServiceCategory category,
        @NotBlank String description,
        @NotBlank String imageUrl
) {
}
