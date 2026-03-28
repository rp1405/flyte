import { RouteProp, useNavigation } from "@react-navigation/native";
import { ChevronLeft, MoreVertical, Send } from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
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
import { useAuth } from "../context/AuthContext";

// WatermelonDB Imports
import { Q } from "@nozbe/watermelondb";
import { withObservables } from "@nozbe/watermelondb/react";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ConnectionStatusBanner } from "../components/ConnectionStatusBanner";
import MessageBubble from "../components/MessageBubble";
import { RoomAvatar } from "../components/RoomAvatar";
import { database } from "../db/index";
import Message from "../db/models/Message";
import Room from "../db/models/Room";
import { useChatWebSocket } from "../hooks/useChatWebsocket";
import {
    ConnectionStatus,
    DirectMessageService,
} from "../services/DirectMessageService";
import { BackendMessage } from "../types/message";

type RootStackParamList = {
  ChatDetail: { roomId: string; userId: string };
  GroupInfo: { roomId: string };
};

interface ChatDetailProps {
  room: Room;
  messages: Message[];
  route: RouteProp<RootStackParamList, "ChatDetail">;
}

const ChatDetailScreen = ({ room, messages, route }: ChatDetailProps) => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [inputText, setInputText] = useState("");
  const userId = route.params.userId;
  const { user: currentUser } = useAuth();

  const [dmStatus, setDmStatus] = useState<ConnectionStatus>("CONNECTED");
  const [isActionLoading, setIsActionLoading] = useState(false);

  useEffect(() => {
    if (room.type?.toLowerCase() === "dm" || room.type === "direct") {
      fetchDmStatus();
    }
    // Reset unread count when entering the room
    if (room.unreadCount > 0) {
      database.write(async () => {
        await room.update((r) => {
          r.unreadCount = 0;
        });
      });
    }
  }, [room.id, room.unreadCount]);

  const fetchDmStatus = async () => {
    try {
      const status = await DirectMessageService.getDMStatus(room.id, userId);
      setDmStatus(status);
    } catch (error) {
      console.error("Failed to fetch DM status", error);
    }
  };

  const handleAccept = async () => {
    setIsActionLoading(true);
    try {
      await DirectMessageService.acceptDMRequest(room.id, userId);
      setDmStatus("CONNECTED");
    } catch (error) {
      console.error("Failed to accept DM request", error);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleReject = async () => {
    setIsActionLoading(true);
    try {
      await DirectMessageService.rejectDMRequest(room.id, userId);
      navigation.goBack();
    } catch (error) {
      console.error("Failed to reject DM request", error);
    } finally {
      setIsActionLoading(false);
    }
  };

  const title = room.name;

  // --- WEBSOCKET HANDLER ---
  const onMessageReceived = async (backendMsg: BackendMessage) => {
    await database.write(async () => {
      const messagesCollection = database.get<Message>("messages");
      const roomsCollection = database.get<Room>("rooms");

      await messagesCollection.create((m) => {
        m._raw.id = backendMsg.id;
        m.text = backendMsg.messageText;
        m.timestamp = new Date(backendMsg.createdAt);
        m.senderId = backendMsg.user.id;
        m.senderName = backendMsg.user.name;
        m.room.id = room.id;
      });

      const roomToUpdate = await roomsCollection.find(room.id);
      await roomToUpdate.update((r) => {
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
  };

  const renderMessageItem = useCallback(
    ({ item, index }: { item: Message; index: number }) => {
      const isMe = item.senderId === userId;
      const nextMessage = messages[index + 1];
      const isSameSenderAsPrevious = nextMessage?.senderId === item.senderId;

      return (
        <MessageBubble
          item={item}
          isMe={isMe}
          isSameSenderAsPrevious={isSameSenderAsPrevious}
        />
      );
    },
    [messages, userId],
  );

  //console.log("Render")

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      {/* --- 2. UPDATED HEADER --- */}
      <View className="px-4 py-3 bg-background border-b border-border flex-row items-center z-10">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="mr-3 p-1"
        >
          <ChevronLeft color={AppColors.text} size={28} />
        </TouchableOpacity>

        <RoomAvatar
          type={room.type}
          imageUrl={room.avatarUrl}
          size="sm"
          className="mr-3"
        />

        <View className="flex-1">
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("GroupInfo", { roomId: room.id })
            }
            className="flex-1"
          >
            <Text
              className="text-lg font-bold text-text mt-1"
              numberOfLines={1}
            >
              {title}
            </Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity>
          <MoreVertical color={AppColors.text} size={22} />
        </TouchableOpacity>
      </View>

      {room.type?.toLowerCase() === "dm" && dmStatus !== "CONNECTED" && (
        <ConnectionStatusBanner
          status={dmStatus}
          targetUserName={room.name}
          onAccept={handleAccept}
          onReject={handleReject}
          isActionLoading={isActionLoading}
        />
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
      >
        <FlatList
          data={messages}
          renderItem={renderMessageItem}
          keyExtractor={(item) => item.id}
          inverted
          contentContainerStyle={{ paddingHorizontal: 0, paddingVertical: 16 }}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="on-drag"
        />

        <SafeAreaView
          edges={["bottom"]}
          className="bg-background border-t border-border p-3"
        >
          <View className="flex-row items-end bg-surface border border-border rounded-3xl pl-4 pr-2 py-2">
            <TextInput
              className="flex-1 text-text text-base max-h-32 pt-[10px] pb-[10px]"
              placeholder={
                dmStatus === "CONNECTED"
                  ? "Type a message..."
                  : "Connecting..."
              }
              placeholderTextColor={AppColors.subtext}
              multiline
              value={inputText}
              onChangeText={setInputText}
              editable={dmStatus === "CONNECTED"}
            />
            <TouchableOpacity
              onPress={handleSend}
              disabled={inputText.trim().length === 0 || dmStatus !== "CONNECTED"}
              className={`w-10 h-10 rounded-full items-center justify-center ml-2 mb-[2px] ${
                inputText.trim().length > 0 && dmStatus === "CONNECTED"
                  ? "bg-brand"
                  : "bg-border"
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
    room: database.get<Room>("rooms").findAndObserve(roomId),
    messages: database
      .get<Message>("messages")
      .query(Q.where("room_id", roomId), Q.sortBy("timestamp", Q.desc))
      .observe(),
  };
});

export default enhance(ChatDetailScreen);
