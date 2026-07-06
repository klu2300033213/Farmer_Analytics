package com.farmer.analytics.model;

import jakarta.persistence.*;

@Entity
@Table(name = "crop_prices")
public class CropPrice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(name = "crop_name")
    private String cropName;

    private double price;
    private int year;
    private String month;
    private String season;
    private String location;

    // ---------- Getters ----------
    public int getId() {
        return id;
    }

    public String getCropName() {
        return cropName;
    }

    public double getPrice() {
        return price;
    }

    public int getYear() {
        return year;
    }

    public String getMonth() {
        return month;
    }

    public String getSeason() {
        return season;
    }

    public String getLocation() {
        return location;
    }

    // ---------- Setters ----------
    public void setId(int id) {
        this.id = id;
    }

    public void setCropName(String cropName) {
        this.cropName = cropName;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public void setYear(int year) {
        this.year = year;
    }

    public void setMonth(String month) {
        this.month = month;
    }

    public void setSeason(String season) {
        this.season = season;
    }

    public void setLocation(String location) {
        this.location = location;
    }
}
