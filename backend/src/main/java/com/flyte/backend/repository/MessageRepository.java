package com.flyte.backend.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.flyte.backend.model.Message;

@Repository
public interface MessageRepository extends JpaRepository<Message, UUID> {

    // Find messages by room ID
    List<Message> findByRoom_IdOrderByCreatedAtDesc(UUID roomId);

    // Find messages by user ID
    List<Message> findByUser_IdOrderByCreatedAtDesc(UUID userId);

    // Count total messages in a room
    Long countByRoom_Id(UUID roomId);

    // Groups messages by Room ID, then sorts internally by time
    List<Message> findByRoom_IdInOrderByCreatedAtDesc(List<UUID> roomIds);
}