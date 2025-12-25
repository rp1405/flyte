package com.flyte.backend.service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Example;
import org.springframework.data.domain.ExampleMatcher;
import org.springframework.stereotype.Service;

import com.flyte.backend.DTO.Journey.CreateJourneyRequest;
import com.flyte.backend.enums.RoomType;
import com.flyte.backend.model.Journey;
import com.flyte.backend.model.Room;
import com.flyte.backend.model.User;
import com.flyte.backend.repository.JourneyRepository;
import com.flyte.backend.repository.RoomRepository;
import com.flyte.backend.repository.UserRepository;
import com.flyte.backend.util.SlotGenerator;
import jakarta.transaction.Transactional;

@Service
public class JourneyService {

        private final JourneyRepository journeyRepository;
        private final UserRepository userRepository;
        private final RoomRepository roomRepository;
        private final int totalSlots;

        public JourneyService(JourneyRepository journeyRepository, UserRepository userRepository,
                        RoomRepository roomRepository,
                        @Value("${app.num_slots}") int totalSlots) {
                this.journeyRepository = journeyRepository;
                this.userRepository = userRepository;
                this.roomRepository = roomRepository;
                this.totalSlots = totalSlots;
        }

        @Transactional
        public Journey createJourney(CreateJourneyRequest journey) {
                // 1. Validate User Existence
                // UUID uuid = UUID.fromString(journey.getUserId);
                User user = userRepository.findById(journey.getUserId())
                                .orElseThrow(() -> new RuntimeException(
                                                "User not found with UserID: " + journey.getUserId()));

                // 2. Create and Populate Journey
                Journey newJourney = new Journey();
                newJourney.setUser(user); // Set the retrieved, validated User object
                newJourney.setSource(journey.getSource());
                newJourney.setDestination(journey.getDestination());
                newJourney.setDepartTime(journey.getDepartureTime());
                newJourney.setArrivalTime(journey.getArrivalTime());
                newJourney.setFlightNumber(journey.getFlightNumber());

                SlotGenerator sourceSlotObj = new SlotGenerator(journey.getDepartureTime(), this.totalSlots);
                SlotGenerator destinationSlotObj = new SlotGenerator(journey.getArrivalTime(), this.totalSlots);
                String sourceSlot = sourceSlotObj.getSlotString();
                String destinationSlot = destinationSlotObj.getSlotString();

                newJourney.setSourceSlot(sourceSlot);
                newJourney.setDestinationSlot(destinationSlot);

                Journey sameFlightJourney = journeyRepository.findByFlightNumber(journey.getFlightNumber()).stream()
                                .findFirst()
                                .orElse(null);
                if (sameFlightJourney != null) {
                        newJourney.setFlightRoom(sameFlightJourney.getFlightRoom());
                } else {
                        Room flightRoom = new Room();
                        flightRoom.setName(
                                        journey.getSource() + "-" + journey.getDestination() + "-"
                                                        + journey.getFlightNumber());
                        flightRoom.setType(RoomType.FLIGHT);
                        Instant expiryTime = destinationSlotObj.getSlotEnd().plusSeconds(24 * 60 * 60); // 2 hours after
                                                                                                        // arrival
                                                                                                        // slot end
                        flightRoom.setExpiryTime(expiryTime);
                        String description = String.format(
                                        "Flight from %s to %s. Departs at %s and arrives at %s. The chat room will expire at %s.",
                                        journey.getSource(), // e.g., "Hyderabad"
                                        journey.getDestination(), // e.g., "Bangalore"
                                        journey.getDepartureTime().toString(), // Formats to "7:30 PM on Sunday, October
                                                                               // 5, 2025"
                                        journey.getArrivalTime().toString()// Formats to "9:00 PM on Sunday, October 5,
                                                                           // 2025"
                                        , expiryTime.toString());
                        flightRoom.setDescription(description);
                        Room savedFlightRoom = roomRepository.save(flightRoom);
                        newJourney.setFlightRoom(savedFlightRoom);
                }
                Journey sameSourceSlotJourney = journeyRepository
                                .findBySourceAndSourceSlot(journey.getSource(), sourceSlot)
                                .stream().findFirst().orElse(null);
                if (sameSourceSlotJourney != null) {
                        newJourney.setSourceRoom(sameSourceSlotJourney.getSourceRoom());
                } else {
                        Room sourceRoom = new Room();
                        sourceRoom.setName(
                                        "Room- " + journey.getSource() + "-" + journey.getFlightNumber());
                        sourceRoom.setType(RoomType.SOURCE);
                        Instant expiryTime = destinationSlotObj.getSlotEnd().plusSeconds(24 * 60 * 60); // 2 hours after
                                                                                                        // arrival
                                                                                                        // slot end
                        sourceRoom.setExpiryTime(expiryTime);
                        String description = String.format(
                                        "Flight from %s to %s. Departs at %s and arrives at %s. The chat room will expire at %s.",
                                        journey.getSource(), // e.g., "Hyderabad"
                                        journey.getDestination(), // e.g., "Bangalore"
                                        journey.getDepartureTime().toString(), // Formats to "7:30 PM on Sunday, October
                                                                               // 5, 2025"
                                        journey.getArrivalTime().toString()// Formats to "9:00 PM on Sunday, October 5,
                                                                           // 2025"
                                        , expiryTime.toString());
                        sourceRoom.setDescription(description);
                        Room savedsourceRoom = roomRepository.save(sourceRoom);
                        newJourney.setSourceRoom(savedsourceRoom);
                }

                Journey sameDestinationSlotJourney = journeyRepository
                                .findBySourceAndSourceSlot(journey.getSource(), sourceSlot)
                                .stream().findFirst().orElse(null);
                if (sameDestinationSlotJourney != null) {
                        newJourney.setDestinationRoom(sameDestinationSlotJourney.getDestinationRoom());
                } else {
                        Room destinationRoom = new Room();
                        destinationRoom.setName(
                                        "Room- " + journey.getDestination() + "-" + journey.getFlightNumber());
                        destinationRoom.setType(RoomType.SOURCE);
                        Instant expiryTime = destinationSlotObj.getSlotEnd().plusSeconds(24 * 60 * 60); // 2 hours after
                                                                                                        // arrival
                                                                                                        // slot end
                        destinationRoom.setExpiryTime(expiryTime);
                        String description = String.format(
                                        "Flight from %s to %s. Departs at %s and arrives at %s. The chat room will expire at %s.",
                                        journey.getSource(), // e.g., "Hyderabad"
                                        journey.getDestination(), // e.g., "Bangalore"
                                        journey.getDepartureTime().toString(), // Formats to "7:30 PM on Sunday, October
                                                                               // 5, 2025"
                                        journey.getArrivalTime().toString()// Formats to "9:00 PM on Sunday, October 5,
                                                                           // 2025"
                                        , expiryTime.toString());
                        destinationRoom.setDescription(description);
                        Room saveddestinationRoom = roomRepository.save(destinationRoom);
                        newJourney.setDestinationRoom(saveddestinationRoom);
                }

                // 3. Save and Return
                ExampleMatcher matcher = ExampleMatcher.matching()
                                .withIgnorePaths("id", "createdAt", "updatedAt");
                Example<Journey> alreadyExistingSimilarJourney = Example.of(newJourney, matcher);
                if (journeyRepository.exists(alreadyExistingSimilarJourney)) {
                        throw new RuntimeException("Similar journey already exists.");
                }
                return journeyRepository.save(newJourney);
        }

        public Journey getJourneyById(UUID journeyId) {
                return journeyRepository.findById(journeyId)
                                .orElseThrow(() -> new RuntimeException("Journey not found with ID: " + journeyId));
        }

        public List<Journey> getJourneyByUserId(UUID userId) {
                return journeyRepository.findByUserId(userId);
        }
}
