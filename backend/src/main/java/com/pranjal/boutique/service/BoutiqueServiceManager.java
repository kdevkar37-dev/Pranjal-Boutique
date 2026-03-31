package com.pranjal.boutique.service;

import com.pranjal.boutique.dto.ServiceRequest;
import com.pranjal.boutique.model.BoutiqueService;
import com.pranjal.boutique.model.ServiceCategory;
import com.pranjal.boutique.repository.BoutiqueServiceRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BoutiqueServiceManager {

    private final BoutiqueServiceRepository boutiqueServiceRepository;

    public BoutiqueServiceManager(BoutiqueServiceRepository boutiqueServiceRepository) {
        this.boutiqueServiceRepository = boutiqueServiceRepository;
    }

    public List<BoutiqueService> getServices(ServiceCategory category) {
        if (category == null) {
            return boutiqueServiceRepository.findAll();
        }
        return boutiqueServiceRepository.findByCategory(category);
    }

    public BoutiqueService getById(String id) {
        return boutiqueServiceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Service not found"));
    }

    public BoutiqueService create(ServiceRequest request) {
        BoutiqueService service = new BoutiqueService();
        map(request, service);
        return boutiqueServiceRepository.save(service);
    }

    public BoutiqueService update(String id, ServiceRequest request) {
        BoutiqueService existing = getById(id);
        map(request, existing);
        return boutiqueServiceRepository.save(existing);
    }

    public void delete(String id) {
        boutiqueServiceRepository.deleteById(id);
    }

    private void map(ServiceRequest request, BoutiqueService service) {
        service.setTitle(request.title());
        service.setCategory(request.category());
        service.setDescription(request.description());
        service.setImageUrl(request.imageUrl());
    }
}
