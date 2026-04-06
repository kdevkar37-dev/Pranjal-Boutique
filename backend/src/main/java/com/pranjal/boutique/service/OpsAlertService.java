package com.pranjal.boutique.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Instant;
import java.util.Map;

@Service
public class OpsAlertService {

    private static final Logger logger = LoggerFactory.getLogger(OpsAlertService.class);

    @Value("${app.alerts.enabled:false}")
    private boolean alertsEnabled;

    @Value("${app.alerts.webhook-url:}")
    private String webhookUrl;

    @Value("${app.alerts.webhook-token:}")
    private String webhookToken;

    private final HttpClient httpClient = HttpClient.newHttpClient();

    public void notifyWarning(String eventType, String message, Map<String, Object> details) {
        if (!alertsEnabled || webhookUrl == null || webhookUrl.isBlank()) {
            return;
        }

        String detailsJson = toJsonObject(details);
        String payload = "{" +
                "\"timestamp\":\"" + Instant.now() + "\"," +
                "\"severity\":\"WARN\"," +
                "\"eventType\":\"" + escapeJson(eventType) + "\"," +
                "\"message\":\"" + escapeJson(message) + "\"," +
                "\"details\":" + detailsJson +
                "}";

        try {
            HttpRequest.Builder requestBuilder = HttpRequest.newBuilder()
                    .uri(URI.create(webhookUrl))
                    .header("Content-Type", MediaType.APPLICATION_JSON_VALUE)
                    .POST(HttpRequest.BodyPublishers.ofString(payload));

            if (webhookToken != null && !webhookToken.isBlank()) {
                requestBuilder.header("X-Alert-Token", webhookToken);
            }

            HttpResponse<String> response = httpClient.send(requestBuilder.build(),
                    HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 300) {
                logger.warn("Ops alert webhook returned non-success status: {}", response.statusCode());
            }
        } catch (Exception ex) {
            logger.warn("Failed to send ops alert webhook: {}", ex.getMessage());
        }
    }

    private String toJsonObject(Map<String, Object> details) {
        if (details == null || details.isEmpty()) {
            return "{}";
        }

        StringBuilder sb = new StringBuilder("{");
        boolean first = true;
        for (Map.Entry<String, Object> entry : details.entrySet()) {
            if (!first) {
                sb.append(',');
            }
            first = false;
            sb.append("\"").append(escapeJson(entry.getKey())).append("\":");
            Object value = entry.getValue();
            if (value == null) {
                sb.append("null");
            } else {
                sb.append("\"").append(escapeJson(String.valueOf(value))).append("\"");
            }
        }
        sb.append('}');
        return sb.toString();
    }

    private String escapeJson(String value) {
        return value.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");
    }
}
