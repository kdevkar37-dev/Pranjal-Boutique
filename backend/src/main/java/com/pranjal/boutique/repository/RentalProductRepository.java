package com.pranjal.boutique.repository;

import com.pranjal.boutique.model.RentalProduct;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface RentalProductRepository extends MongoRepository<RentalProduct, String> {
    List<RentalProduct> findBySectionIgnoreCase(String section);

    List<RentalProduct> findBySectionIgnoreCaseAndCategoryIgnoreCase(String section, String category);
}
