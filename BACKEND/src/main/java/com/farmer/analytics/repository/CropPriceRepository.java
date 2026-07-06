package com.farmer.analytics.repository;

import com.farmer.analytics.model.CropPrice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface CropPriceRepository extends JpaRepository<CropPrice, Integer> {

    // existing method (kept as is)
    CropPrice findFirstByCropNameIgnoreCase(String cropName);

    // ✅ used for multiple records analytics
    List<CropPrice> findByCropNameIgnoreCase(String cropName);

    // ✅ ADD THIS (do not remove others)
    boolean existsByCropNameAndYearAndMonth(
            String cropName,
            int year,
            String month
    );

    @Query("SELECT DISTINCT c.cropName FROM CropPrice c WHERE c.cropName IS NOT NULL AND c.cropName <> ''")
    List<String> findDistinctCropNames();
    
}
