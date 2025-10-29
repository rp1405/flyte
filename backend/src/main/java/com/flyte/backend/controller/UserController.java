package com.flyte.backend.controller;

import com.flyte.backend.DTO.User.UserRequest;
import com.flyte.backend.DTO.User.UserResponse;
import com.flyte.backend.service.UserService;

import jakarta.validation.Valid;

import java.util.UUID;

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

    // Endpoint to get a user by email
    @GetMapping("/getUserByEmail")
    public ResponseEntity<UserResponse> getUser(@RequestParam String email) {
        UserResponse response = userService.getUserByEmail(email);
        if (response != null) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.notFound().build();
        }
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

}