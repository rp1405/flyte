import {
  CreateJourneyRequestPayload,
  JourneyResponse,
} from "../models/journey";
import { RequestExecutor } from "./RequestExecutor";

const JOURNEYS_ENDPOINT = "/api/journeys/create";
const TEMP_TOKEN = process.env.EXPO_PUBLIC_TEMP_AUTH_TOKEN;

/**
 * Calls the backend API to create a new journey.
 * @param payload The journey data to send.
 * @returns The created journey data on success.
 * @throws Error if the request fails.
 */
export const createJourneyService = async (
  payload: CreateJourneyRequestPayload
): Promise<JourneyResponse> => {
  

  RequestExecutor.setAuthToken(TEMP_TOKEN);

  const apiResponse = await RequestExecutor.post<JourneyResponse>(
    JOURNEYS_ENDPOINT,
    payload 
  );

  if (!apiResponse.success) {
    throw new Error(
      apiResponse.error ||
        `Journey creation failed with status: ${apiResponse.status}`
    );
  }
  return apiResponse.data;
};
