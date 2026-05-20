package com.mrmobi.ecommerce.service;

import com.mrmobi.ecommerce.dto.LoginRequest;
import com.mrmobi.ecommerce.dto.LoginResponse;
import com.mrmobi.ecommerce.entity.Admin;
import com.mrmobi.ecommerce.exception.ResourceNotFoundException;
import com.mrmobi.ecommerce.repository.AdminRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AdminService {

    private final AdminRepository adminRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.default-username:admin}")
    private String defaultUsername;

    @Value("${app.admin.default-password:admin123}")
    private String defaultPassword;

    @Value("${app.admin.default-role:ADMIN}")
    private String defaultRole;

    public AdminService(AdminRepository adminRepository, JwtService jwtService, PasswordEncoder passwordEncoder) {
        this.adminRepository = adminRepository;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
    }

    @PostConstruct
    void createDefaultAdmin() {
        Admin admin = adminRepository.findByUsername(defaultUsername).orElseGet(() -> {
            Admin newAdmin = new Admin();
            newAdmin.setUsername(defaultUsername);
            return newAdmin;
        });

        boolean changed = false;
        if (admin.getPassword() == null || !passwordEncoder.matches(defaultPassword, admin.getPassword())) {
            admin.setPassword(passwordEncoder.encode(defaultPassword));
            changed = true;
        }
        if (admin.getRole() == null || !admin.getRole().equals(defaultRole)) {
            admin.setRole(defaultRole);
            changed = true;
        }
        if (admin.getId() == null || changed) {
            adminRepository.save(admin);
        }
    }

    public LoginResponse login(LoginRequest request) {
        Admin admin = adminRepository.findByUsername(request.getUsername().trim())
                .orElseThrow(() -> new ResourceNotFoundException("Invalid username or password"));
        if (!passwordEncoder.matches(request.getPassword(), admin.getPassword())) {
            throw new ResourceNotFoundException("Invalid username or password");
        }
        String token = jwtService.generateToken(admin.getUsername(), admin.getRole());
        return new LoginResponse(token, admin.getUsername(), "Administrator", admin.getRole(), null, null, null);
    }
}
