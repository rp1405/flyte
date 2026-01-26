import Message from "@/db/models/Message";
import Room from "@/db/models/Room";
import { Q } from "@nozbe/watermelondb";
import { withObservables } from "@nozbe/watermelondb/react";
import { map } from "@nozbe/watermelondb/utils/rx";
import {
  Building2,
  Plane,
  PlaneLanding,
  PlaneTakeoff,
} from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { AppColors } from "../constants/colors"; // Ensure this path is correct

// 1. UPDATED PROPS: Expect the DB Models instead of plain JSON
export interface ChatItemProps {
  room: Room;
  latestMessage?: Message; // Injected by withObservables
  onPress: (room: Room) => void;
}

const ChatItem = ({ room, latestMessage, onPress }: ChatItemProps) => {
  // --- HELPER 1: Extract Data safely ---
  const title = room.name || "Unknown Room";
  const messageText = latestMessage ? latestMessage.text : "No messages yet";

  // Time Priority: Message Time -> Room Update Time -> Current Time
  // We use the timestamp number directly from the model
  const timeSource = latestMessage?.timestamp || room.updatedAt;
  const timeDisplay = timeSource
    ? new Date(timeSource).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  // --- HELPER 2: Icon Logic (Moved here to keep it self-contained) ---
  const renderAvatar = () => {
    // If it is a group (Room types usually map to groups in your logic)
    // You can adjust this condition if you have 'direct' types in your DB
    if (true) {
      const typeUpper = room.type?.toUpperCase();
      let iconConfig;

      switch (typeUpper) {
        case "SOURCE":
          iconConfig = {
            icon: PlaneTakeoff,
            bgColor: "bg-blue-900/30",
            color: AppColors.brand,
          };
          break;
        case "DESTINATION":
          iconConfig = {
            icon: PlaneLanding,
            bgColor: "bg-orange-900/30",
            color: "#f97316",
          };
          break;
        case "FLIGHT":
          iconConfig = {
            icon: Plane,
            bgColor: "bg-purple-900/30",
            color: "#9333ea",
          };
          break;
        default:
          iconConfig = {
            icon: Building2,
            bgColor: "bg-slate-800/30",
            color: AppColors.subtext,
          };
          break;
      }

      const Icon = iconConfig.icon;

      return (
        <View
          className={`w-14 h-14 ${iconConfig.bgColor} rounded-full items-center justify-center`}
        >
          <Icon color={iconConfig.color} size={24} />
        </View>
      );
    }
    // Fallback for direct messages (if you add avatarUrl to Room schema later)
    /* else {
      return (
        <Image
          source={{ uri: room.avatarUrl }} 
          className="w-14 h-14 rounded-full border border-border bg-surface"
        />
      );
    }
    */
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => onPress(room)}
      className="flex-row items-center p-4 border-b border-border/40 active:bg-surface"
    >
      {/* Left: Avatar */}
      {renderAvatar()}

      {/* Middle: Title and Last Message */}
      <View className="flex-1 ml-4 justify-center">
        <View className="flex-row justify-between items-baseline">
          <Text className="text-lg font-bold text-text mb-1" numberOfLines={1}>
            {title}
          </Text>
        </View>

        <Text className="text-base text-subtext font-normal" numberOfLines={1}>
          {messageText}
        </Text>
      </View>

      {/* Right: Time */}
      <View className="ml-2 items-end justify-center h-12 py-1">
        <Text className="text-xs text-subtext">{timeDisplay}</Text>
      </View>
    </TouchableOpacity>
  );
};
// 2. THE OBSERVABLE WRAPPER
const enhance = withObservables(["room"], ({ room }) => ({
  room: room.observe(),

  latestMessage: room.messages
    .extend(Q.sortBy("timestamp", Q.desc), Q.take(1))
    .observe()
    .pipe(
      // ✅ Use pipe to attach operators
      map((messages: Message[]) => messages[0]) // ✅ Use the imported map operator
    ),
}));

export default enhance(ChatItem);
