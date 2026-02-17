// src/hooks/useGlobalWebSocket.ts

import { Client, IMessage } from "@stomp/stompjs";
import { useCallback, useEffect, useRef } from "react";
import { BackendResponse, WebSocketEvent } from "../types/globalWebSocket";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:4000";

const getWebSocketURL = () => {
  const wsProtocol = API_BASE_URL.startsWith("https") ? "wss" : "ws";
  const baseUrlClean = API_BASE_URL.replace(/^https?:\/\//, "");
  // Spring Boot usually exposes raw websockets at /ws/websocket when using SockJS fallback
  return `${wsProtocol}://${baseUrlClean}/ws/websocket`;
};

export const useGlobalWebsocket = (
  currentUserId: string,
  // The Handler is now typed to accept our Discriminated Union
  onEventReceived: (event: WebSocketEvent) => void,
) => {
  const stompClientRef = useRef<Client | null>(null);

  useEffect(() => {
    if (!currentUserId || currentUserId === "") return;

    const client = new Client({
      brokerURL: getWebSocketURL(),
      forceBinaryWSFrames: true,
      appendMissingNULLonIncoming: true,
      reconnectDelay: 5000,
    });

    client.onConnect = () => {
        const subscriptionTopic = `/topic/user/${currentUserId}`;
        console.log(`Subscribing to: ${subscriptionTopic}`);
      // Subscribe to the global user queue
      client.subscribe(subscriptionTopic, (message: IMessage) => {
        if (message.body) {
          try {
            // 1. Parse the Raw JSON
            const rawResponse: BackendResponse = JSON.parse(message.body);

            // 2. Construct the Typed Event
            // This casts the raw data into our strict TypeScript Union
            const event: WebSocketEvent = {
              type: rawResponse.type,
              payload: rawResponse.payload,
            } as WebSocketEvent;

            // 3. Pass to the handler
            onEventReceived(event);
          } catch (err) {
            console.error("Error parsing WS message:", err);
          }
        }
      });
    };

    client.activate();
    stompClientRef.current = client;

    return () => {
      if (client.active) client.deactivate();
      stompClientRef.current = null;
    };
  }, [currentUserId]);

  // Generic Send Function
  const sendEvent = useCallback((payload: any) => {

    if (!stompClientRef.current || !stompClientRef.current.connected) {
        console.warn("Cannot send message: WebSocket not connected.");
        // Optional: Show a toast to the user
        return;
    }

    const destination = `/app/chat.send/`;  //TODO Update it in with the endpoint
    if (stompClientRef.current?.connected) {
      stompClientRef.current.publish({
        destination,
        body: JSON.stringify(payload),
      });
    }

  }, []);

  return { sendEvent };
};
