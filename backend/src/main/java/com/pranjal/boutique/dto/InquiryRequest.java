package com.pranjal.boutique.dto;

import jakarta.validation.constraints.NotBlank;

public record InquiryRequest(
        @NotBlank String customerName,
        @NotBlank String phone,
        @NotBlank String serviceType,
        @NotBlank String message
) {
}
