package com.flyte.backend.DTO.Journey;

import java.time.Instant;
import java.util.UUID;

import lombok.Data;

@Data
public class CreateJourneyRequest {
    private UUID userId;
    private String source;
    private String destination;
    private Instant departureTime;
    private Instant arrivalTime;
    private String flightNumber;
}
