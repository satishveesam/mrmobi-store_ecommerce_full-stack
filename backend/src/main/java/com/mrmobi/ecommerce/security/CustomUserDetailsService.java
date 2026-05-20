package com.mrmobi.ecommerce.security;

import com.mrmobi.ecommerce.entity.Admin;
import com.mrmobi.ecommerce.entity.User;
import com.mrmobi.ecommerce.repository.AdminRepository;
import com.mrmobi.ecommerce.repository.UserRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final AdminRepository adminRepository;
    private final UserRepository userRepository;

    public CustomUserDetailsService(AdminRepository adminRepository, UserRepository userRepository) {
        this.adminRepository = adminRepository;
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // Try to find as Admin (using username)
        Optional<Admin> admin = adminRepository.findByUsername(username);
        if (admin.isPresent()) {
            Admin a = admin.get();
            return new org.springframework.security.core.userdetails.User(
                    a.getUsername(),
                    a.getPassword(),
                    List.of(new SimpleGrantedAuthority("ROLE_" + a.getRole()))
            );
        }

        // Try to find as User (using email)
        Optional<User> user = userRepository.findByEmail(username);
        if (user.isPresent()) {
            User u = user.get();
            return new org.springframework.security.core.userdetails.User(
                    u.getEmail(),
                    u.getPassword(),
                    List.of(new SimpleGrantedAuthority("ROLE_" + u.getRole()))
            );
        }

        throw new UsernameNotFoundException("User not found: " + username);
    }
}
