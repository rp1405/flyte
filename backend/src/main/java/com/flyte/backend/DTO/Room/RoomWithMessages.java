package com.flyte.backend.DTO.Room;

import java.util.List;

import com.flyte.backend.model.Message;

import lombok.Data;

@Data
public class RoomWithMessages {
    private RoomResponse room;
    private List<Message> messages;
}
