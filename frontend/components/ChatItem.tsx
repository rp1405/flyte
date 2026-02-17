import Message from "@/db/models/Message";
import Room from "@/db/models/Room";
import { Q } from "@nozbe/watermelondb";
import { withObservables } from "@nozbe/watermelondb/react";
import { map } from "@nozbe/watermelondb/utils/rx";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { RoomAvatar } from "./RoomAvatar"; // Import the new RoomAvatar component

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

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => onPress(room)}
      className="flex-row items-center p-4 border-b border-border/40 active:bg-surface"
    >
      {/* Left: Avatar */}
      <RoomAvatar type={room.type} size="sm" className="" />

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
      map((messages: Message[]) => messages[0]), // ✅ Use the imported map operator
    ),
}));

export default enhance(ChatItem);
