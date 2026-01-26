package com.flyte.backend.DTO.Room;

import java.util.List;

import com.flyte.backend.model.Message;
import com.flyte.backend.model.Room;

import lombok.Data;

@Data
public class RoomWithMessages {
    private Room room;
    private List<Message> messages;
}
