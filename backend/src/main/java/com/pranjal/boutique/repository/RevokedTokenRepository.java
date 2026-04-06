package com.pranjal.boutique.repository;

import com.pranjal.boutique.model.RevokedToken;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.Instant;
import java.util.Optional;

public interface RevokedTokenRepository extends MongoRepository<RevokedToken, String> {
    Optional<RevokedToken> findByTokenHash(String tokenHash);

    long deleteByExpiresAtBefore(Instant now);
}
