import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, Send, MoreVertical, Phone } from "lucide-react-native";
import { AppColors } from "../constants/colors";
// IMPORTANT: If you are using React Navigation, you need these types for props
// If not using TS with navigation, you can remove the generic types <any, any>
// import { NativeStackScreenProps } from "@react-navigation/native-stack";

// --- 1. Define Data Models ---

// Define what info this screen expects to receive upon navigation
// In a real app, define this in your Navigation types file
type RootStackParamList = {
  ChatDetail: {
    chatId: string;
    title: string;
    type: "group" | "direct";
    avatarUrl?: string; // Optional for direct chats
  };
};

// Types for props if using React Navigation + TypeScript
// type Props = NativeStackScreenProps<RootStackParamList, 'ChatDetail'>;

// The shape of a single message
interface Message {
  id: string;
  text: string;
  senderId: string; // We'll use 'me' to identify current user
  senderName?: string; // Needed for groups to show who sent it
  timestamp: string;
}

// --- 2. Dummy Data (Inverted order for chat) ---
// Newest messages at array index 0 because the list will be inverted
const DUMMY_MESSAGES: Message[] = [
  {
    id: "m1",
    text: "Sounds good, see you there!",
    senderId: "me",
    timestamp: "12:35 PM",
  },
  {
    id: "m2",
    text: "I'm at security now, it's moving okay.",
    senderId: "user_sarah",
    senderName: "Sarah",
    timestamp: "12:33 PM",
  },
  {
    id: "m3",
    text: "Has anyone passed security yet? The line looks long.",
    senderId: "user_raj",
    senderName: "Raj",
    timestamp: "12:30 PM",
  },
  {
    id: "m4",
    text: "Hey everyone! Are we still meeting at Gate A12?",
    senderId: "me",
    timestamp: "12:28 PM",
  },
  // Add older messages to test scrolling...
  {
    id: "m5",
    text: "Got my boarding pass.",
    senderId: "user_sarah",
    senderName: "Sarah",
    timestamp: "12:15 PM",
  },
];

// --- The Main Component ---
// If using navigation types, change props to: ({ route, navigation }: Props)
const ChatDetailScreen = ({ route, navigation }: any) => {
  // Get params passed from the previous screen
  // Use fallback values to prevent crashes during testing if nav isn't linked yet
  const { title = "Chat", type = "direct", avatarUrl } = route?.params || {};

  const [inputText, setInputText] = useState("");
  // In a real app, you'd load messages from backend here
  const [messages, setMessages] = useState<Message[]>(DUMMY_MESSAGES);
  const flatListRef = useRef<FlatList>(null);

  // Hardcoded ID for the current user for styling purposes
  const CURRENT_USER_ID = "me";

  const handleSend = () => {
    if (inputText.trim().length === 0) return;

    const newMessage: Message = {
      id: Date.now().toString(), // Unique ID based on time
      text: inputText.trim(),
      senderId: CURRENT_USER_ID,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    // Add new message to start of array (because list is inverted)
    setMessages((prevMessages) => [newMessage, ...prevMessages]);
    setInputText("");

    // Optional: Scroll to bottom (which is index 0 in inverted list)
    // flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  // --- 4. Message Bubble Renderer ---
  const renderMessageItem = ({
    item,
    index,
  }: {
    item: Message;
    index: number;
  }) => {
    const isMe = item.senderId === CURRENT_USER_ID;
    const isGroupChat = type === "group";

    // Check if the previous message (next in inverted array) was from the same sender
    // to group messages visually
    const nextMessage = messages[index + 1];
    const isSameSenderAsPrevious = nextMessage?.senderId === item.senderId;

    return (
      <View
        className={`my-1 px-4 w-full flex-row ${
          isMe ? "justify-end" : "justify-start"
        }`}
        // Add extra top margin if the sender changed
        style={{ marginTop: isSameSenderAsPrevious ? 4 : 12 }}
      >
        {/* Message Content Container */}
        <View
          className={`max-w-[75%] rounded-2xl px-4 py-3 ${
            isMe
              ? "bg-brand rounded-tr-none" // My messages: Brand color, pointy top-right
              : "bg-surface border border-border rounded-tl-none" // Others: Gray, pointy top-left
          }`}
        >
          {/* Show sender name in groups if it's not me and first in block */}
          {!isMe && isGroupChat && !isSameSenderAsPrevious && (
            <Text className="text-brand font-bold text-xs mb-1">
              {item.senderName}
            </Text>
          )}

          <Text className={`text-base ${isMe ? "text-white" : "text-text"}`}>
            {item.text}
          </Text>

          {/* Timestamp tucked into the bottom right of bubble */}
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
    // SafeAreaView ensures header doesn't hit notch.
    // edges=['top'] ensures bottom safe area (iPhone home bar) is handled by the input container below.
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      {/* --- Header --- */}
      <View className="px-4 py-3 bg-background border-b border-border flex-row items-center z-10 shadow-sm">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="mr-3 p-1"
        >
          <ChevronLeft color={AppColors.text} size={28} />
        </TouchableOpacity>

        {/* Header Avatar (for direct chats) */}
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
            <Text className="text-xs text-subtext">24 members</Text>
          ) : (
            <Text className="text-xs text-green-600">Online</Text>
          )}
        </View>

        {/* Header Actions */}
        <View className="flex-row gap-4">
          {/* {type === "direct" && (
            <TouchableOpacity>
              <Phone color={AppColors.brand} size={22} />
            </TouchableOpacity>
          )} */}
          <TouchableOpacity>
            <MoreVertical color={AppColors.text} size={22} />
          </TouchableOpacity>
        </View>
      </View>

      {/* --- Keyboard Handling Wrapper --- */}
      {/* 'padding' behavior on iOS pushes the view up. Android handles it natively. */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
        // keyboardVerticalOffset accounts for header height on iOS if needed
        keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
      >
        {/* --- Message List --- */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessageItem}
          keyExtractor={(item) => item.id}
          // INVERTED is crucial for chat behavior (starts from bottom)
          inverted
          contentContainerStyle={{
            paddingHorizontal: 0,
            paddingVertical: 16,
          }}
          showsVerticalScrollIndicator={false}
          // Dismiss keyboard when dragging the list
          keyboardDismissMode="on-drag"
        />

        {/* --- Input Area --- */}
        {/* Using SafeAreaView edges=['bottom'] here ensures iPhone home bar padding */}
        <SafeAreaView
          edges={["bottom"]}
          className="bg-background border-t border-border p-3"
        >
          <View className="flex-row items-end bg-surface border border-border rounded-3xl pl-4 pr-2 py-2">
            <TextInput
              className="flex-1 text-text text-base max-h-32 pt-[10px] pb-[10px]" // pt/pb for centering vertically
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
              <Send
                color="white"
                size={20}
                // Slight offset for visual centering of the send icon
                style={{ marginLeft: 2 }}
              />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatDetailScreen;
