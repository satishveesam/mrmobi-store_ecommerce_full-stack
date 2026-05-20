package com.mrmobi.ecommerce.service;

import com.mrmobi.ecommerce.entity.Banner;
import com.mrmobi.ecommerce.repository.BannerRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BannerService {

    private final BannerRepository bannerRepository;

    public BannerService(BannerRepository bannerRepository) {
        this.bannerRepository = bannerRepository;
    }

    public List<Banner> getAllBanners() {
        return bannerRepository.findAll();
    }

    public Banner createBanner(Banner banner) {
        return bannerRepository.save(banner);
    }

    public void deleteBanner(Long id) {
        bannerRepository.deleteById(id);
    }
}
