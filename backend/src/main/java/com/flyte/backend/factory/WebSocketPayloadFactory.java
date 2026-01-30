package com.flyte.backend.factory;

import com.flyte.backend.enums.PayloadType;
import com.flyte.backend.DTO.WebSocket.WebSocketPayload;
import com.flyte.backend.model.Message;


import org.springframework.stereotype.Component;

@Component
public class WebSocketPayloadFactory {

    public WebSocketPayload<Message> createChatPayload(Message message) {
        return new WebSocketPayload<>(PayloadType.CHAT_MESSAGE, message);
    }

    // Factory method for User Status (Online/Offline)
    // public WebSocketPayload<UserStatusDTO> createUserStatusPayload(UserStatusDTO status) {
    //     return new WebSocketPayload<>(PayloadType.USER_STATUS, status);
    // }

    // // Factory method for General Notifications
    // public WebSocketPayload<NotificationDTO> createNotificationPayload(NotificationDTO notification) {
    //     return new WebSocketPayload<>(PayloadType.NOTIFICATION, notification);
    // }
    
    public <T> WebSocketPayload<T> createGenericPayload(PayloadType type, T data) {
        return new WebSocketPayload<>(type, data);
    }
}