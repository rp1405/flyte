package com.flyte.backend.controller;

import com.flyte.backend.DTO.Room.RoomRequest;
import com.flyte.backend.DTO.Room.RoomResponse;
import com.flyte.backend.service.RoomService;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

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

    @GetMapping("/getRoom")
    public ResponseEntity<RoomResponse> getRoom(@RequestParam UUID id) {
        RoomResponse response = roomService.getRoomById(id);
        if (response != null) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

}
