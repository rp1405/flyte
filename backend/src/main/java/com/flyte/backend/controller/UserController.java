package com.flyte.backend.controller;

import com.flyte.backend.DTO.User.UserRequest;
import com.flyte.backend.DTO.User.UserResponse;
import com.flyte.backend.service.UserService;

import jakarta.validation.Valid;

import java.util.UUID;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // This endpoint simulates a login/registration event.
    // In a real OAuth flow, this logic would be in a success handler.
    @PostMapping("/findOrCreate")
    public ResponseEntity<UserResponse> findOrCreateUser(@Valid @RequestBody UserRequest userRequest) {
        log.info("Received request to find or create user with email: {}", userRequest.getEmail());
        UserResponse response = userService.findOrCreateUser(userRequest);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/getUserbyId")
    public ResponseEntity<UserResponse> getUser(@RequestParam UUID id) {
        log.info("Received request to get user with ID: {}", id);
        UserResponse response = userService.getUserById(id);
        return ResponseEntity.ok(response);
    }

    // Endpoint to check if a nickname is available
    @PostMapping("/check-nickname")
    public ResponseEntity<Map<String, Boolean>> checkNicknameAvailability(
            @Valid @RequestBody Map<String, String> request) {
        String nickname = request.get("nickname");
        log.info("Checking availability for nickname: {}", nickname);
        boolean available = userService.isNicknameAvailable(nickname);
        return ResponseEntity.ok(Map.of("available", available));
    }

    // Endpoint to set a user's nickname
    @PutMapping("/set-nickname")
    public ResponseEntity<Map<String, Object>> setNickname(
            @RequestParam UUID userId,
            @Valid @RequestBody Map<String, String> request) {
        String nickname = request.get("nickname");
        log.info("Received request to set nickname for user {}: {}", userId, nickname);
        
        UserResponse response = userService.setUserNickname(userId, nickname);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "user", response
        ));
    }

}