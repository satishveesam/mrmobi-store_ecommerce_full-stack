package com.mrmobi.ecommerce.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import java.util.List;

public class ProductRequest {

    @NotBlank
    private String name;

    private String description;

    /**
     * Legacy field used by older UI as "selling price".
     * Optional now; when `originalPrice` is provided, backend will auto-calculate final price.
     */
    @PositiveOrZero
    @JsonAlias({"discountedPrice"})
    private Double price;

    /**
     * New field name (preferred): originalPrice.
     */
    @PositiveOrZero
    @JsonAlias({"mrpPrice"})
    private Double originalPrice;

    /**
     * New field name (preferred): discountPercentage (0..100).
     */
    @DecimalMin("0.0")
    @DecimalMax("100.0")
    @JsonAlias({"discountPercent"})
    private Double discountPercentage;

    private String imageUrl;

    private List<String> images;

    @NotNull
    @Min(0)
    private Integer stock;

    private String category;

    private Boolean quickDelivery = true;

    private Double deliveryFee = 0.0;

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

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public Double getOriginalPrice() {
        return originalPrice;
    }

    public void setOriginalPrice(Double originalPrice) {
        this.originalPrice = originalPrice;
    }

    public Double getDiscountPercentage() {
        return discountPercentage;
    }

    public void setDiscountPercentage(Double discountPercentage) {
        this.discountPercentage = discountPercentage;
    }

    // Backward-compatible accessors (service layer still calls these in places).
    public Double getMrpPrice() {
        return originalPrice;
    }

    public void setMrpPrice(Double mrpPrice) {
        this.originalPrice = mrpPrice;
    }

    public Integer getDiscountPercent() {
        if (discountPercentage == null) return null;
        return (int) Math.round(discountPercentage);
    }

    public void setDiscountPercent(Integer discountPercent) {
        this.discountPercentage = discountPercent == null ? null : discountPercent.doubleValue();
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
