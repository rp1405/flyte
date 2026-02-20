
package com.flyte.backend.controller;

import com.flyte.backend.DTO.Room.RoomWithMessages;
import com.flyte.backend.service.SyncService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/sync")
public class SyncController {

    private final SyncService syncService;

    public SyncController(SyncService syncService) {
        this.syncService = syncService;
    }

    @GetMapping("/getSyncData")
    public ResponseEntity<List<RoomWithMessages>> getSyncData(@RequestParam UUID userId) {
        return ResponseEntity.ok(syncService.getSyncData(userId));
    }
}