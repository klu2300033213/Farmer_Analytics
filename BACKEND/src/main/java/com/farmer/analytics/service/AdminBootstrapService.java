package com.farmer.analytics.service;

import com.farmer.analytics.model.User;
import com.farmer.analytics.repository.UserRepository;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;

@Service
public class AdminBootstrapService {

    private final UserRepository userRepository;

    public AdminBootstrapService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostConstruct
    public void ensureAdminExists() {
        if (userRepository.countByRoleIgnoreCase("ADMIN") > 0) {
            return;
        }

        userRepository.findFirstByOrderByIdAsc().ifPresent(firstUser -> {
            firstUser.setRole("ADMIN");
            userRepository.save(firstUser);
            System.out.println("ADMIN BOOTSTRAP: Promoted first user to ADMIN -> " + firstUser.getEmail());
        });
    }
}
