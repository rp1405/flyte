package com.flyte.backend.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import com.flyte.backend.security.AuthChannelInterceptor;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Autowired
    private AuthChannelInterceptor authChannelInterceptor;

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // The endpoint clients will connect to
        registry.addEndpoint("/ws").withSockJS(); 
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // Prefix for server-to-client messages (broadcasts)
        registry.enableSimpleBroker("/topic"); 
        
        // Prefix for client-to-server messages (handled by @MessageMapping)
        registry.setApplicationDestinationPrefixes("/app"); 
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        // Register our custom interceptor
        registration.interceptors(authChannelInterceptor);
    }
}