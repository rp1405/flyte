package com.flyte.backend.controller;

import com.flyte.backend.DTO.Room.RoomRequest;
import com.flyte.backend.DTO.Room.RoomResponse;
import com.flyte.backend.DTO.Room.RoomWithMessages;
import com.flyte.backend.service.RoomService;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@RestController
@RequestMapping("/api/rooms")
public class RoomController {

    private final RoomService roomService;

    public RoomController(RoomService roomService) {
        this.roomService = roomService;
    }

    @PostMapping("/create")
    public ResponseEntity<RoomResponse> createRoom(@Valid @RequestBody RoomRequest roomRequest) {
        RoomResponse response = roomService.createRoom(roomRequest);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/getRoomById")
    public ResponseEntity<RoomResponse> getRoom(@RequestParam UUID id) {
        RoomResponse response = roomService.getRoomById(id);
        if (response != null) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/getRoomsAndMessagesByUserId")
    public ResponseEntity<List<RoomWithMessages>> getRoomsAndMessagesByUserId(@RequestParam UUID userId) {
        List<RoomWithMessages> response = roomService.getRoomsAndMessagesByUserId(userId);
        return ResponseEntity.ok(response);
    }

}
