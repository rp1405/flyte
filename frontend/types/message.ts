// src/models/message.ts

import { JourneyRoom, JourneyUser } from "./journey";

// Assuming you already have User defined in 'src/models/user.ts'
// If not, define a basic shape here:

// Matches com.flyte.backend.enums.MediaType
export type MediaType = "TEXT" | "IMAGE" | "VIDEO" | "FILE";

// Matches your backend 'Message' entity structure
export interface BackendMessage {
  id: string;
  createdAt: string; // ISO timestamp from BaseEntity
  updatedAt: string;
  room: JourneyRoom; // We don't strictly need the full room object in the message list
  user: JourneyUser; // The sender
  messageText: string;
  messageHTML: string; // Not used in UI currently, but good to have
  mediaType: MediaType;
  mediaLink: string | null;
}

// --- UI Specific Model ---
// This is the simplified shape your ChatDetailScreen's renderItem expects.
// We will map the BackendMessage to this shape.
export interface UIMessage {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  timestamp: string; // Formatted time string (e.g., "12:30 PM")
  // Add later for rich media: mediaType, mediaLink
}

export interface SendMessagePayload {
  messageText: string;
  userId: string; // The backend needs to know who sent it
  messageHTML: string;
  mediaType: MediaType;
  mediaLink: string;
  roomId: string;
}
