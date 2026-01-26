package com.flyte.backend.model;

import java.time.Instant;

import com.flyte.backend.enums.RoomType;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true) // Ensures BaseEntity fields are included
@Entity
@Table(name = "rooms")
public class Room extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @Column
    private String description;

    @Column(nullable = false)
    private RoomType type;

    @Column(name = "expiry_time")
    private Instant expiryTime;

    @Column(name = "last_message_timestamp", nullable = true)
    private Instant lastMessageTimestamp;
}
