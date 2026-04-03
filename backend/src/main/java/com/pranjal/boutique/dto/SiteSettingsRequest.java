package com.pranjal.boutique.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotBlank;

import java.util.List;

public record SiteSettingsRequest(
        @NotEmpty List<@NotBlank String> contactNumbers,
        @NotBlank String location,
        String googleMapsUrl) {
}
