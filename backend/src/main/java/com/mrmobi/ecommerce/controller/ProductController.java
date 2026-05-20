package com.mrmobi.ecommerce.controller;

import com.mrmobi.ecommerce.dto.ProductRequest;
import com.mrmobi.ecommerce.entity.Product;
import com.mrmobi.ecommerce.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;
    private final com.mrmobi.ecommerce.repository.SystemSettingRepository systemSettingRepository;
    private final com.mrmobi.ecommerce.repository.QuickDeliveryLocationRepository quickDeliveryLocationRepository;

    public ProductController(ProductService productService, 
                             com.mrmobi.ecommerce.repository.SystemSettingRepository systemSettingRepository,
                             com.mrmobi.ecommerce.repository.QuickDeliveryLocationRepository quickDeliveryLocationRepository) {
        this.productService = productService;
        this.systemSettingRepository = systemSettingRepository;
        this.quickDeliveryLocationRepository = quickDeliveryLocationRepository;
    }

    @GetMapping("/settings/quick-delivery-locations")
    public List<com.mrmobi.ecommerce.entity.QuickDeliveryLocation> getQuickDeliveryLocations() {
        return quickDeliveryLocationRepository.findAll();
    }

    @GetMapping("/settings/global-delivery-fee")
    public java.util.Map<String, Object> getGlobalDeliveryFee() {
        String feeStr = systemSettingRepository.findById("global_delivery_fee")
                .map(com.mrmobi.ecommerce.entity.SystemSetting::getSettingValue)
                .orElse("0.0");
        java.util.Map<String, Object> response = new java.util.HashMap<>();
        response.put("globalDeliveryFee", Double.parseDouble(feeStr));
        return response;
    }

    @GetMapping("/settings/free-delivery-threshold")
    public java.util.Map<String, Object> getFreeDeliveryThreshold() {
        String thresholdStr = systemSettingRepository.findById("free_delivery_threshold")
                .map(com.mrmobi.ecommerce.entity.SystemSetting::getSettingValue)
                .orElse("0.0");
        java.util.Map<String, Object> response = new java.util.HashMap<>();
        response.put("freeDeliveryThreshold", Double.parseDouble(thresholdStr));
        return response;
    }

    @GetMapping("/settings/quick-delivery-fee")
    public java.util.Map<String, Object> getQuickDeliveryFee() {
        String feeStr = systemSettingRepository.findById("quick_delivery_fee")
                .map(com.mrmobi.ecommerce.entity.SystemSetting::getSettingValue)
                .orElse("0.0");
        java.util.Map<String, Object> response = new java.util.HashMap<>();
        response.put("quickDeliveryFee", Double.parseDouble(feeStr));
        return response;
    }

    @GetMapping("/settings/quick-delivery-free-threshold")
    public java.util.Map<String, Object> getQuickDeliveryFreeThreshold() {
        String thresholdStr = systemSettingRepository.findById("quick_delivery_free_threshold")
                .map(com.mrmobi.ecommerce.entity.SystemSetting::getSettingValue)
                .orElse("0.0");
        java.util.Map<String, Object> response = new java.util.HashMap<>();
        response.put("quickDeliveryFreeThreshold", Double.parseDouble(thresholdStr));
        return response;
    }

    @GetMapping("/settings/announcement")
    public java.util.Map<String, Object> getAnnouncementSettings() {
        String active = systemSettingRepository.findById("announcement_active")
                .map(com.mrmobi.ecommerce.entity.SystemSetting::getSettingValue)
                .orElse("false");
        String text = systemSettingRepository.findById("announcement_text")
                .map(com.mrmobi.ecommerce.entity.SystemSetting::getSettingValue)
                .orElse("🎉 Special Offer: Flat 10% OFF on all smart watches today!");
        String theme = systemSettingRepository.findById("announcement_theme")
                .map(com.mrmobi.ecommerce.entity.SystemSetting::getSettingValue)
                .orElse("emerald");
        String link = systemSettingRepository.findById("announcement_link")
                .map(com.mrmobi.ecommerce.entity.SystemSetting::getSettingValue)
                .orElse("");

        java.util.Map<String, Object> response = new java.util.HashMap<>();
        response.put("active", Boolean.parseBoolean(active));
        response.put("text", text);
        response.put("theme", theme);
        response.put("link", link);
        return response;
    }

    @GetMapping
    public List<Product> getProducts(@RequestParam(required = false) String search) {
        return productService.getProducts(search);
    }

    @GetMapping("/{id}")
    public Product getProduct(@PathVariable Long id) {
        return productService.getProduct(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Product addProduct(@Valid @RequestBody ProductRequest request) {
        return productService.addProduct(request);
    }

    @PutMapping("/{id}")
    public Product updateProduct(@PathVariable Long id, @Valid @RequestBody ProductRequest request) {
        return productService.updateProduct(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
    }
}
