// src/hooks/useChatWebSocket.ts

// Assuming you are using Expo as per previous clues:
const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:4000";

import { Client, IMessage } from "@stomp/stompjs";
import { useCallback, useEffect, useRef } from "react";
import { BackendMessage, SendMessagePayload } from "../types/message";

// Helper to convert HTTP base URL to WS base URL
// e.g., http://localhost:4000 -> ws://localhost:4000/ws/websocket
const getWebSocketURL = () => {
  const wsProtocol = API_BASE_URL.startsWith("https") ? "wss" : "ws";
  const baseUrlClean = API_BASE_URL.replace(/^https?:\/\//, "");
  // Spring Boot usually exposes raw websockets at /ws/websocket when using SockJS fallback
  return `${wsProtocol}://${baseUrlClean}/ws/websocket`;
};

export const useChatWebSocket = (
  roomId: string,
  currentUserId: string,
  onMessageReceived: (message: BackendMessage) => void
) => {
  // Use useRef to hold the client instance so it persists between renders
  const stompClientRef = useRef<Client | null>(null);

  useEffect(() => {
    // Prevent connecting if mandatory data is missing
    if (!roomId || !currentUserId) return;

    console.log("Attempting WebSocket connection...");

    // 1. Initialize STOMP Client
    const client = new Client({
      brokerURL: getWebSocketURL(),
      // React Native specific config to use native internal WebSocket functionality
      forceBinaryWSFrames: true,
      appendMissingNULLonIncoming: true,

      debug: (str) => {
        // Uncomment for detailed STOMP logs in console
        // console.log('[STOMP]: ' + str);
      },
      reconnectDelay: 5000, // Attempt reconnect every 5s if connection lost
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    // 2. Define lifecycle callbacks
    client.onConnect = (frame) => {
      console.log("--- WebSocket Connected ---");

      const subscriptionTopic = `/topic/room/${roomId}`;
      console.log(`Subscribing to: ${subscriptionTopic}`);

      // 3. Subscribe to the room topic
      client.subscribe(subscriptionTopic, (message: IMessage) => {
        if (message.body) {
          try {
            // Parse the JSON body of the incoming message
            const receivedMessage: BackendMessage = JSON.parse(message.body);
            console.log("WebSocket Received Message:", receivedMessage);
            // Pass it back to the UI component
            onMessageReceived(receivedMessage);
          } catch (err) {
            console.error("Error parsing incoming message JSON:", err);
          }
        }
      });
    };

    client.onStompError = (frame) => {
      console.error("Broker reported error: " + frame.headers["message"]);
      console.error("Additional details: " + frame.body);
    };

    client.onWebSocketError = (event) => {
      console.error("WebSocket error", event);
    };

    // 4. Activate the client
    client.activate();
    stompClientRef.current = client;

    // 5. Cleanup on unmount or roomId change
    return () => {
      console.log("Deactivating WebSocket...");
      if (client.active) {
        client.deactivate();
      }
      stompClientRef.current = null;
    };
  }, [roomId, currentUserId]);

  // Function to publish messages to the backend
  const sendMessage = useCallback(
    (text: string, userId: string, roomId: string) => {
      if (!stompClientRef.current || !stompClientRef.current.connected) {
        console.warn("Cannot send message: WebSocket not connected.");
        // Optional: Show a toast to the user
        return;
      }

      const destination = `/app/chat.send/${roomId}`;
      const payload: SendMessagePayload = {
        messageText: text,
        userId: userId,
        messageHTML: text,
        roomId: roomId,
        mediaType: "TEXT",
        mediaLink: "",
      };

      console.log(`Sending message to ${destination}`);
      stompClientRef.current.publish({
        destination: destination,
        body: JSON.stringify(payload),
      });
    },
    []
  );

  return { sendMessage };
};
