package com.mrmobi.ecommerce.controller;

import com.mrmobi.ecommerce.dto.LoginRequest;
import com.mrmobi.ecommerce.dto.LoginResponse;
import com.mrmobi.ecommerce.dto.SignupRequest;
import com.mrmobi.ecommerce.dto.UserLoginRequest;
import com.mrmobi.ecommerce.service.AdminService;
import com.mrmobi.ecommerce.service.UserService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AdminService adminService;
    private final UserService userService;

    public AuthController(AdminService adminService, UserService userService) {
        this.adminService = adminService;
        this.userService = userService;
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        return adminService.login(request);
    }

    @PostMapping("/user/signup")
    public LoginResponse userSignup(@Valid @RequestBody SignupRequest request) {
        return userService.signup(request);
    }

    @PostMapping("/user/login")
    public LoginResponse userLogin(@Valid @RequestBody UserLoginRequest request) {
        return userService.login(request);
    }
}
