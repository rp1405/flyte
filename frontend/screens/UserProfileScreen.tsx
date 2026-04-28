import { useAuth } from "@/context/AuthContext";
import { JourneyUser } from "@/types/journey";
import { RouteProp, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  ChevronLeft,
  Mail,
  MessageSquare,
  MoreVertical,
  Phone,
  User as UserIcon,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RootStackParamList } from "../App"; // Import your types
import { AppColors } from "../constants/colors";
import { DirectMessageService } from "../services/DirectMessageService";

type UserProfileScreenRouteProp = RouteProp<RootStackParamList, "UserProfile">;

interface Props {
  route?: UserProfileScreenRouteProp;
  user?: JourneyUser;
}

const UserProfileScreen = ({ route, user: propUser }: Props) => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  // ALL hooks must be called before any conditional returns (Rules of Hooks)
  const { user: currentUser } = useAuth();
  const [isCreatingDM, setIsCreatingDM] = useState(false);

  const user = propUser || route?.params?.user;

  if (!user) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator color={AppColors.brand} />
      </View>
    );
  }

  const joinedDate = new Date(user.createdAt).toLocaleDateString();

  const handleMessagePress = async () => {
    if (!currentUser) return;

    if(currentUser.id == user.id)
      return;

    setIsCreatingDM(true);
    try {

      // find or create via API
      const room = await DirectMessageService.findOrCreateDM(
        user.id, // Target (The profile you are viewing)
        currentUser.id, // Requester (You)
      );

      // 2. Navigate to Chat Detail with the new Room ID
      navigation.navigate("ChatDetail", {
        roomId: room.id,
        userId: currentUser.id,
      });
    } catch (error) {
      console.error("Failed to start DM", error);
      // Optional: Alert.alert("Error", "Could not start chat.");
    } finally {
      setIsCreatingDM(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      {/* --- HEADER --- */}
      <View className="px-4 py-3 bg-background flex-row justify-between items-center z-10">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="p-2 -ml-2 rounded-full active:bg-surface"
        >
          <ChevronLeft color={AppColors.text} size={28} />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-text">Profile</Text>
        <TouchableOpacity className="p-2 -mr-2">
          <MoreVertical color={AppColors.text} size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* 1. HERO SECTION */}
        <View className="items-center py-8 border-b border-border/50 bg-surface/30">
          <View className="w-24 h-24 bg-surface border border-border rounded-full items-center justify-center mb-4 overflow-hidden">
            {user.profilePictureUrl ? (
              <Image
                source={{ uri: user.profilePictureUrl }}
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <UserIcon color={AppColors.subtext} size={40} />
            )}
          </View>

          <Text className="text-2xl font-bold text-text text-center px-6">
            {user.name}
          </Text>

          {user.nickname && (
            <Text className="text-brand font-medium mt-1">
              @{user.nickname}
            </Text>
          )}
        </View>

        {/* 2. ACTIONS */}
        <View className="flex-row justify-center py-6 px-6 border-b border-border/50">
          <TouchableOpacity
            className="flex-1 bg-brand py-3 rounded-xl flex-row items-center justify-center mr-2 active:opacity-90"
            onPress={handleMessagePress}
            disabled={isCreatingDM}
          >
            {isCreatingDM ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <MessageSquare
                  color="white"
                  size={20}
                  style={{ marginRight: 8 }}
                />
                <Text className="text-white font-bold text-base">Message</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* 3. DETAILS LIST */}
        <View className="px-6 py-6">
          <Text className="text-subtext text-xs font-bold uppercase mb-4 tracking-wider">
            User Details
          </Text>

          {/* Email */}
          <View className="flex-row items-center mb-6">
            <View className="w-10 h-10 bg-surface rounded-full items-center justify-center mr-4 border border-border">
              <Mail size={18} color={AppColors.brand} />
            </View>
            <View>
              <Text className="text-subtext text-xs mb-0.5">Email</Text>
              <Text className="text-text text-base font-medium">
                {user.email}
              </Text>
            </View>
          </View>

          {/* Phone (Only if exists) */}
          {user.phoneNumber && (
            <View className="flex-row items-center mb-6">
              <View className="w-10 h-10 bg-surface rounded-full items-center justify-center mr-4 border border-border">
                <Phone size={18} color={AppColors.brand} />
              </View>
              <View>
                <Text className="text-subtext text-xs mb-0.5">Phone</Text>
                <Text className="text-text text-base font-medium">
                  {user.phoneNumber}
                </Text>
              </View>
            </View>
          )}

          {/* Joined Date */}
          <View className="mt-4 pt-4 border-t border-border/30">
            <Text className="text-subtext text-xs text-center">
              Joined {joinedDate}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default UserProfileScreen;
