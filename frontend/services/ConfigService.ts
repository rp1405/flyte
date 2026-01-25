import { Airport } from "../types/airport"; // Or move Airport interface to a models file
import { ApiResponse, RequestExecutor } from "./RequestExecutor";

export class ConfigService {
  static async getAirports(): Promise<ApiResponse<Airport[]>> {
    return RequestExecutor.get<Airport[]>("/api/config/airports");
  }
}
