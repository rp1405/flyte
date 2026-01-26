package com.flyte.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import com.flyte.backend.service.MessageService;
import com.flyte.backend.model.Message;
import com.flyte.backend.DTO.Message.CreateMessageRequest;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    private final MessageService messageService;

    public MessageController(MessageService messageService) {
        this.messageService = messageService;
    }

    @PostMapping("/create")
    public ResponseEntity<Message> createMessage(@Valid @RequestBody CreateMessageRequest request) {
        Message message = messageService.createMessage(request);
        return ResponseEntity.ok(message);
    }

    @GetMapping("/room/{roomId}")
    public ResponseEntity<List<Message>> getMessagesByRoom(@PathVariable UUID roomId) {
        List<Message> messages = messageService.getMessagesByRoom(roomId);
        return ResponseEntity.ok(messages);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Message>> getMessagesByUser(@PathVariable UUID userId) {
        List<Message> messages = messageService.getMessagesByUser(userId);
        return ResponseEntity.ok(messages);
    }

    @GetMapping("/room/{roomId}/count")
    public ResponseEntity<Long> getMessageCount(@PathVariable UUID roomId) {
        Long count = messageService.getMessageCount(roomId);
        return ResponseEntity.ok(count);
    }
}
