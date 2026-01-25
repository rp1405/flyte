package com.flyte.backend.service;

import java.util.List;
import java.util.UUID;

import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import com.flyte.backend.model.Message;
import com.flyte.backend.model.User;
import com.flyte.backend.repository.RoomParticipantRepository;

@Service
public class NotificationService {

    private final SimpMessageSendingOperations messagingTemplate;
    private final RoomParticipantRepository roomParticipantRepository;

    public NotificationService(SimpMessageSendingOperations messagingTemplate,
            RoomParticipantRepository roomParticipantRepository) {
        this.messagingTemplate = messagingTemplate;
        this.roomParticipantRepository = roomParticipantRepository;
    }

    @Async // This now works because it's in a separate bean!
    public void notifyRoomParticipants(UUID roomId, Message message) {
        List<User> usersInRoom = roomParticipantRepository.findUsersByRoomId(roomId);

        usersInRoom.stream()
                .filter(user -> !user.getId().equals(message.getUser().getId())) // Don't notify sender
                .forEach(user -> {
                    // Send to specific user topic (e.g., for push notifs/unread badges)
                    messagingTemplate.convertAndSend("/topic/user/" + user.getId(), message);
                });
    }
}