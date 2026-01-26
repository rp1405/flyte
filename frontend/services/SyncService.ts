import { database } from "@/db"; // <--- Adjust path to your DB
import { Q } from "@nozbe/watermelondb";
import Message from "../db/models/Message";
import Room from "../db/models/Room";
import { RequestExecutor } from "./RequestExecutor";

// --- 1. Define Interfaces Matching Your JSON Exactly ---

interface ApiUser {
  id: string;
  name: string;
  email: string;
  nickname?: string;
  profilePictureUrl?: string;
}

interface ApiMessage {
  id: string;
  messageText: string; // JSON: "messageText" -> DB: "text"
  createdAt: string; // JSON: "createdAt"   -> DB: "timestamp"
  mediaType: string;
  mediaLink?: string;
  user: ApiUser; // Nested user object for sender info
  roomId: string;
}

interface ApiRoomDetails {
  id: string;
  name: string;
  description: string;
  type: string;
  expiryTime: string;
  createdAt: string;
  updatedAt: string;
  lastMessageTimestamp: string;
}

// The root item in the response array
export interface RoomWithMessagesResponse {
  room: ApiRoomDetails;
  messages: ApiMessage[];
}

// --- 2. The Sync Service ---

export class SyncService {
  static async syncUserChatData(userId: string): Promise<void> {
    try {
      console.log("Syncing: Fetching latest data...");

      // A. Fetch from Backend
      const response = await RequestExecutor.get<RoomWithMessagesResponse[]>(
        `/api/rooms/getRoomsAndMessagesByUserId?userId=${userId}`
      );

      if (!response.success || !response.data) {
        console.warn("Sync skipped: No data or error", response.error);
        return;
      }

      const apiResponseList = response.data;
      if (apiResponseList.length === 0) return;

      // Extract all Room IDs from the nested 'room' object
      const roomIdsToSync = apiResponseList.map((item) => item.room.id);

      // B. Database Transaction (Wipe & Replace)
      await database.write(async () => {
        const roomsCollection = database.get<Room>(Room.table);
        const messagesCollection = database.get<Message>(Message.table);

        // 1. Find existing records to delete (Clean Slate)
        const existingRooms = await roomsCollection
          .query(Q.where("id", Q.oneOf(roomIdsToSync)))
          .fetch();

        const existingMessages = await messagesCollection
          .query(Q.where("room_id", Q.oneOf(roomIdsToSync)))
          .fetch();

        // 2. Delete them
        const deleteOperations = [
          ...existingMessages.map((m) => m.prepareDestroyPermanently()),
          ...existingRooms.map((r) => r.prepareDestroyPermanently()),
        ];

        if (deleteOperations.length > 0) {
          await database.batch(deleteOperations);
        }

        // 3. Create New Records
        const createOperations: any[] = [];

        for (const item of apiResponseList) {
          const apiRoom = item.room;
          const apiMessages = item.messages;

          // Prepare Room Creation
          createOperations.push(
            roomsCollection.prepareCreate((r) => {
              r._raw.id = apiRoom.id; // Map 'id'
              r.name = apiRoom.name;
              r.description = apiRoom.description;
              r.type = apiRoom.type;
              r.createdAt = new Date(apiRoom.createdAt);
              r.expiryTime = new Date(apiRoom.expiryTime);
              r.updatedAt = new Date(apiRoom.updatedAt);
              r.lastMessageTimestamp = new Date(apiRoom.lastMessageTimestamp);
            })
          );

          // Prepare Message Creation
          if (apiMessages && apiMessages.length > 0) {
            for (const msg of apiMessages) {
              createOperations.push(
                messagesCollection.prepareCreate((m) => {
                  m._raw.id = msg.id;
                  m.room.id = apiRoom.id; // Link to Room ID

                  // Map Sender Info from nested 'user' object
                  m.senderId = msg.user.id;
                  m.senderName =
                    msg.user.name || msg.user.nickname || "Unknown";

                  // Map Message Content
                  m.text = msg.messageText;
                  m.timestamp = new Date(msg.createdAt);
                  m.mediaType = msg.mediaType;
                  m.mediaLink = msg.mediaLink;
                })
              );
            }
          }
        }

        // Execute the Create Batch
        if (createOperations.length > 0) {
          await database.batch(createOperations);
        }
      });

      console.log(`Sync Complete: Processed ${apiResponseList.length} rooms.`);
    } catch (error) {
      console.error("Sync Error:", error);
    }
  }
}
