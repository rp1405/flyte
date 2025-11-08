package com.flyte.backend.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
public class AuthChannelInterceptor implements ChannelInterceptor {

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private CustomUserDetailsService customUserDetailsService;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        // We only need to authenticate when the client first sends the CONNECT frame
        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
            
            // 1. Get the token from the STOMP native headers
            String token = accessor.getFirstNativeHeader("Authorization");

            // 2. Validate it just like in your HTTP filter
            if (StringUtils.hasText(token) && token.startsWith("Bearer ")) {
                String jwt = token.substring(7);
                
                if (tokenProvider.validateToken(jwt)) {
                    String email = tokenProvider.getEmailFromJWT(jwt);
                    UserDetails userDetails = customUserDetailsService.loadUserByUsername(email);
                    
                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities());
                    
                    // 3. CRITICAL: Set the user FOR THIS WEBSOCKET SESSION
                    accessor.setUser(authentication);
                }
            }
        }
        return message;
    }
}