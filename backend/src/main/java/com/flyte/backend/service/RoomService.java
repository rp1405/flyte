package com.flyte.backend.service;

import com.flyte.backend.DTO.Room.RoomRequest;
import com.flyte.backend.DTO.Room.RoomResponse;
import com.flyte.backend.model.Room;
import com.flyte.backend.repository.RoomRepository;

import java.util.UUID;

import org.springframework.stereotype.Service;
import jakarta.transaction.Transactional;

@Service
public class RoomService {

    private final RoomRepository roomRepository;

    public RoomService(RoomRepository roomRepository) {
        this.roomRepository = roomRepository;
    }

    @Transactional
    public RoomResponse createRoom(RoomRequest roomRequest) {
        Room newRoom = new Room();
        newRoom.setName(roomRequest.getName());
        newRoom.setDescription(roomRequest.getDescription());
        newRoom.setType(roomRequest.getType());
        Room savedRoom = roomRepository.save(newRoom);
        return new RoomResponse(savedRoom);
    }

    public RoomResponse getRoomById(UUID id) {
        return roomRepository.findById(id)
                .map(RoomResponse::new)
                .orElse(null);
    }
}
