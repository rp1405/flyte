import { JourneyUser } from "@/types/journey";
import { RequestExecutor } from "./RequestExecutor";

export class RoomService {
  // Base endpoint (without query params)
  private static readonly PARTICIPANTS_ENDPOINT =
    "/api/rooms/getParticipantsInRoom";

  /**
   * Fetches participants for a specific room and syncs them to local DB.
   * @param roomId The UUID of the room.
   */
  public static async getParticipants(roomId: string): Promise<JourneyUser[]> {
    // Construct URL with Query Param
    const url = `${this.PARTICIPANTS_ENDPOINT}?roomId=${roomId}`;

    // 1. Call API
    // We assume RequestExecutor.get returns { success: boolean, data: T, error?: string }
    const apiResponse = await RequestExecutor.get<JourneyUser[]>(url);

    if (!apiResponse.success) {
      throw new Error(
        apiResponse.error || `Failed to fetch participants for room ${roomId}`,
      );
    }

    const participants = apiResponse.data || [];

    return participants;
  }

  /**
   * Batch upserts (Create or Update) users into WatermelonDB.
   */
  //   private static async saveUsersToDatabase(apiUsers: UserDTO[]) {
  //     await database.write(async () => {
  //       const usersCollection = database.get<User>("users");

  //       // 1. Filter valid data
  //       const validUsers = apiUsers.filter((u) => u && u.id);
  //       if (validUsers.length === 0) return;

  //       console.log(`Processing ${validUsers.length} participants...`);

  //       // 2. CHECK EXISTENCE: Find which IDs are already in the DB
  //       const idsToCheck = validUsers.map((u) => u.id);
  //       const existingUsers = await usersCollection
  //         .query(Q.where("id", Q.oneOf(idsToCheck)))
  //         .fetch();

  //       // 3. Prepare Batch Operations
  //       const operations = validUsers.map((apiUser) => {
  //         // Check if this user exists locally
  //         const existingUser = existingUsers.find((u) => u.id === apiUser.id);

  //         if (existingUser) {
  //           // A. UPDATE existing user
  //           return existingUser.prepareUpdate((localUser) => {
  //             localUser.name = apiUser.name;
  //             // Update optional fields if they exist in API response
  //             if (apiUser.email) localUser.email = apiUser.email;
  //             if (apiUser.avatarUrl) localUser.avatarUrl = apiUser.avatarUrl;
  //           });
  //         } else {
  //           // B. CREATE new user
  //           return usersCollection.prepareCreate((localUser) => {
  //             localUser._raw.id = apiUser.id;
  //             localUser.name = apiUser.name;
  //             if (apiUser.email) localUser.email = apiUser.email;
  //             if (apiUser.avatarUrl) localUser.avatarUrl = apiUser.avatarUrl;
  //           });
  //         }
  //       });

  //       // 4. Execute Batch
  //       if (operations.length > 0) {
  //         console.log(`Batching ${operations.length} User operations (Upsert)`);
  //         await database.batch(...operations);
  //       }
  //     });
  //   }
}
