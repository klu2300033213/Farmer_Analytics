package com.farmer.analytics.repository;

import com.farmer.analytics.model.PesticideProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PesticideProductRepository extends JpaRepository<PesticideProduct, Long> {

    Optional<PesticideProduct> findFirstByRegistrationNumberIgnoreCaseAndProductNameIgnoreCase(
            String registrationNumber,
            String productName
    );

    @Query("""
        SELECT p
        FROM PesticideProduct p
        WHERE (:query IS NULL OR :query = '' OR
              p.productName LIKE CONCAT('%', :query, '%') OR
              p.activeIngredient LIKE CONCAT('%', :query, '%') OR
              p.registrationNumber LIKE CONCAT('%', :query, '%'))
          AND (:crop IS NULL OR :crop = '' OR p.approvedCrops LIKE CONCAT('%', :crop, '%'))
          AND (:pest IS NULL OR :pest = '' OR p.targetPests LIKE CONCAT('%', :pest, '%'))
          AND (:status IS NULL OR :status = '' OR p.legalStatus = :status)
        ORDER BY p.productName ASC
    """)
    List<PesticideProduct> search(
            @Param("query") String query,
            @Param("crop") String crop,
            @Param("pest") String pest,
            @Param("status") String status
    );

    long countByLegalStatusIgnoreCase(String legalStatus);
}
