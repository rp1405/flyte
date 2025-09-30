package com.flyte.backend.controller;

import com.flyte.backend.DTO.User.UserRequest;
import com.flyte.backend.DTO.User.UserResponse;
import com.flyte.backend.service.UserService;

import jakarta.validation.Valid;

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
    @PostMapping("/create")
    public ResponseEntity<UserResponse> findOrCreateUser(@Valid @RequestBody UserRequest userRequest) {

        UserResponse response = userService.createUser(userRequest);
        return ResponseEntity.ok(response);

    }

    // Endpoint to get a user by email
    @GetMapping("/getUser")
    public ResponseEntity<UserResponse> getUser(@RequestParam String email) {
        UserResponse response = userService.getUserByEmail(email);
        if (response != null) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

}