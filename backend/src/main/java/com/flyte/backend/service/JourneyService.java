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

        private static final long EXPIRY_BUFFER_SECONDS = 24 * 60 * 60; // 24 Hours

        public JourneyService(JourneyRepository journeyRepository,
                        UserRepository userRepository,
                        RoomRepository roomRepository,
                        @Value("${app.num_slots}") int totalSlots) {
                this.journeyRepository = journeyRepository;
                this.userRepository = userRepository;
                this.roomRepository = roomRepository;
                this.totalSlots = totalSlots;
        }

        @Transactional
        public Journey createJourney(CreateJourneyRequest request) {
                // 1. Validate User
                User user = userRepository.findById(request.getUserId())
                                .orElseThrow(() -> new RuntimeException("User not found: " + request.getUserId()));

                // 2. Prepare Slots
                SlotGenerator sourceSlotObj = new SlotGenerator(request.getDepartureTime(), this.totalSlots);
                SlotGenerator destinationSlotObj = new SlotGenerator(request.getArrivalTime(), this.totalSlots);

                // 3. Setup Journey Object
                Journey newJourney = new Journey();
                newJourney.setUser(user);
                newJourney.setSource(request.getSource());
                newJourney.setDestination(request.getDestination());
                newJourney.setDepartTime(request.getDepartureTime());
                newJourney.setArrivalTime(request.getArrivalTime());
                newJourney.setFlightNumber(request.getFlightNumber());
                newJourney.setSourceSlot(sourceSlotObj.getSlotString());
                newJourney.setDestinationSlot(destinationSlotObj.getSlotString());

                // 4. Assign Rooms (Fixed Logic)
                assignFlightRoom(newJourney, request, destinationSlotObj);
                assignSourceRoom(newJourney, request, sourceSlotObj, destinationSlotObj);
                assignDestinationRoom(newJourney, request, destinationSlotObj);

                // 5. Check Duplicates & Save
                validateJourneyDoesNotExist(newJourney);
                return journeyRepository.save(newJourney);
        }

        public Journey getJourneyById(UUID journeyId) {
                return journeyRepository.findById(journeyId)
                                .orElseThrow(() -> new RuntimeException("Journey not found: " + journeyId));
        }

        public List<Journey> getJourneyByUserId(UUID userId) {
                return journeyRepository.findByUserId(userId);
        }

        // ===================================================================================
        // HELPER METHODS
        // ===================================================================================

        private void assignFlightRoom(Journey journey, CreateJourneyRequest request, SlotGenerator destSlot) {
                // Flight rooms ARE specific to the flight number.
                Journey existing = journeyRepository.findByFlightNumber(request.getFlightNumber())
                                .stream().findFirst().orElse(null);

                if (existing != null) {
                        journey.setFlightRoom(existing.getFlightRoom());
                } else {
                        String roomName = request.getSource() + "-" + request.getDestination() + "-"
                                        + request.getFlightNumber();
                        String description = String.format("Flight %s from %s to %s.",
                                        request.getFlightNumber(), request.getSource(), request.getDestination());

                        Room newRoom = createRoom(roomName, RoomType.FLIGHT, description, destSlot);
                        journey.setFlightRoom(newRoom);
                }
        }

        private void assignSourceRoom(Journey journey, CreateJourneyRequest request, SlotGenerator sourceSlot,
                        SlotGenerator destSlot) {
                // FIX: Look for any journey in this Source + Slot
                Journey existing = journeyRepository
                                .findBySourceAndSourceSlot(request.getSource(), sourceSlot.getSlotString())
                                .stream().findFirst().orElse(null);

                if (existing != null) {
                        journey.setSourceRoom(existing.getSourceRoom());
                } else {
                        // FIX: Name is now GENERIC (Location + Slot), not Flight specific.
                        String roomName = "Lounge-" + request.getSource() + "-" + sourceSlot.getReadableSlotString();
                        String description = String.format("Travelers departing from %s during slot %s.",
                                        request.getSource(), sourceSlot.getReadableSlotString());

                        Room newRoom = createRoom(roomName, RoomType.SOURCE, description, destSlot);
                        journey.setSourceRoom(newRoom);
                }
        }

        private void assignDestinationRoom(Journey journey, CreateJourneyRequest request, SlotGenerator destSlot) {
                // FIX: Look for any journey in this Destination + Slot
                Journey existing = journeyRepository
                                .findByDestinationAndDestinationSlot(request.getDestination(), destSlot.getSlotString())
                                .stream().findFirst().orElse(null);

                if (existing != null) {
                        journey.setDestinationRoom(existing.getDestinationRoom());
                } else {
                        // FIX: Name is now GENERIC (Location + Slot)
                        String roomName = "Lounge-" + request.getDestination() + "-" + destSlot.getReadableSlotString();
                        String description = String.format("Travelers arriving at %s during slot %s.",
                                        request.getDestination(), destSlot.getReadableSlotString());

                        Room newRoom = createRoom(roomName, RoomType.DESTINATION, description, destSlot);
                        journey.setDestinationRoom(newRoom);
                }
        }

        // Unified Room Creator
        private Room createRoom(String name, RoomType type, String description, SlotGenerator expiryReferenceSlot) {
                Room room = new Room();
                room.setName(name);
                room.setType(type);

                // Expiry is always based on the Destination time (arrival) + buffer
                Instant expiryTime = expiryReferenceSlot.getSlotEnd().plusSeconds(EXPIRY_BUFFER_SECONDS);
                room.setExpiryTime(expiryTime);
                room.setDescription(description + " Room expires at " + expiryTime.toString());

                return roomRepository.save(room);
        }

        private void validateJourneyDoesNotExist(Journey journey) {
                ExampleMatcher matcher = ExampleMatcher.matching()
                                .withIgnorePaths("id", "createdAt", "updatedAt");
                Example<Journey> example = Example.of(journey, matcher);

                if (journeyRepository.exists(example)) {
                        throw new RuntimeException("Similar journey already exists.");
                }
        }
}