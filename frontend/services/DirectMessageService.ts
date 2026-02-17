import { database } from "@/db";
import Room from "@/db/models/Room";
import { RequestExecutor } from "./RequestExecutor";

// Define Request Payload
interface CreateDMRequest {
  targetUserId: string;
  requesterId: string;
}

// Define Response (Matches your Room model structure)
interface DMRoomResponse {
  id: string;
  name: string;
  description: string;
  type: string;
  createdAt?: string;
  updatedAt?: string;
  lastMessageTimestamp?: string;
}

export type ConnectionStatus = "CONNECTED" | "SENT" | "RECEIVED";

export class DirectMessageService {

  private static readonly DM_ENDPOINT = "/api/dm/findOrCreate";
  private static readonly STATUS_ENDPOINT = "/api/dm/status";
  private static readonly ACCEPT_ENDPOINT = "/api/dm/accept";
  private static readonly REJECT_ENDPOINT = "/api/dm/reject";


  /**
   * Fetches the connection status between two users for a specific room.
   */
  public static async getDMStatus(
    roomId: string,
    userId: string,
  ): Promise<ConnectionStatus> {
    const url = `${this.STATUS_ENDPOINT}?roomId=${roomId}&userId=${userId}`;
    const response = await RequestExecutor.get<ConnectionStatus>(url);

    if (!response.success || !response.data) {
      throw new Error(response.error || "Failed to fetch DM status.");
    }

    return response.data;
  }

  /**
   * Accepts a DM request.
   */
  public static async acceptDMRequest(
    roomId: string,
    userId: string,
  ): Promise<void> {
    const url = `${this.ACCEPT_ENDPOINT}?roomId=${roomId}&userId=${userId}`;
    const response = await RequestExecutor.post(url, {});

    if (!response.success) {
      throw new Error(response.error || "Failed to accept DM request.");
    }
  }

  /**
   * Rejects a DM request.
   */
  public static async rejectDMRequest(
    roomId: string,
    userId: string,
  ): Promise<void> {
    const url = `${this.REJECT_ENDPOINT}?roomId=${roomId}&userId=${userId}`;
    const response = await RequestExecutor.post(url, {});

    if (!response.success) {
      throw new Error(response.error || "Failed to reject DM request.");
    }
  }

  /**
   * Finds an existing DM or creates a new one between two users.
   * Automatically saves the result to local DB.
   * * @param targetUserId The user you want to chat with.
   * @param requesterId The current logged-in user.
   * @returns The Room object (local DB model).
   */
  public static async findOrCreateDM(
    targetUserId: string,
    requesterId: string,
  ): Promise<Room> {
    // 1. Construct Payload
    const payload: CreateDMRequest = {
      targetUserId,
      requesterId,
    };

    console.log("Creating dm for:", targetUserId, " ",requesterId)
    // 2. Call API
    const response = await RequestExecutor.post<DMRoomResponse>(
      this.DM_ENDPOINT,
      payload,
    );

    if (!response.success || !response.data) {
      throw new Error(
        response.error || "Failed to create Direct Message room.",
      );
    }

    // 3. Save to Local DB
    const room = await this.saveDMRoomToDatabase(response.data);
    return room;
  }

  /**
   * Persists the API response into WatermelonDB.
   */
  private static async saveDMRoomToDatabase(
    apiRoom: DMRoomResponse,
  ): Promise<Room> {
    let resultRoom: Room;

    await database.write(async () => {
      const roomsCollection = database.get<Room>("rooms");

      // Check if room already exists locally
      try {
        const existingRoom = await roomsCollection.find(apiRoom.id);

        // UPDATE existing
        resultRoom = await existingRoom.update((r) => {
          r.name = apiRoom.name;
          r.description = apiRoom.description;
          r.type = apiRoom.type; // Should be "DM"
          if (apiRoom.updatedAt) r.updatedAt = new Date(apiRoom.updatedAt);
          if (apiRoom.lastMessageTimestamp) {
            r.lastMessageTimestamp = new Date(apiRoom.lastMessageTimestamp);
          }
        });
      } catch (error) {
        // CREATE new
        resultRoom = await roomsCollection.create((r) => {
          r._raw.id = apiRoom.id;
          r.name = apiRoom.name;
          r.description = apiRoom.description;
          r.type = apiRoom.type; // "DM"
          r.createdAt = apiRoom.createdAt
            ? new Date(apiRoom.createdAt)
            : new Date();
          r.updatedAt = apiRoom.updatedAt
            ? new Date(apiRoom.updatedAt)
            : new Date();
          // For new DMs, last message might be null/now
          r.lastMessageTimestamp = apiRoom.lastMessageTimestamp
            ? new Date(apiRoom.lastMessageTimestamp)
            : new Date();
        });
      }
    });

    // @ts-ignore - resultRoom is assigned inside the write block
    return resultRoom;
  }
}
