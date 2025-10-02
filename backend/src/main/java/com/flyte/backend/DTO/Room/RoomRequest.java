package com.flyte.backend.DTO.Room;

import com.flyte.backend.enums.RoomType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RoomRequest {
    @NotBlank
    public String name;
    public String description;
    @NotNull
    private RoomType type;
}
