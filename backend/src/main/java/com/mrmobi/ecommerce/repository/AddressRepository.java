package com.mrmobi.ecommerce.repository;

import com.mrmobi.ecommerce.entity.UserAddress;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AddressRepository extends JpaRepository<UserAddress, Long> {
    List<UserAddress> findByUserId(Long userId);
    
    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Query("DELETE FROM UserAddress a WHERE a.userId = :userId")
    void deleteByUserId(Long userId);
}
