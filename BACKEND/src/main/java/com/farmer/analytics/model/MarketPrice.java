package com.farmer.analytics.model;

import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "market_prices")
public class MarketPrice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private String crop;
    private String mandi;
    private double price;
    private LocalDate priceDate;
    private String source; // AGMARKNET / SIMULATED

    public int getId() { return id; }
    public String getCrop() { return crop; }
    public String getMandi() { return mandi; }
    public double getPrice() { return price; }
    public LocalDate getPriceDate() { return priceDate; }
    public String getSource() { return source; }

    public void setCrop(String crop) { this.crop = crop; }
    public void setMandi(String mandi) { this.mandi = mandi; }
    public void setPrice(double price) { this.price = price; }
    public void setPriceDate(LocalDate priceDate) { this.priceDate = priceDate; }
    public void setSource(String source) { this.source = source; }
}
