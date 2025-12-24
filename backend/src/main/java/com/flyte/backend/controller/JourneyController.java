package com.flyte.backend.controller;

import org.springframework.web.bind.annotation.RestController;

import com.flyte.backend.DTO.Journey.CreateJourneyRequest;
import com.flyte.backend.model.Journey;
import com.flyte.backend.service.JourneyService;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

import java.security.Principal;
import java.util.UUID;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@RestController
@RequestMapping("/api/journeys")
public class JourneyController {
    private final JourneyService journeyService;

    public JourneyController(JourneyService journeyService) {
        this.journeyService = journeyService;
    }

    @PostMapping("/create")
    public Journey createJourney(@Valid @RequestBody CreateJourneyRequest journeyRequest) {
        
        return journeyService.createJourney(journeyRequest);

    }

    @GetMapping("/getJouney")
    public Journey getJouney(@RequestParam UUID id) {
        return journeyService.getJourneyById(id);
    }

}
