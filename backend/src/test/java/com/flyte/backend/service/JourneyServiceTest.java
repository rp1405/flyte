package com.flyte.backend.service;

import com.flyte.backend.DTO.Journey.CreateJourneyRequest;
import com.flyte.backend.model.Journey;
import com.flyte.backend.model.Room;
import com.flyte.backend.model.RoomParticipant;
import com.flyte.backend.model.User;
import com.flyte.backend.repository.JourneyRepository;
import com.flyte.backend.repository.RoomParticipantRepository;
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
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JourneyServiceTest {

    @Mock
    private JourneyRepository journeyRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private RoomRepository roomRepository;
    @Mock
    private RoomParticipantRepository roomParticipantRepository; // Added this

    private JourneyService journeyService;

    @BeforeEach
    void setUp() {
        // Updated constructor with new repo
        journeyService = new JourneyService(journeyRepository, userRepository, roomRepository,
                roomParticipantRepository, 24);
    }

    @Test
    void createJourney_Success_CreatesRoomsAndAddsParticipant() {
        // 1. Arrange
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

        // Mock finding NO existing rooms (force creation)
        when(journeyRepository.findByFlightNumberAndSourceAndSourceSlotAndDestinationAndDestinationSlot(anyString(),
                anyString(), anyString(), anyString(), anyString()))
                .thenReturn(Collections.emptyList());
        when(journeyRepository.findBySourceAndSourceSlot(anyString(), anyString())).thenReturn(Collections.emptyList());
        when(journeyRepository.findByDestinationAndDestinationSlot(anyString(), anyString()))
                .thenReturn(Collections.emptyList());

        // Mock Saves
        when(roomRepository.save(any(Room.class))).thenAnswer(i -> i.getArgument(0)); // Return what is passed
        when(journeyRepository.save(any(Journey.class))).thenAnswer(i -> {
            Journey j = i.getArgument(0);
            // Simulate DB assigning ID
            j.setId(UUID.randomUUID());
            return j;
        });

        // 2. Act
        Journey result = journeyService.createJourney(request);

        // 3. Assert
        assertNotNull(result);

        // Verify 3 Rooms Created
        verify(roomRepository, times(3)).save(any(Room.class));

        // Verify User Added to 3 Rooms (CRITICAL CHECK)
        verify(roomParticipantRepository, times(3)).save(any(RoomParticipant.class));
    }

    @Test
    void createJourney_Success_ReusesRoomsAndAddsParticipant() {
        // 1. Arrange
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

        // Mock Existing Data
        Room existingRoom = new Room();
        existingRoom.setId(UUID.randomUUID());
        Journey existingJourney = new Journey();
        existingJourney.setFlightRoom(existingRoom);
        existingJourney.setSourceRoom(existingRoom);
        existingJourney.setDestinationRoom(existingRoom);

        when(userRepository.findById(userId)).thenReturn(Optional.of(mockUser));

        // Return existing journeys for all room searches
        when(journeyRepository.findByFlightNumberAndSourceAndSourceSlotAndDestinationAndDestinationSlot(anyString(),
                anyString(), anyString(), anyString(), anyString()))
                .thenReturn(List.of(existingJourney));
        when(journeyRepository.findBySourceAndSourceSlot(anyString(), anyString()))
                .thenReturn(List.of(existingJourney));
        when(journeyRepository.findByDestinationAndDestinationSlot(anyString(), anyString()))
                .thenReturn(List.of(existingJourney));

        when(journeyRepository.save(any(Journey.class))).thenAnswer(i -> i.getArgument(0));

        // 2. Act
        Journey result = journeyService.createJourney(request);

        // 3. Assert
        // Verify NO new rooms created
        verify(roomRepository, never()).save(any(Room.class));

        // Verify User STILL Added to the 3 EXISTING Rooms
        verify(roomParticipantRepository, times(3)).save(any(RoomParticipant.class));
    }

    @Test
    void createJourney_Fails_WhenUserNotFound() {
        CreateJourneyRequest request = new CreateJourneyRequest();
        request.setUserId(UUID.randomUUID());

        when(userRepository.findById(any())).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> journeyService.createJourney(request));
        verifyNoInteractions(roomRepository, roomParticipantRepository);
    }

    @Test
    void createJourney_Fails_WhenDuplicateJourney() {
        UUID userId = UUID.randomUUID();
        User mockUser = new User();
        mockUser.setId(userId);

        CreateJourneyRequest request = new CreateJourneyRequest();
        request.setUserId(userId);
        request.setDepartureTime(Instant.now());
        request.setArrivalTime(Instant.now());

        when(userRepository.findById(userId)).thenReturn(Optional.of(mockUser));
        when(journeyRepository.exists(any(Example.class))).thenReturn(true); // Duplicate found!

        assertThrows(RuntimeException.class, () -> journeyService.createJourney(request));
        verify(journeyRepository, never()).save(any());
    }
}