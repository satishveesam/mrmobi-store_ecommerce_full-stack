package com.mrmobi.ecommerce.repository;

import com.mrmobi.ecommerce.entity.QuickDeliveryLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface QuickDeliveryLocationRepository extends JpaRepository<QuickDeliveryLocation, Long> {
    Optional<QuickDeliveryLocation> findByPincode(String pincode);
}
