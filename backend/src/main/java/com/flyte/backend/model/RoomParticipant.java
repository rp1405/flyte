package com.flyte.backend.model;

import jakarta.persistence.Entity;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

@Data
@EqualsAndHashCode(callSuper = true)
@Entity
// Unique constraint ensures a user can't be added to the same DM twice
@Table(name = "dm_participants", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "room_id", "user_id" })
})
public class RoomParticipant extends BaseEntity {

    @ManyToOne
    @JoinColumn(name = "room_id", nullable = false, foreignKey = @ForeignKey(name = "fk_dm_room"), referencedColumnName = "id")
    @OnDelete(action = OnDeleteAction.CASCADE) // If Room is deleted, this link is deleted
    private Room room;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false, foreignKey = @ForeignKey(name = "fk_dm_user"), referencedColumnName = "id")
    @OnDelete(action = OnDeleteAction.CASCADE) // If User is deleted, this link is deleted
    private User user;

}