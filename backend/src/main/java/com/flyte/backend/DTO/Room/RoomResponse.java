package com.flyte.backend.DTO.Room;

import java.util.UUID;

import com.flyte.backend.enums.RoomType;
import com.flyte.backend.model.Room;

import lombok.Data;

@Data
public class RoomResponse {
    public UUID id;
    public String name;
    public String description;
    private RoomType type;

    public RoomResponse(Room room) {
        this.id = room.getId();
        this.name = room.getName();
        this.description = room.getDescription();
        this.type = room.getType();
    }
}
