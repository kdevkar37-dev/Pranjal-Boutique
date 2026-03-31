package com.pranjal.boutique.service;

import com.pranjal.boutique.dto.AuthResponse;
import com.pranjal.boutique.dto.LoginRequest;
import com.pranjal.boutique.dto.RegisterRequest;
import com.pranjal.boutique.model.Role;
import com.pranjal.boutique.model.User;
import com.pranjal.boutique.repository.UserRepository;
import com.pranjal.boutique.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class AuthService {

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	private final AuthenticationManager authenticationManager;
	private final JwtService jwtService;

	public AuthService(UserRepository userRepository,
					   PasswordEncoder passwordEncoder,
					   AuthenticationManager authenticationManager,
					   JwtService jwtService) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
		this.authenticationManager = authenticationManager;
		this.jwtService = jwtService;
	}

	public AuthResponse register(RegisterRequest request) {
		if (userRepository.existsByEmail(request.email())) {
			throw new IllegalArgumentException("Email already registered");
		}

		User user = new User();
		user.setName(request.name());
		user.setEmail(request.email());
		user.setPassword(passwordEncoder.encode(request.password()));
		user.setRole(Role.ROLE_USER);
		user.setProvider("local");

		User saved = userRepository.save(user);
		return createAuthResponse(saved);
	}

	public AuthResponse login(LoginRequest request) {
		authenticationManager.authenticate(
				new UsernamePasswordAuthenticationToken(request.email(), request.password())
		);

		User user = userRepository.findByEmail(request.email())
				.orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));

		return createAuthResponse(user);
	}

	public AuthResponse processOAuth2User(Map<String, Object> attributes) {
		String email = (String) attributes.get("email");
		if (email == null || email.isBlank()) {
			throw new IllegalArgumentException("Email not found from OAuth provider");
		}

		User user = userRepository.findByEmail(email).orElseGet(() -> {
			User newUser = new User();
			newUser.setEmail(email);
			newUser.setName((String) attributes.getOrDefault("name", "Google User"));
			newUser.setProfilePic((String) attributes.get("picture"));
			newUser.setRole(Role.ROLE_USER);
			newUser.setProvider("google");
			return newUser;
		});

		user.setName((String) attributes.getOrDefault("name", user.getName()));
		user.setProfilePic((String) attributes.getOrDefault("picture", user.getProfilePic()));
		user.setProvider("google");

		User saved = userRepository.save(user);
		return createAuthResponse(saved);
	}

	private AuthResponse createAuthResponse(User user) {
		String token = jwtService.generateToken(user);
		return new AuthResponse(
				token,
				user.getId(),
				user.getName(),
				user.getEmail(),
				user.getRole(),
				user.getProfilePic()
		);
	}
}
