import { CreateJourneyRequestPayload, JourneyResponse } from "../types/journey";
import { RequestExecutor } from "./RequestExecutor";
import { database } from "@/db"; 
import { Q } from "@nozbe/watermelondb";
import Message from "../db/models/Message";
import Room from "../db/models/Room";

export class JourneyService {
  private static readonly JOURNEYS_ENDPOINT = "/api/journeys/create";

  /**
   * Calls the backend API to create a new journey.
   * @param payload The journey data to send.
   * @returns The created journey data on success.
   * @throws Error if the request fails.
   */
  public static async createJourney(
    payload: CreateJourneyRequestPayload
  ): Promise<JourneyResponse> {
    //RequestExecutor.setAuthToken(TEMP_TOKEN);

    const apiResponse = await RequestExecutor.post<JourneyResponse>(
      this.JOURNEYS_ENDPOINT,
      payload
    );

    if (!apiResponse.success) {
      throw new Error(
        apiResponse.error ||
          `Journey creation failed with status: ${apiResponse.status}`
      );
    }

    await this.saveRoomsToDatabase(apiResponse.data);
    return apiResponse.data;
  }

  private static async saveRoomsToDatabase(data: JourneyResponse) {
    await database.write(async () => {
      const roomsCollection = database.get<Room>(Room.table);

      // 1. Clean the list: Filter out nulls/undefined
      const roomsToSave = [
        data.sourceRoom,
        data.destinationRoom,
        data.flightRoom,
      ].filter((r) => r && r.id);

      if (roomsToSave.length === 0) return;

      console.log("Processing Rooms:", roomsToSave.length);

      // 2. CHECK EXISTENCE: Find which IDs are already in the DB
      const idsToCheck = roomsToSave.map((r) => r!.id);
      const existingRooms = await roomsCollection
        .query(Q.where("id", Q.oneOf(idsToCheck)))
        .fetch();

      // 3. Create Batch Operations (Mix of Create and Update)
      const operations = roomsToSave.map((apiRoom) => {
        // Check if this specific API room is already in our DB results
        const existingRoom = existingRooms.find((r) => r.id === apiRoom!.id);

        if (existingRoom) {
          // A. If it exists -> UPDATE it
          return existingRoom.prepareUpdate((localRoom) => {
            // We can reuse a helper to map fields
            localRoom.name = apiRoom!.name;
            localRoom.type = apiRoom!.type;
            localRoom.description = apiRoom!.description;
            // Update timestamps only if necessary, or just overwrite
            localRoom.updatedAt = new Date(apiRoom!.updatedAt);
            localRoom.lastMessageTimestamp = new Date(
              apiRoom!.lastMessageTimestamp
            );
          });
        } else {
          // B. If it doesn't exist -> CREATE it
          return roomsCollection.prepareCreate((localRoom) => {
            localRoom._raw.id = apiRoom!.id; // ID is only set on creation
            localRoom.name = apiRoom!.name;
            localRoom.type = apiRoom!.type;
            localRoom.description = apiRoom!.description;
            localRoom.createdAt = new Date(apiRoom!.createdAt);
            localRoom.updatedAt = new Date(apiRoom!.updatedAt);
            localRoom.expiryTime = new Date(apiRoom!.expiryTime);
            localRoom.lastMessageTimestamp = new Date(
              apiRoom!.lastMessageTimestamp
            );
          });
        }
      });

      console.log(`Batching ${operations.length} operations (Upsert)`);

      // 4. Execute safely
      if (operations.length > 0) {
        await database.batch(...operations);
      }
    });
  }
}
