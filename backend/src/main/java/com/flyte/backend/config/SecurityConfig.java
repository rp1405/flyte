package com.flyte.backend.config;

import com.flyte.backend.security.JwtAuthenticationFilter;
import com.flyte.backend.security.OAuth2LoginSuccessHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler,
                          JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.oAuth2LoginSuccessHandler = oAuth2LoginSuccessHandler;
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // 1. Disable CSRF (since we are stateless)
            .csrf(AbstractHttpConfigurer::disable)
            
            // 2. Set session management to STATELESS
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            
            // 3. Configure authorization rules
            .authorizeHttpRequests(auth -> auth
                // Allow public access to login, auth callbacks, and WebSocket handshake
                .requestMatchers(
                        "/login",
                        "/oauth2/**",       // CRITICAL: Permit standard OAuth2 endpoints
                        "/authCallback/**", // Permit your custom success/failure URLs
                        "/ws/**" ,
                        "/index.html",
                        "/swagger-ui/**",
                        "/v3/api-docs/**"  // Allow WebSocket connection
                ).permitAll()
                // All other requests must be authenticated
                .anyRequest().authenticated()
            )
            
            // 4. Configure OAuth2 Login
            .oauth2Login(oauth2 -> oauth2
                //.loginPage("/login") // Your (optional) custom login page
                .successHandler(oAuth2LoginSuccessHandler) // <-- Use our custom JWT handler
                .failureUrl("/login?error=true") // Redirect on failure
            )
            
            // 5. Add our custom JWT filter before the default auth filter
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // Bean for password encoding (if you add standard username/password login later)
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // Bean needed for the JwtAuthenticationFilter
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }
}