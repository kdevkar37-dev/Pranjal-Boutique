package com.pranjal.boutique.service;

import com.pranjal.boutique.model.RefreshToken;
import com.pranjal.boutique.repository.RefreshTokenRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.HexFormat;
import java.util.List;
import java.util.UUID;

@Service
public class RefreshTokenService {

    @Value("${app.jwt.refresh-expiration-ms:2592000000}")
    private long refreshExpirationMs;

    private final RefreshTokenRepository refreshTokenRepository;

    public RefreshTokenService(RefreshTokenRepository refreshTokenRepository) {
        this.refreshTokenRepository = refreshTokenRepository;
    }

    public String createToken(String userEmail) {
        cleanupExpired();

        String rawToken = UUID.randomUUID() + "." + UUID.randomUUID();

        RefreshToken token = new RefreshToken();
        token.setTokenHash(hash(rawToken));
        token.setUserEmail(userEmail);
        token.setCreatedAt(Instant.now());
        token.setExpiresAt(Instant.now().plusMillis(refreshExpirationMs));
        token.setRevoked(false);

        refreshTokenRepository.save(token);
        return rawToken;
    }

    public RotationResult rotateToken(String rawToken) {
        cleanupExpired();

        RefreshToken token = refreshTokenRepository.findByTokenHash(hash(rawToken))
                .orElseThrow(() -> new IllegalArgumentException("Invalid refresh token"));

        if (token.isRevoked() || token.getExpiresAt().isBefore(Instant.now())) {
            throw new IllegalArgumentException("Refresh token expired or revoked");
        }

        token.setRevoked(true);
        refreshTokenRepository.save(token);

        String newRawToken = createToken(token.getUserEmail());
        return new RotationResult(token.getUserEmail(), newRawToken);
    }

    public void revokeToken(String rawToken) {
        if (rawToken == null || rawToken.isBlank()) {
            return;
        }

        refreshTokenRepository.findByTokenHash(hash(rawToken)).ifPresent(token -> {
            if (!token.isRevoked()) {
                token.setRevoked(true);
                refreshTokenRepository.save(token);
            }
        });
    }

    public void revokeAllUserTokens(String userEmail) {
        List<RefreshToken> userTokens = refreshTokenRepository.findByUserEmail(userEmail);
        if (userTokens.isEmpty()) {
            return;
        }

        for (RefreshToken token : userTokens) {
            token.setRevoked(true);
        }

        refreshTokenRepository.saveAll(userTokens);
    }

    public long getRefreshExpirationSeconds() {
        return Math.max(1, refreshExpirationMs / 1000);
    }

    private void cleanupExpired() {
        refreshTokenRepository.deleteByExpiresAtBefore(Instant.now());
    }

    private String hash(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(value.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 algorithm unavailable", e);
        }
    }

    public record RotationResult(String userEmail, String newRawToken) {
    }
}
