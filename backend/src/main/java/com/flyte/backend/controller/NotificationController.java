package com.flyte.backend.controller;

import com.flyte.backend.model.User;
import com.flyte.backend.model.UserDeviceToken;
import com.flyte.backend.repository.UserDeviceTokenRepository;
import com.flyte.backend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final UserDeviceTokenRepository userDeviceTokenRepository;
    private final UserService userService;

    public NotificationController(UserDeviceTokenRepository userDeviceTokenRepository, UserService userService) {
        this.userDeviceTokenRepository = userDeviceTokenRepository;
        this.userService = userService;
    }

    @PostMapping("/register-token")
    public ResponseEntity<?> registerToken(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        String userIdStr = request.get("userId");

        if (userIdStr == null || token == null) {
            return ResponseEntity.badRequest().body("userId and token are required");
        }

        UUID userId = UUID.fromString(userIdStr);
        User user = userService.findById(userId);
        if (user == null) {
            return ResponseEntity.badRequest().body("User not found");
        }

        // Check if token already exists
        // (Simple implementation: just save if it doesn't exist)
        // In a real app, you might want to handle updates or removals
        
        UserDeviceToken deviceToken = new UserDeviceToken();
        deviceToken.setUser(user);
        deviceToken.setFcmToken(token);
        
        try {
            userDeviceTokenRepository.save(deviceToken);
            return ResponseEntity.ok("Token registered successfully");
        } catch (Exception e) {
            // Probably unique constraint violation
            return ResponseEntity.ok("Token already registered");
        }
    }
}
