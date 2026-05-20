package com.mrmobi.ecommerce.controller;

import com.mrmobi.ecommerce.entity.User;
import com.mrmobi.ecommerce.repository.UserRepository;
import com.mrmobi.ecommerce.service.CartService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user/cart")
public class CartController {

    private final CartService cartService;
    private final UserRepository userRepository;

    public CartController(CartService cartService, UserRepository userRepository) {
        this.cartService = cartService;
        this.userRepository = userRepository;
    }

    private Long getUserId(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .map(User::getId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping
    public ResponseEntity<?> getCart(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(cartService.getCartItems(getUserId(userDetails)));
    }

    @PostMapping("/add")
    public ResponseEntity<?> addToCart(@AuthenticationPrincipal UserDetails userDetails, 
                                      @RequestParam Long productId, 
                                      @RequestParam(defaultValue = "1") int quantity) {
        return ResponseEntity.ok(cartService.addToCart(getUserId(userDetails), productId, quantity));
    }

    @PutMapping("/update")
    public ResponseEntity<?> updateQuantity(@AuthenticationPrincipal UserDetails userDetails, 
                                           @RequestParam Long productId, 
                                           @RequestParam int quantity) {
        return ResponseEntity.ok(cartService.updateQuantity(getUserId(userDetails), productId, quantity));
    }

    @DeleteMapping("/remove/{productId}")
    public ResponseEntity<?> removeFromCart(@AuthenticationPrincipal UserDetails userDetails, 
                                           @PathVariable Long productId) {
        cartService.removeFromCart(getUserId(userDetails), productId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/clear")
    public ResponseEntity<?> clearCart(@AuthenticationPrincipal UserDetails userDetails) {
        cartService.clearCart(getUserId(userDetails));
        return ResponseEntity.ok().build();
    }
}
