package com.pranjal.boutique.repository;

import com.pranjal.boutique.model.SiteSettings;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface SiteSettingsRepository extends MongoRepository<SiteSettings, String> {
}
