package com.flyte.backend.repository;

import com.flyte.backend.model.Journey;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface JourneyRepository extends JpaRepository<Journey, UUID> {

    /**
     * Finds all journeys matching a specific flight number.
     * 
     * @param flightNumber The flight number to search for (e.g., "6E 2431").
     * @return A list of journeys with that flight number.
     */
    List<Journey> findByFlightNumber(String flightNumber);

    /**
     * Finds all journeys from a specific source location that also match a source
     * time slot.
     * 
     * @param source     The source location (e.g., "HYD").
     * @param sourceSlot The specific time slot at the source.
     * @return A list of matching journeys.
     */
    List<Journey> findBySourceAndSourceSlot(String source, String sourceSlot);

    /**
     * Finds all journeys to a specific destination that also match a destination
     * time slot.
     * 
     * @param destination     The destination location (e.g., "BLR").
     * @param destinationSlot The specific time slot at the destination.
     * @return A list of matching journeys.
     */
    List<Journey> findByDestinationAndDestinationSlot(String destination, String destinationSlot);

    List<Journey> findByFlightNumberAndSourceSlotAndDestinationSlot(String flightNumber, String sourceSlot,
            String destinationSlot);

    List<Journey> findByUserId(UUID userId);
}