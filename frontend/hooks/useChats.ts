import { useCallback, useState } from "react";
// 1. Add this import
import { useFocusEffect } from "@react-navigation/native";
import { fetchUserJourneysService } from "../services/ChatService";
import { JourneyResponse } from "../types/journey";

interface UseChatsResult {
  chats: JourneyResponse[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useChats = (userId: string | null): UseChatsResult => {
  const [chats, setChats] = useState<JourneyResponse[]>([]);
  // Initialize loading to false so it doesn't show loading before the first focus
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // The function that performs the actual fetching (Keep this as is)
  const loadChats = useCallback(async () => {
    // Don't fetch if we don't have a user ID yet
    if (!userId) {
      // No need to set isLoading false here if initialized to false
      return;
    }

    console.log("useChats hook: fetching data..."); // Debug log to verify it runs
    setIsLoading(true);
    setError(null);

    try {
      const fetchedJourneys = await fetchUserJourneysService(userId);
      setChats(fetchedJourneys);
    } catch (err: any) {
      console.error("Error in useChats hook:", err);
      setError(err.message || "Failed to load chats.");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // --- REPLACED useEffect WITH useFocusEffect ---

  // This will run every time the screen using this hook comes into focus.
  useFocusEffect(
    useCallback(() => {
      loadChats();
    }, [loadChats]) // Dependency ensures it uses the latest version of loadChats
  );

  return { chats, isLoading, error, refetch: loadChats };
};
