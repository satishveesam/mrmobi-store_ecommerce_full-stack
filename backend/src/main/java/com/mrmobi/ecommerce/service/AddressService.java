package com.mrmobi.ecommerce.service;

import com.mrmobi.ecommerce.entity.UserAddress;
import com.mrmobi.ecommerce.exception.ResourceNotFoundException;
import com.mrmobi.ecommerce.repository.AddressRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AddressService {

    private final AddressRepository addressRepository;

    public AddressService(AddressRepository addressRepository) {
        this.addressRepository = addressRepository;
    }

    public List<UserAddress> getAddressesByUserId(Long userId) {
        return addressRepository.findByUserId(userId);
    }

    @Transactional
    public UserAddress addAddress(Long userId, UserAddress address) {
        address.setUserId(userId);
        if (address.isDefault()) {
            resetOtherDefaults(userId);
        }
        return addressRepository.save(address);
    }

    @Transactional
    public UserAddress updateAddress(Long userId, Long addressId, UserAddress updatedAddress) {
        UserAddress existing = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));
        
        if (!existing.getUserId().equals(userId)) {
            throw new SecurityException("Unauthorized");
        }

        existing.setFullName(updatedAddress.getFullName());
        existing.setMobile(updatedAddress.getMobile());
        existing.setAddressLine(updatedAddress.getAddressLine());
        existing.setCity(updatedAddress.getCity());
        existing.setState(updatedAddress.getState());
        existing.setPincode(updatedAddress.getPincode());
        existing.setType(updatedAddress.getType());
        
        if (updatedAddress.isDefault()) {
            resetOtherDefaults(userId);
            existing.setDefault(true);
        } else {
            existing.setDefault(updatedAddress.isDefault());
        }

        return addressRepository.save(existing);
    }

    @Transactional
    public void deleteAddress(Long userId, Long addressId) {
        UserAddress existing = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));
        
        if (!existing.getUserId().equals(userId)) {
            throw new SecurityException("Unauthorized");
        }
        
        addressRepository.delete(existing);
    }

    private void resetOtherDefaults(Long userId) {
        List<UserAddress> addresses = addressRepository.findByUserId(userId);
        for (UserAddress addr : addresses) {
            if (addr.isDefault()) {
                addr.setDefault(false);
                addressRepository.save(addr);
            }
        }
    }
}
