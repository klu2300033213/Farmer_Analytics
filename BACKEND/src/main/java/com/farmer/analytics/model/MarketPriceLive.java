package com.farmer.analytics.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "market_prices_live")
public class MarketPriceLive {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private String state;
    private String district;
    private String mandi;

    @Column(name = "crop_name")
    private String cropName;

    @Column(name = "min_price")
    private double minPrice;

    @Column(name = "modal_price")
    private double modalPrice;

    @Column(name = "max_price")
    private double maxPrice;

    @Column(name = "price_date")
    private LocalDate priceDate;

    public int getId() { return id; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }

    public String getMandi() { return mandi; }
    public void setMandi(String mandi) { this.mandi = mandi; }

    public String getCropName() { return cropName; }
    public void setCropName(String cropName) { this.cropName = cropName; }

    public double getMinPrice() { return minPrice; }
    public void setMinPrice(double minPrice) { this.minPrice = minPrice; }

    public double getModalPrice() { return modalPrice; }
    public void setModalPrice(double modalPrice) { this.modalPrice = modalPrice; }

    public double getMaxPrice() { return maxPrice; }
    public void setMaxPrice(double maxPrice) { this.maxPrice = maxPrice; }

    public LocalDate getPriceDate() { return priceDate; }
    public void setPriceDate(LocalDate priceDate) { this.priceDate = priceDate; }
}
