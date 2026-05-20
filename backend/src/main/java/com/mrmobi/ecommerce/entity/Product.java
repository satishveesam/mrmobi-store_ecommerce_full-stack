package com.mrmobi.ecommerce.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Column;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.JoinColumn;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import java.util.List;
import java.util.ArrayList;

@Entity
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    /**
     * Final selling price (after discount).
     *
     * Persisted as `discounted_price` per PRD.
     * Also exposed as legacy JSON field `price` for backward compatibility.
     */
    @NotNull
    @PositiveOrZero
    @Column(name = "discounted_price")
    private Double discountedPrice;

    /**
     * MRP / original price before discount.
     */
    @PositiveOrZero
    @Column(name = "original_price")
    private Double originalPrice;

    /**
     * Discount percentage from 0 to 100.
     */
    @DecimalMin("0.0")
    @DecimalMax("100.0")
    @Column(name = "discount_percentage")
    private Double discountPercentage = 0.0;

    private String imageUrl;

    @ElementCollection(fetch = jakarta.persistence.FetchType.EAGER)
    @CollectionTable(name = "product_images", joinColumns = @JoinColumn(name = "product_id"))
    @Column(name = "image_url")
    private List<String> images = new ArrayList<>();

    @Min(0)
    private Integer stock;

    private String category;

    @Column(name = "quick_delivery")
    private Boolean quickDelivery = true;

    @Column(name = "delivery_fee")
    private Double deliveryFee = 0.0;

    @PrePersist
    @PreUpdate
    public void recalculatePricing() {
        if (originalPrice == null) {
            // If original price isn't provided, keep discountedPrice as-is (e.g., legacy payloads).
            return;
        }
        double discount = discountPercentage == null ? 0.0 : discountPercentage;
        if (discount < 0) discount = 0.0;
        if (discount > 100) discount = 100.0;

        double finalPrice = originalPrice - (originalPrice * discount / 100.0);
        if (finalPrice < 0) finalPrice = 0.0;
        discountedPrice = finalPrice;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    /**
     * Legacy JSON field: `price` (final price).
     */
    @JsonProperty("price")
    public Double getPrice() {
        return discountedPrice;
    }

    @JsonProperty("price")
    public void setPrice(Double price) {
        this.discountedPrice = price;
    }

    public Double getDiscountedPrice() {
        return discountedPrice;
    }

    public void setDiscountedPrice(Double discountedPrice) {
        this.discountedPrice = discountedPrice;
    }

    /**
     * Legacy JSON field: `mrpPrice` (original price).
     */
    @JsonProperty("mrpPrice")
    public Double getMrpPrice() {
        return originalPrice;
    }

    @JsonProperty("mrpPrice")
    public void setMrpPrice(Double mrpPrice) {
        this.originalPrice = mrpPrice;
    }

    public Double getOriginalPrice() {
        return originalPrice;
    }

    public void setOriginalPrice(Double originalPrice) {
        this.originalPrice = originalPrice;
    }

    /**
     * Legacy JSON field: `discountPercent` (integer discount).
     */
    @JsonProperty("discountPercent")
    public Integer getDiscountPercent() {
        if (discountPercentage == null) return null;
        return (int) Math.round(discountPercentage);
    }

    @JsonProperty("discountPercent")
    public void setDiscountPercent(Integer discountPercent) {
        this.discountPercentage = discountPercent == null ? null : discountPercent.doubleValue();
    }

    public Double getDiscountPercentage() {
        return discountPercentage;
    }

    public void setDiscountPercentage(Double discountPercentage) {
        this.discountPercentage = discountPercentage;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public List<String> getImages() {
        return images;
    }

    public void setImages(List<String> images) {
        this.images = images;
    }

    public Integer getStock() {
        return stock;
    }

    public void setStock(Integer stock) {
        this.stock = stock;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public Boolean getQuickDelivery() {
        return quickDelivery;
    }

    public void setQuickDelivery(Boolean quickDelivery) {
        this.quickDelivery = quickDelivery;
    }

    public Double getDeliveryFee() {
        return deliveryFee == null ? 0.0 : deliveryFee;
    }

    public void setDeliveryFee(Double deliveryFee) {
        this.deliveryFee = deliveryFee == null ? 0.0 : deliveryFee;
    }
}
