package com.pranjal.boutique.controller;

import com.pranjal.boutique.dto.AuthResponse;
import com.pranjal.boutique.dto.LoginRequest;
import com.pranjal.boutique.dto.RegisterRequest;
import com.pranjal.boutique.model.User;
import com.pranjal.boutique.repository.UserRepository;
import com.pranjal.boutique.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

	private final AuthService authService;
	private final UserRepository userRepository;

	public AuthController(AuthService authService, UserRepository userRepository) {
		this.authService = authService;
		this.userRepository = userRepository;
	}

	@PostMapping("/register")
	public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
		return authService.register(request);
	}

	@PostMapping("/login")
	public AuthResponse login(@Valid @RequestBody LoginRequest request) {
		return authService.login(request);
	}

	@GetMapping("/me")
	public AuthResponse me(Authentication authentication) {
		User user = userRepository.findByEmail(authentication.getName())
				.orElseThrow(() -> new IllegalArgumentException("User not found"));

		return new AuthResponse(
				null,
				user.getId(),
				user.getName(),
				user.getEmail(),
				user.getRole(),
				user.getProfilePic()
		);
	}

	@PostMapping("/logout")
	public void logout() {
		// Logout is handled client-side by clearing the JWT token
		// This endpoint is provided for completeness and can be used for server-side cleanup if needed
	}
}
