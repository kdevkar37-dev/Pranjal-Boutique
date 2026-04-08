package com.pranjal.boutique.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ServiceRequest(
        @NotBlank @Size(min = 2, max = 120) String title,
        @NotBlank @Pattern(regexp = "^[A-Za-z0-9_\\s-]+$", message = "Category can contain letters, numbers, spaces, hyphen, underscore") @Size(min = 2, max = 40) String category,
        @NotBlank @Size(min = 3, max = 3000) String description,
        @NotBlank @Size(max = 500) String imageUrl) {
}
