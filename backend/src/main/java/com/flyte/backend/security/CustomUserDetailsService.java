package com.flyte.backend.security;

import com.flyte.backend.model.User;
import com.flyte.backend.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.UUID;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String userId) throws UsernameNotFoundException {

        UUID uuid = UUID.fromString(userId);

        User user = userRepository.findById(uuid)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + userId));

        // Convert your `User` entity to Spring Security's `UserDetails`
        // We are passing an empty list for authorities (roles), but you can add roles
        // here.
        return new org.springframework.security.core.userdetails.User(
                user.getId().toString(),
                "",
                new ArrayList<>());
    }
}