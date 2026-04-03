package com.pranjal.boutique.config;

import com.pranjal.boutique.model.BoutiqueService;
import com.pranjal.boutique.repository.BoutiqueServiceRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Configuration
public class ServiceSeedConfig {

    private static final Logger logger = LoggerFactory.getLogger(ServiceSeedConfig.class);

    @Bean
    CommandLineRunner seedServices(BoutiqueServiceRepository boutiqueServiceRepository) {
        return args -> {
            List<BoutiqueService> defaults = List.of(
                    createDefaultService(
                            "Aari Work",
                            "AARI",
                            "Royal zari and threadwork tailored for bridal and festive outfits.",
                            "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1200&q=80"),
                    createDefaultService(
                            "Embroidery",
                            "EMBROIDERY",
                            "Hand-finished embroidery with premium detailing and modern silhouettes.",
                            "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=80"),
                    createDefaultService(
                            "Mehendi Art",
                            "MEHENDI",
                            "Classic to contemporary mehendi patterns for brides and celebrations.",
                            "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=80"),
                    createDefaultService(
                            "Fabric Painting",
                            "FABRIC_PAINTING",
                            "Fashion-forward painted motifs curated for contemporary festive edits.",
                            "https://images.unsplash.com/photo-1604480133435-25b86862d276?auto=format&fit=crop&w=1200&q=80"),
                    createDefaultService(
                            "Flower Jewellery",
                            "FLOWER_JEWELLERY",
                            "Fresh floral jewelry styling designed for haldi and mehendi ceremonies.",
                            "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=1200&q=80"),
                    createDefaultService(
                            "Custom Design",
                            "CUSTOM_DESIGN",
                            "Personalized bridal customization and design consultation services.",
                            "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80"));

            try {
                List<BoutiqueService> existingServices = boutiqueServiceRepository.findAll();
                Set<String> existingCategories = existingServices.stream()
                        .map(BoutiqueService::getCategory)
                        .filter(category -> category != null && !category.isBlank())
                        .map(String::trim)
                        .map(String::toUpperCase)
                        .collect(Collectors.toSet());

                List<BoutiqueService> missingDefaults = defaults.stream()
                        .filter(service -> !existingCategories.contains(service.getCategory().toUpperCase()))
                        .toList();

                if (missingDefaults.isEmpty()) {
                    return;
                }

                boutiqueServiceRepository.saveAll(missingDefaults);
                logger.info("✅ Seeded {} missing default service categories", missingDefaults.size());
            } catch (Exception e) {
                logger.warn(
                        "MongoDB not available during seeding. Application will continue without initial data. Error: {}",
                        e.getMessage());
            }
        };
    }

    private BoutiqueService createDefaultService(String title, String category, String description, String imageUrl) {
        BoutiqueService service = new BoutiqueService();
        service.setTitle(title);
        service.setCategory(category);
        service.setDescription(description);
        service.setImageUrl(imageUrl);
        return service;
    }
}
