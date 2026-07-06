package com.farmer.analytics.repository;

import com.farmer.analytics.model.MlModelSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MlModelSnapshotRepository extends JpaRepository<MlModelSnapshot, Long> {

    Optional<MlModelSnapshot> findByCropNameIgnoreCase(String cropName);
}
