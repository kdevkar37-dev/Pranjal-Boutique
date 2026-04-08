package com.pranjal.boutique.service;

import com.pranjal.boutique.dto.ServiceRequest;
import com.pranjal.boutique.dto.ServiceCategoryCountResponse;
import com.pranjal.boutique.model.BoutiqueService;
import com.pranjal.boutique.repository.BoutiqueServiceRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class BoutiqueServiceManager {

    private static final List<String> DEFAULT_CATEGORIES = List.of(
            "AARI",
            "EMBROIDERY",
            "MEHENDI",
            "FABRIC_PAINTING",
            "FLOWER_JEWELLERY",
            "CUSTOM_DESIGN");

    private final BoutiqueServiceRepository boutiqueServiceRepository;

    public BoutiqueServiceManager(BoutiqueServiceRepository boutiqueServiceRepository) {
        this.boutiqueServiceRepository = boutiqueServiceRepository;
    }

    public List<BoutiqueService> getServices(String category) {
        List<BoutiqueService> services;
        if (category == null || category.isBlank()) {
            services = boutiqueServiceRepository.findAll();
        } else {
            services = boutiqueServiceRepository.findByCategoryIgnoreCase(normalizeCategory(category));
        }

        services.forEach(this::normalizeImageUrlForResponse);
        return services;
    }

    public BoutiqueService getById(String id) {
        BoutiqueService service = boutiqueServiceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Service not found"));
        normalizeImageUrlForResponse(service);
        return service;
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

    public List<ServiceCategoryCountResponse> getServiceCategoryCounts() {
        List<BoutiqueService> allServices = boutiqueServiceRepository.findAll();
        Map<String, CountAccumulator> counts = new LinkedHashMap<>();

        DEFAULT_CATEGORIES.forEach(category -> counts.put(category, new CountAccumulator()));

        allServices.stream()
                .map(BoutiqueService::getCategory)
                .map(this::normalizeCategory)
                .filter(category -> category != null && !category.isBlank())
                .filter(category -> !counts.containsKey(category.toUpperCase()))
                .map(String::toUpperCase)
                .distinct()
                .sorted(Comparator.naturalOrder())
                .forEach(category -> counts.put(category, new CountAccumulator()));

        for (BoutiqueService service : allServices) {
            String category = normalizeCategory(service.getCategory());
            if (category == null || category.isBlank()) {
                continue;
            }

            String normalizedCategory = category.toUpperCase();
            CountAccumulator accumulator = counts.computeIfAbsent(normalizedCategory, key -> new CountAccumulator());
            accumulator.itemCount++;

            if (service.getImageUrl() != null && !service.getImageUrl().isBlank()) {
                accumulator.imageCount++;
            }
        }

        List<ServiceCategoryCountResponse> response = new ArrayList<>();
        counts.forEach((category, accumulator) -> response
                .add(new ServiceCategoryCountResponse(category, accumulator.itemCount, accumulator.imageCount)));

        return response;
    }

    private void map(ServiceRequest request, BoutiqueService service) {
        service.setTitle(request.title());
        service.setCategory(normalizeCategory(request.category()));
        service.setDescription(request.description());
        service.setImageUrl(normalizeImageUrlForStorage(request.imageUrl()));
    }

    private String normalizeCategory(String category) {
        if (category == null) {
            return null;
        }

        String normalized = category.trim()
                .toUpperCase()
                .replaceAll("[\\s-]+", "_")
                .replaceAll("[^A-Z0-9_]", "");

        return normalized;
    }

    private static class CountAccumulator {
        private long itemCount;
        private long imageCount;
    }

    private void normalizeImageUrlForResponse(BoutiqueService service) {
        service.setImageUrl(normalizeImageUrlForStorage(service.getImageUrl()));
    }

    private String normalizeImageUrlForStorage(String imageUrl) {
        if (imageUrl == null || imageUrl.isBlank()) {
            return imageUrl;
        }

        String value = imageUrl.trim();

        if (value.startsWith("http://") || value.startsWith("https://")) {
            return value;
        }

        if (value.startsWith("/")) {
            value = value.substring(1);
        }

        if (value.startsWith("uploads/images/")) {
            return value;
        }

        if (value.startsWith("uploads/")) {
            return "uploads/images/" + value.substring("uploads/".length());
        }

        return "uploads/images/" + value;
    }
}
