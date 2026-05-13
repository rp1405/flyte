package com.flyte.backend.controller;

import com.flyte.backend.DTO.User.UserRequest;
import com.flyte.backend.DTO.User.UserResponse;
import com.flyte.backend.service.UserService;

import jakarta.validation.Valid;

import java.util.UUID;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

        UserResponse response = userService.findOrCreateUser(userRequest);
        return ResponseEntity.ok(response);

    }

    @GetMapping("/getUserbyId")
    public ResponseEntity<UserResponse> getUser(@RequestParam UUID id) {
        UserResponse response = userService.getUserById(id);
        if (response != null) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Endpoint to check if a nickname is available
    @PostMapping("/check-nickname")
    public ResponseEntity<Map<String, Boolean>> checkNicknameAvailability(
            @Valid @RequestBody Map<String, String> request) {
        String nickname = request.get("nickname");
        boolean available = userService.isNicknameAvailable(nickname);
        return ResponseEntity.ok(Map.of("available", available));
    }

    // Endpoint to set a user's nickname
    @PutMapping("/set-nickname")
    public ResponseEntity<Map<String, Object>> setNickname(
            @RequestParam UUID userId,
            @Valid @RequestBody Map<String, String> request) {
        String nickname = request.get("nickname");

        try {
            UserResponse response = userService.setUserNickname(userId, nickname);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "user", response
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", e.getMessage()
            ));
        }
    }

}