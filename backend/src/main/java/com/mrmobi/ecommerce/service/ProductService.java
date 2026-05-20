package com.mrmobi.ecommerce.service;

import com.mrmobi.ecommerce.dto.ProductRequest;
import com.mrmobi.ecommerce.entity.Product;
import com.mrmobi.ecommerce.exception.ResourceNotFoundException;
import com.mrmobi.ecommerce.repository.ProductRepository;
import com.mrmobi.ecommerce.repository.CartRepository;
import com.mrmobi.ecommerce.repository.WishlistRepository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final CartRepository cartRepository;
    private final WishlistRepository wishlistRepository;

    public ProductService(ProductRepository productRepository, CartRepository cartRepository, WishlistRepository wishlistRepository) {
        this.productRepository = productRepository;
        this.cartRepository = cartRepository;
        this.wishlistRepository = wishlistRepository;
    }

    public List<Product> getProducts(String search) {
        if (search == null || search.isBlank()) {
            return productRepository.findAll();
        }
        return productRepository.findByNameContainingIgnoreCaseOrCategoryContainingIgnoreCase(search, search);
    }

    public Product getProduct(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
    }

    public Product addProduct(ProductRequest request) {
        Product product = new Product();
        applyRequest(product, request);
        return productRepository.save(product);
    }

    public Product updateProduct(Long id, ProductRequest request) {
        Product product = getProduct(id);
        applyRequest(product, request);
        return productRepository.save(product);
    }

    @Transactional
    public void deleteProduct(Long id) {
        Product product = getProduct(id);
        cartRepository.deleteByProductId(id);
        wishlistRepository.deleteByProductId(id);
        productRepository.delete(product);
    }

    private void applyRequest(Product product, ProductRequest request) {
        product.setName(request.getName());
        product.setDescription(request.getDescription());

        // Discount model (preferred): originalPrice + discountPercentage => discountedPrice
        Double originalPrice = request.getOriginalPrice();
        Double discountPercentage = request.getDiscountPercentage();

        product.setOriginalPrice(originalPrice);
        product.setDiscountPercentage(discountPercentage == null ? 0.0 : discountPercentage);

        if (originalPrice != null) {
            // Entity lifecycle will compute discountedPrice
            product.recalculatePricing();
        } else {
            // Legacy mode: if originalPrice isn't sent, accept `price` as final selling price.
            product.setDiscountedPrice(request.getPrice());
        }

        product.setImageUrl(request.getImageUrl());
        
        if (request.getImages() != null && !request.getImages().isEmpty()) {
            product.setImages(request.getImages());
            if (request.getImageUrl() == null || request.getImageUrl().isBlank()) {
                product.setImageUrl(request.getImages().get(0));
            }
        } else {
            product.setImages(new java.util.ArrayList<>());
        }

        product.setStock(request.getStock());
        product.setCategory(request.getCategory());
        product.setQuickDelivery(request.getQuickDelivery() != null ? request.getQuickDelivery() : true);
        product.setDeliveryFee(request.getDeliveryFee() != null ? request.getDeliveryFee() : 0.0);
    }
}
