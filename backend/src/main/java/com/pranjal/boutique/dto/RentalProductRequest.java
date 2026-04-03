package com.pranjal.boutique.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RentalProductRequest(
        @NotBlank @Size(max = 120) String name,
        @NotBlank @Pattern(regexp = "(?i)RENTAL|CUSTOMIZATION", message = "Section must be RENTAL or CUSTOMIZATION") String section,
        @NotBlank @Size(max = 120) String category,
        @NotBlank @Size(max = 1200) String description,
        @NotBlank @Size(max = 1000) String imageUrl) {
}
