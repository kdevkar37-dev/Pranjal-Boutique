package com.pranjal.boutique.service;

import com.pranjal.boutique.dto.SiteSettingsRequest;
import com.pranjal.boutique.model.SiteSettings;
import com.pranjal.boutique.repository.SiteSettingsRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SiteSettingsService {

    private static final String SETTINGS_ID = "default";

    private final SiteSettingsRepository siteSettingsRepository;

    public SiteSettingsService(SiteSettingsRepository siteSettingsRepository) {
        this.siteSettingsRepository = siteSettingsRepository;
    }

    public SiteSettings getSettings() {
        SiteSettings settings = siteSettingsRepository.findById(SETTINGS_ID)
                .orElseGet(this::createDefaultSettings);

        // Migrate legacy single contact field to list if needed.
        if ((settings.getContactNumbers() == null || settings.getContactNumbers().isEmpty())
                && settings.getContactNumber() != null
                && !settings.getContactNumber().isBlank()) {
            settings.setContactNumbers(List.of(settings.getContactNumber().trim()));
            settings = siteSettingsRepository.save(settings);
        }

        return settings;
    }

    public SiteSettings updateSettings(SiteSettingsRequest request) {
        SiteSettings settings = getSettings();

        List<String> sanitizedContacts = request.contactNumbers().stream()
                .map(String::trim)
                .filter(value -> !value.isBlank())
                .distinct()
                .toList();

        if (sanitizedContacts.isEmpty()) {
            throw new IllegalArgumentException("At least one contact number is required");
        }

        settings.setContactNumbers(sanitizedContacts);
        settings.setContactNumber(sanitizedContacts.get(0));
        settings.setLocation(request.location().trim());
        settings.setGoogleMapsUrl(request.googleMapsUrl() == null ? "" : request.googleMapsUrl().trim());
        return siteSettingsRepository.save(settings);
    }

    private SiteSettings createDefaultSettings() {
        SiteSettings settings = new SiteSettings();
        settings.setId(SETTINGS_ID);
        settings.setContactNumber("+91 98765 43210");
        settings.setContactNumbers(List.of("+91 98765 43210", "+91 99887 76655"));
        settings.setLocation("Pune, Maharashtra, India");
        settings.setGoogleMapsUrl("");
        return siteSettingsRepository.save(settings);
    }
}
