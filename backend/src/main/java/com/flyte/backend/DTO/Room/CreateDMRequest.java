package com.flyte.backend.DTO.Room;

import java.util.UUID;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateDMRequest {
    @NotNull
    private UUID targetUserId;

    @NotNull
    private UUID requesterId;
}
