package com.flyte.backend.service;

import com.flyte.backend.DTO.Room.RoomRequest;
import com.flyte.backend.DTO.Room.RoomResponse;
import com.flyte.backend.DTO.Room.RoomWithMessages;
import com.flyte.backend.model.Journey;
import com.flyte.backend.model.Message;
import com.flyte.backend.model.Room;
import com.flyte.backend.model.User;
import com.flyte.backend.repository.RoomParticipantRepository;
import com.flyte.backend.repository.RoomRepository;
import com.flyte.backend.repository.UserRepository;
import com.flyte.backend.DTO.Room.CreateDMRequest;
import com.flyte.backend.enums.ConnectionStatus;
import com.flyte.backend.enums.RoomType;
import com.flyte.backend.model.RoomParticipant;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.time.Instant;

import org.springframework.stereotype.Service;
import jakarta.transaction.Transactional;

@Service
public class RoomService {

    private final RoomRepository roomRepository;
    private final RoomParticipantRepository roomParticipantRepository;
    private final JourneyService journeyService;
    private final MessageService messageService;
    private final UserRepository userRepository;

    public RoomService(RoomRepository roomRepository, RoomParticipantRepository roomParticipantRepository,
            JourneyService journeyService, MessageService messageService, UserRepository userRepository) {
        this.roomRepository = roomRepository;
        this.roomParticipantRepository = roomParticipantRepository;
        this.journeyService = journeyService;
        this.messageService = messageService;
        this.userRepository = userRepository;
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

    public List<User> getParticipantsInRoom(UUID roomId) {
        return roomParticipantRepository.findUsersByRoomId(roomId);
    }

    @Transactional
    public RoomResponse findOrCreateDM(CreateDMRequest request) {
        // 1. Check if DM already exists
        List<Room> existingRooms = roomParticipantRepository.findRoomForUsers(request.getRequesterId(),
                request.getTargetUserId(),
                RoomType.DM);
        Room existingDM = existingRooms.isEmpty() ? null : existingRooms.get(0);
        if (existingDM != null) {
            return new RoomResponse(existingDM);
        }

        // 2. Create new Room
        Room room = new Room();
        room.setName("DM-" + request.getRequesterId() + "-" + request.getTargetUserId()); // Name can be dynamic or
                                                                                          // generic
        room.setType(RoomType.DM);
        Room savedRoom = roomRepository.save(room);

        // 3. Add Requester (SENT) means the requester has sent the chat request
        User requester = userRepository.findById(request.getRequesterId())
                .orElseThrow(() -> new IllegalArgumentException("Requester not found"));
        RoomParticipant requesterParticipant = new RoomParticipant();
        requesterParticipant.setRoom(savedRoom);
        requesterParticipant.setUser(requester);
        requesterParticipant.setStatus(ConnectionStatus.SENT);
        roomParticipantRepository.save(requesterParticipant);

        // 4. Add Target (RECEIVED) means the target has received the chat request
        User target = userRepository.findById(request.getTargetUserId())
                .orElseThrow(() -> new IllegalArgumentException("Target user not found"));
        RoomParticipant targetParticipant = new RoomParticipant();
        targetParticipant.setRoom(savedRoom);
        targetParticipant.setUser(target);
        targetParticipant.setStatus(ConnectionStatus.RECEIVED);
        roomParticipantRepository.save(targetParticipant);

        return new RoomResponse(savedRoom);
    }

    public List<RoomResponse> getReceivedDMs(UUID userId) {
        // Find participants entries where user is RECEIVED (incoming requests)
        List<RoomParticipant> participants = roomParticipantRepository.findByUserIdAndStatus(userId,
                ConnectionStatus.RECEIVED);

        List<RoomResponse> responses = new ArrayList<>();
        for (RoomParticipant p : participants) {
            responses.add(new RoomResponse(p.getRoom()));
        }
        return responses;
    }

    public RoomResponse acceptDM(UUID userId, UUID roomId) {
        RoomParticipant otherParticipant = roomParticipantRepository.findOtherParticipant(roomId, userId, RoomType.DM)
                .orElseThrow(() -> new IllegalArgumentException("Participant not found"));
        RoomParticipant selfParticipant = roomParticipantRepository.findByRoomIdAndUserId(roomId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Participant not found"));

        otherParticipant.setStatus(ConnectionStatus.CONNECTED);
        selfParticipant.setStatus(ConnectionStatus.CONNECTED);

        roomParticipantRepository.save(otherParticipant);
        roomParticipantRepository.save(selfParticipant);
        return new RoomResponse(otherParticipant.getRoom());
    }

    public RoomResponse rejectDM(UUID userId, UUID roomId) {
        RoomParticipant otherParticipant = roomParticipantRepository.findOtherParticipant(roomId, userId, RoomType.DM)
                .orElseThrow(() -> new IllegalArgumentException("Participant not found"));
        RoomParticipant selfParticipant = roomParticipantRepository.findByRoomIdAndUserId(roomId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Participant not found"));

        otherParticipant.setStatus(ConnectionStatus.NOT_CONNECTED);
        selfParticipant.setStatus(ConnectionStatus.NOT_CONNECTED);

        roomParticipantRepository.save(otherParticipant);
        roomParticipantRepository.save(selfParticipant);
        return new RoomResponse(otherParticipant.getRoom());
    }
}
