// src/types/websocket.ts

import { BackendMessage } from "./message";

// 1. The Enum: Acts as the "Key" or "Header" for routing
export enum WSMessageType {
  CHAT_MESSAGE = "CHAT_MESSAGE",
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
// It links the Type Enum to the specific Payload
export type WebSocketEvent =
  | { type: WSMessageType.CHAT_MESSAGE; payload: BackendMessage }
  | { type: WSMessageType.USER_STATUS; payload: UserStatusPayload }
  | { type: WSMessageType.NOTIFICATION; payload: NotificationPayload }
  | {
      type: WSMessageType.TYPING_INDICATOR;
      payload: { roomId: string; userId: string };
    };

// 4. The Response Wrapper (What comes from the server)
export interface BackendResponse {
  type: WSMessageType; // The discriminator
  data: any; // The raw payload
}
