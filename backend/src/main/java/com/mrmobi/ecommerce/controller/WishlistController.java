package com.mrmobi.ecommerce.controller;

import com.mrmobi.ecommerce.entity.User;
import com.mrmobi.ecommerce.repository.UserRepository;
import com.mrmobi.ecommerce.service.WishlistService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user/wishlist")
public class WishlistController {

    private final WishlistService wishlistService;
    private final UserRepository userRepository;

    public WishlistController(WishlistService wishlistService, UserRepository userRepository) {
        this.wishlistService = wishlistService;
        this.userRepository = userRepository;
    }

    private Long getUserId(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .map(User::getId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping
    public ResponseEntity<?> getWishlist(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(wishlistService.getWishlist(getUserId(userDetails)));
    }

    @GetMapping("/count")
    public ResponseEntity<?> getWishlistCount(@AuthenticationPrincipal UserDetails userDetails) {
        Long count = wishlistService.getWishlistCount(getUserId(userDetails));
        return ResponseEntity.ok().body(java.util.Map.of("count", count));
    }

    @PostMapping("/add")
    public ResponseEntity<?> addToWishlist(@AuthenticationPrincipal UserDetails userDetails,
                                          @RequestParam Long productId) {
        return ResponseEntity.ok(wishlistService.addToWishlist(getUserId(userDetails), productId));
    }

    @DeleteMapping("/remove/{productId}")
    public ResponseEntity<?> removeFromWishlist(@AuthenticationPrincipal UserDetails userDetails,
                                               @PathVariable Long productId) {
        wishlistService.removeFromWishlist(getUserId(userDetails), productId);
        return ResponseEntity.ok().body(java.util.Map.of("message", "Removed from wishlist"));
    }

    @GetMapping("/check/{productId}")
    public ResponseEntity<?> checkInWishlist(@AuthenticationPrincipal UserDetails userDetails,
                                            @PathVariable Long productId) {
        boolean inWishlist = wishlistService.isInWishlist(getUserId(userDetails), productId);
        return ResponseEntity.ok().body(java.util.Map.of("inWishlist", inWishlist));
    }
}
