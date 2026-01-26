import { useNavigation } from "@react-navigation/native";
import { Edit3, Search, X } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/context/AuthContext";
import Room from "@/db/models/Room";
import { useChats } from "@/hooks/localDb/useChats"; // ✅ Importing the NEW hook
import ChatItem from "../components/ChatItem";
import { AppColors } from "../constants/colors";
// import { SyncService } from "../services/SyncService"; // ✅ You need to import your sync service

export default function ChatsScreen() {
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const [searchText, setSearchText] = useState("");

  // 1. Get Data from Local DB (Instant Load)
  const { rooms, isLoading } = useChats();

  // 2. Refresh = Trigger Background Sync
  //   const [refreshing, setRefreshing] = useState(false);

  //   const onRefresh = useCallback(async () => {
  //     setRefreshing(true);
  //     // Call your SyncService here to fetch latest from API and update DB
  //     await SyncService.sync();
  //     setRefreshing(false);
  //   }, []);

  // 4. Search Filter
  const filteredRooms = useMemo(() => {
    if (!searchText.trim()) return rooms;
    return rooms.filter((r) =>
      r.name.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [rooms, searchText]);

  // 5. Navigate
  const handleChatPress = (room: Room) => {
    navigation.navigate("ChatDetail", {
      roomId: room.id, // ✅ Pass ONLY the ID string
      userId: user?.id,
    });
  };

  // --- RENDERING ---

  // UI Transformer: Convert DB Model -> UI Prop
  const renderItem = ({ item }: { item: Room }) => {
    return <ChatItem room={item} onPress={handleChatPress} />;
  };

  if (isLoading && rooms.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color={AppColors.brand} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="px-6 py-4 bg-background border-b border-border flex-row justify-between items-center">
        <Text className="text-3xl font-bold text-text">Chats</Text>
        <TouchableOpacity className="w-10 h-10 bg-surface rounded-full items-center justify-center border border-border">
          <Edit3 color={AppColors.brand} size={20} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View className="px-4 py-3">
        <View className="flex-row items-center bg-surface px-4 py-3 rounded-xl border border-border">
          <Search color={AppColors.subtext} size={20} />
          <TextInput
            placeholder="Search rooms"
            placeholderTextColor={AppColors.subtext}
            value={searchText}
            onChangeText={setSearchText}
            className="flex-1 ml-3 text-text font-medium text-base p-0"
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText("")}>
              <X color={AppColors.subtext} size={20} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* List */}
      <FlatList
        data={filteredRooms}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        // refreshControl={
        //   <RefreshControl
        //     refreshing={refreshing}
        //     onRefresh={onRefresh}
        //     tintColor={AppColors.brand}
        //   />
        // }
        ListEmptyComponent={
          <View className="pt-20 items-center px-6">
            <Text className="text-text text-lg font-bold">No chats found</Text>
            <Text className="text-subtext text-center mt-2">
              Syncing might be in progress...
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
