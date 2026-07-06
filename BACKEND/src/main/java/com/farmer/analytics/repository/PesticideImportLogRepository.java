package com.farmer.analytics.repository;

import com.farmer.analytics.model.PesticideImportLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PesticideImportLogRepository extends JpaRepository<PesticideImportLog, Long> {

    List<PesticideImportLog> findTop20ByOrderByCreatedAtDesc();
}
