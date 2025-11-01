package com.flyte.backend.DTO.Message;

import java.util.UUID;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateMessageRequest {
    
    @NotNull(message = "Room ID is required")
    private UUID roomId;

    @NotNull(message = "User ID is required")
    private UUID userId;

    @NotBlank(message = "Message text cannot be empty")
    private String messageText;

    @NotBlank(message = "Message HTML cannot be empty")
    private String messageHTML;

    @NotBlank(message = "Media type cannot be empty")
    private String mediaType;
    
    private String mediaLink;
}
