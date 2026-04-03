package com.pranjal.boutique.repository;

import com.pranjal.boutique.model.BoutiqueService;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface BoutiqueServiceRepository extends MongoRepository<BoutiqueService, String> {
    List<BoutiqueService> findByCategoryIgnoreCase(String category);
}
