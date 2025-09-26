package com.flyte.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class Hello {

    @GetMapping("/hello") // Or just @GetMapping("/")
    public String hello() {
        return "Hello, World!";
    }
}