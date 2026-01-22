import { RequestExecutor, ApiResponse } from "./RequestExecutor";
import { Airport } from "../models/airport"; // Or move Airport interface to a models file

export class ConfigService {
 
  static async getAirports(): Promise<ApiResponse<Airport[]>> {
    return RequestExecutor.get<Airport[]>("/api/config/airports");
  }

}
