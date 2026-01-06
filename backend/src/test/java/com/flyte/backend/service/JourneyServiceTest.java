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
import org.mockito.ArgumentCaptor;
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
import static org.mockito.ArgumentMatchers.contains;
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

    private final int TOTAL_SLOTS = 24; // Example slot count

    @BeforeEach
    void setUp() {
        // Manually injecting the dependencies including the @Value primitive
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

        // Mocks for finding User
        when(userRepository.findById(userId)).thenReturn(Optional.of(mockUser));

        // Mocks for Room reuse logic (Return empty to trigger new room creation)
        when(journeyRepository.findByFlightNumber(anyString())).thenReturn(Collections.emptyList());
        when(journeyRepository.findBySourceAndSourceSlot(anyString(), anyString())).thenReturn(Collections.emptyList());
        when(journeyRepository.findByDestinationAndDestinationSlot(anyString(), anyString()))
                .thenReturn(Collections.emptyList());

        // Mocks for saving Rooms
        when(roomRepository.save(any(Room.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Mock for duplicate check
        when(journeyRepository.exists(any(Example.class))).thenReturn(false);

        // Mock for saving Journey
        when(journeyRepository.save(any(Journey.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        Journey createdJourney = journeyService.createJourney(request);

        // Assert
        assertNotNull(createdJourney);
        assertEquals("BA123", createdJourney.getFlightNumber());
        assertEquals(mockUser, createdJourney.getUser());

        // Verify Rooms were created and assigned
        assertNotNull(createdJourney.getFlightRoom());
        assertEquals(RoomType.FLIGHT, createdJourney.getFlightRoom().getType());

        assertNotNull(createdJourney.getSourceRoom());
        assertEquals(RoomType.SOURCE, createdJourney.getSourceRoom().getType());

        assertNotNull(createdJourney.getDestinationRoom());
        assertEquals(RoomType.DESTINATION, createdJourney.getDestinationRoom().getType());

        // Verify Repository interactions
        verify(roomRepository, times(3)).save(any(Room.class)); // 1 Flight + 1 Source + 1 Dest
        verify(journeyRepository).save(any(Journey.class));
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

        // Pre-existing rooms
        Room existingFlightRoom = new Room();
        existingFlightRoom.setId(UUID.randomUUID());
        existingFlightRoom.setType(RoomType.FLIGHT);

        Room existingSourceRoom = new Room();
        existingSourceRoom.setId(UUID.randomUUID());
        existingSourceRoom.setType(RoomType.SOURCE);

        Room existingDestRoom = new Room();
        existingDestRoom.setId(UUID.randomUUID());
        existingDestRoom.setType(RoomType.DESTINATION);

        // Mock User
        when(userRepository.findById(userId)).thenReturn(Optional.of(mockUser));

        // Mock finding existing journeys to reuse rooms
        Journey journeyWithFlightRoom = new Journey();
        journeyWithFlightRoom.setFlightRoom(existingFlightRoom);

        Journey journeyWithSourceRoom = new Journey();
        journeyWithSourceRoom.setSourceRoom(existingSourceRoom);

        Journey journeyWithDestRoom = new Journey();
        journeyWithDestRoom.setDestinationRoom(existingDestRoom);

        // Return lists containing the existing journeys
        when(journeyRepository.findByFlightNumber("BA123"))
                .thenReturn(List.of(journeyWithFlightRoom));

        // Use anyString() here because calculating the exact slot string in test setup
        // is brittle
        when(journeyRepository.findBySourceAndSourceSlot(eq("JFK"), anyString()))
                .thenReturn(List.of(journeyWithSourceRoom));

        when(journeyRepository.findByDestinationAndDestinationSlot(eq("LHR"), anyString()))
                .thenReturn(List.of(journeyWithDestRoom));

        // Mock duplicate check
        when(journeyRepository.exists(any(Example.class))).thenReturn(false);
        when(journeyRepository.save(any(Journey.class))).thenAnswer(i -> i.getArgument(0));

        // Act
        Journey result = journeyService.createJourney(request);

        // Assert
        // Should reuse the IDs we set up
        assertEquals(existingFlightRoom.getId(), result.getFlightRoom().getId());
        assertEquals(existingSourceRoom.getId(), result.getSourceRoom().getId());
        assertEquals(existingDestRoom.getId(), result.getDestinationRoom().getId());

        // Verify we NEVER called roomRepository.save() because we reused everything
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