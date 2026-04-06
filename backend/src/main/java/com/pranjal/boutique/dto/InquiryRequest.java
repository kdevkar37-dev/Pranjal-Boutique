package com.pranjal.boutique.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record InquiryRequest(
                @NotBlank @Size(min = 2, max = 80) String customerName,
                @NotBlank @Pattern(regexp = "^\\+?[0-9][0-9\\-\\s]{7,19}$", message = "Invalid phone number format") String phone,
                @NotBlank @Size(min = 2, max = 80) String serviceType,
                @NotBlank @Size(min = 10, max = 1200) String message) {
}
