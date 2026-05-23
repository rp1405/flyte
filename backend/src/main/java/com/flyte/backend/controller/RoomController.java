package com.flyte.backend.controller;

import com.flyte.backend.DTO.Room.RoomRequest;
import com.flyte.backend.DTO.Room.RoomResponse;
import com.flyte.backend.DTO.Room.RoomWithMessages;
import com.flyte.backend.model.User;
import com.flyte.backend.service.RoomService;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import lombok.extern.slf4j.Slf4j;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Slf4j
@RestController
@RequestMapping("/api/rooms")
public class RoomController {

    private final RoomService roomService;

    public RoomController(RoomService roomService) {
        this.roomService = roomService;
    }

    @PostMapping("/create")
    public ResponseEntity<RoomResponse> createRoom(@Valid @RequestBody RoomRequest roomRequest) {
        log.info("Received request to create room: {}", roomRequest.getName());
        RoomResponse response = roomService.createRoom(roomRequest);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/getRoomById")
    public ResponseEntity<RoomResponse> getRoom(@RequestParam UUID id) {
        log.info("Received request to get room with ID: {}", id);
        RoomResponse response = roomService.getRoomById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/getRoomsAndMessagesByUserId")
    public ResponseEntity<List<RoomWithMessages>> getRoomsAndMessagesByUserId(@RequestParam UUID userId) {
        log.info("Fetching rooms and messages for user ID: {}", userId);
        List<RoomWithMessages> response = roomService.getRoomsAndMessagesByUserId(userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/getParticipantsInRoom")
    public ResponseEntity<List<User>> getParticipantsInRoom(@RequestParam UUID roomId) {
        log.info("Fetching participants for room ID: {}", roomId);
        List<User> participants = roomService.getParticipantsInRoom(roomId);
        return ResponseEntity.ok(participants);
    }

    @DeleteMapping("/delete/{roomId}/{userId}")
    public ResponseEntity<Void> deleteRoom(@PathVariable UUID roomId, @PathVariable UUID userId) {
        log.info("Received request from user ID {} to delete room ID {}", userId, roomId);
        roomService.deleteRoom(roomId, userId);
        return ResponseEntity.ok().build();
    }

}
