package com.pranjal.boutique.controller;

import com.pranjal.boutique.dto.AuthResponse;
import com.pranjal.boutique.dto.LoginRequest;
import com.pranjal.boutique.dto.RegisterRequest;
import com.pranjal.boutique.model.User;
import com.pranjal.boutique.repository.UserRepository;
import com.pranjal.boutique.service.AuthService;
import com.pranjal.boutique.service.RefreshTokenService;
import com.pranjal.boutique.service.TokenRevocationService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
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
	private final RefreshTokenService refreshTokenService;
	private final TokenRevocationService tokenRevocationService;

	@Value("${app.security.refresh-cookie-name:boutique_refresh}")
	private String refreshCookieName;

	@Value("${app.security.refresh-cookie-secure:true}")
	private boolean refreshCookieSecure;

	@Value("${app.security.refresh-cookie-same-site:Strict}")
	private String refreshCookieSameSite;

	public AuthController(
			AuthService authService,
			UserRepository userRepository,
			RefreshTokenService refreshTokenService,
			TokenRevocationService tokenRevocationService) {
		this.authService = authService;
		this.userRepository = userRepository;
		this.refreshTokenService = refreshTokenService;
		this.tokenRevocationService = tokenRevocationService;
	}

	@PostMapping("/register")
	public AuthResponse register(@Valid @RequestBody RegisterRequest request, HttpServletResponse response) {
		AuthResponse authResponse = authService.register(request);
		writeRefreshCookie(response, refreshTokenService.createToken(authResponse.email()));
		return authResponse;
	}

	@PostMapping("/login")
	public AuthResponse login(@Valid @RequestBody LoginRequest request, HttpServletResponse response) {
		AuthResponse authResponse = authService.login(request);
		writeRefreshCookie(response, refreshTokenService.createToken(authResponse.email()));
		return authResponse;
	}

	@PostMapping("/refresh")
	public AuthResponse refresh(HttpServletRequest request, HttpServletResponse response) {
		String refreshToken = extractCookie(request, refreshCookieName);
		if (refreshToken == null || refreshToken.isBlank()) {
			throw new IllegalArgumentException("Missing refresh token");
		}

		RefreshTokenService.RotationResult rotationResult = refreshTokenService.rotateToken(refreshToken);
		writeRefreshCookie(response, rotationResult.newRawToken());
		return authService.issueAccessTokenForEmail(rotationResult.userEmail());
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
				user.getProfilePic());
	}

	@PostMapping("/logout")
	public void logout(HttpServletRequest request, HttpServletResponse response) {
		String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
		if (authHeader != null && authHeader.startsWith("Bearer ")) {
			String accessToken = authHeader.substring(7);
			try {
				tokenRevocationService.revokeAccessToken(accessToken);
			} catch (Exception ignored) {
				// Ignore invalid/expired token during logout; refresh token revocation still
				// applies.
			}
		}

		String refreshToken = extractCookie(request, refreshCookieName);
		if (refreshToken != null) {
			refreshTokenService.revokeToken(refreshToken);
		}

		clearRefreshCookie(response);
	}

	private String extractCookie(HttpServletRequest request, String cookieName) {
		Cookie[] cookies = request.getCookies();
		if (cookies == null || cookieName == null) {
			return null;
		}

		for (Cookie cookie : cookies) {
			if (cookieName.equals(cookie.getName())) {
				return cookie.getValue();
			}
		}

		return null;
	}

	private void writeRefreshCookie(HttpServletResponse response, String refreshToken) {
		ResponseCookie cookie = ResponseCookie.from(refreshCookieName, refreshToken)
				.httpOnly(true)
				.secure(refreshCookieSecure)
				.sameSite(refreshCookieSameSite)
				.path("/api/auth")
				.maxAge(refreshTokenService.getRefreshExpirationSeconds())
				.build();
		response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
	}

	private void clearRefreshCookie(HttpServletResponse response) {
		ResponseCookie cookie = ResponseCookie.from(refreshCookieName, "")
				.httpOnly(true)
				.secure(refreshCookieSecure)
				.sameSite(refreshCookieSameSite)
				.path("/api/auth")
				.maxAge(0)
				.build();
		response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
	}
}
