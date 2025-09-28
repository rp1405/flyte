package com.flyte.backend.controller;

import com.flyte.backend.model.User;
import com.flyte.backend.service.UserService;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

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
    public User findOrCreateUser(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String name = payload.get("name");
        String profilePictureUrl = payload.get("profilePictureUrl");

        return userService.findOrCreateUser(email, name, profilePictureUrl);
    }
}