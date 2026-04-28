package com.flyte.backend.globalWebsocketHandler;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.flyte.backend.globalWebsocketHandler.dto.GlobalWebSocketEnvelope;
import com.flyte.backend.globalWebsocketHandler.enums.GlobalMessageType;
import com.flyte.backend.globalWebsocketHandler.interfaces.GlobalMessageHandler;
import org.springframework.stereotype.Service;

import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class GlobalMessageDispatcher {

    // FIX 1: Use <?> to say "A handler of some unknown type"
    private final Map<GlobalMessageType, GlobalMessageHandler<?>> handlers;
    private final ObjectMapper objectMapper;

    // FIX 2: Update the constructor arguments to match
    public GlobalMessageDispatcher(List<GlobalMessageHandler<?>> handlerList, ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.handlers = handlerList.stream()
                .collect(Collectors.toMap(GlobalMessageHandler::getType, Function.identity()));
    }

    @SuppressWarnings("unchecked") // This suppresses the warning about the cast below
    public void dispatch(GlobalWebSocketEnvelope envelope, Principal user) {
        GlobalMessageHandler<?> handler = handlers.get(envelope.getType());

        if (handler == null) {
            throw new IllegalArgumentException("No handler found for type: " + envelope.getType());
        }

        // 1. Get the class type
        Class<?> payloadType = handler.getPayloadType();

        // 2. Convert the raw JSON to that specific class
        Object specificPayload = objectMapper.convertValue(envelope.getPayload(), payloadType);

        // 3. THE FIX: Cast to <Object> so we can pass 'specificPayload' in.
        // We cast the generic '?' handler to a specific '<Object>' handler.
        // This is safe at runtime due to type erasure, provided our logic above is
        // correct.
        ((GlobalMessageHandler<Object>) handler).handle(specificPayload, user);
    }
}