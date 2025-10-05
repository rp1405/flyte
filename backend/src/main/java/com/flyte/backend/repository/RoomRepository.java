package com.flyte.backend.repository;

import com.flyte.backend.model.Room;
import com.flyte.backend.enums.RoomType;
import java.util.Optional;
import java.util.List;
import java.util.UUID;
import java.time.Instant;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RoomRepository extends JpaRepository<Room, UUID> {
    Optional<Room> findByName(String name);

    List<Room> findByType(RoomType type);

    List<Room> findByExpiryTimeGreaterThan(Instant time);

    List<Room> findByTypeAndExpiryTimeGreaterThan(RoomType type, Instant time);
}