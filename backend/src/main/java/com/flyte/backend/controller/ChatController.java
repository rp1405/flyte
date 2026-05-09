package com.flyte.backend.controller;

import com.flyte.backend.DTO.Chat.ClientMessage;
import com.flyte.backend.service.ChatService;

import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import jakarta.validation.Valid;

@RestController
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

    // Added REST endpoint so you can test real-time broadcasting via Swagger
    @PostMapping("/api/chat/send/{roomId}")
    public ResponseEntity<String> testRealtimeMessageViaRest(@PathVariable String roomId,
            @RequestBody @Valid ClientMessage request) {

        chatService.processAndBroadcastMessage(request, roomId);
        return ResponseEntity.ok("Message processed and broadcasted via WebSockets successfully!");
    }
}