import { useAuth } from "@/context/AuthContext";
import { useNavigation } from "@react-navigation/native";
import {
  AlertCircle,
  Building2,
  Edit3,
  Plane,
  PlaneLanding,
  PlaneTakeoff,
  Search,
  X,
} from "lucide-react-native";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RootStackNavigationProp } from "../App";
import ChatItem, { ChatItemProps } from "../components/ChatItem";
import { AppColors } from "../constants/colors";
import { useChats } from "../hooks/useChats";
import { JourneyResponse, JourneyRoom } from "../types/journey";

type ChatItemData = ChatItemProps["item"];

export default function ChatsScreen() {
  const { user, isAuthLoading } = useAuth();
  const navigation = useNavigation<RootStackNavigationProp>();
  const [searchText, setSearchText] = useState<string>("");

  // --- 1. FETCH REAL DATA VIA HOOK ---
  if (!user) {
    Alert.alert("Error", "You must be logged in to access this page.");
    return;
  }
  const userId = user?.id;
  const { chats: rawJourneys, isLoading, error, refetch } = useChats(userId);

  // --- Helper: Determine Icon Config based on room type ---
  const getIconConfig = useCallback((roomType: string) => {
    // Normalize string just in case backend sends lowercase
    const typeUpper = roomType?.toUpperCase();
    switch (typeUpper) {
      case "SOURCE":
        return {
          icon: PlaneTakeoff, // Departure icon
          bgColorBg: "bg-blue-900/30",
          iconColorHex: AppColors.brand,
        };
      case "DESTINATION":
        return {
          icon: PlaneLanding, // Arrival icon
          bgColorBg: "bg-orange-900/30",
          iconColorHex: "#f97316", // Orange
        };
      case "FLIGHT":
        return {
          icon: Plane, // In-flight icon
          bgColorBg: "bg-purple-900/30",
          iconColorHex: "#9333ea", // Purple
        };
      default:
        return {
          icon: Building2, // Generic fallback
          bgColorBg: "bg-slate-800/30",
          iconColorHex: AppColors.subtext,
        };
    }
  }, []);

  // --- Helper: Simple time formatter ---
  const formatTimeStr = (isoString: string) => {
    try {
      if (!isoString) return "";
      const date = new Date(isoString);
      // Returns something like "10:45 AM" based on device locale
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return "";
    }
  };

  // --- 2. DATA TRANSFORMATION & DEDUPLICATION ---
  // Backend gives Journeys, UI needs distinct Rooms.
  const processedChats = useMemo(() => {
    const uiChats: ChatItemData[] = [];

    if (!rawJourneys || rawJourneys.length === 0) return [];

    // --- FIX: Create a Set to track IDs we have already seen ---
    const seenRoomIds = new Set<string>();
    const now = new Date(); // Get current time for expiry check

    console.log("Processing journeys:", rawJourneys.length);

    // Iterate through each journey
    rawJourneys.forEach((journey: JourneyResponse) => {
      // Collect the three nested room objects
      const roomsToProcess: (JourneyRoom | null)[] = [
        journey.sourceRoom,
        journey.destinationRoom,
        journey.flightRoom,
      ];

      roomsToProcess.forEach((room) => {
        // Safety check: ensure room exists and has an ID
        if (!room || !room.id) return;

        // --- NEW: Expiry Check ---
        // If the room has an expiryTime and it is in the past, skip it.
        if (room.expiryTime) {
          const expiryDate = new Date(room.expiryTime);
          if (expiryDate < now) {
            return; // Skip rendering this room
          }
        }

        // --- FIX: Check if we have already processed this room ID ---
        if (seenRoomIds.has(room.id)) {
          // If yes, skip it to avoid duplicate keys in FlatList
          return;
        }

        // --- FIX: Mark this ID as seen so we don't add it again ---
        seenRoomIds.add(room.id);

        // Add to UI list
        uiChats.push({
          id: room.id,
          type: "group", // All current backend rooms are groups
          title: room.name || "Unknown Room", // Use room name as title
          // Using the description as a placeholder for last message
          lastMessage: room.description
            ? room.description.substring(0, 35) +
              (room.description.length > 35 ? "..." : "")
            : "Tap to start chatting",
          time: formatTimeStr(room.updatedAt), // Use updatedAt for display
          unreadCount: 0, // Not in backend response yet
          // Generate icon based on type string (SOURCE, FLIGHT, etc.)
          groupIconConfig: getIconConfig(room.type),
        });
      });
    });

    // Optional: Sort by time (newest first) based on string comparison
    return uiChats.sort((a, b) => (a.time < b.time ? 1 : -1));
  }, [rawJourneys, getIconConfig]);

  // --- 3. SEARCH LOGIC (Applied to the processed list) ---
  const filteredChats = useMemo(() => {
    if (!searchText.trim()) {
      // Use the processed real data here
      return processedChats;
    }

    const lowerCaseQuery = searchText.toLowerCase().trim();

    return processedChats.filter((chat) => {
      return chat.title.toLowerCase().includes(lowerCaseQuery);
    });
  }, [searchText, processedChats]); // Depends on processedChats now

  const handleChatPress = (item: ChatItemData) => {
    navigation.navigate("ChatDetail", {
      roomId: item.id,
      title: item.title,
      type: item.type,
      avatarUrl: item.type === "direct" ? item.avatarUrl : undefined,
      userId: userId,
    });
  };

  // Handler for pull-to-refresh
  const onRefresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  // --- LOADING STATE ---
  // Show full-screen loading only on initial load if data is empty
  if (isLoading && processedChats.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color={AppColors.brand} />
        <Text className="text-subtext mt-4">Loading your chats...</Text>
      </SafeAreaView>
    );
  }

  // --- ERROR STATE ---
  if (error && processedChats.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center p-6">
        <AlertCircle color="#ef4444" size={48} style={{ marginBottom: 16 }} />
        <Text className="text-text text-xl font-bold mb-2">
          It's quiet here
        </Text>
        <Text className="text-subtext text-center mb-6">
          We couldn't load your chats. {error}
        </Text>
        <TouchableOpacity
          onPress={refetch}
          className="bg-brand px-6 py-3 rounded-xl"
        >
          <Text className="text-white font-semibold">Try Again</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // --- MAIN RENDER ---
  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* --- Header --- */}
      <View className="px-6 py-4 bg-background/95 z-10 flex-row justify-between items-center border-b border-border">
        <Text className="text-3xl font-bold text-text">Chats</Text>
        <TouchableOpacity className="w-10 h-10 bg-surface rounded-full items-center justify-center border border-border active:bg-border">
          <Edit3 color={AppColors.brand} size={20} />
        </TouchableOpacity>
      </View>

      {/* --- Search Bar --- */}
      <View className="px-4 py-3 bg-background">
        <View className="flex-row items-center bg-surface px-4 py-3 rounded-xl border border-border">
          <Search color={AppColors.subtext} size={20} />
          <TextInput
            placeholder="Search rooms"
            placeholderTextColor={AppColors.subtext}
            value={searchText}
            onChangeText={setSearchText}
            className={`flex-1 ml-3 text-text font-medium text-base p-0 ${
              searchText.length > 0 ? "pr-2" : ""
            }`}
          />
          {searchText.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchText("")}
              activeOpacity={0.7}
            >
              <X color={AppColors.subtext} size={20} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* --- Chat List --- */}
      <FlatList
        // Use the filtered, processed real data
        data={filteredChats}
        renderItem={({ item }) => (
          <ChatItem item={item} onPress={() => handleChatPress(item)} />
        )}
        // Key extractor uses the unique room ID
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        // Add Pull-to-Refresh
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={onRefresh}
            tintColor={AppColors.brand}
          />
        }
        ListEmptyComponent={
          <View className="pt-20 items-center px-6">
            <Text className="text-text text-lg font-bold mb-2">
              {searchText ? "No results found" : "No active chats"}
            </Text>
            <Text className="text-subtext text-center">
              {searchText
                ? `We couldn't find anything matching "${searchText}"`
                : "Create a journey on the home screen to join chat rooms!"}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
