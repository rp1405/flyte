package com.flyte.backend.repository;

import com.flyte.backend.enums.RoomType;
import com.flyte.backend.model.RoomParticipant;
import com.flyte.backend.model.User;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RoomParticipantRepository extends JpaRepository<RoomParticipant, UUID> {

    // 1. Get all users in a specific room (Group Chat / DM)
    List<RoomParticipant> findByRoomId(UUID roomId);

    // 2. Get all rooms a specific user is in (My Chats List)
    List<RoomParticipant> findByUserId(UUID userId);

    // 3. Security Check: Is this user actually in this room?
    // Use this before sending a message!
    boolean existsByRoomIdAndUserId(UUID roomId, UUID userId);

    // 4. Remove a specific user from a specific room (e.g. "Leave Group")
    void deleteByRoomIdAndUserId(UUID roomId, UUID userId);

    @Query("SELECT rp.user FROM RoomParticipant rp WHERE rp.room.id = :roomId")
    List<User> findUsersByRoomId(@Param("roomId") UUID roomId);

    @Query("SELECT rp.room FROM RoomParticipant rp WHERE rp.user.id = :userId")
    List<User> findRoomsByUserId(@Param("userId") UUID userId);

    @Query("SELECT rp.user FROM RoomParticipant rp WHERE rp.room.id = :roomId AND rp.user.id != :userId")
    List<User> findOtherParticipants(@Param("roomId") UUID roomId, @Param("myUserId") UUID userId);

    @Query("SELECT rp.user FROM RoomParticipant rp " +
            "WHERE rp.room.id = :roomId " +
            "AND rp.user.id != :userId " +
            "AND rp.room.type = :type")
    User findOtherParticipant(@Param("roomId") UUID roomId,
            @Param("userId") UUID userId,
            @Param("type") RoomType type);
}