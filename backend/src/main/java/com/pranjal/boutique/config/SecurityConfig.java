package com.pranjal.boutique.config;

import com.pranjal.boutique.security.JwtAuthenticationFilter;
import com.pranjal.boutique.security.OAuth2SuccessHandler;
import jakarta.servlet.Filter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Lazy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.util.matcher.RegexRequestMatcher;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final Filter rateLimitingFilter;
    private final UserDetailsService userDetailsService;
    private final OAuth2SuccessHandler oAuth2SuccessHandler;

    @Value("${app.cors.allowed-origins}")
    private String allowedOrigins;

    @Value("${app.security.require-https:false}")
    private boolean requireHttps;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter,
            @Qualifier("rateLimitingFilter") Filter rateLimitingFilter,
            UserDetailsService userDetailsService,
            @Lazy OAuth2SuccessHandler oAuth2SuccessHandler) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.rateLimitingFilter = rateLimitingFilter;
        this.userDetailsService = userDetailsService;
        this.oAuth2SuccessHandler = oAuth2SuccessHandler;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(RegexRequestMatcher.regexMatcher("^/api/auth(?:/.*)?$"))
                        .permitAll()
                        .requestMatchers(RegexRequestMatcher.regexMatcher("^/oauth2(?:/.*)?$"))
                        .permitAll()
                        .requestMatchers(RegexRequestMatcher.regexMatcher(HttpMethod.GET, "^/api/services(?:/.*)?$"))
                        .permitAll()
                        .requestMatchers(
                                RegexRequestMatcher.regexMatcher(HttpMethod.GET, "^/api/rental-products(?:/.*)?$"))
                        .permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/site-settings")
                        .permitAll()
                        .requestMatchers(RegexRequestMatcher.regexMatcher(HttpMethod.POST, "^/api/services/inquiries$"))
                        .permitAll()
                        .requestMatchers(RegexRequestMatcher.regexMatcher(HttpMethod.POST, "^/api/services/reviews$"))
                        .permitAll()
                        .requestMatchers(HttpMethod.GET, "/uploads/**")
                        .permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/images/**")
                        .permitAll()
                        .requestMatchers(RegexRequestMatcher.regexMatcher("^/api/admin(?:/.*)?$"))
                        .hasRole("ADMIN")
                        .anyRequest().authenticated())
                .exceptionHandling(ex -> ex
                        .defaultAuthenticationEntryPointFor(
                                new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED),
                                RegexRequestMatcher.regexMatcher("^/api(?:/.*)?$")))
                .requiresChannel(channel -> {
                    if (requireHttps) {
                        channel.anyRequest().requiresSecure();
                    }
                })
                .authenticationProvider(authenticationProvider())
                .oauth2Login(oauth2 -> oauth2.successHandler(oAuth2SuccessHandler))
                .addFilterBefore(rateLimitingFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // @Bean
    // public DaoAuthenticationProvider authenticationProvider() {
    // DaoAuthenticationProvider authProvider = new
    // DaoAuthenticationProvider(userDetailsService);
    // authProvider.setPasswordEncoder(passwordEncoder());
    // return authProvider;
    // }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService); // ✅ important
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        List<String> sanitizedOrigins = Arrays.stream((allowedOrigins == null ? "" : allowedOrigins).split(","))
                .map(String::trim)
                .map(origin -> origin.endsWith("/") ? origin.substring(0, origin.length() - 1) : origin)
                .filter(origin -> !origin.isEmpty())
                .collect(Collectors.toList());

        // Safe defaults prevent production lockout when env var is missing/malformed.
        if (sanitizedOrigins.isEmpty()) {
            sanitizedOrigins = List.of(
                    "https://pranjal-boutique.vercel.app",
                    "https://*.vercel.app",
                    "http://localhost:3000",
                    "http://localhost:5173");
        }

        configuration.setAllowedOriginPatterns(sanitizedOrigins);
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setExposedHeaders(List.of("Set-Cookie"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
