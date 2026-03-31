package com.pranjal.boutique.repository;

import com.pranjal.boutique.model.Inquiry;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface InquiryRepository extends MongoRepository<Inquiry, String> {
}
