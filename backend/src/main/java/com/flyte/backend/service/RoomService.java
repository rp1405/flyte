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
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

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

        // 1. Collect IDs using a simple loop
        Set<UUID> allRoomIds = new HashSet<>();
        for (Journey journey : journeysByUser) {
            if (journey.getSourceRoom() != null)
                allRoomIds.add(journey.getSourceRoom().getId());
            if (journey.getDestinationRoom() != null)
                allRoomIds.add(journey.getDestinationRoom().getId());
            if (journey.getFlightRoom() != null)
                allRoomIds.add(journey.getFlightRoom().getId());
        }

        // 2. Fetch all messages at once
        Map<UUID, List<Message>> allMessagesMap = messageService.getMessagesByRoomIds(new ArrayList<>(allRoomIds));

        // 3. Map them back to the result list
        List<RoomWithMessages> roomsAndMessages = new ArrayList<>();

        for (Journey journey : journeysByUser) {
            // Helper list for this specific journey
            List<Room> currentRooms = Arrays.asList(journey.getSourceRoom(), journey.getDestinationRoom(),
                    journey.getFlightRoom());

            for (Room room : currentRooms) {
                if (room != null) {
                    RoomWithMessages item = new RoomWithMessages();
                    item.setRoom(room);
                    item.setMessages(allMessagesMap.getOrDefault(room.getId(), new ArrayList<>()));
                    roomsAndMessages.add(item);
                }
            }
        }
        return roomsAndMessages;
    }
}
