package com.pranjal.boutique.service;

import com.pranjal.boutique.dto.RentalCategoryCountResponse;
import com.pranjal.boutique.dto.RentalProductRequest;
import com.pranjal.boutique.model.RentalProduct;
import com.pranjal.boutique.repository.RentalProductRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class RentalProductService {

    private static final List<String> DEFAULT_SECTIONS = List.of("RENTAL", "CUSTOMIZATION");

    private final RentalProductRepository rentalProductRepository;

    public RentalProductService(RentalProductRepository rentalProductRepository) {
        this.rentalProductRepository = rentalProductRepository;
    }

    public List<RentalProduct> getProducts(String section, String category) {
        List<RentalProduct> products;
        String normalizedSection = normalizeSection(section);
        String normalizedCategory = normalizeValue(category);

        if (normalizedSection == null) {
            products = rentalProductRepository.findAll();
        } else if (normalizedCategory == null) {
            products = rentalProductRepository.findBySectionIgnoreCase(normalizedSection);
        } else {
            products = rentalProductRepository.findBySectionIgnoreCaseAndCategoryIgnoreCase(normalizedSection,
                    normalizedCategory);
        }

        products.forEach(this::normalizeImageUrlForResponse);
        products.sort(
                Comparator.comparing(RentalProduct::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())));
        return products;
    }

    public RentalProduct create(RentalProductRequest request) {
        RentalProduct product = new RentalProduct();
        map(request, product);
        product.setCreatedAt(Instant.now());
        return rentalProductRepository.save(product);
    }

    public RentalProduct update(String id, RentalProductRequest request) {
        RentalProduct existing = rentalProductRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Rental product not found"));
        map(request, existing);
        return rentalProductRepository.save(existing);
    }

    public void delete(String id) {
        rentalProductRepository.deleteById(id);
    }

    public List<RentalCategoryCountResponse> getCategoryCounts() {
        List<RentalProduct> products = rentalProductRepository.findAll();

        Map<String, CountAccumulator> counts = new LinkedHashMap<>();
        DEFAULT_SECTIONS.forEach(section -> counts.put(section + "::__TOTAL__", new CountAccumulator(section, "ALL")));

        for (RentalProduct product : products) {
            String section = normalizeSection(product.getSection());
            String category = normalizeValue(product.getCategory());
            if (section == null || category == null) {
                continue;
            }

            String key = section + "::" + category.toUpperCase();
            CountAccumulator categoryAccumulator = counts.computeIfAbsent(
                    key,
                    ignored -> new CountAccumulator(section, category.toUpperCase()));
            categoryAccumulator.itemCount++;
            if (product.getImageUrl() != null && !product.getImageUrl().isBlank()) {
                categoryAccumulator.imageCount++;
            }

            CountAccumulator totalAccumulator = counts.computeIfAbsent(
                    section + "::__TOTAL__",
                    ignored -> new CountAccumulator(section, "ALL"));
            totalAccumulator.itemCount++;
            if (product.getImageUrl() != null && !product.getImageUrl().isBlank()) {
                totalAccumulator.imageCount++;
            }
        }

        List<RentalCategoryCountResponse> response = new ArrayList<>();
        counts.values().stream()
                .sorted(Comparator
                        .comparing(CountAccumulator::section)
                        .thenComparing(CountAccumulator::category))
                .forEach(entry -> response.add(
                        new RentalCategoryCountResponse(entry.section, entry.category, entry.itemCount,
                                entry.imageCount)));

        return response;
    }

    private void map(RentalProductRequest request, RentalProduct product) {
        product.setName(normalizeValue(request.name()));
        product.setSection(normalizeSection(request.section()));
        product.setCategory(normalizeValue(request.category()));
        product.setDescription(normalizeValue(request.description()));
        product.setImageUrl(normalizeImageUrlForStorage(request.imageUrl()));
    }

    private String normalizeSection(String section) {
        String value = normalizeValue(section);
        return value == null ? null : value.toUpperCase();
    }

    private String normalizeValue(String value) {
        if (value == null) {
            return null;
        }
        String normalized = value.trim();
        return normalized.isBlank() ? null : normalized;
    }

    private void normalizeImageUrlForResponse(RentalProduct product) {
        product.setImageUrl(normalizeImageUrlForStorage(product.getImageUrl()));
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

    private static class CountAccumulator {
        private final String section;
        private final String category;
        private long itemCount;
        private long imageCount;

        private CountAccumulator(String section, String category) {
            this.section = section;
            this.category = category;
        }

        private String section() {
            return section;
        }

        private String category() {
            return category;
        }
    }
}
