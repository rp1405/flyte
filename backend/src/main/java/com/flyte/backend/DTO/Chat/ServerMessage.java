package com.flyte.backend.DTO.Chat;

import com.flyte.backend.enums.MediaType;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ServerMessage {
    
    private String senderUserName;
    private String messageText;
    private String messageHTML;
    private MediaType mediaType;
    private String mediaLink;

}
