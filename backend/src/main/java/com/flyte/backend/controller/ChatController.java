package com.flyte.backend.controller;

import com.flyte.backend.DTO.Chat.ClientMessage;
import com.flyte.backend.service.ChatService;

import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;

import java.util.UUID;

import jakarta.validation.Valid;

// Note: @Controller, NOT @RestController
@Controller
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @MessageMapping("/chat.send/{roomId}") 
    public void handleRealtimeMessage(@DestinationVariable String roomId,
                                      @Payload @Valid ClientMessage request) {

        chatService.processAndBroadcastMessage(request, roomId);
    }
}