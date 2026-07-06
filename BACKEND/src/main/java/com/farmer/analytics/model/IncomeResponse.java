package com.farmer.analytics.model;

public class IncomeResponse {

    private String incomeRange;
    private String riskLevel;
    private String unit;

    // Phase-2
    private double volatility;
    private String volatilityLevel;

    // STEP-2
    private int bestCaseIncome;
    private int worstCaseIncome;

    // ✅ STEP-3 (UNIQUE FEATURE)
    private String riskReason;
    private String recommendation;

    // OLD constructor (kept)
    public IncomeResponse(String incomeRange, String riskLevel) {
        this.incomeRange = incomeRange;
        this.riskLevel = riskLevel;
    }

    // Existing constructor (kept)
    public IncomeResponse(String incomeRange, String riskLevel,
                          double volatility, String volatilityLevel) {
        this.incomeRange = incomeRange;
        this.riskLevel = riskLevel;
        this.volatility = volatility;
        this.volatilityLevel = volatilityLevel;
    }

    // ✅ MAIN constructor (USED NOW)
    public IncomeResponse(String incomeRange, String riskLevel,
                          double volatility, String volatilityLevel,
                          int bestCaseIncome, int worstCaseIncome,
                          String riskReason, String recommendation) {

        this.incomeRange = incomeRange;
        this.riskLevel = riskLevel;
        this.volatility = volatility;
        this.volatilityLevel = volatilityLevel;
        this.bestCaseIncome = bestCaseIncome;
        this.worstCaseIncome = worstCaseIncome;
        this.riskReason = riskReason;
        this.recommendation = recommendation;
    }

    public String getIncomeRange() { return incomeRange; }
    public String getRiskLevel() { return riskLevel; }
    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }
    public double getVolatility() { return volatility; }
    public String getVolatilityLevel() { return volatilityLevel; }
    public int getBestCaseIncome() { return bestCaseIncome; }
    public int getWorstCaseIncome() { return worstCaseIncome; }
    public String getRiskReason() { return riskReason; }
    public String getRecommendation() { return recommendation; }
}
