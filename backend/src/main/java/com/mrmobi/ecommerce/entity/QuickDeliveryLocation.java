package com.mrmobi.ecommerce.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Column;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

@Entity
public class QuickDeliveryLocation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Pattern(regexp = "^[0-9]{6}$", message = "Invalid pincode - must be 6 digits")
    @Column(unique = true, nullable = false)
    private String pincode;

    @NotNull
    @Column(nullable = false)
    private Double deliveryFee = 0.0;

    @Column(nullable = true)
    private String cityName;

    @Column(nullable = true)
    private Double freeThreshold = 0.0;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getPincode() {
        return pincode;
    }

    public void setPincode(String pincode) {
        this.pincode = pincode;
    }

    public Double getDeliveryFee() {
        return deliveryFee;
    }

    public void setDeliveryFee(Double deliveryFee) {
        this.deliveryFee = deliveryFee;
    }

    public String getCityName() {
        return cityName;
    }

    public void setCityName(String cityName) {
        this.cityName = cityName;
    }

    public Double getFreeThreshold() {
        return freeThreshold;
    }

    public void setFreeThreshold(Double freeThreshold) {
        this.freeThreshold = freeThreshold;
    }
}
