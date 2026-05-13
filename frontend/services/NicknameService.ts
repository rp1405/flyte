/**
 * Nickname Service
 * Handles API calls for nickname operations using RequestExecutor
 */

import UserData from "@/types/UserData";
import { RequestExecutor } from "./RequestExecutor";

export class NicknameService {
  /**
   * Check if a nickname is available
   * @param nickname - The nickname to check
   * @param signal - AbortSignal for request cancellation
   * @returns Promise resolving to { available: boolean }
   */
  public static async checkNicknameAvailability(
    nickname: string,
    signal?: AbortSignal,
  ): Promise<{ available: boolean }> {
    const apiResponse = await RequestExecutor.post<{ available: boolean }>(
      "/api/users/check-nickname",
      { nickname },
      { signal }, // Pass AbortSignal for cancellation
    );

    if (!apiResponse.success) {
      throw new Error(
        apiResponse.error || "Failed to check nickname availability",
      );
    }

    return apiResponse.data;
  }

  /**
   * Set a user's nickname
   * @param nickname - The nickname to set
   * @param userId - The user ID
   * @returns Promise resolving to UserData
   */
  public static async setNickname(
    nickname: string,
    userId: string,
  ): Promise<UserData> {
    const apiResponse = await RequestExecutor.put<{ user: UserData }>(
      `/api/users/set-nickname?userId=${userId}`,
      { nickname },
    );

    if (!apiResponse.success) {
      throw new Error(apiResponse.error || "Failed to set nickname");
    }

    return apiResponse.data.user;
  }
}
