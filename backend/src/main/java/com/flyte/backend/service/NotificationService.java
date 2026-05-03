package com.flyte.backend.service;

import com.flyte.backend.globalWebsocketHandler.dto.GlobalWebSocketEnvelope;
import com.flyte.backend.globalWebsocketHandler.enums.GlobalMessageType;
import com.flyte.backend.model.Message;
import com.flyte.backend.model.User;
import com.flyte.backend.repository.RoomParticipantRepository;
import com.flyte.backend.repository.UserDeviceTokenRepository;
import com.flyte.backend.model.UserDeviceToken;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class NotificationService {

    private final SimpMessageSendingOperations messagingTemplate;
    private final RoomParticipantRepository roomParticipantRepository;
    private final FcmService fcmService;
    private final UserDeviceTokenRepository userDeviceTokenRepository;

    public NotificationService(SimpMessageSendingOperations messagingTemplate,
            RoomParticipantRepository roomParticipantRepository,
            FcmService fcmService,
            UserDeviceTokenRepository userDeviceTokenRepository) {
        this.messagingTemplate = messagingTemplate;
        this.roomParticipantRepository = roomParticipantRepository;
        this.fcmService = fcmService;
        this.userDeviceTokenRepository = userDeviceTokenRepository;
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

                    // 3. Send Push Notification
                    List<UserDeviceToken> tokens = userDeviceTokenRepository.findByUserId(user.getId());
                    
                    com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                    String messageJson = "{}";
                    try {
                        messageJson = mapper.writeValueAsString(message);
                    } catch (Exception e) {
                        e.printStackTrace();
                    }

                    for (UserDeviceToken token : tokens) {
                        fcmService.sendPushNotification(
                            token.getFcmToken(),
                            message.getUser().getName(),
                            messageJson
                        );
                    }
                });
    }
}