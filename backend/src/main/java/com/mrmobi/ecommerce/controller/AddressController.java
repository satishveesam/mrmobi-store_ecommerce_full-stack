package com.mrmobi.ecommerce.controller;

import com.mrmobi.ecommerce.entity.User;
import com.mrmobi.ecommerce.entity.UserAddress;
import com.mrmobi.ecommerce.repository.UserRepository;
import com.mrmobi.ecommerce.service.AddressService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user/addresses")
public class AddressController {

    private final AddressService addressService;
    private final UserRepository userRepository;

    public AddressController(AddressService addressService, UserRepository userRepository) {
        this.addressService = addressService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<?> getMyAddresses(@AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        return ResponseEntity.ok(addressService.getAddressesByUserId(userId));
    }

    @PostMapping
    public ResponseEntity<?> addAddress(@AuthenticationPrincipal UserDetails userDetails, @Valid @RequestBody UserAddress address) {
        Long userId = getUserId(userDetails);
        return ResponseEntity.ok(addressService.addAddress(userId, address));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateAddress(@AuthenticationPrincipal UserDetails userDetails, @PathVariable Long id, @Valid @RequestBody UserAddress address) {
        Long userId = getUserId(userDetails);
        return ResponseEntity.ok(addressService.updateAddress(userId, id, address));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAddress(@AuthenticationPrincipal UserDetails userDetails, @PathVariable Long id) {
        Long userId = getUserId(userDetails);
        addressService.deleteAddress(userId, id);
        return ResponseEntity.ok().build();
    }

    private Long getUserId(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .map(User::getId)
                .orElseThrow(() -> new SecurityException("User not found"));
    }
}
