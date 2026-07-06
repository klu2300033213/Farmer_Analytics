package com.farmer.analytics.repository;

import com.farmer.analytics.model.ContactMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ContactMessageRepository extends JpaRepository<ContactMessage, Long> {

    List<ContactMessage> findAllByOrderByCreatedAtDesc();

    List<ContactMessage> findByEmailIgnoreCaseOrderByCreatedAtDesc(String email);

    long countByStatusIgnoreCase(String status);
}
