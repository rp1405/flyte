import { RequestExecutor } from "./RequestExecutor";

interface RegisterTokenRequest {
  token: string;
  userId: string;
}

export class NotificationService {
  private static readonly REGISTER_TOKEN_ENDPOINT = "/api/notifications/register-token";

  /**
   * Registers the FCM token for a given user.
   * @param token The FCM device token
   * @param userId The user's ID
   */
  public static async registerToken(
    token: string,
    userId: string,
  ): Promise<void> {
    const payload: RegisterTokenRequest = {
      token,
      userId,
    };

    const response = await RequestExecutor.post(
      this.REGISTER_TOKEN_ENDPOINT,
      payload,
    );

    if (!response.success) {
      throw new Error(
        response.error || "Failed to register FCM token.",
      );
    }
  }
}
