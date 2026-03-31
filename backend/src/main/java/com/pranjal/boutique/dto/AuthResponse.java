package com.pranjal.boutique.dto;

import com.pranjal.boutique.model.Role;

public record AuthResponse(
        String token,
        String userId,
        String name,
        String email,
        Role role,
        String profilePic
) {
}
