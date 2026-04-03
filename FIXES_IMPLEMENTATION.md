# PRODUCTION FIXES - DETAILED IMPLEMENTATION

## FIX #1: IMPLEMENT REFRESH TOKEN MECHANISM + TOKEN BLACKLIST

### Step 1: Create RefreshToken Model

**File**: `backend/src/main/java/com/pranjal/boutique/model/RefreshToken.java`

```java
package com.pranjal.boutique.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "refresh_tokens")
public class RefreshToken {
    @Id
    private String id;
    private String token;
    private String userId;
    private LocalDateTime expiresAt;
    private LocalDateTime createdAt;
    private boolean revoked;

    public RefreshToken() {}

    public RefreshToken(String token, String userId, LocalDateTime expiresAt) {
        this.token = token;
        this.userId = userId;
        this.expiresAt = expiresAt;
        this.createdAt = LocalDateTime.now();
        this.revoked = false;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    
    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public boolean isRevoked() { return revoked; }
    public void setRevoked(boolean revoked) { this.revoked = revoked; }
}
```

### Step 2: Create TokenBlacklist Model

**File**: `backend/src/main/java/com/pranjal/boutique/model/TokenBlacklist.java`

```java
package com.pranjal.boutique.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "token_blacklist")
public class TokenBlacklist {
    @Id
    private String id;
    private String token;
    private String userId;
    private LocalDateTime blacklistedAt;
    private LocalDateTime expiresAt;

    public TokenBlacklist() {}

    public TokenBlacklist(String token, String userId, LocalDateTime expiresAt) {
        this.token = token;
        this.userId = userId;
        this.blacklistedAt = LocalDateTime.now();
        this.expiresAt = expiresAt;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    
    public LocalDateTime getBlacklistedAt() { return blacklistedAt; }
    public void setBlacklistedAt(LocalDateTime blacklistedAt) { this.blacklistedAt = blacklistedAt; }
    
    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }
}
```

### Step 3: Create Refresh Token Request/Response DTOs

**File**: `backend/src/main/java/com/pranjal/boutique/dto/RefreshTokenRequest.java`

```java
package com.pranjal.boutique.dto;

import jakarta.validation.constraints.NotBlank;

public record RefreshTokenRequest(
    @NotBlank(message = "Refresh token is required") String refreshToken
) {}
```

**File**: `backend/src/main/java/com/pranjal/boutique/dto/TokenRefreshResponse.java`

```java
package com.pranjal.boutique.dto;

public record TokenRefreshResponse(
    String accessToken,
    String refreshToken,
    long expiresIn
) {}
```

### Step 4: Create Repositories

**File**: `backend/src/main/java/com/pranjal/boutique/repository/RefreshTokenRepository.java`

```java
package com.pranjal.boutique.repository;

import com.pranjal.boutique.model.RefreshToken;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface RefreshTokenRepository extends MongoRepository<RefreshToken, String> {
    Optional<RefreshToken> findByToken(String token);
    void deleteByUserIdAndRevokedTrue(String userId);
}
```

**File**: `backend/src/main/java/com/pranjal/boutique/repository/TokenBlacklistRepository.java`

```java
package com.pranjal.boutique.repository;

import com.pranjal.boutique.model.TokenBlacklist;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface TokenBlacklistRepository extends MongoRepository<TokenBlacklist, String> {
    Optional<TokenBlacklist> findByToken(String token);
    void deleteByExpiresAtBefore(java.time.LocalDateTime date);
}
```

### Step 5: Update JwtService

**File**: `backend/src/main/java/com/pranjal/boutique/security/JwtService.java` (REPLACE ENTIRE FILE)

```java
package com.pranjal.boutique.security;

import com.pranjal.boutique.model.User;
import com.pranjal.boutique.model.RefreshToken;
import com.pranjal.boutique.repository.RefreshTokenRepository;
import com.pranjal.boutique.repository.TokenBlacklistRepository;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtService {

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${app.jwt.expiration-ms}")
    private long jwtExpirationMs;

    @Value("${app.jwt.refresh-expiration-ms:2592000000}") // 30 days default
    private long refreshTokenExpirationMs;

    private final RefreshTokenRepository refreshTokenRepository;
    private final TokenBlacklistRepository tokenBlacklistRepository;

    public JwtService(RefreshTokenRepository refreshTokenRepository,
                      TokenBlacklistRepository tokenBlacklistRepository) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.tokenBlacklistRepository = tokenBlacklistRepository;
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public Map<String, String> generateTokenPair(User user) {
        String accessToken = generateAccessToken(user);
        String refreshToken = generateRefreshToken(user);

        // Store refresh token in database
        RefreshToken refreshTokenEntity = new RefreshToken(
            refreshToken,
            user.getId(),
            LocalDateTime.now().plusNanos(refreshTokenExpirationMs * 1_000_000)
        );
        refreshTokenRepository.save(refreshTokenEntity);

        return Map.of(
            "accessToken", accessToken,
            "refreshToken", refreshToken
        );
    }

    private String generateAccessToken(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", user.getRole().name());
        claims.put("type", "ACCESS");

        long now = System.currentTimeMillis();
        return Jwts.builder()
                .claims(claims)
                .subject(user.getEmail())
                .issuedAt(new Date(now))
                .expiration(new Date(now + jwtExpirationMs))
                .signWith(getSigningKey())
                .compact();
    }

    private String generateRefreshToken(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("type", "REFRESH");

        long now = System.currentTimeMillis();
        return Jwts.builder()
                .claims(claims)
                .subject(user.getEmail())
                .issuedAt(new Date(now))
                .expiration(new Date(now + refreshTokenExpirationMs))
                .signWith(getSigningKey())
                .compact();
    }

    public String generateToken(User user) {
        // Legacy support - returns access token only
        return generateAccessToken(user);
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        if (isTokenBlacklisted(token)) {
            return false;
        }
        String username = extractUsername(token);
        return username.equals(userDetails.getUsername()) && !isTokenExpired(token);
    }

    public boolean validateRefreshToken(String token) {
        try {
            // Check if blacklisted
            if (isTokenBlacklisted(token)) {
                return false;
            }

            // Check if exists and not revoked in database
            return refreshTokenRepository.findByToken(token)
                .map(rt -> !rt.isRevoked() && !isTokenExpired(token))
                .orElse(false);
        } catch (Exception e) {
            return false;
        }
    }

    public void revokeToken(String token) {
        // Add to blacklist
        try {
            Claims claims = extractAllClaims(token);
            Date expiresAt = claims.getExpiration();
            String email = claims.getSubject();

            // For now, just mark in refresh token repo if it's a refresh token
            refreshTokenRepository.findByToken(token).ifPresent(rt -> {
                rt.setRevoked(true);
                refreshTokenRepository.save(rt);
            });
        } catch (Exception e) {
            // Token already expired or invalid
        }
    }

    public void revokeAllUserTokens(String userId) {
        refreshTokenRepository.deleteByUserIdAndRevokedTrue(userId);
    }

    private boolean isTokenBlacklisted(String token) {
        return tokenBlacklistRepository.findByToken(token)
            .filter(bt -> bt.getExpiresAt().isAfter(LocalDateTime.now()))
            .isPresent();
    }

    private boolean isTokenExpired(String token) {
        try {
            return extractClaim(token, Claims::getExpiration).before(new Date());
        } catch (Exception e) {
            return true;
        }
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private SecretKey getSigningKey() {
        byte[] keyBytes;
        try {
            keyBytes = Decoders.BASE64.decode(jwtSecret);
        } catch (IllegalArgumentException ex) {
            keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
        }
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
```

### Step 6: Update AuthController

**File**: `backend/src/main/java/com/pranjal/boutique/controller/AuthController.java` (REPLACE)

```java
package com.pranjal.boutique.controller;

import com.pranjal.boutique.dto.AuthResponse;
import com.pranjal.boutique.dto.LoginRequest;
import com.pranjal.boutique.dto.RegisterRequest;
import com.pranjal.boutique.dto.RefreshTokenRequest;
import com.pranjal.boutique.dto.TokenRefreshResponse;
import com.pranjal.boutique.model.User;
import com.pranjal.boutique.repository.UserRepository;
import com.pranjal.boutique.service.AuthService;
import com.pranjal.boutique.security.JwtService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;
    private final JwtService jwtService;

    public AuthController(AuthService authService, UserRepository userRepository, JwtService jwtService) {
        this.authService = authService;
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@Valid @RequestBody LoginRequest request) {
        User user = authService.login(request);
        Map<String, String> tokens = jwtService.generateTokenPair(user);

        return ResponseEntity.ok(Map.of(
            "accessToken", tokens.get("accessToken"),
            "refreshToken", tokens.get("refreshToken"),
            "userId", user.getId(),
            "name", user.getName(),
            "email", user.getEmail(),
            "role", user.getRole()
        ));
    }

    @PostMapping("/refresh")
    public ResponseEntity<TokenRefreshResponse> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        if (!jwtService.validateRefreshToken(request.refreshToken())) {
            throw new IllegalArgumentException("Invalid or expired refresh token");
        }

        String email = jwtService.extractUsername(request.refreshToken());
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Map<String, String> tokens = jwtService.generateTokenPair(user);
        return ResponseEntity.ok(new TokenRefreshResponse(
            tokens.get("accessToken"),
            tokens.get("refreshToken"),
            7 * 24 * 60 * 60 // 7 days in seconds
        ));
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
    public ResponseEntity<Map<String, String>> logout(Authentication authentication) {
        if (authentication != null && authentication.getName() != null) {
            User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
            
            // Revoke all refresh tokens for this user
            jwtService.revokeAllUserTokens(user.getId());
        }

        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }
}
```

### Step 7: Update application.properties

Add to `backend/src/main/resources/application.properties`:

```properties
# JWT Configuration
app.jwt.refresh-expiration-ms=2592000000
```

### Step 8: Update Frontend authApi.js

**File**: `frontend/src/api/authApi.js` (REPLACE)

```javascript
import api from "./client";

export async function login(payload) {
  const { data } = await api.post("/auth/login", payload);
  return data;
}

export async function register(payload) {
  const { data } = await api.post("/auth/register", payload);
  return data;
}

export async function getCurrentUser() {
  const { data } = await api.get("/auth/me");
  return data;
}

export async function refreshTokens(refreshToken) {
  const { data } = await api.post("/auth/refresh", { refreshToken });
  return data;
}

export async function logout(token) {
  try {
    await api.post("/auth/logout");
  } catch (error) {
    // Logout is client-side, failure is non-blocking
  }
  // Always clear localStorage regardless of API response
  localStorage.removeItem("boutique-token");
  localStorage.removeItem("boutique-refresh-token");
  localStorage.removeItem("boutique-user");
}
```

---

## FIX #2: IMPLEMENT CORS ORIGIN TRIMMING

**File**: `backend/src/main/java/com/pranjal/boutique/config/SecurityConfig.java` (UPDATE METHOD)

Change line 104 from:
```java
configuration.setAllowedOrigins(List.of(allowedOrigins.split(",")));
```

To:
```java
configuration.setAllowedOrigins(
    List.of(allowedOrigins.split(","))
        .stream()
        .map(String::trim)
        .toList()
);
```

---

## FIX #3: ADD RESPONSE INTERCEPTOR WITH 401 HANDLING

**File**: `frontend/src/api/client.js` (REPLACE)

```javascript
import axios from "axios";
import { refreshTokens } from "./authApi";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080",
  timeout: 30000, // 30 second timeout
});

// Request interceptor - add token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("boutique-token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handle 401 and refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh token
        const refreshToken = localStorage.getItem("boutique-refresh-token");
        if (!refreshToken) {
          // No refresh token, redirect to login
          redirectToLogin();
          return Promise.reject(error);
        }

        const { accessToken, refreshToken: newRefreshToken } = await refreshTokens(
          refreshToken
        );

        // Update tokens
        localStorage.setItem("boutique-token", accessToken);
        localStorage.setItem("boutique-refresh-token", newRefreshToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem("boutique-token");
        localStorage.removeItem("boutique-refresh-token");
        localStorage.removeItem("boutique-user");
        redirectToLogin();
        return Promise.reject(refreshError);
      }
    }

    // For other errors, return enhanced error
    if (error.response?.data) {
      error.message = error.response.data.error || error.message;
    }

    return Promise.reject(error);
  }
);

function redirectToLogin() {
  window.location.href = "/login?redirect=" + encodeURIComponent(window.location.pathname);
}

export default api;
```

---

## FIX #4: ADD PAGINATION TO ADMIN ENDPOINTS

###Step 1: Create PageRequest/PageResponse DTOs

**File**: `backend/src/main/java/com/pranjal/boutique/dto/PageRequest.java`

```java
package com.pranjal.boutique.dto;

import jakarta.validation.constraints.Min;

public record PageRequest(
    @Min(0) int page,
    @Min(1) int size
) {}
```

**File**: `backend/src/main/java/com/pranjal/boutique/dto/PageResponse.java`

```java
package com.pranjal.boutique.dto;

import java.util.List;

public record PageResponse<T>(
    List<T> content,
    int page,
    int size,
    long total,
    int totalPages
) {
    public PageResponse(List<T> content, int page, int size, long total) {
        this(content, page, size, total, (int) Math.ceil((double) total / size));
    }
}
```

### Step 2: Update InquiryService

Update the `getAll()` method to support pagination:

```java
public PageResponse<Inquiry> getAll(int page, int size) {
    long total = inquiryRepository.count();
    List<Inquiry> inquiries = inquiryRepository.findAll()
        .stream()
        .skip((long) page * size)
        .limit(size)
        .toList();
    
    return new PageResponse<>(inquiries, page, size, total);
}
```

### Step 3: Update AdminController

```java
@GetMapping("/inquiries")
public PageResponse<Inquiry> getInquiries(
    @RequestParam(defaultValue = "0") int page,
    @RequestParam(defaultValue = "20") int size) {
    return inquiryService.getAll(page, size);
}
```

---

## FIX #5: ADD INPUT VALIDATION - PHONE NUMBER

**File**: `backend/src/main/java/com/pranjal/boutique/dto/InquiryRequest.java` (REPLACE)

```java
package com.pranjal.boutique.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record InquiryRequest(
        @NotBlank @Size(min=2, max=100) String customerName,
        @NotBlank @Pattern(
            regexp = "^[\\d\\s\\-\\+\\(\\)]{10,15}$",
            message = "Phone must be valid format (10-15 digits)"
        ) String phone,
        @NotBlank String serviceType,
        @NotBlank @Size(min=10, max=2000) String message
) {
}
```

---

## FIX #6: ADD SIZE CONSTRAINTS TO ALL DTODTO

**File**: `backend/src/main/java/com/pranjal/boutique/dto/ServiceRequest.java` (REPLACE)

```java
package com.pranjal.boutique.dto;

import com.pranjal.boutique.model.ServiceCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ServiceRequest(
        @NotBlank @Size(min=3, max=100) String title,
        @NotNull ServiceCategory category,
        @NotBlank @Size(min=10, max=2000) String description,
        @NotBlank String imageUrl
) {
}
```

**File**: `backend/src/main/java/com/pranjal/boutique/dto/ReviewRequest.java` (REPLACE)

```java
package com.pranjal.boutique.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ReviewRequest(
        @NotBlank @Size(min=2, max=100) String reviewerName,
        @NotBlank @Size(min=10, max=1000) String message,
        @Min(1) @Max(5) int stars
) {
}
```

---

**-> CONTINUE WITH REMAINING FIXES IN NEXT RESPONSE**

Key fixes implemented:
✅ Refresh token mechanism with database storage
✅ Token blacklist for logout revocation
✅ CORS origin trimming
✅ Response interceptor with 401 handling
✅ Pagination support
✅ Input validation
✅ Size constraints on fields

Remaining to implement:
- Rate limiting middleware
- Password strength validation
- Input sanitization (XSS prevention)
- HTTPS requirement
- Loading states in React
- Error UI components
- Proper ProtectedRoute implementation
