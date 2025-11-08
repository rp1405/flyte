package com.flyte.backend.security;

import com.flyte.backend.model.User;
import com.flyte.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        // Find the user in your database by their email
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        // Convert your `User` entity to Spring Security's `UserDetails`
        // We are passing an empty list for authorities (roles), but you can add roles here.
        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                "", // We don't store passwords for OAuth users
                new ArrayList<>() // Empty authorities list
        );
    }
}