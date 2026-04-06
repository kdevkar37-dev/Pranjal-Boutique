package com.pranjal.boutique.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
                @NotBlank @Size(min = 2, max = 80) String name,
                @NotBlank @Email @Size(max = 120) String email,
                @NotBlank @Size(min = 8, max = 128) @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z\\d]).+$", message = "Password must include uppercase, lowercase, number, and special character") String password) {
}
