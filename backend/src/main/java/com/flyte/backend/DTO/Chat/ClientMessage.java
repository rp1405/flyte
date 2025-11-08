package com.flyte.backend.DTO.Chat;

import com.flyte.backend.enums.MediaType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ClientMessage {

    @NotBlank(message = "Message text cannot be empty")
    private String messageText;

    @NotBlank(message = "Message HTML cannot be empty")
    private String messageHTML;

    @NotNull(message = "Media type cannot be empty")
    private MediaType mediaType;
    
    private String mediaLink;
}