package com.flyte.backend.globalWebsocketHandler.interfaces;

import com.flyte.backend.globalWebsocketHandler.enums.GlobalMessageType;
import java.security.Principal;

public interface GlobalMessageHandler<T> {

    // The logic to execute
    void handle(Object specificPayload, Principal user);

    // Which enum does this handler solve?
    GlobalMessageType getType();

    // What class structure should the JSON be converted into?
    Class<T> getPayloadType();
}