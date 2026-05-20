package com.mrmobi.ecommerce.service;

import com.mrmobi.ecommerce.entity.CartItem;
import com.mrmobi.ecommerce.entity.Product;
import com.mrmobi.ecommerce.entity.User;
import com.mrmobi.ecommerce.repository.CartRepository;
import com.mrmobi.ecommerce.repository.ProductRepository;
import com.mrmobi.ecommerce.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class CartService {

    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public CartService(CartRepository cartRepository, ProductRepository productRepository, UserRepository userRepository) {
        this.cartRepository = cartRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    public List<CartItem> getCartItems(Long userId) {
        return cartRepository.findByUserId(userId);
    }

    public CartItem addToCart(Long userId, Long productId, int quantity) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        Product product = productRepository.findById(productId).orElseThrow(() -> new RuntimeException("Product not found"));

        CartItem item = cartRepository.findByUserIdAndProductId(userId, productId)
                .orElse(new CartItem());

        if (item.getId() == null) {
            item.setUser(user);
            item.setProduct(product);
            item.setQuantity(quantity);
        } else {
            item.setQuantity(item.getQuantity() + quantity);
        }

        return cartRepository.save(item);
    }

    public CartItem updateQuantity(Long userId, Long productId, int quantity) {
        CartItem item = cartRepository.findByUserIdAndProductId(userId, productId)
                .orElseThrow(() -> new RuntimeException("Item not found in cart"));
        item.setQuantity(quantity);
        return cartRepository.save(item);
    }

    public void removeFromCart(Long userId, Long productId) {
        CartItem item = cartRepository.findByUserIdAndProductId(userId, productId)
                .orElseThrow(() -> new RuntimeException("Item not found in cart"));
        cartRepository.delete(item);
    }

    public void clearCart(Long userId) {
        cartRepository.deleteByUserId(userId);
    }
}
