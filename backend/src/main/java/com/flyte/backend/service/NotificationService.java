package com.flyte.backend.service;

import com.flyte.backend.globalWebsocketHandler.dto.GlobalWebSocketEnvelope;
import com.flyte.backend.globalWebsocketHandler.enums.GlobalMessageType;
import com.flyte.backend.model.Message;
import com.flyte.backend.model.User;
import com.flyte.backend.repository.RoomParticipantRepository;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class NotificationService {

    private final SimpMessageSendingOperations messagingTemplate;
    private final RoomParticipantRepository roomParticipantRepository;

    public NotificationService(SimpMessageSendingOperations messagingTemplate,
            RoomParticipantRepository roomParticipantRepository) {
        this.messagingTemplate = messagingTemplate;
        this.roomParticipantRepository = roomParticipantRepository;
    }

    @Async
    public void notifyRoomParticipants(UUID roomId, Message message) {
        List<User> usersInRoom = roomParticipantRepository.findUsersByRoomId(roomId);

        // 1. Create the Standard Envelope
        // We wrap the specific 'Message' object inside our generic Global Envelope
        GlobalWebSocketEnvelope envelope = new GlobalWebSocketEnvelope(
                GlobalMessageType.CHAT_NOTIFICATION,
                message // This becomes the "payload"
        );

        usersInRoom.stream()
                .filter(user -> !user.getId().equals(message.getUser().getId()))
                .forEach(user -> {
                    // 2. Send the Envelope!
                    // The frontend receives: { "type": "CHAT_NOTIFICATION", "payload": { "id":
                    // "...", "text": "..." } }
                    messagingTemplate.convertAndSend("/topic/user/" + user.getId(), envelope);
                });
    }
}