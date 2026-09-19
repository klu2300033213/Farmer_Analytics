package com.farmer.analytics.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.farmer.analytics.model.MarketPriceLive;
import com.farmer.analytics.repository.MarketPriceLiveRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
@Service
public class LiveMarketFetcher {

    private final MarketPriceLiveRepository repo;

    public LiveMarketFetcher(MarketPriceLiveRepository repo) {
        this.repo = repo;
    }

    @Value("${gov.api.key}")
    private String apiKey;

    @Value("${gov.api.base-url}")
    private String baseUrl;

    @Value("${gov.api.state-filter:}")
    private String stateFilter;

    @Value("${gov.api.page-limit:1000}")
    private int pageLimit;

    @Value("${gov.api.max-pages-per-run:5}")
    private int maxPagesPerRun;

    // ðŸ” Runs on configured fixed rate
    @Scheduled(fixedRateString = "${gov.api.fetch-fixed-rate-ms:300000}")
    public void fetchLivePrices() {

        try {
            RestTemplate restTemplate = new RestTemplate();

            ObjectMapper mapper = new ObjectMapper();

            DateTimeFormatter formatter =
                    DateTimeFormatter.ofPattern("dd/MM/yyyy");

            int savedCount = 0;
            int duplicateCount = 0;
            int totalFetched = 0;

            int safePageLimit = Math.max(pageLimit, 100);
            int safeMaxPages = Math.max(maxPagesPerRun, 1);

            for (int page = 0; page < safeMaxPages; page++) {

                int offset = page * safePageLimit;

                String url = baseUrl
                        + "?api-key=" + apiKey
                        + "&format=json"
                        + "&limit=" + safePageLimit
                        + "&offset=" + offset;

                if (stateFilter != null && !stateFilter.isBlank()) {
                    url += "&filters[state]=" + stateFilter;
                }

                String response = restTemplate.getForObject(url, String.class);
                JsonNode root = mapper.readTree(response);

                // âœ… SAFETY CHECK
                if (!root.has("records")) {
                    System.out.println("âŒ NO RECORDS FOUND â€“ CHECK API KEY");
                    return;
                }

                JsonNode records = root.get("records");
                if (records == null || records.isEmpty()) {
                    break;
                }

                int pageFetched = 0;

                for (JsonNode node : records) {

                    // ðŸ” REQUIRED FIELDS CHECK
                    if (!node.has("commodity") || !node.has("modal_price")) continue;

                    String state = node.path("state").asText().trim();
                    String district = node.path("district").asText().trim();
                    String mandi = node.path("market").asText().trim();
                    String cropName = node.path("commodity").asText().trim().toLowerCase();
                    LocalDate priceDate = LocalDate.parse(
                            node.path("arrival_date").asText(),
                            formatter
                    );
                    double modalPrice = node.path("modal_price").asDouble();

                    pageFetched++;
                    totalFetched++;

                    boolean exists = repo.existsByStateIgnoreCaseAndDistrictIgnoreCaseAndMandiIgnoreCaseAndCropNameIgnoreCaseAndPriceDateAndModalPrice(
                            state,
                            district,
                            mandi,
                            cropName,
                            priceDate,
                            modalPrice
                    );

                    if (exists) {
                        duplicateCount++;
                        continue;
                    }

                    MarketPriceLive mp = new MarketPriceLive();

                    mp.setState(state);
                    mp.setDistrict(district);
                    mp.setMandi(mandi);
                    mp.setCropName(cropName);

                    mp.setMinPrice(node.path("min_price").asDouble());
                    mp.setModalPrice(modalPrice);
                    mp.setMaxPrice(node.path("max_price").asDouble());

                    mp.setPriceDate(priceDate);

                    repo.save(mp);
                    savedCount++;
                }

                if (pageFetched < safePageLimit) {
                    break;
                }
            }

            System.out.println(
                    "âœ… LIVE FETCH COMPLETE | fetched=" + totalFetched +
                            " saved=" + savedCount +
                            " duplicatesSkipped=" + duplicateCount
            );

        } catch (Exception e) {
            System.out.println("âŒ LIVE FETCH ERROR");
            e.printStackTrace();
        }
    }
}
