import React, { memo } from "react";
import { View, Text } from "react-native";
import Message from "../db/models/Message";

interface MessageBubbleProps {
  item: Message;
  isMe: boolean;
  isSameSenderAsPrevious: boolean;
}

const MessageBubble = ({
  item,
  isMe,
  isSameSenderAsPrevious,
}: MessageBubbleProps) => {
  const timeStr = new Date(item.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  console.log("Rendering MessageBubble:");

  return (
    <View
      className={`my-1 px-4 w-full flex-row ${isMe ? "justify-end" : "justify-start"}`}
      style={{ marginTop: isSameSenderAsPrevious ? 4 : 12 }}
    >
      <View
        className={`max-w-[75%] rounded-2xl px-4 py-3 ${
          isMe
            ? "bg-brand rounded-tr-none"
            : "bg-surface border border-border rounded-tl-none"
        }`}
      >
        <Text className={`text-base ${isMe ? "text-white" : "text-text"}`}>
          {item.text}
        </Text>
        <Text
          className={`text-[10px] text-right mt-1 ${isMe ? "text-white/70" : "text-subtext"}`}
        >
          {timeStr}
        </Text>
      </View>
    </View>
  );
};

// React.memo prevents re-renders if props (item, isMe, etc) haven't changed
export default memo(MessageBubble);
