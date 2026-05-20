package com.mrmobi.ecommerce.controller;

import com.mrmobi.ecommerce.dto.ReviewRequest;
import com.mrmobi.ecommerce.entity.Review;
import com.mrmobi.ecommerce.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @GetMapping("/can-rate/{productId}")
    public Map<String, Object> canRate(@PathVariable Long productId) {
        boolean canRate = reviewService.canRate(productId);
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("canRate", canRate);
        return res;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Review submit(@Valid @RequestBody ReviewRequest request) {
        return reviewService.submit(request);
    }

    @GetMapping("/product/{productId}")
    public List<Review> productReviews(@PathVariable Long productId) {
        return reviewService.productReviews(productId);
    }

    @GetMapping("/all")
    public List<Review> getAllReviews() {
        return reviewService.getAllReviews();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReview(@PathVariable Long id) {
        reviewService.deleteReview(id);
        return ResponseEntity.noContent().build();
    }
}

