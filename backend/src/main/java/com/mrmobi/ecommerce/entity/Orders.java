package com.mrmobi.ecommerce.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.Column;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import java.time.Instant;

@Entity
@Table(name = "orders")
public class Orders {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String customerName;

    @NotBlank
    private String mobile;

    @NotBlank
    @Column(columnDefinition = "TEXT")
    private String address;

    @NotBlank
    private String productName;

    /**
     * Product reference (for reviews/eligibility).
     * Nullable for legacy rows created before this feature.
     */
    @Column(name = "product_id")
    private Long productId;

    /**
     * Logged-in user reference. Nullable for guest checkouts.
     */
    @Column(name = "user_id")
    private Long userId;

    /**
     * Order lifecycle status. This project currently doesn't have full order workflow,
     * so we store a simple string to support "DELIVERED" gating for reviews.
     */
    @NotBlank
    private String status = "PLACED";

    @NotNull
    @Min(1)
    private Integer quantity;

    @NotNull
    @PositiveOrZero
    private Double totalPrice;

    @Column(name = "created_at")
    private Instant createdAt;

    @PrePersist
    public void setDefaults() {
        if (status == null || status.isBlank()) status = "PLACED";
        if (createdAt == null) createdAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getMobile() {
        return mobile;
    }

    public void setMobile(String mobile) {
        this.mobile = mobile;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public Double getTotalPrice() {
        return totalPrice;
    }

    public void setTotalPrice(Double totalPrice) {
        this.totalPrice = totalPrice;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
