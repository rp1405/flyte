package com.flyte.backend.DTO.WebSocket;

import com.flyte.backend.enums.PayloadType;

import lombok.Data;

@Data
public class WebSocketPayload<T> {
    private PayloadType type;
    private T data;

    public WebSocketPayload(PayloadType type, T data) {
        this.type = type;
        this.data = data;
    }
}