package com.flyte.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth
                        // Allow access to the root and login failure pages without authentication
                        .requestMatchers("/login").permitAll()
                        // Require authentication for any other request
                        .anyRequest().authenticated())
                .oauth2Login(oauth2 -> oauth2
                        // Redirect to /user upon successful login
                        .defaultSuccessUrl("/authCallback/success", true)
                        // Redirect to /loginFailure upon a failed login
                        .failureUrl("/authCallback/failure"))
                // Add logout configuration
                .logout(logout -> logout
                        // Define the URL that triggers logout
                        .logoutUrl("/logout")
                        // Specify where to redirect after a successful logout
                        .logoutSuccessUrl("/login") // change later
                        // Invalidate the user's session
                        .invalidateHttpSession(true)
                        // Clear the authentication information
                        .clearAuthentication(true)
                        // Delete the session cookie
                        .deleteCookies("JSESSIONID")
                        .permitAll());

        return http.build();
    }
}
