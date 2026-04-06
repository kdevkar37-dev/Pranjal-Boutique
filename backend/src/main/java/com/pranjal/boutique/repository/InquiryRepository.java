package com.pranjal.boutique.repository;

import com.pranjal.boutique.model.Inquiry;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface InquiryRepository extends MongoRepository<Inquiry, String> {
    List<Inquiry> findAllByOrderByCreatedAtDesc();
}
