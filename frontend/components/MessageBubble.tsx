import React, { memo } from "react";
import { Text, View } from "react-native";
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

  // Decide if we should show the name
  // 1. It must NOT be me (we don't show our own name)
  // 2. It must be a different sender than the message visually above it
  const showName = !isMe && !isSameSenderAsPrevious;
  //console.log("rendering")
  return (
    <View
      className={`w-full px-4 mb-2 flex-col ${
        isMe ? "items-end" : "items-start"
      }`}
      style={{ marginTop: isSameSenderAsPrevious ? 2 : 10 }}
    >
      {/* --- SENDER NAME LABEL --- */}
      {showName && (
        <Text className="text-xs text-subtext ml-1 mb-1 font-medium">
          {item.senderName || "Unknown"}
        </Text>
      )}

      {/* --- BUBBLE --- */}
      <View
        className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
          isMe
            ? "bg-brand rounded-tr-none self-end" // Your Bubble (Right)
            : "bg-surface border border-border rounded-tl-none self-start" // Their Bubble (Left)
        }`}
      >
        <Text
          className={`text-base leading-5 ${isMe ? "text-white" : "text-text"}`}
        >
          {item.text}
        </Text>

        <Text
          className={`text-[10px] text-right mt-1 ${
            isMe ? "text-white/70" : "text-subtext"
          }`}
        >
          {timeStr}
        </Text>
      </View>
    </View>
  );
};

// React.memo is crucial for performance in chat lists
export default memo(MessageBubble);
