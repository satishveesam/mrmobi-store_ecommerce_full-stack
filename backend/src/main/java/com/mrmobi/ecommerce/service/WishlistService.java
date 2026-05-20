package com.mrmobi.ecommerce.service;

import com.mrmobi.ecommerce.dto.WishlistItemDTO;
import com.mrmobi.ecommerce.entity.Product;
import com.mrmobi.ecommerce.entity.User;
import com.mrmobi.ecommerce.entity.WishlistItem;
import com.mrmobi.ecommerce.repository.ProductRepository;
import com.mrmobi.ecommerce.repository.UserRepository;
import com.mrmobi.ecommerce.repository.WishlistRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    public WishlistService(WishlistRepository wishlistRepository, UserRepository userRepository, ProductRepository productRepository) {
        this.wishlistRepository = wishlistRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
    }

    public List<WishlistItemDTO> getWishlist(Long userId) {
        List<WishlistItem> items = wishlistRepository.findByUserId(userId);
        return items.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public WishlistItemDTO addToWishlist(Long userId, Long productId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (wishlistRepository.existsByUserIdAndProductId(userId, productId)) {
            throw new RuntimeException("Product already in wishlist");
        }

        WishlistItem item = new WishlistItem(user, product);
        WishlistItem saved = wishlistRepository.save(item);
        return convertToDTO(saved);
    }

    @Transactional
    public void removeFromWishlist(Long userId, Long productId) {
        if (!wishlistRepository.existsByUserIdAndProductId(userId, productId)) {
            throw new RuntimeException("Product not in wishlist");
        }
        wishlistRepository.deleteByUserIdAndProductId(userId, productId);
    }

    public boolean isInWishlist(Long userId, Long productId) {
        return wishlistRepository.existsByUserIdAndProductId(userId, productId);
    }

    public long getWishlistCount(Long userId) {
        return wishlistRepository.findByUserId(userId).size();
    }

    private WishlistItemDTO convertToDTO(WishlistItem item) {
        Product product = item.getProduct();
        return new WishlistItemDTO(
                item.getId(),
                product.getId(),
                product.getName(),
                product.getImageUrl(),
                product.getDiscountedPrice(),
                product.getOriginalPrice(),
                product.getDiscountPercent(),
                product.getStock(),
                product.getCategory(),
                item.getAddedAt()
        );
    }
}
