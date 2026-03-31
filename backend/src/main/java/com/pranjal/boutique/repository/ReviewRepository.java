package com.pranjal.boutique.repository;

import com.pranjal.boutique.model.Review;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ReviewRepository extends MongoRepository<Review, String> {

    List<Review> findAllByOrderByCreatedAtDesc();
}