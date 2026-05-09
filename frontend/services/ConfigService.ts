import { Airport } from "../types/airport"; // Or move Airport interface to a models file
import { ApiResponse, RequestExecutor } from "./RequestExecutor";

export interface AppConfig {
  helpAndSupportContent: string;
  privacyAndSecurityContent: string;
}

export class ConfigService {
  static async getAirports(): Promise<ApiResponse<Airport[]>> {
    return RequestExecutor.get<Airport[]>("/api/config/airports");
  }

  public static async getAppConfig(): Promise<AppConfig | null> {
    try {
      const response = await RequestExecutor.get<AppConfig>("/api/config/app");
      if (response.success && response.data) {
        return response.data;
      }
      return null;
    } catch (error) {
      console.error("Failed to fetch app config", error);
      return null;
    }
  }
}
