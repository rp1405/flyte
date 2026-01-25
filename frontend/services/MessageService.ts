// src/services/messageService.ts
import { BackendMessage } from "../types/message";
import { RequestExecutor } from "./RequestExecutor";

// Adjust base path if needed, e.g., just "" if controller is at root /room
const ROOM_MESSAGES_ENDPOINT = "/api/messages/room";

/**
 * Fetches all past messages for a specific chat room.
 * GET /api/room/{roomId}
 */
export const fetchRoomMessagesService = async (
  roomId: string
): Promise<BackendMessage[]> => {
  try {
    console.log(`Fetching messages for room: ${roomId}`);

    // Construct the URL with the path parameter
    const url = `${ROOM_MESSAGES_ENDPOINT}/${roomId}`;

    // Execute GET request expecting an array of BackendMessage
    const apiResponse = await RequestExecutor.get<BackendMessage[]>(url);

    if (!apiResponse.success) {
      throw new Error(apiResponse.error || "Failed to fetch messages");
    }

    return apiResponse.data;
  } catch (error) {
    console.error("Error fetching room messages:", error);
    throw error;
  }
};
