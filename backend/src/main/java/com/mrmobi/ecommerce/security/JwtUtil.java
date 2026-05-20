package com.mrmobi.ecommerce.security;

import com.mrmobi.ecommerce.service.JwtService;
import org.springframework.stereotype.Component;

@Component
public class JwtUtil {

    private final JwtService jwtService;

    public JwtUtil(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    public String generateToken(String username, String role) {
        return jwtService.generateToken(username, role);
    }

    public boolean validateToken(String token) {
        return jwtService.isTokenValid(token);
    }

    public String getUsernameFromToken(String token) {
        return jwtService.extractUsername(token);
    }
}
