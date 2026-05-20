package com.mrmobi.ecommerce.repository;

import com.mrmobi.ecommerce.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    boolean existsByUserIdAndProductId(Long userId, Long productId);

    Optional<Review> findByUserIdAndProductId(Long userId, Long productId);

    List<Review> findByProductIdOrderByCreatedAtDesc(Long productId);
    
    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Query("DELETE FROM Review r WHERE r.userId = :userId")
    void deleteByUserId(Long userId);
}

