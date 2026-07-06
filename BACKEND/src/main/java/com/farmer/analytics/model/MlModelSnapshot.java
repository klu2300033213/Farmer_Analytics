package com.farmer.analytics.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "ml_model_snapshots",
        uniqueConstraints = @UniqueConstraint(columnNames = "crop_name")
)
public class MlModelSnapshot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "crop_name", nullable = false, length = 120)
    private String cropName;

    @Column(name = "model_version", nullable = false, length = 40)
    private String modelVersion;

    @Lob
    @Column(name = "weights_csv", nullable = false)
    private String weightsCsv;

    @Lob
    @Column(name = "feature_mean_csv", nullable = false)
    private String featureMeanCsv;

    @Lob
    @Column(name = "feature_std_csv", nullable = false)
    private String featureStdCsv;

    @Column(name = "target_mean", nullable = false)
    private double targetMean;

    @Column(name = "target_std", nullable = false)
    private double targetStd;

    @Column(name = "training_mape", nullable = false)
    private double trainingMape;

    @Column(name = "sample_count", nullable = false)
    private int sampleCount;

    @Column(name = "trained_at", nullable = false)
    private LocalDateTime trainedAt;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCropName() {
        return cropName;
    }

    public void setCropName(String cropName) {
        this.cropName = cropName;
    }

    public String getModelVersion() {
        return modelVersion;
    }

    public void setModelVersion(String modelVersion) {
        this.modelVersion = modelVersion;
    }

    public String getWeightsCsv() {
        return weightsCsv;
    }

    public void setWeightsCsv(String weightsCsv) {
        this.weightsCsv = weightsCsv;
    }

    public String getFeatureMeanCsv() {
        return featureMeanCsv;
    }

    public void setFeatureMeanCsv(String featureMeanCsv) {
        this.featureMeanCsv = featureMeanCsv;
    }

    public String getFeatureStdCsv() {
        return featureStdCsv;
    }

    public void setFeatureStdCsv(String featureStdCsv) {
        this.featureStdCsv = featureStdCsv;
    }

    public double getTargetMean() {
        return targetMean;
    }

    public void setTargetMean(double targetMean) {
        this.targetMean = targetMean;
    }

    public double getTargetStd() {
        return targetStd;
    }

    public void setTargetStd(double targetStd) {
        this.targetStd = targetStd;
    }

    public double getTrainingMape() {
        return trainingMape;
    }

    public void setTrainingMape(double trainingMape) {
        this.trainingMape = trainingMape;
    }

    public int getSampleCount() {
        return sampleCount;
    }

    public void setSampleCount(int sampleCount) {
        this.sampleCount = sampleCount;
    }

    public LocalDateTime getTrainedAt() {
        return trainedAt;
    }

    public void setTrainedAt(LocalDateTime trainedAt) {
        this.trainedAt = trainedAt;
    }
}
