package com.flyte.backend.globalWebsocketHandler.dto;

import com.flyte.backend.globalWebsocketHandler.enums.GlobalMessageType;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GlobalWebSocketEnvelope {

    // This matches the "type" field in your JSON
    private GlobalMessageType type;

    // - When Receiving: Jackson reads this as a Map/Node.
    // - When Sending: Jackson serializes your Java Object (Message) into JSON.
    private Object payload;
}