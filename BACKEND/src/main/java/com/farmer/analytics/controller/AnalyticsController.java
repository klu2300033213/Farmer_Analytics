package com.farmer.analytics.controller;

import com.farmer.analytics.model.CropPrice;
import com.farmer.analytics.model.IncomeResponse;
import com.farmer.analytics.repository.CropPriceRepository;
import com.farmer.analytics.service.MlIncomePredictionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173")
public class AnalyticsController {

    private final CropPriceRepository repo;
    private final MlIncomePredictionService mlService;

    public AnalyticsController(CropPriceRepository repo,
                               MlIncomePredictionService mlService) {
        this.repo = repo;
        this.mlService = mlService;
    }

    // 🔹 ANALYZE SELECTED CROP (FULL ANALYTICS)
    @GetMapping("/analyze")
    public ResponseEntity<IncomeResponse> analyzeCrop(@RequestParam String crop) {

        List<CropPrice> prices =
                repo.findByCropNameIgnoreCase(crop.trim());

        if (prices.isEmpty()) {
            return ResponseEntity.ok(
                new IncomeResponse(
                    "No data available",
                    "UNKNOWN",
                    0,
                    "UNKNOWN",
                    0,
                    0,
                    "No historical data available for this crop.",
                    "Upload more seasonal data for accurate analysis."
                )
            );
        }

        MlIncomePredictionService.MlPredictionResult ml = mlService.predict(crop, prices);
        double predictedPrice = ml.predictedPrice();
        double volatility = ml.volatility();
        String volatilityLevel = ml.volatilityLevel();

        // Keep the same response contract while deriving range from ML prediction + uncertainty.
        double spreadRatio = Math.max(0.08, Math.min(0.30,
            (volatility / Math.max(predictedPrice, 1.0)) * 1.2));

        double maxPrice = predictedPrice * (1.0 + spreadRatio);
        double minPrice = Math.max(0, predictedPrice * (1.0 - spreadRatio));

        if (Double.compare(maxPrice, minPrice) == 0) {
            double bump = Math.max(2.0, predictedPrice * 0.1);
            maxPrice = predictedPrice + bump;
            minPrice = Math.max(0, predictedPrice - bump);
        }

        double yieldQtlPerAcre = estimateYieldPerAcreQtl(crop);

        int bestCaseIncome = (int) (maxPrice * yieldQtlPerAcre);
        int worstCaseIncome = (int) (minPrice * yieldQtlPerAcre);

        String range =
            "₹" + worstCaseIncome +
            " - ₹" + bestCaseIncome;

        int confidence = ml.confidence();
        String risk = confidence >= 78 ? "LOW" : confidence >= 60 ? "MEDIUM" : "HIGH";

        String riskReason;
        String recommendation;

        if (confidence >= 78) {
            riskReason = "ML model confidence is high for this crop. Trend signal is " + ml.trendDirection()
                    + " with relatively stable historical behavior.";
            recommendation = "Model suggests normal selling strategy. You can sell in planned batches and monitor mandi trend.";
        } else if (confidence >= 60) {
            riskReason = "ML model confidence is moderate due to seasonal volatility shifts. Trend signal is "
                    + ml.trendDirection() + ".";
            recommendation = "Use staggered selling in 2-3 batches. Recheck prices weekly before final sale decision.";
        } else {
            riskReason = "ML model confidence is low because recent price behavior is highly unstable for this crop.";
            recommendation = "Avoid one-shot selling. Wait for clearer trend, compare multiple mandis, and sell in smaller lots.";
        }

        IncomeResponse response = new IncomeResponse(
                range,
                risk,
                volatility,
                volatilityLevel,
                bestCaseIncome,
                worstCaseIncome,
                riskReason,
                recommendation
        );

        response.setUnit("per acre · per season (est. " +
                (int) yieldQtlPerAcre + " qtl/acre)");

        return ResponseEntity.ok(response);
    }

    @GetMapping("/ml/model-info")
    public Map<String, Object> modelInfo() {
        Map<String, Object> info = new LinkedHashMap<>();
        info.put("modelType", "Custom Linear Regression (Gradient Descent)");
        info.put("trainingData", "Historical crop_prices records from current database");
        info.put("features", List.of("timeIndex", "lag1Price", "movingAverage3"));
        info.put("target", "Next period crop price");
        info.put("persistence", "Model coefficients saved in ml_model_snapshots table");
        info.put("retraining", "Scheduled retraining enabled via ml.retrain-fixed-rate-ms");
        info.put("output", "Predicted price, volatility, confidence, trend direction");
        return info;
    }

    private double estimateYieldPerAcreQtl(String crop) {
        if (crop == null) return 10;

        String c = crop.trim().toLowerCase();

        if (c.contains("paddy") || c.contains("rice")) return 22;
        if (c.contains("wheat")) return 18;
        if (c.contains("maize") || c.contains("corn")) return 18;
        if (c.contains("cotton")) return 8;
        if (c.contains("groundnut") || c.contains("peanut")) return 8;
        if (c.contains("soy") || c.contains("soya")) return 10;
        if (c.contains("tur") || c.contains("arhar") || c.contains("pigeon")) return 6;
        if (c.contains("gram") || c.contains("chickpea")) return 7;
        if (c.contains("black gram") || c.contains("urad")) return 6;
        if (c.contains("green gram") || c.contains("moong")) return 6;
        if (c.contains("chilli") || c.contains("chili")) return 5;
        if (c.contains("onion")) return 70;
        if (c.contains("potato")) return 80;
        if (c.contains("tomato")) return 90;

        return 10;
    }

    // 🔹 PRICE DATA FOR CHART
    @GetMapping("/prices")
    public List<Map<String, Object>> getAllPrices() {

        List<Map<String, Object>> list = new ArrayList<>();

        for (CropPrice cp : repo.findAll()) {
            Map<String, Object> map = new HashMap<>();
            map.put("crop", cp.getCropName());
            map.put("price", cp.getPrice());
            list.add(map);
        }

        return list;
    }

    // 🔹 DOWNLOAD REPORT
    @GetMapping("/report")
    public List<Map<String, Object>> downloadReport() {

        List<Map<String, Object>> report = new ArrayList<>();

        for (CropPrice cp : repo.findAll()) {
            Map<String, Object> row = new HashMap<>();
            row.put("Crop", cp.getCropName());
            row.put("Price", cp.getPrice());
            row.put("Year", cp.getYear());
            row.put("Month", cp.getMonth());
            row.put("Season", cp.getSeason());
            row.put("Location", cp.getLocation());
            report.add(row);
        }

        return report;
    }
}
