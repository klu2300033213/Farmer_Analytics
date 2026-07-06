

package com.farmer.analytics.repository;

import com.farmer.analytics.model.MarketPriceLive;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;

public interface MarketPriceLiveRepository
        extends JpaRepository<MarketPriceLive, Integer> {

    // ===============================
    // EXISTING METHODS (UNCHANGED)
    // ===============================

    List<MarketPriceLive> findByCropNameIgnoreCase(String cropName);

    List<MarketPriceLive> findByPriceDate(LocalDate date);

        boolean existsByStateIgnoreCaseAndDistrictIgnoreCaseAndMandiIgnoreCaseAndCropNameIgnoreCaseAndPriceDateAndModalPrice(
            String state,
            String district,
            String mandi,
            String cropName,
            LocalDate priceDate,
            double modalPrice
        );

    @Query("""
        SELECT DISTINCT m.cropName
        FROM MarketPriceLive m
        WHERE m.cropName IS NOT NULL
        ORDER BY m.cropName
    """)
    List<String> findAllCrops();

    @Query("""
        SELECT DISTINCT m.state
        FROM MarketPriceLive m
        WHERE m.state IS NOT NULL
        ORDER BY m.state
    """)
    List<String> findAllStates();

    @Query("""
        SELECT DISTINCT m.priceDate
        FROM MarketPriceLive m
        WHERE LOWER(m.cropName)=LOWER(?1)
        ORDER BY m.priceDate DESC
    """)
    List<LocalDate> findDatesByCrop(String crop);

    // 🔥 DB decides latest date (already fixed)
    @Query("""
        SELECT MAX(m.priceDate)
        FROM MarketPriceLive m
        WHERE LOWER(m.cropName)=LOWER(?1)
    """)
    LocalDate findLatestDateByCrop(String crop);

    @Query("""
        SELECT m.priceDate, AVG(m.modalPrice)
        FROM MarketPriceLive m
        WHERE LOWER(m.cropName)=LOWER(?1)
        GROUP BY m.priceDate
        ORDER BY m.priceDate
    """)
    List<Object[]> findDateWisePriceTrend(String crop);

    @Query("""
        SELECT m.district, AVG(m.modalPrice)
        FROM MarketPriceLive m
        WHERE LOWER(m.cropName)=LOWER(?1)
          AND m.priceDate = (
              SELECT MAX(p.priceDate)
              FROM MarketPriceLive p
              WHERE LOWER(p.cropName)=LOWER(?1)
          )
        GROUP BY m.district
    """)
    List<Object[]> findDistrictComparison(String crop);

    // ===============================
    // ✅ NEW METHODS (ADDED ONLY)
    // ===============================

    // 1️⃣ Districts by selected crop
    @Query("""
        SELECT DISTINCT m.district
        FROM MarketPriceLive m
        WHERE LOWER(m.cropName)=LOWER(?1)
        ORDER BY m.district
    """)
    List<String> findDistrictsByCrop(String crop);

    @Query("""
        SELECT DISTINCT m.district
        FROM MarketPriceLive m
        WHERE LOWER(m.state)=LOWER(?1)
          AND m.district IS NOT NULL
        ORDER BY m.district
    """)
    List<String> findDistrictsByState(String state);

    // 2️⃣ Dates by selected crop + district
    @Query("""
        SELECT DISTINCT m.priceDate
        FROM MarketPriceLive m
        WHERE LOWER(m.cropName)=LOWER(?1)
          AND LOWER(m.district)=LOWER(?2)
        ORDER BY m.priceDate DESC
    """)
    List<LocalDate> findDatesByCropAndDistrict(String crop, String district);

        @Query("""
                SELECT DISTINCT m.cropName
                FROM MarketPriceLive m
                WHERE LOWER(m.state)=LOWER(?1)
                    AND LOWER(m.district)=LOWER(?2)
                    AND m.cropName IS NOT NULL
                ORDER BY m.cropName
        """)
        List<String> findCropsByStateAndDistrict(String state, String district);

        @Query("""
                SELECT DISTINCT m.priceDate
                FROM MarketPriceLive m
                WHERE LOWER(m.state)=LOWER(?1)
                    AND LOWER(m.district)=LOWER(?2)
                    AND LOWER(m.cropName)=LOWER(?3)
                ORDER BY m.priceDate DESC
        """)
        List<LocalDate> findDatesByStateDistrictAndCrop(
                        String state,
                        String district,
                        String crop
        );

    // 3️⃣ Final filtered result (crop + district + date)
    @Query("""
        SELECT m
        FROM MarketPriceLive m
        WHERE LOWER(m.cropName)=LOWER(?1)
          AND LOWER(m.district)=LOWER(?2)
          AND m.priceDate = ?3
    """)
    List<MarketPriceLive> findByCropDistrictAndDate(
            String crop,
            String district,
            LocalDate date
    );

        @Query("""
                SELECT m
                FROM MarketPriceLive m
                WHERE LOWER(m.state)=LOWER(?1)
                    AND LOWER(m.district)=LOWER(?2)
                    AND LOWER(m.cropName)=LOWER(?3)
                    AND m.priceDate = ?4
        """)
        List<MarketPriceLive> findByStateDistrictCropAndDate(
                        String state,
                        String district,
                        String crop,
                        LocalDate date
        );

    @Query("SELECT COUNT(DISTINCT m.state) FROM MarketPriceLive m WHERE m.state IS NOT NULL")
    long countDistinctStates();

    @Query("SELECT COUNT(DISTINCT m.district) FROM MarketPriceLive m WHERE m.district IS NOT NULL")
    long countDistinctDistricts();

    @Query("SELECT COUNT(DISTINCT m.cropName) FROM MarketPriceLive m WHERE m.cropName IS NOT NULL")
    long countDistinctCrops();

    @Query("SELECT MAX(m.priceDate) FROM MarketPriceLive m")
    LocalDate findLatestPriceDate();

    @Query("""
        SELECT m.cropName, COUNT(m.id)
        FROM MarketPriceLive m
        WHERE m.cropName IS NOT NULL AND m.cropName <> ''
        GROUP BY m.cropName
        ORDER BY COUNT(m.id) DESC
    """)
    List<Object[]> findTopCropsByRecords(Pageable pageable);
}

