package com.flyte.backend.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.flyte.backend.DTO.Config.*;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/config")
public class ConfigController {

    private final ObjectMapper objectMapper;

    public ConfigController(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @GetMapping("/airports")
    public ResponseEntity<List<Airport>> getAirports() {
        try {
            // Read the JSON file from src/main/resources
            ClassPathResource resource = new ClassPathResource("airports.json");
            
            // Convert JSON file directly into a List of Airport objects
            List<Airport> airports = objectMapper.readValue(
                resource.getInputStream(), 
                new TypeReference<List<Airport>>() {}
            );

            return ResponseEntity.ok(airports);
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}