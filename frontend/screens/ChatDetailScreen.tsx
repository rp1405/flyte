import { useNavigation, useRoute } from "@react-navigation/native";
import { ChevronLeft, MoreVertical, Send } from "lucide-react-native";
// ADDED: useCallback here
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppColors } from "../constants/colors";

import { useChatWebSocket } from "../hooks/useChatWebsocket";
import { fetchRoomMessagesService } from "../services/MessageService";
import { BackendMessage, UIMessage } from "../types/message";

const ChatDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const {
    roomId,
    title = "Chat",
    type = "group",
    avatarUrl,
    userId,
  } = route.params;

  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  // --- HELPERs (formatTime, mapBackendMessageToUI) UNCHANGED ---
  const formatTime = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return "";
    }
  };

  const mapBackendMessageToUI = useCallback(
    (backendMsg: BackendMessage): UIMessage => {
      return {
        id: backendMsg.id,
        text: backendMsg.messageText,
        senderId: backendMsg.user.id,
        senderName: backendMsg.user.name || "Unknown",
        timestamp: formatTime(backendMsg.createdAt),
      };
    },
    []
  );

  // --- 2. NEW: WebSocket Message Handler ---
  // This callback fires whenever a new message arrives over the socket.
  // We use useCallback so the hook dependency doesn't change unnecessarily.
  const onMessageReceived = useCallback(
    (backendMsg: BackendMessage) => {
      // Map the incoming real-time message to UI shape
      const newUIMsg = mapBackendMessageToUI(backendMsg);

      // Add to state.
      // Since FlatList is INVERTED, new messages go to the START of the array.
      setMessages((prevMessages) => {
        // Simple check to avoid duplicate keys if REST and WS overlap slightly
        if (prevMessages.some((m) => m.id === newUIMsg.id)) {
          return prevMessages;
        }
        return [newUIMsg, ...prevMessages];
      });
    },
    [mapBackendMessageToUI]
  );

  // --- 3. NEW: Initialize WebSocket Hook ---
  const { sendMessage } = useChatWebSocket(roomId, userId, onMessageReceived);

  // --- EFFECT: Fetch initial messages on mount (UNCHANGED) ---
  useEffect(() => {
    const loadMessages = async () => {
      if (!roomId) return;
      setIsLoading(true);
      try {
        const backendData = await fetchRoomMessagesService(roomId);
        const uiMessages = backendData.map(mapBackendMessageToUI);
        // Assuming backend returns oldest first.
        // Inverted list needs newest at index 0, so we REVERSE history.
        setMessages(uiMessages);
      } catch (error) {
        console.error("Failed to load chat history:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();
  }, [roomId, mapBackendMessageToUI]);

  // --- 4. UPDATED: Handle Send ---
  const handleSend = () => {
    const textToSend = inputText.trim();
    if (textToSend.length === 0) return;

    // --- WebSocket Implementation ---
    // Send the message over the socket.
    // We rely on the backend to broadcast it back to trigger onMessageReceived
    sendMessage(textToSend, userId, roomId);
    setInputText("");

    // Optional: If you want "optimistic updates" (show immediately before server confirms),
    // keep the previous logic here. But relying on the socket echo is safer to ensure consistency.
  };

  // --- RENDER (No changes below here) ---
  const renderMessageItem = ({
    item,
    index,
  }: {
    item: UIMessage;
    index: number;
  }) => {
    const isMe = item.senderId === userId;
    const isGroupChat = type === "group";

    // INVERTED LIST LOGIC:
    // The "next" message visually (below current) is actually at index + 1
    const nextMessage = messages[index + 1];
    const isSameSenderAsPrevious = nextMessage?.senderId === item.senderId;

    return (
      <View
        className={`my-1 px-4 w-full flex-row ${
          isMe ? "justify-end" : "justify-start"
        }`}
        style={{ marginTop: isSameSenderAsPrevious ? 4 : 12 }}
      >
        <View
          className={`max-w-[75%] rounded-2xl px-4 py-3 ${
            isMe
              ? "bg-brand rounded-tr-none"
              : "bg-surface border border-border rounded-tl-none"
          }`}
        >
          {!isMe && isGroupChat && !isSameSenderAsPrevious && (
            <Text className="text-brand font-bold text-xs mb-1">
              {item.senderName}
            </Text>
          )}

          <Text className={`text-base ${isMe ? "text-white" : "text-text"}`}>
            {item.text}
          </Text>

          <Text
            className={`text-[10px] text-right mt-1 ${
              isMe ? "text-white/70" : "text-subtext"
            }`}
          >
            {item.timestamp}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      {/* ... Header (Unchanged) ... */}
      <View className="px-4 py-3 bg-background border-b border-border flex-row items-center z-10 shadow-sm">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="mr-3 p-1"
        >
          <ChevronLeft color={AppColors.text} size={28} />
        </TouchableOpacity>

        {type === "direct" && avatarUrl && (
          <Image
            source={{ uri: avatarUrl }}
            className="w-8 h-8 rounded-full mr-3 border border-border"
          />
        )}

        <View className="flex-1">
          <Text className="text-lg font-bold text-text" numberOfLines={1}>
            {title}
          </Text>
          {type === "group" ? (
            <Text className="text-xs text-subtext">Group Chat</Text>
          ) : (
            <Text className="text-xs text-green-600">Online</Text>
          )}
        </View>

        <View className="flex-row gap-4">
          <TouchableOpacity>
            <MoreVertical color={AppColors.text} size={22} />
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
      >
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={AppColors.brand} />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessageItem}
            keyExtractor={(item) => item.id}
            inverted // KEEPING INVERTED AS PER YOUR CODE
            contentContainerStyle={{
              paddingHorizontal: 0,
              paddingVertical: 16,
            }}
            showsVerticalScrollIndicator={false}
            keyboardDismissMode="on-drag"
            ListEmptyComponent={
              <View className="flex-1 items-center justify-center pt-20 rotate-180">
                <Text className="text-subtext">No messages yet. Say hi!</Text>
              </View>
            }
          />
        )}

        {/* ... Input Area (Unchanged) ... */}
        <SafeAreaView
          edges={["bottom"]}
          className="bg-background border-t border-border p-3"
        >
          <View className="flex-row items-end bg-surface border border-border rounded-3xl pl-4 pr-2 py-2">
            <TextInput
              className="flex-1 text-text text-base max-h-32 pt-[10px] pb-[10px]"
              placeholder="Type a message..."
              placeholderTextColor={AppColors.subtext}
              multiline
              value={inputText}
              onChangeText={setInputText}
            />
            <TouchableOpacity
              onPress={handleSend}
              disabled={inputText.trim().length === 0}
              className={`w-10 h-10 rounded-full items-center justify-center ml-2 mb-[2px] ${
                inputText.trim().length > 0 ? "bg-brand" : "bg-border"
              }`}
            >
              <Send color="white" size={20} style={{ marginLeft: 2 }} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatDetailScreen;
