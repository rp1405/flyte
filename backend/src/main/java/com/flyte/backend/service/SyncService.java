package com.flyte.backend.service;

import com.flyte.backend.DTO.Room.RoomResponse;
import com.flyte.backend.DTO.Room.RoomWithMessages;
import com.flyte.backend.DTO.User.UserResponse;
import com.flyte.backend.enums.ConnectionStatus;
import com.flyte.backend.enums.RoomType;
import com.flyte.backend.model.*;
import com.flyte.backend.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class SyncService {

    private final SyncTimeRepository syncTimeRepository;
    private final RoomParticipantRepository roomParticipantRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;

    public SyncService(SyncTimeRepository syncTimeRepository,
            RoomParticipantRepository roomParticipantRepository,
            MessageRepository messageRepository,
            UserRepository userRepository) {
        this.syncTimeRepository = syncTimeRepository;
        this.roomParticipantRepository = roomParticipantRepository;
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public List<RoomWithMessages> getSyncData(UUID userId) {
        Instant now = Instant.now();

        // 1. Get last sync time for user
        SyncTime syncTimeObj = syncTimeRepository.findByUserId(userId)
                .orElseGet(() -> {
                    SyncTime st = new SyncTime();
                    st.setUser(userRepository.findById(userId)
                            .orElseThrow(() -> new IllegalArgumentException("User not found")));
                    // Default to epoch if first time syncing to get all history
                    st.setSyncTime(Instant.EPOCH);
                    return st;
                });

        Instant since = syncTimeObj.getSyncTime();
        boolean isFirstSync = since.equals(Instant.EPOCH);

        // 2. Get all active rooms for user
        List<Room> userRooms = roomParticipantRepository.findRoomsByUserIdAndStatusExcept(userId,
                ConnectionStatus.NOT_CONNECTED);

        // Filter out expired rooms (unless it's the first sync and they are still
        // valid)
        List<Room> activeRooms = userRooms.stream()
                .filter(room -> room.getExpiryTime() == null || now.isBefore(room.getExpiryTime()))
                .collect(Collectors.toList());

        List<UUID> roomIds = activeRooms.stream().map(Room::getId).toList();

        // 3. Get new messages since last sync for those rooms
        Map<UUID, List<Message>> messagesByRoom = new HashMap<>();
        if (!roomIds.isEmpty()) {
            List<Message> newMessages = messageRepository
                    .findByRoom_IdInAndCreatedAtGreaterThanOrderByCreatedAtDesc(roomIds, since);
            messagesByRoom = newMessages.stream().collect(Collectors.groupingBy(m -> m.getRoom().getId()));
        }

        // 4. Build response: Rooms created after 'since' OR rooms with new messages
        List<RoomWithMessages> response = new ArrayList<>();
        for (Room room : activeRooms) {
            boolean isNewRoom = isFirstSync || room.getCreatedAt().isAfter(since);
            List<Message> roomMessages = messagesByRoom.getOrDefault(room.getId(), new ArrayList<>());

            if (isNewRoom || !roomMessages.isEmpty()) {
                RoomWithMessages item = new RoomWithMessages();
                RoomResponse roomResponse = new RoomResponse(room);

                // Handle DM naming (show other participant's name)
                if (room.getType() == RoomType.DM) {
                    roomParticipantRepository.findOtherParticipant(room.getId(), userId, RoomType.DM)
                            .ifPresent(otherParticipant -> {
                                roomResponse.setName(otherParticipant.getUser().getName());
                                roomResponse.setOtherUser(new UserResponse(otherParticipant.getUser()));
                            });
                }

                item.setRoom(roomResponse);
                item.setMessages(roomMessages);
                response.add(item);
            }
        }

        // 5. Update sync time
        syncTimeObj.setSyncTime(now);
        syncTimeRepository.save(syncTimeObj);

        return response;
    }

    @Transactional
    public void resetSyncTime(UUID userId) {
        SyncTime syncTimeObj = syncTimeRepository.findByUserId(userId)
                .orElseGet(() -> {
                    SyncTime st = new SyncTime();
                    st.setUser(userRepository.findById(userId)
                            .orElseThrow(() -> new IllegalArgumentException("User not found")));
                    return st;
                });
        syncTimeObj.setSyncTime(Instant.EPOCH);
        syncTimeRepository.save(syncTimeObj);
    }
}