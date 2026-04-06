package com.pranjal.boutique.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Component
public class RateLimitingFilter extends OncePerRequestFilter {

    @Value("${app.rate-limit.enabled:true}")
    private boolean rateLimitEnabled;

    @Value("${app.rate-limit.auth-max-per-minute:20}")
    private int authMaxPerMinute;

    @Value("${app.rate-limit.write-max-per-minute:60}")
    private int writeMaxPerMinute;

    @Value("${app.rate-limit.default-max-per-minute:180}")
    private int defaultMaxPerMinute;

    private final Map<String, WindowCounter> counters = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        if (!rateLimitEnabled || !request.getRequestURI().startsWith("/api")) {
            filterChain.doFilter(request, response);
            return;
        }

        int limit = determineLimit(request);
        String bucketKey = request.getRemoteAddr() + "|" + request.getMethod() + "|" + request.getRequestURI();

        long currentWindowMinute = Instant.now().getEpochSecond() / 60;
        WindowCounter counter = counters.computeIfAbsent(bucketKey, ignored -> new WindowCounter(currentWindowMinute));

        synchronized (counter) {
            if (counter.windowMinute != currentWindowMinute) {
                counter.windowMinute = currentWindowMinute;
                counter.count.set(0);
            }

            int count = counter.count.incrementAndGet();
            if (count > limit) {
                response.setStatus(429);
                response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                response.getWriter().write("{\"error\":\"Too many requests\"}");
                return;
            }
        }

        if (counters.size() > 5000) {
            counters.entrySet().removeIf(entry -> entry.getValue().windowMinute < currentWindowMinute - 2);
        }

        filterChain.doFilter(request, response);
    }

    private int determineLimit(HttpServletRequest request) {
        String uri = request.getRequestURI();
        String method = request.getMethod();

        if ("/api/auth/login".equals(uri) || "/api/auth/register".equals(uri) || "/api/auth/refresh".equals(uri)) {
            return authMaxPerMinute;
        }

        if ("POST".equals(method) || "PUT".equals(method) || "DELETE".equals(method) || "PATCH".equals(method)) {
            return writeMaxPerMinute;
        }

        return defaultMaxPerMinute;
    }

    private static class WindowCounter {
        private long windowMinute;
        private final AtomicInteger count = new AtomicInteger(0);

        private WindowCounter(long windowMinute) {
            this.windowMinute = windowMinute;
        }
    }
}
