import { RequestExecutor } from "./RequestExecutor";
// Import the model definition for the response
import { JourneyResponse } from "../types/journey";

// Define the endpoint relative to the base URL.
// Assuming your JourneyController still has @RequestMapping("/api/journeys") at the class level.
const GET_USER_JOURNEYS_ENDPOINT = "/api/journeys/getJourney/user";

/**
 * Fetches all active journeys (chat rooms) for a specific user.
 *
 * @param userId - The UUID of the user to fetch journeys for.
 * @returns A promise resolving to an array of JourneyResponse objects.
 * @throws Error if the API call fails.
 */
export const fetchUserJourneysService = async (
  userId: string
): Promise<JourneyResponse[]> => {
  try {
    console.log(`Fetching journeys for user: ${userId}`);

    // We use RequestExecutor.get.
    // We specify <JourneyResponse[]> (Note the array []) as the generic type.
    const apiResponse = await RequestExecutor.get<JourneyResponse[]>(
      GET_USER_JOURNEYS_ENDPOINT,
      {
        // Axios requires query parameters to be passed in a 'params' object.
        // The key 'id' must match the backend's @RequestParam name.
        params: {
          id: userId,
        },
      }
    );

    // Standard success check
    if (!apiResponse.success) {
      console.error("Failed to fetch user journeys:", apiResponse.error);
      throw new Error(
        apiResponse.error ||
          `Failed to fetch chats (Status: ${apiResponse.status})`
      );
    }

    // Return the array of journeys
    return apiResponse.data;
  } catch (error) {
    // Re-throw error for the UI layer to handle
    throw error;
  }
};
