import { useAuth } from "@/context/AuthContext";
import { withObservables } from "@nozbe/watermelondb/react";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  Bell,
  ChevronLeft,
  Clock,
  LogOut,
  MoreVertical,
  Search,
  User as UserIcon,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { JourneyUser } from "@/types/journey";
import { RootStackParamList } from "../App"; // Import the RootStackParamList for type safety
import { RoomAvatar } from "../components/RoomAvatar";
import { AppColors } from "../constants/colors";
import { database } from "../db";
import Room from "../db/models/Room";
import { RoomService } from "../services/RoomService"; // Ensure UserDTO is exported from Service
import UserProfileScreen from "./UserProfileScreen";

interface GroupInfoScreenProps {
  room: Room;
}

const GroupInfoScreen = ({ room }: GroupInfoScreenProps) => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user: currentUser } = useAuth();

  // 1. STATE FOR PARTICIPANTS
  const [participants, setParticipants] = useState<JourneyUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Helper: Format Date
  const createdDate = room.createdAt
    ? new Date(room.createdAt).toLocaleDateString()
    : "Unknown";

  const expiryDate = room.expiryTime
    ? new Date(room.expiryTime).toLocaleDateString() +
      " " +
      new Date(room.expiryTime).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Never";

  // 2. FETCH DATA
  useEffect(() => {
    let isMounted = true;

    const fetchParticipants = async () => {
      try {
        setIsLoading(true);
        // This calls API -> Updates DB -> Returns List
        const data = await RoomService.getParticipants(room.id);

        if (isMounted) {
          setParticipants(data);
        }
      } catch (err) {
        console.error("Failed to sync participants:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchParticipants();

    return () => {
      isMounted = false;
    };
  }, [room.id]);

  // --- RENDER HEADER ---
  const renderHeader = () => (
    <View className="px-4 py-3 bg-background flex-row justify-between items-center z-10">
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        className="p-2 -ml-2 rounded-full active:bg-surface"
      >
        <ChevronLeft color={AppColors.text} size={28} />
      </TouchableOpacity>
      <Text className="text-lg font-bold text-text">Group Info</Text>
      <TouchableOpacity className="p-2 -mr-2">
        <MoreVertical color={AppColors.text} size={24} />
      </TouchableOpacity>
    </View>
  );

  const renderParticipant = ({ item }: { item: JourneyUser }) => (
    <TouchableOpacity
      key={item.id}
      onPress={() => navigation.navigate("UserProfile", { user: item })}
      className="flex-row items-center justify-between py-3 border-b border-border/40 active:bg-surface"
    >
      <View className="flex-row items-center">
        {/* Avatar */}
        <View className="w-10 h-10 bg-surface border border-border rounded-full items-center justify-center mr-3 overflow-hidden">
          {item.profilePictureUrl ? (
            // Replace with <Image source={{ uri: item.profilePictureUrl }} /> if you have one
            <View className="w-full h-full bg-brand/20 items-center justify-center">
              <Text className="text-brand font-bold text-sm">
                {item.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          ) : (
            <UserIcon color={AppColors.subtext} size={20} />
          )}
        </View>

        {/* Name */}
        <View>
          <Text className="text-text font-medium text-base">{item.name}</Text>
          {item.nickname && (
            <Text className="text-subtext text-xs">@{item.nickname}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  if (room.type?.toLowerCase() === "dm") {
    if (isLoading) {
      return (
        <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
          {renderHeader()}
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color={AppColors.brand} size="large" />
          </View>
        </SafeAreaView>
      );
    }
    const otherUser = participants.find((p) => p.id !== currentUser?.id);
    if (otherUser) {
      return <UserProfileScreen user={otherUser} />;
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      {renderHeader()}

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* 1. HERO SECTION */}
        <View className="items-center py-6 border-b border-border/50 bg-surface/30">
          <RoomAvatar type={room.type} size="xl" className="mb-4" />

          <Text className="text-2xl font-bold text-text text-center px-6">
            {room.name}
          </Text>

          <Text className="text-subtext mt-1 text-base capitalize">
            {room.type?.toLowerCase() || "Group"} • {participants.length}{" "}
            participants
          </Text>
        </View>

        {/* 2. DESCRIPTION & METADATA */}
        <View className="px-6 py-6 border-b border-border/50">
          <Text className="text-subtext text-xs font-bold uppercase mb-2 tracking-wider">
            Description
          </Text>
          <Text className="text-text text-base leading-6 mb-4">
            {room.description || "No description provided for this group."}
          </Text>

          <View className="flex-row mt-2">
            <View className="flex-1 bg-surface p-3 rounded-lg mr-2 border border-border">
              <Text className="text-subtext text-xs mb-1">Created</Text>
              <View className="flex-row items-center">
                <Clock
                  size={14}
                  color={AppColors.subtext}
                  style={{ marginRight: 4 }}
                />
                <Text className="text-text font-medium">{createdDate}</Text>
              </View>
            </View>
            <View className="flex-1 bg-surface p-3 rounded-lg ml-2 border border-border">
              <Text className="text-subtext text-xs mb-1">Expires</Text>
              <View className="flex-row items-center">
                <Bell
                  size={14}
                  color={AppColors.subtext}
                  style={{ marginRight: 4 }}
                />
                <Text className="text-text font-medium">{expiryDate}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 3. PARTICIPANTS LIST */}
        <View className="px-6 py-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-subtext text-xs font-bold uppercase tracking-wider">
              {participants.length} Participants
            </Text>
            <TouchableOpacity>
              <Search size={20} color={AppColors.brand} />
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <ActivityIndicator size="small" color={AppColors.brand} />
          ) : (
            participants.map((user) => (
              <View key={user.id}>{renderParticipant({ item: user })}</View>
            ))
          )}

          {!isLoading && participants.length === 0 && (
            <Text className="text-subtext text-center py-4">
              No participants found.
            </Text>
          )}
        </View>

        {/* 4. ACTIONS */}
        <View className="px-6 pb-10 mt-4">
          <TouchableOpacity className="flex-row items-center justify-center bg-red-500/10 py-4 rounded-xl border border-red-500/20">
            <LogOut color="#ef4444" size={20} style={{ marginRight: 8 }} />
            <Text className="text-red-500 font-bold text-base">Exit Group</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const enhance = withObservables(["route"], ({ route }) => {
  const { roomId } = route.params;
  return {
    room: database.get<Room>("rooms").findAndObserve(roomId),
  };
});

export default enhance(GroupInfoScreen);
