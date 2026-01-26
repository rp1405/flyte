package com.flyte.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.flyte.backend.repository.MessageRepository;
import com.flyte.backend.repository.RoomRepository;
import com.flyte.backend.repository.UserRepository;
import com.flyte.backend.DTO.Message.CreateMessageRequest;
import com.flyte.backend.model.Message;
import com.flyte.backend.model.Room;
import com.flyte.backend.model.User;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class MessageService {

    private final MessageRepository messageRepository;
    private final RoomRepository roomRepository;
    private final UserRepository userRepository;

    public MessageService(MessageRepository messageRepository, RoomRepository roomRepository,
            UserRepository userRepository) {
        this.messageRepository = messageRepository;
        this.roomRepository = roomRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public Message createMessage(CreateMessageRequest request) {
        Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new IllegalArgumentException("Room not found"));

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Message message = new Message();
        message.setRoom(room);
        message.setUser(user);
        message.setMessageText(request.getMessageText());
        message.setMessageHTML(request.getMessageHTML());
        message.setMediaType(request.getMediaType());
        message.setMediaLink(request.getMediaLink());

        Message savedMessage = messageRepository.save(message);
        room.setLastMessageTimestamp(savedMessage.getCreatedAt());
        roomRepository.save(room);
        return savedMessage;
    }

    public List<Message> getMessagesByRoom(UUID roomId) {
        return messageRepository.findByRoom_IdOrderByCreatedAtDesc(roomId);
    }

    public List<Message> getMessagesByUser(UUID userId) {
        return messageRepository.findByUser_IdOrderByCreatedAtDesc(userId);
    }

    public Long getMessageCount(UUID roomId) {
        return messageRepository.countByRoom_Id(roomId);
    }

    public Map<UUID, List<Message>> getMessagesByRoomIds(List<UUID> roomIds) {
        List<Message> allMessages = messageRepository.findByRoom_IdInOrderByCreatedAtDesc(roomIds);

        Map<UUID, List<Message>> messagesByRoom = allMessages.stream()
                .collect(Collectors.groupingBy(
                        Message::getRoomId,
                        LinkedHashMap::new, // Use LinkedHashMap to keep insertion order of keys
                        Collectors.toList()));
        return messagesByRoom;
    }
}
