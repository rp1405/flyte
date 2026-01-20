package com.flyte.backend.controller;

import com.flyte.backend.DTO.User.UserRequest;
import com.flyte.backend.DTO.User.UserResponse;
import com.flyte.backend.security.JwtTokenProvider;
import com.flyte.backend.service.UserService;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final JwtTokenProvider tokenProvider;

    // You need your Google Client ID here to verify the token is truly for your app
    @Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String googleClientId;

    public AuthController(UserService userService, JwtTokenProvider tokenProvider) {
        this.userService = userService;
        this.tokenProvider = tokenProvider;
    }

    @PostMapping("/google")
    public ResponseEntity<?> loginWithGoogle(@RequestBody Map<String, String> payload) {
        String idTokenString = payload.get("idToken");

        try {
            System.out.println("Token: " + idTokenString);
            // 1. Verify the Google Token
            // This ensures the token was issued by Google and is for YOUR app
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(),
                    new GsonFactory())
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();

            GoogleIdToken idToken = verifier.verify(idTokenString);

            if (idToken == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid Google Token");
            }

            // 2. Extract User Info from the verified token
            GoogleIdToken.Payload googlePayload = idToken.getPayload();
            String email = googlePayload.getEmail();
            String name = (String) googlePayload.get("name");
            String pictureUrl = (String) googlePayload.get("picture");
            System.out.println("Name: " + name);

            // 3. Create or Update User in your DB (Logic from your Service)
            UserRequest userRequest = new UserRequest();
            userRequest.setEmail(email);
            userRequest.setName(name);
            userRequest.setProfilePictureUrl(pictureUrl);

            UserResponse userResponse = userService.findOrCreateUser(userRequest);

            // 4. Generate YOUR App's JWT (Logic from your SuccessHandler)
            String appToken = tokenProvider.generateToken(userResponse.getId().toString());

            // 5. Return the response (Token + User Info)
            return ResponseEntity.ok(Map.of(
                    "token", appToken,
                    "user", userResponse));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Login processing failed");
        }
    }
}