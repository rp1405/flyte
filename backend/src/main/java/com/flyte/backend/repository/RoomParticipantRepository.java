package com.flyte.backend.repository;

import com.flyte.backend.enums.RoomType;
import com.flyte.backend.model.Room;
import com.flyte.backend.model.RoomParticipant;
import com.flyte.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;
import java.util.Optional;

import com.flyte.backend.enums.ConnectionStatus;

@Repository
public interface RoomParticipantRepository extends JpaRepository<RoomParticipant, UUID> {

        // 1. Get all participants
        List<RoomParticipant> findByRoomId(UUID roomId);

        // 2. Get all entries for a user
        List<RoomParticipant> findByUserId(UUID userId);

        // 3. Security Check
        boolean existsByRoomIdAndUserId(UUID roomId, UUID userId);

        // 4. Leave Group (Requires Transactional at Service level usually)
        void deleteByRoomIdAndUserId(UUID roomId, UUID userId);

        // 5. Get actual User objects in a room
        @Query("SELECT rp.user FROM RoomParticipant rp WHERE rp.room.id = :roomId")
        List<User> findUsersByRoomId(@Param("roomId") UUID roomId);

        // 6. Get actual Room objects for a user
        @Query("SELECT rp.room FROM RoomParticipant rp WHERE rp.user.id = :userId AND rp.status != :status")
        List<Room> findRoomsByUserIdAndStatusExcept(@Param("userId") UUID userId,
                        @Param("status") ConnectionStatus status);

        // 7. Find everyone else in the room (List version)
        @Query("SELECT rp.user FROM RoomParticipant rp WHERE rp.room.id = :roomId AND rp.user.id != :userId")
        List<User> findOtherParticipants(@Param("roomId") UUID roomId, @Param("userId") UUID userId);

        // 8. Find specific other person (Single User version - for DMs)
        @Query("SELECT rp FROM RoomParticipant rp " +
                        "WHERE rp.room.id = :roomId " +
                        "AND rp.user.id != :userId " +
                        "AND rp.room.type = :type")
        Optional<RoomParticipant> findOtherParticipant(@Param("roomId") UUID roomId,
                        @Param("userId") UUID userId,
                        @Param("type") RoomType type);

        @Query("SELECT rp1.room FROM RoomParticipant rp1 " +
                        "JOIN RoomParticipant rp2 ON rp1.room.id = rp2.room.id " +
                        "WHERE rp1.user.id = :userId1 " +
                        "AND rp2.user.id = :userId2 " +
                        "AND rp1.room.type = :type")
        List<Room> findRoomForUsers(@Param("userId1") UUID userId1,
                        @Param("userId2") UUID userId2,
                        @Param("type") RoomType type);

        List<RoomParticipant> findByUserIdAndStatus(UUID userId, ConnectionStatus status);

        Optional<RoomParticipant> findByRoomIdAndUserId(UUID roomId, UUID userId);
}