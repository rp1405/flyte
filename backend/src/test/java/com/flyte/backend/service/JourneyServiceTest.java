package com.flyte.backend.service;

import com.flyte.backend.DTO.Journey.CreateJourneyRequest;
import com.flyte.backend.enums.RoomType;
import com.flyte.backend.model.Journey;
import com.flyte.backend.model.Room;
import com.flyte.backend.model.User;
import com.flyte.backend.repository.JourneyRepository;
import com.flyte.backend.repository.RoomRepository;
import com.flyte.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Example;

import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JourneyServiceTest {

    @Mock
    private JourneyRepository journeyRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoomRepository roomRepository;

    private JourneyService journeyService;

    private final int TOTAL_SLOTS = 24;

    @BeforeEach
    void setUp() {
        journeyService = new JourneyService(journeyRepository, userRepository, roomRepository, TOTAL_SLOTS);
    }

    @Test
    void createJourney_Success_NewRoomsCreated() {
        // Arrange
        UUID userId = UUID.randomUUID();
        User mockUser = new User();
        mockUser.setId(userId);

        CreateJourneyRequest request = new CreateJourneyRequest();
        request.setUserId(userId);
        request.setSource("JFK");
        request.setDestination("LHR");
        request.setFlightNumber("BA123");
        request.setDepartureTime(Instant.now());
        request.setArrivalTime(Instant.now().plusSeconds(3600));

        when(userRepository.findById(userId)).thenReturn(Optional.of(mockUser));

        // --- FIX STARTS HERE ---
        // Match the EXACT method calls from the Service
        when(journeyRepository.findByFlightNumberAndSourceAndSourceSlotAndDestinationAndDestinationSlot(anyString(),
                anyString(), anyString(), anyString(), anyString()))
                .thenReturn(Collections.emptyList());

        when(journeyRepository.findBySourceAndSourceSlot(anyString(), anyString()))
                .thenReturn(Collections.emptyList());

        when(journeyRepository.findByDestinationAndDestinationSlot(anyString(), anyString()))
                .thenReturn(Collections.emptyList());
        // --- FIX ENDS HERE ---

        when(roomRepository.save(any(Room.class))).thenAnswer(i -> i.getArgument(0));
        when(journeyRepository.exists(any(Example.class))).thenReturn(false);
        when(journeyRepository.save(any(Journey.class))).thenAnswer(i -> i.getArgument(0));

        // Act
        Journey createdJourney = journeyService.createJourney(request);

        // Assert
        assertNotNull(createdJourney);
        verify(roomRepository, times(3)).save(any(Room.class));
    }

    @Test
    void createJourney_Success_ExistingRoomsReused() {
        // Arrange
        UUID userId = UUID.randomUUID();
        User mockUser = new User();
        mockUser.setId(userId);

        CreateJourneyRequest request = new CreateJourneyRequest();
        request.setUserId(userId);
        request.setSource("JFK");
        request.setDestination("LHR");
        request.setFlightNumber("BA123");
        request.setDepartureTime(Instant.now());
        request.setArrivalTime(Instant.now().plusSeconds(3600));

        // Existing Rooms
        Room existingFlightRoom = new Room();
        existingFlightRoom.setId(UUID.randomUUID()); // Ensure ID is set
        existingFlightRoom.setType(RoomType.FLIGHT);

        Room existingSourceRoom = new Room();
        existingSourceRoom.setId(UUID.randomUUID());
        existingSourceRoom.setType(RoomType.SOURCE);

        Room existingDestRoom = new Room();
        existingDestRoom.setId(UUID.randomUUID());
        existingDestRoom.setType(RoomType.DESTINATION);

        when(userRepository.findById(userId)).thenReturn(Optional.of(mockUser));

        // Mock Existing Journeys
        Journey jFlight = new Journey();
        jFlight.setFlightRoom(existingFlightRoom);
        Journey jSource = new Journey();
        jSource.setSourceRoom(existingSourceRoom);
        Journey jDest = new Journey();
        jDest.setDestinationRoom(existingDestRoom);

        // --- FIX STARTS HERE ---
        // Mock the logic: If we search for this flight + slots, we find an existing
        // journey
        when(journeyRepository.findByFlightNumberAndSourceAndSourceSlotAndDestinationAndDestinationSlot(
                eq("BA123"), anyString(), anyString(), anyString(), anyString())) // Use arguments from request
                .thenReturn(List.of(jFlight));

        when(journeyRepository.findBySourceAndSourceSlot(eq("JFK"), anyString()))
                .thenReturn(List.of(jSource));

        when(journeyRepository.findByDestinationAndDestinationSlot(eq("LHR"), anyString()))
                .thenReturn(List.of(jDest));
        // --- FIX ENDS HERE ---

        when(journeyRepository.exists(any(Example.class))).thenReturn(false);
        when(journeyRepository.save(any(Journey.class))).thenAnswer(i -> i.getArgument(0));

        // Act
        Journey result = journeyService.createJourney(request);

        // Assert
        assertEquals(existingFlightRoom.getId(), result.getFlightRoom().getId(),
                "Flight Room ID should match existing");
        assertEquals(existingSourceRoom.getId(), result.getSourceRoom().getId(),
                "Source Room ID should match existing");
        assertEquals(existingDestRoom.getId(), result.getDestinationRoom().getId(),
                "Dest Room ID should match existing");

        verify(roomRepository, never()).save(any(Room.class));
    }

    @Test
    void createJourney_UserNotFound_ThrowsException() {
        // Arrange
        UUID userId = UUID.randomUUID();
        CreateJourneyRequest request = new CreateJourneyRequest();
        request.setUserId(userId);

        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            journeyService.createJourney(request);
        });

        assertEquals("User not found: " + userId, exception.getMessage());
        verify(journeyRepository, never()).save(any());
    }

    @Test
    void createJourney_DuplicateJourney_ThrowsException() {
        // Arrange
        UUID userId = UUID.randomUUID();
        User mockUser = new User();
        mockUser.setId(userId);

        CreateJourneyRequest request = new CreateJourneyRequest();
        request.setUserId(userId);
        request.setDepartureTime(Instant.now());
        request.setArrivalTime(Instant.now());

        when(userRepository.findById(userId)).thenReturn(Optional.of(mockUser));

        // Mock that the Example matcher finds a match
        when(journeyRepository.exists(any(Example.class))).thenReturn(true);

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            journeyService.createJourney(request);
        });

        assertEquals("Similar journey already exists.", exception.getMessage());
    }

    @Test
    void getJourneyById_Success() {
        // Arrange
        UUID journeyId = UUID.randomUUID();
        Journey journey = new Journey();
        journey.setId(journeyId);

        when(journeyRepository.findById(journeyId)).thenReturn(Optional.of(journey));

        // Act
        Journey result = journeyService.getJourneyById(journeyId);

        // Assert
        assertEquals(journeyId, result.getId());
    }

    @Test
    void getJourneyById_NotFound_ThrowsException() {
        // Arrange
        UUID journeyId = UUID.randomUUID();
        when(journeyRepository.findById(journeyId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(RuntimeException.class, () -> journeyService.getJourneyById(journeyId));
    }

    @Test
    void getJourneyByUserId_Success() {
        // Arrange
        UUID userId = UUID.randomUUID();
        List<Journey> journeys = List.of(new Journey(), new Journey());

        when(journeyRepository.findByUserId(userId)).thenReturn(journeys);

        // Act
        List<Journey> result = journeyService.getJourneyByUserId(userId);

        // Assert
        assertEquals(2, result.size());
        verify(journeyRepository).findByUserId(userId);
    }
}