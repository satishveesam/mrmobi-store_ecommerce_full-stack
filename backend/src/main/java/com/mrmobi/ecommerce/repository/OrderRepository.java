package com.mrmobi.ecommerce.repository;

import com.mrmobi.ecommerce.entity.Orders;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Orders, Long> {
    boolean existsByUserIdAndProductIdAndStatus(Long userId, Long productId, String status);

    List<Orders> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Orders> findAllByOrderByIdDesc();
    
    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Query("DELETE FROM Orders o WHERE o.userId = :userId")
    void deleteByUserId(Long userId);
}
