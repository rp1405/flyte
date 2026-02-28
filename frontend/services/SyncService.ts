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
  messageText: string;
  createdAt: string;
  mediaType: string;
  mediaLink?: string;
  user: ApiUser;
  roomId: string;
  room?: ApiRoomDetails;
}

interface ApiRoomDetails {
  id: string;
  name: string;
  description: string | null;
  type: string;
  expiryTime?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  lastMessageTimestamp?: string | null;
  otherUser?: ApiUser; 
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
        `/api/sync/getSyncData?userId=${userId}`,
      );

      if (!response.success || !response.data) {
        console.warn("Sync skipped: No data or error", response.error);
        return;
      }

      console.log("Response:", response.data);

      const apiResponseList = response.data;
      if (apiResponseList.length === 0) return;

      // 🕵️ DUPLICATE DETECTOR
      // ---------------------------------------------------------
      const seenIds = new Set<string>();
      const duplicateIds: string[] = [];

      apiResponseList.forEach((item) => {
        if (seenIds.has(item.room.id)) {
          duplicateIds.push(item.room.name);
        } else {
          seenIds.add(item.room.id);
        }
      });

      if (duplicateIds.length > 0) {
        console.warn(
          `⚠️ DUPLICATE ROOM IDs DETECTED IN API RESPONSE:\n` +
            `Count: ${duplicateIds.length}\n` +
            `IDs: ${duplicateIds.join(", ")}`,
        );
        console.log(
          "Info: The sync service will automatically handle these by using the last occurrence.",
        );
      } else {
        console.log("✅ Data Check Passed: No duplicate Room IDs found.");
      }
      // ---------------------------------------------------------

      // B. Database Transaction (Incremental Sync)
      await database.write(async () => {
        const roomsCollection = database.get<Room>(Room.table);
        const messagesCollection = database.get<Message>(Message.table);

        // 1. Fetch all local rooms to decide what remains
        const allLocalRooms = await roomsCollection.query().fetch();
        const existingRoomsMap = new Map(allLocalRooms.map((r) => [r.id, r]));

        // 2. Identify rooms to delete (present locally but not in the sync response)
        const roomIdsInResponse = new Set(
          apiResponseList.map((item) => item.room.id),
        );
        const roomsToDelete = allLocalRooms.filter(
          (r) => !roomIdsInResponse.has(r.id),
        );
        const roomsToDeleteIds = roomsToDelete.map((r) => r.id);

        const operations: any[] = [];

        // 3. Prepare Delete Operations for stale rooms and their messages
        if (roomsToDeleteIds.length > 0) {
          const messagesToDelete = await messagesCollection
            .query(Q.where("room_id", Q.oneOf(roomsToDeleteIds)))
            .fetch();

          operations.push(
            ...messagesToDelete.map((m) => m.prepareDestroyPermanently()),
          );
          operations.push(
            ...roomsToDelete.map((r) => r.prepareDestroyPermanently()),
          );
        }

        // 4. Pre-fetch existing message IDs to prevent primary key collision on "push"
        const allApiMessageIds = apiResponseList.flatMap((item) =>
          item.messages.map((m) => m.id),
        );
        let existingMessageIds = new Set<string>();
        if (allApiMessageIds.length > 0) {
          const existingMsgs = await messagesCollection
            .query(Q.where("id", Q.oneOf(allApiMessageIds)))
            .fetch();
          existingMessageIds = new Set(existingMsgs.map((m) => m.id));
        }

        // 5. Prepare Upsert for Rooms and Create for New Messages
        for (const item of apiResponseList) {
          const apiRoom = item.room;
          const apiMessages = item.messages;
          const existingRoom = existingRoomsMap.get(apiRoom.id);

          // FALLBACK: The top-level 'room' in your JSON is missing dates.
          // We can find them inside the room object attached to messages if available.
          const fullRoomData = (apiMessages && apiMessages.length > 0 && apiMessages[0].room) ? apiMessages[0].room : apiRoom;

          const parseDate = (d: any) => {
            const date = new Date(d);
            return isNaN(date.getTime()) ? new Date() : date;
          };

          // Push new messages (since sync returns "data after last sync")
          let newMessagesCount = 0;
          if (apiMessages && apiMessages.length > 0) {
            for (const msg of apiMessages) {
              // Skip if message ID already exists locally
              if (existingMessageIds.has(msg.id)) continue;

              newMessagesCount++;
              operations.push(
                messagesCollection.prepareCreate((m) => {
                  m._raw.id = msg.id;
                  m.room.id = apiRoom.id;
                  m.senderId = msg.user.id;
                  m.senderName =
                    msg.user.name || msg.user.nickname || "Unknown";
                  m.text = msg.messageText;
                  m.timestamp = parseDate(msg.createdAt);
                  m.mediaType = msg.mediaType;
                  m.mediaLink = msg.mediaLink;
                }),
              );
            }
          }

          const applyMetadata = (r: Room) => {
            r.name = apiRoom.name;
            r.description = apiRoom.description || "";
            r.type = apiRoom.type;
            r.createdAt = parseDate(fullRoomData.createdAt);
            r.expiryTime = parseDate(fullRoomData.expiryTime);
            r.updatedAt = parseDate(fullRoomData.updatedAt);
            r.lastMessageTimestamp = parseDate(fullRoomData.lastMessageTimestamp);

            // Update avatar if provided (typical for DMs)
            if (apiRoom.otherUser?.profilePictureUrl) {
              r.avatarUrl = apiRoom.otherUser.profilePictureUrl;
            }
          };

          if (existingRoom) {
            // Update existing room metadata
            operations.push(
              existingRoom.prepareUpdate((r) => {
                applyMetadata(r);
                if (newMessagesCount > 0) {
                  r.unreadCount = (r.unreadCount || 0) + newMessagesCount;
                }
              }),
            );
          } else {
            // Create new room if it doesn't exist locally
            operations.push(
              roomsCollection.prepareCreate((r) => {
                r._raw.id = apiRoom.id;
                applyMetadata(r);
                r.unreadCount = newMessagesCount;
              }),
            );
          }
        }

        // 6. Execute all operations in a single batch for performance
        if (operations.length > 0) {
          await database.batch(operations);
        }
      });

      console.log(`Sync Complete: Processed ${apiResponseList.length} rooms.`);
    } catch (error) {
      console.error("Sync Error:", error);
    }
  }
}
