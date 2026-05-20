package com.mrmobi.ecommerce.service;

import com.mrmobi.ecommerce.dto.SignupRequest;
import com.mrmobi.ecommerce.dto.UserLoginRequest;
import com.mrmobi.ecommerce.dto.LoginResponse;
import com.mrmobi.ecommerce.entity.User;
import com.mrmobi.ecommerce.exception.ResourceNotFoundException;
import com.mrmobi.ecommerce.repository.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final ReviewRepository reviewRepository;
    private final CartRepository cartRepository;
    private final AddressRepository addressRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    public UserService(UserRepository userRepository, 
                       OrderRepository orderRepository, 
                       ReviewRepository reviewRepository,
                       CartRepository cartRepository,
                       AddressRepository addressRepository,
                       JwtService jwtService, 
                       PasswordEncoder passwordEncoder,
                       EmailService emailService) {
        this.userRepository = userRepository;
        this.orderRepository = orderRepository;
        this.reviewRepository = reviewRepository;
        this.cartRepository = cartRepository;
        this.addressRepository = addressRepository;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    public LoginResponse signup(SignupRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new ResourceNotFoundException("Email already registered");
        }

        User user = new User();
        user.setEmail(request.getEmail().trim().toLowerCase());
        user.setFullName(request.getFullName().trim());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole("USER");

        user = userRepository.save(user);

        // Send Welcome Email
        emailService.sendWelcomeEmail(user.getEmail(), user.getFullName());

        String token = jwtService.generateToken(user.getEmail(), user.getRole());
        return new LoginResponse(token, user.getEmail(), user.getFullName(), user.getRole(), user.getMobile(), user.getAddress(), user.getGender());
    }

    public LoginResponse login(UserLoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new ResourceNotFoundException("Invalid email or password");
        }

        String token = jwtService.generateToken(user.getEmail(), user.getRole());
        return new LoginResponse(token, user.getEmail(), user.getFullName(), user.getRole(), user.getMobile(), user.getAddress(), user.getGender());
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public String resetPassword(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        String randomPassword = java.util.UUID.randomUUID().toString().substring(0, 8);
        user.setPassword(passwordEncoder.encode(randomPassword));
        if (user.getCreatedAt() == null) {
            user.setCreatedAt(java.time.LocalDateTime.now());
        }
        userRepository.save(user);

        // Send Password Reset Email
        emailService.sendPasswordResetEmail(user.getEmail(), randomPassword);
        
        return randomPassword;
    }

    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        cartRepository.deleteByUserId(id);
        reviewRepository.deleteByUserId(id);
        addressRepository.deleteByUserId(id);
        orderRepository.deleteByUserId(id);
        
        userRepository.delete(user);
    }

    public User getProfile(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    public User updateProfile(String email, com.mrmobi.ecommerce.dto.ProfileUpdateDto request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            user.setFullName(request.getFullName().trim());
        }
        
        if (request.getMobile() != null) {
            user.setMobile(request.getMobile().trim());
        }
        
        if (request.getAddress() != null) {
            user.setAddress(request.getAddress().trim());
        }

        if (request.getGender() != null) {
            user.setGender(request.getGender().trim());
        }

        if (request.getNewPassword() != null && !request.getNewPassword().isBlank()) {
            if (request.getOldPassword() == null || request.getOldPassword().isBlank()) {
                throw new IllegalArgumentException("Old password is required to set a new password");
            }
            if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
                throw new IllegalArgumentException("Invalid old password");
            }
            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        }

        return userRepository.save(user);
    }
}
