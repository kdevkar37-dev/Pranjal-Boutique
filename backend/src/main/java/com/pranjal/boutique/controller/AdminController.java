package com.pranjal.boutique.controller;

import com.pranjal.boutique.dto.InquiryStatusUpdateRequest;
import com.pranjal.boutique.dto.ServiceRequest;
import com.pranjal.boutique.model.BoutiqueService;
import com.pranjal.boutique.model.Inquiry;
import com.pranjal.boutique.service.BoutiqueServiceManager;
import com.pranjal.boutique.service.InquiryService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final BoutiqueServiceManager boutiqueServiceManager;
    private final InquiryService inquiryService;

    public AdminController(BoutiqueServiceManager boutiqueServiceManager, InquiryService inquiryService) {
        this.boutiqueServiceManager = boutiqueServiceManager;
        this.inquiryService = inquiryService;
    }

    @PostMapping("/services")
    public BoutiqueService createService(@Valid @RequestBody ServiceRequest request) {
        return boutiqueServiceManager.create(request);
    }

    @PutMapping("/services/{id}")
    public BoutiqueService updateService(@PathVariable String id, @Valid @RequestBody ServiceRequest request) {
        return boutiqueServiceManager.update(id, request);
    }

    @DeleteMapping("/services/{id}")
    public void deleteService(@PathVariable String id) {
        boutiqueServiceManager.delete(id);
    }

    @GetMapping("/inquiries")
    public List<Inquiry> getInquiries() {
        return inquiryService.getAll();
    }

    @PutMapping("/inquiries/{id}/status")
    public Inquiry updateInquiryStatus(@PathVariable String id,
                                       @Valid @RequestBody InquiryStatusUpdateRequest request) {
        return inquiryService.updateStatus(id, request.status());
    }
}
