
package com.farmer.analytics.controller;

import com.farmer.analytics.model.MarketPriceLive;
import com.farmer.analytics.model.MandiSummaryResponse;
import com.farmer.analytics.repository.MarketPriceLiveRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174"
})
public class LiveMarketController {

    private final MarketPriceLiveRepository repo;

    @Value("${gov.api.key}")
    private String apiKey;

    @Value("${gov.api.base-url}")
    private String baseUrl;

    @Value("${gov.api.page-limit:1000}")
    private int pageLimit;

    @Value("${gov.api.crop-catalog-max-pages:30}")
    private int cropCatalogMaxPages;

    private volatile List<String> cachedSourceCrops = List.of();
    private volatile Instant sourceCropsCachedAt = Instant.EPOCH;

    public LiveMarketController(MarketPriceLiveRepository repo) {
        this.repo = repo;
    }

    // =====================================================
    // 0️⃣ STATES DROPDOWN
    // =====================================================
    @GetMapping("/live/states")
    public List<String> getStates() {
        return repo.findAllStates();
    }

    // =====================================================
    // 1️⃣ CROPS DROPDOWN
    // =====================================================
    @GetMapping("/live/crops")
    public List<String> getCropsByStateAndDistrict(
            @RequestParam String state,
            @RequestParam String district
    ) {
        return repo.findCropsByStateAndDistrict(state, district);
    }

    @GetMapping("/live/crops-all")
    public List<String> getAllCrops() {
        Set<String> merged = new HashSet<>();

        merged.addAll(repo.findAllCrops());
        merged.addAll(fetchSourceCropsCached());

        return merged.stream()
                .map(value -> value == null ? "" : value.trim().toLowerCase())
                .filter(value -> !value.isBlank())
                .distinct()
                .sorted()
                .toList();
    }

    private List<String> fetchSourceCropsCached() {
        try {
            Instant now = Instant.now();
            if (!cachedSourceCrops.isEmpty() && Duration.between(sourceCropsCachedAt, now).toMinutes() < 30) {
                return cachedSourceCrops;
            }

            RestTemplate restTemplate = new RestTemplate();
            ObjectMapper mapper = new ObjectMapper();
            Set<String> crops = new HashSet<>();

            int safeLimit = Math.max(pageLimit, 100);
            int safePages = Math.max(cropCatalogMaxPages, 1);

            for (int page = 0; page < safePages; page++) {
                int offset = page * safeLimit;

                String url = baseUrl
                        + "?api-key=" + apiKey
                        + "&format=json"
                        + "&limit=" + safeLimit
                        + "&offset=" + offset;

                String response = restTemplate.getForObject(url, String.class);
                if (response == null || response.isBlank()) {
                    break;
                }

                JsonNode root = mapper.readTree(response);
                JsonNode records = root.get("records");
                if (records == null || records.isEmpty()) {
                    break;
                }

                int pageCount = 0;
                for (JsonNode node : records) {
                    pageCount++;
                    String commodity = node.path("commodity").asText("").trim();
                    if (!commodity.isBlank()) {
                        crops.add(commodity);
                    }
                }

                if (pageCount < safeLimit) {
                    break;
                }
            }

            cachedSourceCrops = new ArrayList<>(crops);
            sourceCropsCachedAt = now;

            return cachedSourceCrops;
        } catch (Exception ignored) {
            return cachedSourceCrops;
        }
    }

    // =====================================================
    // 2️⃣ DISTRICTS BASED ON CROP
    // =====================================================
    @GetMapping("/live/districts")
    public List<String> getDistrictsByState(@RequestParam String state) {
        return repo.findDistrictsByState(state);
    }

    // =====================================================
    // 3️⃣ DATES BASED ON CROP + DISTRICT
    // =====================================================
    @GetMapping("/live/dates")
    public List<LocalDate> getDatesByStateDistrictAndCrop(
            @RequestParam String state,
            @RequestParam String district,
            @RequestParam String crop
    ) {
        return repo.findDatesByStateDistrictAndCrop(state, district, crop);
    }

    // =====================================================
    // 4️⃣ FINAL RESULT (CROP + DISTRICT + DATE)
    // =====================================================
    @GetMapping("/live/filter")
    public List<MarketPriceLive> filterByStateDistrictCropDate(
            @RequestParam String state,
            @RequestParam String district,
            @RequestParam String crop,
            @RequestParam LocalDate date
    ) {
        return repo.findByStateDistrictCropAndDate(state, district, crop, date);
    }

    // =====================================================
    // 5️⃣ BEST & WORST MANDI (LATEST DATE – AUTO)
    // =====================================================
    @GetMapping("/live/mandi-summary")
    public MandiSummaryResponse mandiSummary(@RequestParam String crop) {

        LocalDate latestDate = repo.findLatestDateByCrop(crop);

        if (latestDate == null) {
            return new MandiSummaryResponse(
                    crop,
                    null,
                    "N/A", 0, "N/A",
                    "N/A", 0, "N/A",
                    "No mandi data available yet."
            );
        }

        List<MarketPriceLive> list =
                repo.findByCropNameIgnoreCase(crop)
                        .stream()
                        .filter(p -> p.getPriceDate().equals(latestDate))
                        .toList();

        MarketPriceLive best =
                list.stream()
                        .max(Comparator.comparingDouble(MarketPriceLive::getModalPrice))
                        .get();

        MarketPriceLive worst =
                list.stream()
                        .min(Comparator.comparingDouble(MarketPriceLive::getModalPrice))
                        .get();

        String advice =
                "Sell at " + best.getMandi() +
                " mandi in " + best.getDistrict() +
                " for best price on " + latestDate;

        return new MandiSummaryResponse(
                crop,
                latestDate,
                best.getMandi(), best.getModalPrice(), best.getDistrict(),
                worst.getMandi(), worst.getModalPrice(), worst.getDistrict(),
                advice
        );
    }

    // =====================================================
    // 6️⃣ PRICE TREND (DATE-WISE)
    // =====================================================
    @GetMapping("/live/price-trend")
    public List<Object[]> priceTrend(@RequestParam String crop) {
        return repo.findDateWisePriceTrend(crop);
    }

    // =====================================================
    // 7️⃣ DISTRICT COMPARISON (LATEST DATE)
    // =====================================================
    @GetMapping("/live/district-compare")
    public List<Object[]> districtCompare(@RequestParam String crop) {
        return repo.findDistrictComparison(crop);
    }
}





