package com.pranjal.boutique.repository;

import com.pranjal.boutique.model.RefreshToken;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface RefreshTokenRepository extends MongoRepository<RefreshToken, String> {
    Optional<RefreshToken> findByTokenHash(String tokenHash);

    List<RefreshToken> findByUserEmail(String userEmail);

    long deleteByExpiresAtBefore(Instant now);
}
