package com.flyte.backend.service;

import com.flyte.backend.DTO.Chat.ClientMessage;
import com.flyte.backend.DTO.Chat.ServerMessage;
import com.flyte.backend.DTO.Message.CreateMessageRequest;
import com.flyte.backend.model.Message;
import com.flyte.backend.model.User;
import com.flyte.backend.repository.UserRepository;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class ChatService {

    private final UserRepository userRepository;
    private final MessageService messageService;
    private final SimpMessageSendingOperations messagingTemplate;

    public ChatService(UserRepository userRepository,
            MessageService messageService,
            SimpMessageSendingOperations messagingTemplate) {
        this.userRepository = userRepository;
        this.messageService = messageService;
        this.messagingTemplate = messagingTemplate;
    }

    @Transactional
    public void processAndBroadcastMessage(ClientMessage request, String roomId) {

        User sender = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found: " + request.getUserId()));

        // 2. Prepare the DTO for the MessageService
        CreateMessageRequest message = new CreateMessageRequest();
        message.setUserId(request.getUserId());
        message.setRoomId(UUID.fromString(roomId));
        message.setMessageText(request.getMessageText());
        message.setMessageHTML(request.getMessageHTML());
        message.setMediaType(request.getMediaType());
        message.setMediaLink(request.getMediaLink());

        // 3. Call the "worker" service to save the message
        Message savedMessage = messageService.createMessage(message);

        // 4. Create the broadcast DTO
        // ServerMessage broadcastMsg = new ServerMessage(
        // savedMessage.getId(),
        // sender.getName(),
        // savedMessage.getMessageText(),
        // savedMessage.getMessageHTML(),
        // savedMessage.getMediaType(),
        // savedMessage.getMediaLink()
        // );

        // 5. Broadcast the new message to everyone in the room
        messagingTemplate.convertAndSend("/topic/room/" + roomId, savedMessage);
    }
}