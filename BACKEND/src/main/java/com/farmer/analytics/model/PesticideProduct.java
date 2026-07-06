package com.farmer.analytics.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "pesticide_products",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"registration_number", "product_name"})
        }
)
public class PesticideProduct {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "registration_number", nullable = false, length = 120)
    private String registrationNumber;

    @Column(name = "product_name", nullable = false, length = 300)
    private String productName;

    @Column(name = "active_ingredient", length = 300)
    private String activeIngredient;

    @Column(name = "formulation", length = 120)
    private String formulation;

    @Column(name = "concentration", length = 120)
    private String concentration;

    @Column(name = "price_per_unit")
    private Double pricePerUnit;

    @Lob
    @Column(name = "approved_crops")
    private String approvedCrops;

    @Lob
    @Column(name = "target_pests")
    private String targetPests;

    @Column(name = "registrant_company", length = 300)
    private String registrantCompany;

    @Column(name = "legal_status", length = 40)
    private String legalStatus;

    @Column(name = "source_section", length = 120)
    private String sourceSection;

    @Column(name = "source_year")
    private Integer sourceYear;

    @Column(name = "source_date", length = 40)
    private String sourceDate;

    @Column(name = "last_imported_at", nullable = false)
    private LocalDateTime lastImportedAt;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getRegistrationNumber() {
        return registrationNumber;
    }

    public void setRegistrationNumber(String registrationNumber) {
        this.registrationNumber = registrationNumber;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public String getActiveIngredient() {
        return activeIngredient;
    }

    public void setActiveIngredient(String activeIngredient) {
        this.activeIngredient = activeIngredient;
    }

    public String getFormulation() {
        return formulation;
    }

    public void setFormulation(String formulation) {
        this.formulation = formulation;
    }

    public String getConcentration() {
        return concentration;
    }

    public void setConcentration(String concentration) {
        this.concentration = concentration;
    }

    public Double getPricePerUnit() {
        return pricePerUnit;
    }

    public void setPricePerUnit(Double pricePerUnit) {
        this.pricePerUnit = pricePerUnit;
    }

    public String getApprovedCrops() {
        return approvedCrops;
    }

    public void setApprovedCrops(String approvedCrops) {
        this.approvedCrops = approvedCrops;
    }

    public String getTargetPests() {
        return targetPests;
    }

    public void setTargetPests(String targetPests) {
        this.targetPests = targetPests;
    }

    public String getRegistrantCompany() {
        return registrantCompany;
    }

    public void setRegistrantCompany(String registrantCompany) {
        this.registrantCompany = registrantCompany;
    }

    public String getLegalStatus() {
        return legalStatus;
    }

    public void setLegalStatus(String legalStatus) {
        this.legalStatus = legalStatus;
    }

    public String getSourceSection() {
        return sourceSection;
    }

    public void setSourceSection(String sourceSection) {
        this.sourceSection = sourceSection;
    }

    public Integer getSourceYear() {
        return sourceYear;
    }

    public void setSourceYear(Integer sourceYear) {
        this.sourceYear = sourceYear;
    }

    public String getSourceDate() {
        return sourceDate;
    }

    public void setSourceDate(String sourceDate) {
        this.sourceDate = sourceDate;
    }

    public LocalDateTime getLastImportedAt() {
        return lastImportedAt;
    }

    public void setLastImportedAt(LocalDateTime lastImportedAt) {
        this.lastImportedAt = lastImportedAt;
    }
}
