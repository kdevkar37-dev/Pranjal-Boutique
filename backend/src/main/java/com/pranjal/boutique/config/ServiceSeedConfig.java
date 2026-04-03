package com.pranjal.boutique.config;

import com.pranjal.boutique.model.BoutiqueService;
import com.pranjal.boutique.model.ServiceCategory;
import com.pranjal.boutique.repository.BoutiqueServiceRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class ServiceSeedConfig {

    private static final Logger logger = LoggerFactory.getLogger(ServiceSeedConfig.class);

    @Bean
    CommandLineRunner seedServices(BoutiqueServiceRepository boutiqueServiceRepository) {
        return args -> {
            try {
                if (boutiqueServiceRepository.count() > 0) {
                    return;
                }
            } catch (Exception e) {
                logger.warn("MongoDB not available during seeding. Application will continue without initial data. Error: {}", e.getMessage());
                return;
            }

            BoutiqueService aari = new BoutiqueService();
            aari.setTitle("Aari Work");
            aari.setCategory(ServiceCategory.AARI);
            aari.setDescription("Royal zari and threadwork tailored for bridal and festive outfits.");
            aari.setImageUrl("https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1200&q=80");

            BoutiqueService embroidery = new BoutiqueService();
            embroidery.setTitle("Embroidery");
            embroidery.setCategory(ServiceCategory.EMBROIDERY);
            embroidery.setDescription("Hand-finished embroidery with premium detailing and modern silhouettes.");
            embroidery.setImageUrl("https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=80");

            BoutiqueService mehendi = new BoutiqueService();
            mehendi.setTitle("Mehendi Art");
            mehendi.setCategory(ServiceCategory.MEHENDI);
            mehendi.setDescription("Classic to contemporary mehendi patterns for brides and celebrations.");
            mehendi.setImageUrl("https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=80");

            BoutiqueService fabricPainting = new BoutiqueService();
            fabricPainting.setTitle("Fabric Painting");
            fabricPainting.setCategory(ServiceCategory.FABRIC_PAINTING);
            fabricPainting.setDescription("Fashion-forward painted motifs curated for contemporary festive edits.");
            fabricPainting.setImageUrl("https://images.unsplash.com/photo-1604480133435-25b86862d276?auto=format&fit=crop&w=1200&q=80");

            BoutiqueService flowerJewellery = new BoutiqueService();
            flowerJewellery.setTitle("Flower Jewellery");
            flowerJewellery.setCategory(ServiceCategory.FLOWER_JEWELLERY);
            flowerJewellery.setDescription("Fresh floral jewelry styling designed for haldi and mehendi ceremonies.");
            flowerJewellery.setImageUrl("https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=1200&q=80");

            BoutiqueService customDesign = new BoutiqueService();
            customDesign.setTitle("Custom Design");
            customDesign.setCategory(ServiceCategory.CUSTOM_DESIGN);
            customDesign.setDescription("Personalized bridal customization and design consultation services.");
            customDesign.setImageUrl("https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80");

            try {
                boutiqueServiceRepository.saveAll(List.of(aari, embroidery, mehendi, fabricPainting, flowerJewellery, customDesign));
                logger.info("✅ Services seeded successfully");
            } catch (Exception e) {
                logger.warn("Failed to seed services data: {}", e.getMessage());
            }
        };
    }
}
