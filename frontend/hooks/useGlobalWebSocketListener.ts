import { useAuth } from "@/context/AuthContext";
import { database } from "@/db";
import Message from "@/db/models/Message";
import Room from "@/db/models/Room";
import { useGlobalWebsocket } from "@/hooks/useGlobalWebsocket";
import { WebSocketEvent, WSMessageType } from "@/types/globalWebSocket";
import { useCallback } from "react";

export const useGlobalWebSocketListener = () => {
  const { user } = useAuth();

  const handleWebSocketEvent = useCallback(async (event: WebSocketEvent) => {
    console.log("Global WS Event Received:", event.type, event.payload);

    switch (event.type) {
      case WSMessageType.CHAT_MESSAGE:
        // Handle incoming chat message -> Save to WatermelonDB
       
        try {
          await database.write(async () => {
            const messagesCollection = database.get<Message>(Message.table);
            const roomsCollection = database.get<Room>("rooms");
            await messagesCollection.create((m) => {
              m._raw.id = event.payload.id;
              m.text = event.payload.messageText;
              m.timestamp = new Date(event.payload.createdAt);
              m.senderId = event.payload.user.id;
              m.senderName = event.payload.user.name;
              m.room.id = event.payload.room.id;
            });

            const roomToUpdate = await roomsCollection.find(event.payload.room.id);
            await roomToUpdate.update((r) => {
              // Ensure you convert to number if your schema uses number
              r.lastMessageTimestamp = new Date(event.payload.createdAt);
            });
          });

          console.log(`Saved message ${event.payload.id} to DB`);
        } catch (error) {
          console.error("Error saving incoming message to DB:", error);
        }
        break;

      case WSMessageType.TYPING_INDICATOR:
        // Handle typing indicator
        console.log(
          `User ${event.payload.userId} is typing in room ${event.payload.roomId}`
        );
        // TODO: Update local state or trigger an event for UI to show typing indicator
        break;

      case WSMessageType.NOTIFICATION:
        // Handle global notification
        console.log("Notification received:", event.payload);
        // TODO: Show a toast or update notification count
        break;

      case WSMessageType.USER_STATUS:
        // Handle user status update
        console.log("User status update:", event.payload);
        // TODO: Update user status in DB or local state
        break;

      default:
        console.warn("Unhandled WebSocket event type:", event);
    }
  }, []);

  // Initialize the websocket connection with our handler
  useGlobalWebsocket(user?.id || "", handleWebSocketEvent);
};
