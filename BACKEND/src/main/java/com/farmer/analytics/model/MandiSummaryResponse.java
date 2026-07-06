package com.farmer.analytics.model;

import java.time.LocalDate;

public class MandiSummaryResponse {

    private String crop;
    private LocalDate date; // ✅ FIX

    private String bestMandi;
    private double bestPrice;
    private String bestDistrict;

    private String worstMandi;
    private double worstPrice;
    private String worstDistrict;

    private String recommendation;

    public MandiSummaryResponse(
            String crop,
            LocalDate date, // ✅ FIX
            String bestMandi, double bestPrice, String bestDistrict,
            String worstMandi, double worstPrice, String worstDistrict,
            String recommendation) {

        this.crop = crop;
        this.date = date;
        this.bestMandi = bestMandi;
        this.bestPrice = bestPrice;
        this.bestDistrict = bestDistrict;
        this.worstMandi = worstMandi;
        this.worstPrice = worstPrice;
        this.worstDistrict = worstDistrict;
        this.recommendation = recommendation;
    }

    public String getCrop() { return crop; }
    public LocalDate getDate() { return date; } // ✅ FIX
    public String getBestMandi() { return bestMandi; }
    public double getBestPrice() { return bestPrice; }
    public String getBestDistrict() { return bestDistrict; }
    public String getWorstMandi() { return worstMandi; }
    public double getWorstPrice() { return worstPrice; }
    public String getWorstDistrict() { return worstDistrict; }
    public String getRecommendation() { return recommendation; }
}
