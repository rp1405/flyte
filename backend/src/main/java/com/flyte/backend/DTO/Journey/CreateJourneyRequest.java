package com.flyte.backend.DTO.Journey;

import java.time.Instant;
import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateJourneyRequest {

    @NotNull(message = "User Id is required and cannot be blank")
    private UUID userId;

    @NotBlank(message = "Source location is required and cannot be blank")
    private String source;

    @NotBlank(message = "Destination location is required and cannot be blank")
    private String destination;

    @NotNull(message = "Departure time is required")
    private Instant departureTime;

    @NotNull(message = "Arrival time is required")
    private Instant arrivalTime;

    @NotBlank(message = "Flight number cannot be blank")
    private String flightNumber;
}
