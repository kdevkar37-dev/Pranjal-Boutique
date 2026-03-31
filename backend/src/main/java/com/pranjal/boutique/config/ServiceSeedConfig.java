package com.pranjal.boutique.config;

import com.pranjal.boutique.model.BoutiqueService;
import com.pranjal.boutique.model.ServiceCategory;
import com.pranjal.boutique.repository.BoutiqueServiceRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class ServiceSeedConfig {

    @Bean
    CommandLineRunner seedServices(BoutiqueServiceRepository boutiqueServiceRepository) {
        return args -> {
            if (boutiqueServiceRepository.count() > 0) {
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

            BoutiqueService fabricPainting = new BoutiqueService();
            fabricPainting.setTitle("Fabric Painting");
            fabricPainting.setCategory(ServiceCategory.EMBROIDERY);
            fabricPainting.setDescription("Custom hand-painted fabrics for festive attire and occasion wear.");
            fabricPainting.setImageUrl("https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1200&q=80");

            BoutiqueService mehendi = new BoutiqueService();
            mehendi.setTitle("Mehendi Art");
            mehendi.setCategory(ServiceCategory.MEHENDI);
            mehendi.setDescription("Classic to contemporary mehendi patterns for brides and celebrations.");
            mehendi.setImageUrl("https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=80");

            BoutiqueService flowerJewellery = new BoutiqueService();
            flowerJewellery.setTitle("Flower Jewellery");
            flowerJewellery.setCategory(ServiceCategory.EMBROIDERY);
            flowerJewellery.setDescription("Elegant floral jewellery sets for haldi, mehendi, and bridal shoots.");
            flowerJewellery.setImageUrl("https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=1200&q=80");

            boutiqueServiceRepository.saveAll(List.of(aari, embroidery, fabricPainting, mehendi, flowerJewellery));
        };
    }
}
