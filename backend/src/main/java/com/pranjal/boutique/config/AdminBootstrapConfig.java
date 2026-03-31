package com.pranjal.boutique.config;

import com.pranjal.boutique.model.Role;
import com.pranjal.boutique.model.User;
import com.pranjal.boutique.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class AdminBootstrapConfig {

    @Bean
    CommandLineRunner ensureAdminUser(UserRepository userRepository,
                                      PasswordEncoder passwordEncoder,
                                      @Value("${app.admin.email}") String email,
                                      @Value("${app.admin.password}") String password,
                                      @Value("${app.admin.name}") String name) {
        return args -> {
            if (userRepository.existsByEmail(email)) {
                return;
            }

            User admin = new User();
            admin.setName(name);
            admin.setEmail(email);
            admin.setPassword(passwordEncoder.encode(password));
            admin.setRole(Role.ROLE_ADMIN);
            admin.setProvider("local");
            userRepository.save(admin);
        };
    }
}
