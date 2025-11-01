package com.flyte.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;

import com.flyte.backend.repository.MessageRepository;
import com.flyte.backend.repository.RoomRepository;
import com.flyte.backend.repository.UserRepository;
import com.flyte.backend.DTO.Message.CreateMessageRequest;
import com.flyte.backend.model.Message;
import com.flyte.backend.model.Room;
import com.flyte.backend.model.User;

import java.util.List;
import java.util.UUID;

@Service
public class MessageService {
    
    private final MessageRepository messageRepository;
    private final RoomRepository roomRepository;
    private final UserRepository userRepository;

    public MessageService(MessageRepository messageRepository, RoomRepository roomRepository, UserRepository userRepository){
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

        return messageRepository.save(message);
    }

    public List<Message> getMessagesByRoom(UUID roomId) {
        return messageRepository.findByRoomIdOrderByCreatedAtDesc(roomId);
    }

    public List<Message> getMessagesByUser(UUID userId) {
        return messageRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<Message> getNewMessages(UUID roomId, UUID lastMessageId) {
        return messageRepository.findByRoomIdAndIdGreaterThanOrderByCreatedAtAsc(roomId, lastMessageId);
    }

    public Long getMessageCount(UUID roomId) {
        return messageRepository.countByRoomId(roomId);
    }
}
