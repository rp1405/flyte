package com.flyte.backend.controller;

import com.flyte.backend.DTO.Chat.ClientMessage;
import com.flyte.backend.service.ChatService;

import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.util.Map;
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
                                      @Payload @Valid ClientMessage request,
                                      Principal principal) {

        String email = principal.getName();
        chatService.processAndBroadcastMessage(request, roomId, email);
    }
}