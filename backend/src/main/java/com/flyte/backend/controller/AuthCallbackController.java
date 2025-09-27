package com.flyte.backend.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
public class AuthCallbackController {

    @GetMapping("/authCallback/success")
    public void authCallbackSuccess(@AuthenticationPrincipal OidcUser principal) {
        String email = principal.getEmail();
        String userName = principal.getFullName();
        
        System.out.println("User: " + userName + " has succesfully logined with email: " +  email );
    }

    @GetMapping("/authCallback/failure")
    public void authCallbackFailure() {
       
        System.out.println("Please try again");
    }

  

}
