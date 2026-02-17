import { BackendMessage } from "./message";

// 1. The Enum: Acts as the "Key" or "Header" for routing
export enum WSMessageType {
  CHAT_NOTIFICATION = "CHAT_NOTIFICATION",
  USER_STATUS = "USER_STATUS",
  NOTIFICATION = "NOTIFICATION",
  TYPING_INDICATOR = "TYPING_INDICATOR",
}

export interface UserStatusPayload {
  userId: string;
  isOnline: boolean;
  lastSeen: string;
}

export interface NotificationPayload {
  title: string;
  deepLink: string;
  priority: "HIGH" | "LOW";
}

// 3. The Discriminated Union: This is the magic part
export type WebSocketEvent =
  | { type: WSMessageType.CHAT_NOTIFICATION; payload: BackendMessage }
  | { type: WSMessageType.USER_STATUS; payload: UserStatusPayload }
  | { type: WSMessageType.NOTIFICATION; payload: NotificationPayload }
  | {
      type: WSMessageType.TYPING_INDICATOR;
      payload: { roomId: string; userId: string };
    };

// 4. The Response Wrapper (MATCHES BACKEND GlobalWebSocketEnvelope)
export interface BackendResponse {
  type: WSMessageType; 
  payload: any; // Changed from 'data' to 'payload' to match Java class
}