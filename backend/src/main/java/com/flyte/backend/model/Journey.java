package com.flyte.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.Instant;

@Data
@EqualsAndHashCode(callSuper = true) // Ensures BaseEntity fields are included
@Entity
@Table(name = "journeys")
public class Journey extends BaseEntity {
    @Column(nullable = false)
    private String name;

     @Column(name = "depart_time", nullable = false, columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private Instant departTime;

    @Column(name = "arrival_time", nullable = false, columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private Instant arrivalTime;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false, foreignKey = @ForeignKey(name = "fk_journey_user"), referencedColumnName = "id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "source_room_id", nullable = false, foreignKey = @ForeignKey(name = "fk_journey_source_room"), referencedColumnName = "id")
    private Room sourceRoom;

    @ManyToOne
    @JoinColumn(name = "destination_room_id", nullable = false, foreignKey = @ForeignKey(name = "fk_journey_destination_room"), referencedColumnName = "id")
    private Room destinationRoom;

    @ManyToOne
    @JoinColumn(name = "flight_room_id", nullable = false, foreignKey = @ForeignKey(name = "fk_journey_flight_room"), referencedColumnName = "id")
    private Room flightRoom;
}
