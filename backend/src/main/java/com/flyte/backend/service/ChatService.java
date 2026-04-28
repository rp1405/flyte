package com.flyte.backend.service;

import com.flyte.backend.DTO.Chat.ClientMessage;
import com.flyte.backend.DTO.Message.CreateMessageRequest;
import com.flyte.backend.model.Message;
import com.flyte.backend.repository.RoomParticipantRepository;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class ChatService {

    private final MessageService messageService;
    private final SimpMessageSendingOperations messagingTemplate;
    private final RoomParticipantRepository roomParticipantRepository;
    private final NotificationService notificationService; // Inject the new service

    public ChatService(MessageService messageService,
            SimpMessageSendingOperations messagingTemplate,
            RoomParticipantRepository roomParticipantRepository,
            NotificationService notificationService) {
        this.messageService = messageService;
        this.messagingTemplate = messagingTemplate;
        this.roomParticipantRepository = roomParticipantRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public void processAndBroadcastMessage(ClientMessage request, String roomId) {
        UUID roomUuid = UUID.fromString(roomId);

        // 1. SECURITY: Check if user is actually in the room
        if (!roomParticipantRepository.existsByRoomIdAndUserId(roomUuid, request.getUserId())) {
            throw new AccessDeniedException("User is not a participant of this room");
        }

        // 2. Save Message
        CreateMessageRequest messageReq = new CreateMessageRequest();
        messageReq.setUserId(request.getUserId());
        messageReq.setRoomId(roomUuid);
        messageReq.setMessageText(request.getMessageText());
        messageReq.setMessageHTML(request.getMessageHTML());
        messageReq.setMediaType(request.getMediaType());
        messageReq.setMediaLink(request.getMediaLink());

        Message savedMessage = messageService.createMessage(messageReq);

        // 3. REAL-TIME: Broadcast to the open chat window (Fast)
        messagingTemplate.convertAndSend("/topic/room/" + roomId, savedMessage);

        // 4. NOTIFICATION: Send background alerts (Async via separate service)
        notificationService.notifyRoomParticipants(roomUuid, savedMessage);
    }
}