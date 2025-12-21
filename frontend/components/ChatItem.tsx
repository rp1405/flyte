import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
// AppColors might still be needed by the avatar rendering if it uses brand colors
// import { AppColors } from "../constants/colors";

// Define the shape of the data this component expects.
export interface ChatItemProps {
  item: {
    id: string;
    type: "group" | "direct";
    title: string;
    lastMessage: string;
    time: string;
    // We keep unreadCount in the interface so the parent doesn't break,
    // but we no longer use it in the rendering below.
    unreadCount: number;
    avatarUrl?: string;
    groupIconConfig?: {
      icon: React.ElementType;
      bgColorBg: string;
      iconColorHex: string;
    };
  };
  // Standard prop for handling taps on list items
  onPress: () => void;
}

const ChatItem = ({ item, onPress }: ChatItemProps) => {

    const renderAvatar = () => {
    if (item.type === "group" && item.groupIconConfig) {
      const Icon = item.groupIconConfig.icon;
      return (
        <View
          className={`w-14 h-14 ${item.groupIconConfig.bgColorBg} rounded-full items-center justify-center`}
        >
          <Icon color={item.groupIconConfig.iconColorHex} size={24} />
        </View>
      );
    } else {
      return (
        <Image
          source={{ uri: item.avatarUrl }}
          className="w-14 h-14 rounded-full border border-border bg-surface"
        />
      );
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      className="flex-row items-center p-4 border-b border-border/40 active:bg-surface"
    >
      {/* Left: Avatar */}
      {renderAvatar()}

      {/* Middle: Title and Last Message */}
      <View className="flex-1 ml-4 justify-center">
        <View className="flex-row justify-between items-baseline">
          <Text className="text-lg font-bold text-text mb-1" numberOfLines={1}>
            {item.title}
          </Text>
        </View>

        {/* UPDATED: Removed conditional styling based on unreadCount */}
        <Text className="text-base text-subtext font-normal" numberOfLines={1}>
          {/* UPDATED: Removed conditional "New:" prefix */}
          {item.lastMessage}
        </Text>
      </View>

      {/* Right: Time */}
      {/* UPDATED: Changed justify-between to justify-center so time centers vertically now that the badge is gone */}
      <View className="ml-2 items-end justify-center h-12 py-1">
        {/* UPDATED: Removed conditional styling based on unreadCount */}
        <Text className="text-xs text-subtext">{item.time}</Text>

        {/* UPDATED: Removed the entire unread badge condition block here */}
      </View>
    </TouchableOpacity>
  );
};

export default ChatItem;
