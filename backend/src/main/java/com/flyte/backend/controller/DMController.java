package com.flyte.backend.controller;

import com.flyte.backend.DTO.Room.RoomResponse;
import com.flyte.backend.DTO.Room.CreateDMRequest;
import com.flyte.backend.service.RoomService;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/dm")
public class DMController {

    private final RoomService roomService;

    public DMController(RoomService roomService) {
        this.roomService = roomService;
    }

    @PostMapping("/findOrCreate")
    public ResponseEntity<RoomResponse> findOrCreate(@Valid @RequestBody CreateDMRequest request) {
        RoomResponse response = roomService.findOrCreateDM(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/receivedDMs")
    public ResponseEntity<List<RoomResponse>> getReceivedDMs(@RequestParam UUID userId) {
        List<RoomResponse> responses = roomService.getReceivedDMs(userId);
        return ResponseEntity.ok(responses);
    }

    @PostMapping("/accept")
    public ResponseEntity<RoomResponse> acceptDM(@RequestParam UUID userId, @RequestParam UUID roomId) {
        RoomResponse response = roomService.acceptDM(userId, roomId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/reject")
    public ResponseEntity<RoomResponse> rejectDM(@RequestParam UUID userId, @RequestParam UUID roomId) {
        RoomResponse response = roomService.rejectDM(userId, roomId);
        return ResponseEntity.ok(response);
    }
}
