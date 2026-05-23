package com.flyte.backend.controller;

import org.springframework.web.bind.annotation.RestController;

import com.flyte.backend.DTO.Journey.CreateJourneyRequest;
import com.flyte.backend.model.Journey;
import com.flyte.backend.service.JourneyService;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.List;
import java.util.UUID;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Slf4j
@RestController
@RequestMapping("/api/journeys")
public class JourneyController {
    private final JourneyService journeyService;

    public JourneyController(JourneyService journeyService) {
        this.journeyService = journeyService;
    }

    @PostMapping("/create")
    public Journey createJourney(@Valid @RequestBody CreateJourneyRequest journeyRequest) {
        log.info("Received request to create journey with request: {}", journeyRequest);
        return journeyService.createJourney(journeyRequest);
    }

    @GetMapping("/getJouney")
    public Journey getJouney(@RequestParam UUID id) {
        return journeyService.getJourneyById(id);
    }

    @GetMapping("/getJourney/user")
    public List<Journey> getJourneyByUserId(@RequestParam UUID id){
        return journeyService.getJourneyByUserId(id);
    }
}
