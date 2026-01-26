package com.flyte.backend.service;

import com.flyte.backend.DTO.Room.RoomRequest;
import com.flyte.backend.DTO.Room.RoomResponse;
import com.flyte.backend.DTO.Room.RoomWithMessages;
import com.flyte.backend.model.Journey;
import com.flyte.backend.model.Message;
import com.flyte.backend.model.Room;
import com.flyte.backend.repository.RoomRepository;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.time.Instant;

import org.springframework.stereotype.Service;
import jakarta.transaction.Transactional;

@Service
public class RoomService {

    private final RoomRepository roomRepository;
    private final JourneyService journeyService;
    private final MessageService messageService;

    public RoomService(RoomRepository roomRepository, JourneyService journeyService, MessageService messageService) {
        this.roomRepository = roomRepository;
        this.journeyService = journeyService;
        this.messageService = messageService;
    }

    @Transactional
    public RoomResponse createRoom(RoomRequest roomRequest) {
        Room newRoom = new Room();
        newRoom.setName(roomRequest.getName());
        newRoom.setDescription(roomRequest.getDescription());
        newRoom.setType(roomRequest.getType());
        Room savedRoom = roomRepository.save(newRoom);
        return new RoomResponse(savedRoom);
    }

    public RoomResponse getRoomById(UUID id) {
        return roomRepository.findById(id)
                .map(RoomResponse::new)
                .orElse(null);
    }

    public List<RoomWithMessages> getRoomsAndMessagesByUserId(UUID userId) {
        List<Journey> journeysByUser = journeyService.getJourneyByUserId(userId);

        // 1. Collect Unique Rooms using a Map (Key: ID, Value: Room Object)
        // Using a Map ensures that if we see the same Room ID twice, we overwrite it,
        // preventing duplicates.
        Map<UUID, Room> uniqueRoomsMap = new HashMap<>();

        for (Journey journey : journeysByUser) {
            List<Room> currentRooms = Arrays.asList(
                    journey.getSourceRoom(),
                    journey.getDestinationRoom(),
                    journey.getFlightRoom());

            for (Room room : currentRooms) {
                if (room != null) {
                    // Check expiry logic immediately
                    if (room.getExpiryTime() != null && Instant.now().isAfter(room.getExpiryTime())) {
                        continue;
                    }
                    // Put into map: This acts as the deduplication filter
                    uniqueRoomsMap.put(room.getId(), room);
                }
            }
        }

        // 2. Fetch all messages at once using the unique IDs
        Map<UUID, List<Message>> allMessagesMap = messageService
                .getMessagesByRoomIds(new ArrayList<>(uniqueRoomsMap.keySet()));

        // 3. Build the final response list iterating over the UNIQUE rooms only
        List<RoomWithMessages> roomsAndMessages = new ArrayList<>();

        for (Room room : uniqueRoomsMap.values()) {
            RoomWithMessages item = new RoomWithMessages();
            item.setRoom(room);
            // Safely get messages or empty list
            item.setMessages(allMessagesMap.getOrDefault(room.getId(), new ArrayList<>()));
            roomsAndMessages.add(item);
        }

        return roomsAndMessages;
    }
}
