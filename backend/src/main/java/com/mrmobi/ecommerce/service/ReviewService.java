package com.mrmobi.ecommerce.service;

import com.mrmobi.ecommerce.dto.ReviewRequest;
import com.mrmobi.ecommerce.entity.Review;
import com.mrmobi.ecommerce.exception.ResourceNotFoundException;
import com.mrmobi.ecommerce.repository.OrderRepository;
import com.mrmobi.ecommerce.repository.ReviewRepository;
import com.mrmobi.ecommerce.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    public ReviewService(ReviewRepository reviewRepository, OrderRepository orderRepository, UserRepository userRepository) {
        this.reviewRepository = reviewRepository;
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
    }

    public boolean canRate(Long productId) {
        Long userId = getAuthenticatedUserId();
        return orderRepository.existsByUserIdAndProductIdAndStatus(userId, productId, "DELIVERED");
    }

    @Transactional
    public Review submit(ReviewRequest request) {
        Long userId = getAuthenticatedUserId();
        Long productId = request.getProductId();

        if (!orderRepository.existsByUserIdAndProductIdAndStatus(userId, productId, "DELIVERED")) {
            throw new SecurityException("Only customers who purchased this product can rate it.");
        }

        if (reviewRepository.existsByUserIdAndProductId(userId, productId)) {
            throw new IllegalArgumentException("You have already reviewed this product.");
        }

        Review review = new Review();
        review.setUserId(userId);
        review.setProductId(productId);
        review.setRating(request.getRating());
        review.setComment(request.getComment());
        return reviewRepository.save(review);
    }

    public List<Review> productReviews(Long productId) {
        List<Review> reviews = reviewRepository.findByProductIdOrderByCreatedAtDesc(productId);
        populateUserNames(reviews);
        return reviews;
    }

    public List<Review> getAllReviews() {
        List<Review> reviews = reviewRepository.findAll(org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "createdAt"));
        populateUserNames(reviews);
        return reviews;
    }

    private void populateUserNames(List<Review> reviews) {
        for (Review r : reviews) {
            if (r.getUserId() != null) {
                userRepository.findById(r.getUserId()).ifPresent(u -> {
                    r.setUserName(u.getFullName() != null && !u.getFullName().isBlank() ? u.getFullName() : "Anonymous Customer");
                });
            }
            if (r.getUserName() == null) {
                r.setUserName("Anonymous Customer");
            }
        }
    }

    @Transactional
    public void deleteReview(Long id) {
        if (!reviewRepository.existsById(id)) {
            throw new ResourceNotFoundException("Review not found with id: " + id);
        }
        reviewRepository.deleteById(id);
    }

    private Long getAuthenticatedUserId() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new SecurityException("Login required");
        }

        boolean isUser = auth.getAuthorities() != null && auth.getAuthorities().stream().anyMatch(a -> "ROLE_USER".equals(a.getAuthority()));
        if (!isUser) {
            throw new SecurityException("Login required");
        }

        String email = auth.getName();
        return userRepository.findByEmail(email)
                .map(u -> u.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}

