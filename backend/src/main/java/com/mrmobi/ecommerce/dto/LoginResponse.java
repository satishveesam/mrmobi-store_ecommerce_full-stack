package com.mrmobi.ecommerce.dto;

public class LoginResponse {

    private String token;
    private String username;
    private String fullName;
    private String role;
    private String mobile;
    private String address;
    private String gender;

    public LoginResponse(String token, String username, String fullName, String role, String mobile, String address, String gender) {
        this.token = token;
        this.username = username;
        this.fullName = fullName;
        this.role = role;
        this.mobile = mobile;
        this.address = address;
        this.gender = gender;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getMobile() {
        return mobile;
    }

    public void setMobile(String mobile) {
        this.mobile = mobile;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }
}
