package com.farmer.analytics.service;

import com.farmer.analytics.model.CropPrice;
import com.farmer.analytics.model.MlModelSnapshot;
import com.farmer.analytics.repository.CropPriceRepository;
import com.farmer.analytics.repository.MlModelSnapshotRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.StringJoiner;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class MlIncomePredictionService {

    private static final String MODEL_VERSION = "linear-v2";

    private static final Map<String, Integer> MONTH_INDEX = new HashMap<>();
    private final CropPriceRepository cropPriceRepository;
    private final MlModelSnapshotRepository snapshotRepository;
    private final Map<String, TrainedModel> modelCache = new ConcurrentHashMap<>();

    @Value("${ml.retrain-fixed-rate-ms:21600000}")
    private long retrainFixedRateMs;

    public MlIncomePredictionService(CropPriceRepository cropPriceRepository,
                                     MlModelSnapshotRepository snapshotRepository) {
        this.cropPriceRepository = cropPriceRepository;
        this.snapshotRepository = snapshotRepository;
    }

    static {
        MONTH_INDEX.put("january", 1);
        MONTH_INDEX.put("jan", 1);
        MONTH_INDEX.put("february", 2);
        MONTH_INDEX.put("feb", 2);
        MONTH_INDEX.put("march", 3);
        MONTH_INDEX.put("mar", 3);
        MONTH_INDEX.put("april", 4);
        MONTH_INDEX.put("apr", 4);
        MONTH_INDEX.put("may", 5);
        MONTH_INDEX.put("june", 6);
        MONTH_INDEX.put("jun", 6);
        MONTH_INDEX.put("july", 7);
        MONTH_INDEX.put("jul", 7);
        MONTH_INDEX.put("august", 8);
        MONTH_INDEX.put("aug", 8);
        MONTH_INDEX.put("september", 9);
        MONTH_INDEX.put("sep", 9);
        MONTH_INDEX.put("october", 10);
        MONTH_INDEX.put("oct", 10);
        MONTH_INDEX.put("november", 11);
        MONTH_INDEX.put("nov", 11);
        MONTH_INDEX.put("december", 12);
        MONTH_INDEX.put("dec", 12);
    }

    @PostConstruct
    public void preloadModelsFromSnapshots() {
        for (MlModelSnapshot snapshot : snapshotRepository.findAll()) {
            String cropKey = normalizeCrop(snapshot.getCropName());
            TrainedModel model = fromSnapshot(snapshot);
            if (model != null) {
                modelCache.put(cropKey, model);
            }
        }
    }

    @Scheduled(fixedRateString = "${ml.retrain-fixed-rate-ms:21600000}")
    public void retrainAllCrops() {
        List<String> crops = cropPriceRepository.findDistinctCropNames();
        int updated = 0;

        for (String crop : crops) {
            if (crop == null || crop.isBlank()) continue;
            List<CropPrice> records = cropPriceRepository.findByCropNameIgnoreCase(crop.trim());
            if (records.size() < 5) continue;
            trainAndPersist(crop, records);
            updated++;
        }

        if (updated > 0) {
            System.out.println("[ML] retrain complete | updatedModels=" + updated + " | intervalMs=" + retrainFixedRateMs);
        }
    }

    public MlPredictionResult predict(String crop, List<CropPrice> rawPrices) {
        List<CropPrice> prices = new ArrayList<>(rawPrices);
        prices.sort(Comparator
                .comparingInt(CropPrice::getYear)
                .thenComparingInt(p -> monthToIndex(p.getMonth())));

        String cropKey = normalizeCrop(crop);

        List<Double> ySeries = prices.stream().map(CropPrice::getPrice).toList();
        if (ySeries.isEmpty()) {
            return new MlPredictionResult(0, 0, "LOW", 40, "STABLE");
        }

        if (ySeries.size() < 5) {
            double avg = ySeries.stream().mapToDouble(Double::doubleValue).average().orElse(0);
            double vol = stdDev(ySeries, avg);
            return new MlPredictionResult(Math.max(0, avg), vol, toVolLevel(vol), 45, "STABLE");
        }

        TrainedModel model = modelCache.get(cropKey);
        if (model == null) {
            model = snapshotRepository.findByCropNameIgnoreCase(cropKey)
                    .map(this::fromSnapshot)
                    .orElse(null);
            if (model != null) {
                modelCache.put(cropKey, model);
            }
        }

        if (model == null) {
            model = trainAndPersist(cropKey, prices);
        }

        if (model == null) {
            double avg = ySeries.stream().mapToDouble(Double::doubleValue).average().orElse(0);
            double vol = stdDev(ySeries, avg);
            return new MlPredictionResult(Math.max(0, avg), vol, toVolLevel(vol), 50, "STABLE");
        }

        int n = ySeries.size();
        double last = ySeries.get(n - 1);
        double prev1 = ySeries.get(n - 2);
        double prev2 = ySeries.get(n - 3);
        double nextMa3 = (last + prev1 + prev2) / 3.0;
        double nextPred = predictOne(new double[] { n + 1.0, last, nextMa3 }, model.modelData());

        double avg = ySeries.stream().mapToDouble(Double::doubleValue).average().orElse(0);
        double vol = stdDev(ySeries, avg);
        double mape = model.mape();

        String trend = "STABLE";
        if (nextPred > last * 1.015) trend = "UP";
        if (nextPred < last * 0.985) trend = "DOWN";

        int confidence = (int) Math.round(Math.max(40, Math.min(95, 100 - (mape * 130))));

        return new MlPredictionResult(
                Math.max(0, nextPred),
                vol,
                toVolLevel(vol),
                confidence,
                trend
        );
    }

    private TrainedModel trainAndPersist(String crop, List<CropPrice> prices) {
        TrainingDataset ds = buildDataset(prices);
        if (ds.rows().isEmpty()) return null;

        ModelData trained = trainLinearModel(ds.rows(), ds.targets());
        double mape = computeMape(ds.rows(), ds.targets(), trained);
        TrainedModel model = new TrainedModel(trained, mape, ds.rows().size(), LocalDateTime.now());

        MlModelSnapshot snapshot = snapshotRepository
                .findByCropNameIgnoreCase(crop)
                .orElseGet(MlModelSnapshot::new);

        snapshot.setCropName(crop);
        snapshot.setModelVersion(MODEL_VERSION);
        snapshot.setWeightsCsv(toCsv(trained.weights()));
        snapshot.setFeatureMeanCsv(toCsv(trained.featureMean()));
        snapshot.setFeatureStdCsv(toCsv(trained.featureStd()));
        snapshot.setTargetMean(trained.targetMean());
        snapshot.setTargetStd(trained.targetStd());
        snapshot.setTrainingMape(mape);
        snapshot.setSampleCount(ds.rows().size());
        snapshot.setTrainedAt(model.trainedAt());

        snapshotRepository.save(snapshot);
        modelCache.put(normalizeCrop(crop), model);
        return model;
    }

    private TrainingDataset buildDataset(List<CropPrice> rawPrices) {
        List<CropPrice> prices = new ArrayList<>(rawPrices);
        prices.sort(Comparator
                .comparingInt(CropPrice::getYear)
                .thenComparingInt(p -> monthToIndex(p.getMonth())));

        List<Double> ySeries = prices.stream().map(CropPrice::getPrice).toList();
        List<double[]> rows = new ArrayList<>();
        List<Double> targets = new ArrayList<>();

        for (int i = 3; i < ySeries.size(); i++) {
            double lag1 = ySeries.get(i - 1);
            double lag2 = ySeries.get(i - 2);
            double lag3 = ySeries.get(i - 3);
            double ma3 = (lag1 + lag2 + lag3) / 3.0;

            rows.add(new double[] { i + 1.0, lag1, ma3 });
            targets.add(ySeries.get(i));
        }

        return new TrainingDataset(rows, targets);
    }

    private ModelData trainLinearModel(List<double[]> rows, List<Double> targets) {
        int m = rows.size();
        int features = 3;

        double[] mean = new double[features];
        double[] std = new double[features];

        for (int j = 0; j < features; j++) {
            double sum = 0;
            for (double[] row : rows) sum += row[j];
            mean[j] = sum / m;
        }

        for (int j = 0; j < features; j++) {
            double var = 0;
            for (double[] row : rows) {
                double d = row[j] - mean[j];
                var += d * d;
            }
            std[j] = Math.sqrt(var / m);
            if (std[j] < 1e-6) std[j] = 1.0;
        }

        double yMean = targets.stream().mapToDouble(Double::doubleValue).average().orElse(0);
        double yVar = 0;
        for (double y : targets) {
            double d = y - yMean;
            yVar += d * d;
        }
        double yStd = Math.sqrt(yVar / m);
        if (yStd < 1e-6) yStd = 1.0;

        double[] w = new double[] { 0, 0, 0, 0 }; // bias + 3 weights
        double lr = 0.05;
        double l2 = 0.0005;

        for (int epoch = 0; epoch < 1400; epoch++) {
            double[] grad = new double[] { 0, 0, 0, 0 };

            for (int i = 0; i < m; i++) {
                double[] xRaw = rows.get(i);
                double x1 = (xRaw[0] - mean[0]) / std[0];
                double x2 = (xRaw[1] - mean[1]) / std[1];
                double x3 = (xRaw[2] - mean[2]) / std[2];

                double y = (targets.get(i) - yMean) / yStd;
                double pred = w[0] + w[1] * x1 + w[2] * x2 + w[3] * x3;
                double err = pred - y;

                grad[0] += err;
                grad[1] += err * x1;
                grad[2] += err * x2;
                grad[3] += err * x3;
            }

            for (int j = 0; j < w.length; j++) {
                double reg = (j == 0) ? 0 : l2 * w[j];
                w[j] -= lr * ((grad[j] / m) + reg);
            }
        }

        return new ModelData(w, mean, std, yMean, yStd);
    }

    private double predictOne(double[] row, ModelData model) {
        double x1 = (row[0] - model.featureMean()[0]) / model.featureStd()[0];
        double x2 = (row[1] - model.featureMean()[1]) / model.featureStd()[1];
        double x3 = (row[2] - model.featureMean()[2]) / model.featureStd()[2];

        double z = model.weights()[0]
                + model.weights()[1] * x1
                + model.weights()[2] * x2
                + model.weights()[3] * x3;

        return (z * model.targetStd()) + model.targetMean();
    }

    private double computeMape(List<double[]> rows, List<Double> targets, ModelData model) {
        double sum = 0;
        for (int i = 0; i < rows.size(); i++) {
            double actual = targets.get(i);
            double pred = predictOne(rows.get(i), model);
            double denom = Math.max(1.0, Math.abs(actual));
            sum += Math.abs(actual - pred) / denom;
        }
        return sum / Math.max(1, rows.size());
    }

    private String toVolLevel(double vol) {
        if (vol < 3) return "LOW";
        if (vol < 6) return "MEDIUM";
        return "HIGH";
    }

    private String toCsv(double[] values) {
        StringJoiner sj = new StringJoiner(",");
        for (double v : values) {
            sj.add(Double.toString(v));
        }
        return sj.toString();
    }

    private double[] fromCsv(String csv) {
        if (csv == null || csv.isBlank()) return new double[0];
        String[] parts = csv.split(",");
        double[] out = new double[parts.length];
        for (int i = 0; i < parts.length; i++) {
            out[i] = Double.parseDouble(parts[i]);
        }
        return out;
    }

    private String normalizeCrop(String crop) {
        return crop == null ? "unknown" : crop.trim().toLowerCase();
    }

    private TrainedModel fromSnapshot(MlModelSnapshot snapshot) {
        try {
            ModelData data = new ModelData(
                    fromCsv(snapshot.getWeightsCsv()),
                    fromCsv(snapshot.getFeatureMeanCsv()),
                    fromCsv(snapshot.getFeatureStdCsv()),
                    snapshot.getTargetMean(),
                    snapshot.getTargetStd()
            );
            return new TrainedModel(data, snapshot.getTrainingMape(), snapshot.getSampleCount(), snapshot.getTrainedAt());
        } catch (Exception ex) {
            return null;
        }
    }

    private int monthToIndex(String month) {
        if (month == null) return 1;
        return MONTH_INDEX.getOrDefault(month.trim().toLowerCase(), 1);
    }

    private double stdDev(List<Double> values, double avg) {
        double variance = values.stream()
                .mapToDouble(v -> {
                    double d = v - avg;
                    return d * d;
                })
                .average()
                .orElse(0);
        return Math.sqrt(variance);
    }

    private record ModelData(double[] weights, double[] featureMean, double[] featureStd,
                             double targetMean, double targetStd) {
    }

    public record MlPredictionResult(double predictedPrice, double volatility,
                                     String volatilityLevel, int confidence,
                                     String trendDirection) {
    }

    private record TrainingDataset(List<double[]> rows, List<Double> targets) {
    }

    private record TrainedModel(ModelData modelData, double mape, int sampleCount,
                                LocalDateTime trainedAt) {
    }
}