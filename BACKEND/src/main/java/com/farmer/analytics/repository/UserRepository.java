package com.farmer.analytics.repository;

import com.farmer.analytics.model.User;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    @Query("SELECT u FROM User u WHERE lower(u.email) = lower(:value) OR lower(u.name) = lower(:value)")
    Optional<User> findByEmailOrName(@Param("value") String value);

    Optional<User> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    long countByRoleIgnoreCase(String role);

    Optional<User> findFirstByOrderByIdAsc();
}
