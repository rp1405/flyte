package com.flyte.backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtTokenProvider {

    // 1. Load a secret key from your application.properties
    // This key MUST be long and kept secret!
    // Example for application.properties:
    // app.jwt.secret=ThisIsAStrongAndLongSecretKeyForMyFlyteApp12345
    // app.jwt.expiration-ms=3600000 
    
    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${app.jwt.expiration-ms}")
    private int jwtExpirationInMs;

    private SecretKey getSigningKey() {
        // We use the secret string to create a secure key
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    // --- Method to generate a token ---
    public String generateToken(Authentication authentication) {
        // For OAuth2, the principal is an OAuth2User
        OAuth2User oauthUser = (OAuth2User) authentication.getPrincipal();
        
        // We'll use the user's email as the "subject" of the token
        String email = oauthUser.getAttribute("email");
        String name = oauthUser.getAttribute("name");

        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationInMs);

        return Jwts.builder()
                .subject(email) // The user the token belongs to (their email)
                .claim("name", name) // Add extra info (claims)
                .issuedAt(new Date())
                .expiration(expiryDate)
                .signWith(getSigningKey())
                .compact();
    }

    // --- Method to get the user's email from the token ---
    public String getEmailFromJWT(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();

        return claims.getSubject();
    }

    // --- Method to validate the token ---
    public boolean validateToken(String authToken) {
        try {
            Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(authToken);
            return true;
        } catch (Exception ex) {
            // Can log different exceptions:
            // MalformedJwtException, ExpiredJwtException, UnsupportedJwtException, etc
            System.err.println("JWT validation failed: " + ex.getMessage());
        }
        return false;
    }
}