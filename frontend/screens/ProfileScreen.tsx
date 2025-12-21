import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Settings,
  Edit2,
  Plane,
  Users,
  ChevronRight,
  UserCog,
  Bell,
  ShieldCheck,
  HelpCircle,
  LogOut,
  MapPin, // Kept for stats icon, removed from hero text
} from "lucide-react-native";
import { AppColors } from "../constants/colors";

// --- 1. Define TypeScript Interface based on Backend Model ---
// This mirrors the fields in your Java User entity
interface UserProfile {
  id: string; // From BaseEntity
  name: string;
  email: string;
  phoneNumber?: string;
  profilePictureUrl?: string;
  nickname?: string;
}

// --- 2. Dummy Data representing fetched user ---
const DUMMY_USER: UserProfile = {
  id: "usr_12345",
  name: "Yuvraj Singh",
  email: "yuvraj.singh@example.com",
  phoneNumber: "+91 98765 43210",
  // Using a stable seed for consistent avatar image
  profilePictureUrl: "https://api.dicebear.com/7.x/avataaars/png?seed=Yuvraj2",
  nickname: "yuvi_flyer",
};

// --- Types for Menu Items ---
type MenuItemProps = {
  icon: React.ElementType;
  label: string;
  onPress: () => void;
  isDestructive?: boolean;
};

// --- Reusable Menu Item Component ---
const ProfileMenuItem = ({
  icon: Icon,
  label,
  onPress,
  isDestructive = false,
}: MenuItemProps) => {
  const textColor = isDestructive ? "text-red-500" : "text-text";
  const iconColor = isDestructive ? "#ef4444" : AppColors.subtext;
  const bgColor = isDestructive ? "bg-red-500/10" : "bg-background";
  const borderColor = isDestructive ? "border-red-500/30" : "border-border/50";

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className={`flex-row items-center p-4 border-b ${borderColor} active:bg-background/50`}
    >
      <View
        className={`w-10 h-10 ${bgColor} rounded-full items-center justify-center mr-4`}
      >
        <Icon color={iconColor} size={20} />
      </View>
      <Text className={`flex-1 font-medium text-base ${textColor}`}>
        {label}
      </Text>
      {!isDestructive && <ChevronRight color={AppColors.subtext} size={20} />}
    </TouchableOpacity>
  );
};

export default function ProfileScreen() {
  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: () => console.log("Logging out..."),
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* --- Header --- */}
      <View className="px-6 py-4 flex-row justify-between items-center z-10">
        <Text className="text-3xl font-bold text-text">Profile</Text>
        <TouchableOpacity className="w-10 h-10 bg-surface rounded-full items-center justify-center border border-border active:bg-border">
          <Settings color={AppColors.subtext} size={20} />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* --- User Hero Section (UPDATED with DUMMY_USER data) --- */}
        <View className="items-center mt-4 px-6">
          {/* Avatar */}
          <View className="relative">
            <Image
              source={{
                uri:
                  DUMMY_USER.profilePictureUrl ||
                  "https://via.placeholder.com/150", // Fallback if null
              }}
              className="w-28 h-28 rounded-full border-4 border-surface bg-background"
            />
            {/* Online Status Indicator */}
            <View className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-background" />
          </View>

          {/* Name */}
          <Text className="text-2xl font-bold text-text mt-4 mb-1">
            {DUMMY_USER.name}
          </Text>

          {/* Email and Nickname block instead of Location */}
          <View className="items-center">
            <Text className="text-subtext text-base">{DUMMY_USER.email}</Text>
            {DUMMY_USER.nickname && (
              <Text className="text-brand font-medium text-sm mt-1">
                @{DUMMY_USER.nickname}
              </Text>
            )}
          </View>

          {/* Edit Profile Button (Preserved) */}
          <TouchableOpacity className="mt-6 bg-brand py-3 px-8 rounded-full flex-row items-center active:opacity-90">
            <Edit2 color="white" size={16} />
            <Text className="text-white font-semibold ml-2">Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* --- Stats Row (Placeholders - these likely need separate API calls) --- */}
        {/* <View className="flex-row justify-between px-6 mt-8 gap-4">
          <View className="flex-1 bg-surface p-4 rounded-2xl items-center border border-border shadow-sm">
            <View className="bg-blue-900/30 p-2 rounded-full mb-2">
              <Plane color={AppColors.brand} size={20} />
            </View>
            <Text className="font-bold text-xl text-text">12</Text>
            <Text className="text-xs text-subtext font-medium">Flights</Text>
          </View>
          <View className="flex-1 bg-surface p-4 rounded-2xl items-center border border-border shadow-sm">
            <View className="bg-orange-900/30 p-2 rounded-full mb-2">
              <MapPin color="#f97316" size={20} />
            </View>
            <Text className="font-bold text-xl text-text">8</Text>
            <Text className="text-xs text-subtext font-medium">Countries</Text>
          </View>
          <View className="flex-1 bg-surface p-4 rounded-2xl items-center border border-border shadow-sm">
            <View className="bg-purple-900/30 p-2 rounded-full mb-2">
              <Users color="#a855f7" size={20} />
            </View>
            <Text className="font-bold text-xl text-text">45</Text>
            <Text className="text-xs text-subtext font-medium">
              Connections
            </Text>
          </View>
        </View> */}

        {/* --- Settings Menu Section --- */}
        <View className="mt-8 mx-6">
          <Text className="text-lg font-bold text-text mb-4">General</Text>

          <View className="bg-surface rounded-3xl border border-border overflow-hidden">
            <ProfileMenuItem
              icon={UserCog}
              // This section could show phone number in a detail screen
              label="Personal Information"
              onPress={() => console.log("Navigate to Personal Info edit")}
            />
            <ProfileMenuItem
              icon={Bell}
              label="Notifications"
              onPress={() => {}}
            />
            <ProfileMenuItem
              icon={ShieldCheck}
              label="Privacy & Security"
              onPress={() => {}}
            />
            <ProfileMenuItem
              icon={HelpCircle}
              label="Help & Support"
              onPress={() => {}}
            />
          </View>
        </View>

        {/* --- Log Out Button (Preserved) --- */}
        <TouchableOpacity
          onPress={handleLogout}
          activeOpacity={0.8}
          className="mx-6 mt-8 flex-row items-center justify-center p-4 rounded-2xl border border-red-500/30 bg-red-500/10 active:bg-red-500/20"
        >
          <LogOut color="#ef4444" size={20} />
          <Text className="text-red-500 font-semibold text-base ml-2">
            Log Out
          </Text>
        </TouchableOpacity>

        <Text className="text-center text-subtext text-xs mt-6">
          Flyte App v1.0.2 (Build 45)
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
