package com.flyte.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.flyte.backend.DTO.User.UserRequest;
import com.flyte.backend.DTO.User.UserResponse;
import com.flyte.backend.service.UserService;


@RestController
public class AuthCallbackController {

    private final UserService userService;

    public AuthCallbackController(UserService userService) {
        this.userService = userService;
    }


    @GetMapping("/authCallback/success")
    public ResponseEntity<UserResponse> authCallbackSuccess(@AuthenticationPrincipal OidcUser principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }

        String email = principal.getEmail();
        String userName = principal.getFullName();

        UserRequest userRequest = new UserRequest();
        userRequest.setName(userName);
        userRequest.setEmail(email);
        
        System.out.println("User: " + userName + " has succesfully logined with email: " +  email );

        UserResponse response = userService.findOrCreateUser(userRequest);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/authCallback/failure")
    public ResponseEntity<String> authCallbackFailure() {
        return ResponseEntity.status(401).body("Authentication failed");
    }

  

}
