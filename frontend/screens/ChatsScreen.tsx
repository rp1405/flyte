// Added useMemo here
import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
// Added X icon here for clearing search
import { Search, Edit3, PlaneTakeoff, Building2, X } from "lucide-react-native";
import { AppColors } from "../constants/colors";
import ChatItem, { ChatItemProps } from "../components/ChatItem";

import { useNavigation } from "@react-navigation/native";
// Import the types we defined in App.tsx. Adjust path if needed, e.g., "../../App"
import { RootStackNavigationProp } from "../App";

// We can reuse the props interface from the child component for our data type here
type ChatItemData = ChatItemProps["item"];

// --- Dummy Data (Unchanged) ---
const DUMMY_CHATS: ChatItemData[] = [
  {
    id: "1",
    type: "group",
    title: "Flight BA 149",
    lastMessage: "Sarah: Has anyone passed security yet? The line is...",
    time: "12:30 PM",
    unreadCount: 5,
    groupIconConfig: {
      icon: PlaneTakeoff,
      bgColorBg: "bg-blue-900/30",
      iconColorHex: AppColors.brand,
    },
  },
  {
    id: "2",
    type: "group",
    title: "Mumbai Int. Airport (BOM)",
    lastMessage: "Raj: Taxi sharing to Andheri? Looking for 2 more.",
    time: "11:45 AM",
    unreadCount: 2,
    groupIconConfig: {
      icon: Building2,
      bgColorBg: "bg-orange-900/30",
      iconColorHex: "#f97316", // Orange hex
    },
  },
  {
    id: "3",
    type: "direct",
    title: "Alex Chen",
    lastMessage: "Yeah, I'll meet you at Gate A12 in 10 mins.",
    time: "Yesterday",
    unreadCount: 0,
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/png?seed=Alex",
  },
  {
    id: "4",
    type: "direct",
    title: "Maria Rodriguez",
    lastMessage: "Safe flight! Let me know when you land.",
    time: "Mon",
    unreadCount: 0,
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/png?seed=Maria",
  },
  {
    id: "5",
    type: "group",
    title: "London Heathrow (LHR)",
    lastMessage: "System: Welcome to the LHR public chat room.",
    time: "Mon",
    unreadCount: 0,
    groupIconConfig: {
      icon: Building2,
      bgColorBg: "bg-slate-800/30",
      iconColorHex: AppColors.subtext,
    },
  },
];

export default function ChatsScreen() {

  const navigation = useNavigation<RootStackNavigationProp>();

  const [searchText, setSearchText] = useState<string>("");

  // --- SEARCH LOGIC ---
  // useMemo ensures filtering only runs when searchText changes
  const filteredChats = useMemo(() => {
    // 1. If search is empty, return the original list for efficiency
    if (!searchText.trim()) {
      return DUMMY_CHATS;
    }

    const lowerCaseQuery = searchText.toLowerCase().trim();

    // 2. Filter the list
    return DUMMY_CHATS.filter((chat) => {
      // Perform case-insensitive match on the title
      return chat.title.toLowerCase().includes(lowerCaseQuery);
      // Note: If you wanted to search messages too, you'd add:
      // || chat.lastMessage.toLowerCase().includes(lowerCaseQuery)
    });
  }, [searchText]); // Dependency array: only rerun if this changes

  const handleChatPress = (item: ChatItemData) => {
    // --- 3. PERFORM NAVIGATION ---
    // Because this screen is defined in the RootStack in App.tsx,
    // navigating to it pushes it over the tab bar.
    navigation.navigate("ChatDetail", {
      chatId: item.id,
      title: item.title,
      type: item.type,
      avatarUrl: item.type === "direct" ? item.avatarUrl : undefined,
    });
  };

  // --- Main Component Return ---
  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* --- Header --- */}
      <View className="px-6 py-4 bg-background/95 z-10 flex-row justify-between items-center border-b border-border">
        <Text className="text-3xl font-bold text-text">Chats</Text>
        <TouchableOpacity className="w-10 h-10 bg-surface rounded-full items-center justify-center border border-border active:bg-border">
          <Edit3 color={AppColors.brand} size={20} />
        </TouchableOpacity>
      </View>

      {/* --- Search Bar Content Header --- */}
      <View className="px-4 py-3 bg-background">
        <View className="flex-row items-center bg-surface px-4 py-3 rounded-xl border border-border">
          <Search color={AppColors.subtext} size={20} />
          <TextInput
            placeholder="Search groups or messages"
            placeholderTextColor={AppColors.subtext}
            value={searchText}
            onChangeText={setSearchText}
            // Added pr-8 (padding right) to make space for the clear button if text exists
            className={`flex-1 ml-3 text-text font-medium text-base p-0 ${
              searchText.length > 0 ? "pr-2" : ""
            }`}
          />
          {/* Clear Search Button - appears only when text is typed */}
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
        // UPDATED: Use the filtered list here instead of DUMMY_CHATS
        data={filteredChats}
        renderItem={({ item }) => (
          <ChatItem item={item} onPress={() => handleChatPress(item)} />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        // Added empty state feedback
        ListEmptyComponent={
          <View className="pt-10 items-center">
            <Text className="text-subtext text-lg font-medium">
              No chats found
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
