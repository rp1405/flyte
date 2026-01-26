import { RouteProp, useNavigation } from "@react-navigation/native";
import { ChevronLeft, MoreVertical, Send } from "lucide-react-native";
import React, { useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppColors } from "../constants/colors";

// 1. WatermelonDB Imports
import { Q } from "@nozbe/watermelondb";
import { withObservables } from "@nozbe/watermelondb/react";
import { database } from "../db/index"; // Your DB Instance
import Message from "../db/models/Message"; // Your Message Model
import Room from "../db/models/Room"; // Your Room Model

import { useChatWebSocket } from "../hooks/useChatWebsocket";
import { BackendMessage } from "../types/message";

// Define the shape of your route params
type RootStackParamList = {
  ChatDetail: { roomId: string; userId: string };
};

interface ChatDetailProps {
  room: Room;
  messages: Message[];
  // Add route here so we can access userId inside the component
  route: RouteProp<RootStackParamList, "ChatDetail">;
}

// 3. The Component (Now simpler)
const ChatDetailScreen = ({ room, messages, route }: ChatDetailProps) => {
  const navigation = useNavigation();
  const [inputText, setInputText] = useState("");
  const userId = route.params.userId;

  // Helper for type checking
  const type = room.type;
  const title = room.name;

  // --- WEBSOCKET HANDLER ---
  // When a socket message comes, we SAVE IT TO DB.
  // The UI updates automatically because we are observing the DB.
  const onMessageReceived = async (backendMsg: BackendMessage) => {
    await database.write(async () => {
      const messagesCollection = database.get<Message>("messages");
      const roomsCollection = database.get<Room>("rooms");

      console.log("WebSocket: New message received", backendMsg);

      // 1. Save Message
      await messagesCollection.create((m) => {
        m._raw.id = backendMsg.id;
        m.text = backendMsg.messageText;
        m.timestamp = new Date(backendMsg.createdAt);
        m.senderId = backendMsg.user.id;
        m.senderName = backendMsg.user.name;
        m.room.id = room.id;
      });

      // 2. Update Room (for sorting in the list)
      const roomToUpdate = await roomsCollection.find(room.id);
      await roomToUpdate.update((r) => {
        // Ensure you convert to number if your schema uses number
        r.lastMessageTimestamp = new Date(backendMsg.createdAt);
      });
    });
  };

  const { sendMessage } = useChatWebSocket(room.id, userId, onMessageReceived);

  const handleSend = () => {
    const textToSend = inputText.trim();
    if (textToSend.length === 0) return;

    sendMessage(textToSend, userId, room.id);
    setInputText("");
    // Note: Ideally, you also optimistically write to DB here for instant UI
  };

  const renderMessageItem = ({
    item,
    index,
  }: {
    item: Message;
    index: number;
  }) => {
    const isMe = item.senderId === userId;
    // const isGroupChat = type === "SOURCE" || type === "DESTINATION" || type === "FLIGHT";

    // Since 'messages' is now a WatermelonDB object, accessing index + 1 is fine
    const nextMessage = messages[index + 1];
    const isSameSenderAsPrevious = nextMessage?.senderId === item.senderId;

    // Helper to format time from timestamp
    console.log("Message object:", item);
    const timeStr = new Date(item.timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

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
          {/* You can add Sender Name logic here if needed */}
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

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      {/* Header */}
      <View className="px-4 py-3 bg-background border-b border-border flex-row items-center z-10 shadow-sm">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="mr-3 p-1"
        >
          <ChevronLeft color={AppColors.text} size={28} />
        </TouchableOpacity>

        <View className="flex-1">
          <Text className="text-lg font-bold text-text" numberOfLines={1}>
            {title}
          </Text>
        </View>
        <TouchableOpacity>
          <MoreVertical color={AppColors.text} size={22} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
      >
        {/* LIST IS NOW DRIVEN BY DB PROPS */}
        <FlatList
          data={messages}
          renderItem={renderMessageItem}
          keyExtractor={(item) => item.id}
          inverted // WatermelonDB sorts Descending (Newest first), so Inverted puts Newest at bottom
          contentContainerStyle={{ paddingHorizontal: 0, paddingVertical: 16 }}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="on-drag"
        />

        {/* Input Area */}
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

const enhance = withObservables(["route"], ({ route }) => {
  const { roomId } = route.params;

  return {
    // ✅ Add <Room> here
    room: database.get<Room>("rooms").findAndObserve(roomId),

    // ✅ Add <Message> here (This fixes the "Model[] not assignable to Message[]" error)
    messages: database
      .get<Message>("messages")
      .query(Q.where("room_id", roomId), Q.sortBy("timestamp", Q.desc))
      .observe(),
  };
});

export default enhance(ChatDetailScreen);
