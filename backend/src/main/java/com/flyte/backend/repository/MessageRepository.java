package com.flyte.backend.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.flyte.backend.model.Message;

@Repository
public interface MessageRepository extends JpaRepository<Message, UUID> {
    
    // Find messages by room ID
    List<Message> findByRoomIdOrderByCreatedAtDesc(UUID roomId);
    
    // Find messages by user ID
    List<Message> findByUserIdOrderByCreatedAtDesc(UUID userId);
    
    // Find messages in a room after a specific message ID
    List<Message> findByRoomIdAndIdGreaterThanOrderByCreatedAtAsc(UUID roomId, UUID lastMessageId);
    
    // Count total messages in a room
    Long countByRoomId(UUID roomId);
}