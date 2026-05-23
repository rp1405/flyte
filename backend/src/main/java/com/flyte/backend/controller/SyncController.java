
package com.flyte.backend.controller;

import com.flyte.backend.DTO.Room.RoomWithMessages;
import com.flyte.backend.service.SyncService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.extern.slf4j.Slf4j;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/sync")
public class SyncController {

    private final SyncService syncService;

    public SyncController(SyncService syncService) {
        this.syncService = syncService;
    }

    @GetMapping("/getSyncData")
    public ResponseEntity<List<RoomWithMessages>> getSyncData(@RequestParam UUID userId) {
        log.info("Received request to get sync data for user: {}", userId);
        return ResponseEntity.ok(syncService.getSyncData(userId));
    }
}