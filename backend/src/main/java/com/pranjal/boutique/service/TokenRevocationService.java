package com.pranjal.boutique.service;

import com.pranjal.boutique.model.RevokedToken;
import com.pranjal.boutique.repository.RevokedTokenRepository;
import com.pranjal.boutique.security.JwtService;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.HexFormat;

@Service
public class TokenRevocationService {

    private final RevokedTokenRepository revokedTokenRepository;
    private final JwtService jwtService;

    public TokenRevocationService(RevokedTokenRepository revokedTokenRepository, JwtService jwtService) {
        this.revokedTokenRepository = revokedTokenRepository;
        this.jwtService = jwtService;
    }

    public void revokeAccessToken(String jwt) {
        if (jwt == null || jwt.isBlank()) {
            return;
        }

        cleanupExpired();

        String tokenHash = hash(jwt);
        if (revokedTokenRepository.findByTokenHash(tokenHash).isPresent()) {
            return;
        }

        RevokedToken revokedToken = new RevokedToken();
        revokedToken.setTokenHash(tokenHash);
        revokedToken.setRevokedAt(Instant.now());
        revokedToken.setExpiresAt(jwtService.extractExpiration(jwt).toInstant());

        revokedTokenRepository.save(revokedToken);
    }

    public boolean isRevoked(String jwt) {
        if (jwt == null || jwt.isBlank()) {
            return false;
        }

        cleanupExpired();
        return revokedTokenRepository.findByTokenHash(hash(jwt)).isPresent();
    }

    private void cleanupExpired() {
        revokedTokenRepository.deleteByExpiresAtBefore(Instant.now());
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
}
