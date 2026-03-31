package com.pranjal.boutique.service;

import com.pranjal.boutique.dto.InquiryRequest;
import com.pranjal.boutique.model.Inquiry;
import com.pranjal.boutique.model.InquiryStatus;
import com.pranjal.boutique.repository.InquiryRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class InquiryService {

    private final InquiryRepository inquiryRepository;

    public InquiryService(InquiryRepository inquiryRepository) {
        this.inquiryRepository = inquiryRepository;
    }

    public Inquiry create(InquiryRequest request) {
        Inquiry inquiry = new Inquiry();
        inquiry.setCustomerName(request.customerName());
        inquiry.setPhone(request.phone());
        inquiry.setServiceType(request.serviceType());
        inquiry.setMessage(request.message());
        inquiry.setStatus(InquiryStatus.NEW);
        inquiry.setCreatedAt(Instant.now());

        return inquiryRepository.save(inquiry);
    }

    public List<Inquiry> getAll() {
        return inquiryRepository.findAll();
    }

    public Inquiry updateStatus(String id, InquiryStatus status) {
        Inquiry inquiry = inquiryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Inquiry not found"));
        inquiry.setStatus(status);
        return inquiryRepository.save(inquiry);
    }
}
