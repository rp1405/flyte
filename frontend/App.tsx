
import "@react-native-firebase/app";
import {
  createNativeStackNavigator,
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";
import { registerRootComponent } from "expo";
import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AppColors } from "./constants/colors";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ConfigProvider } from "./context/ConfigContext";
import { database as localDb } from "./db";
import "./global.css";
import ChatDetailScreen from "./screens/ChatDetailScreen";
import LoginScreen from "./screens/LoginScreen";
import TabNavigator from "./screens/TabNavigator";
import { SyncService } from "./services/SyncService";
import messaging from "@react-native-firebase/messaging";
import { usePushNotifications } from "./hooks/usePushNotifications";
import Toast from "react-native-toast-message";

// Register background handler early in the app lifecycle
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  console.log("Message handled in the background!", remoteMessage);
});

// --- TYPES ---
export type RootStackParamList = {
  MainTabs: undefined;
  Login: undefined;
  ChatDetail: {
    roomId: string;
    title?: string;
    type?: "group" | "direct";
    avatarUrl?: string;
    userId: string;
  };
  GroupInfo: {
    roomId: string;
  };
  UserProfile: { user: JourneyUser };
};

export type RootStackNavigationProp =
  NativeStackNavigationProp<RootStackParamList>;

const Stack = createNativeStackNavigator<RootStackParamList>();

// --- 1. SEPARATE NAVIGATION LOGIC ---
// We need a separate component here because we can only call 'useAuth'
// INSIDE a component that is wrapped by <AuthProvider>
import { NavigationContainer } from "@react-navigation/native";
import { useGlobalWebSocketListener } from "./hooks/useGlobalWebSocketListener";
import GroupInfoScreen from "./screens/GroupInfoScreen";
import UserProfileScreen from "./screens/UserProfileScreen";
import { JourneyUser } from "./types/journey";

// ...

function AppNavigator() {
  const { user, isAuthLoading } = useAuth();
  
  // Initialize Global WebSocket Listener
  useGlobalWebSocketListener();

  // Initialize Push Notifications
  usePushNotifications(user?.id);

  // Example usage in HomeScreen.tsx
  useEffect(() => {
    if (user?.id) {
      SyncService.syncUserChatData(user.id);
    }
  }, [user]);

  // A. Loading State
  // While checking storage, show a spinner (or a Splash Screen)
  if (isAuthLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: AppColors.background,
        }}
      >
        <ActivityIndicator size="large" color={AppColors.brand} />
      </View>
    );
  }

  // B. Main Navigation
  return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          // --- AUTHENTICATED ROUTES ---
          // If user exists, show the App Stack. Login screen is NOT rendered.
          <>
            <Stack.Screen name="MainTabs" component={TabNavigator} />
            <Stack.Screen name="ChatDetail" component={ChatDetailScreen} />
            <Stack.Screen name="GroupInfo" component={GroupInfoScreen} />
            <Stack.Screen name="UserProfile" component={UserProfileScreen} />
          </>
        ) : (
          // --- GUEST ROUTES ---
          // If no user, show ONLY the Login screen.
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
  );
}

// --- 2. ROOT COMPONENT ---
import { ToastConfig } from "react-native-toast-message";
import { Image, TouchableOpacity, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Custom Toast Component Wrapper
const CustomToast = () => {
  const insets = useSafeAreaInsets();
  
  const toastConfig: ToastConfig = {
    info: ({ text1, text2, onPress }) => (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress}
        style={{
          width: '100%',
          backgroundColor: AppColors.surface,
          paddingHorizontal: 16,
          paddingBottom: 16,
          paddingTop: insets.top + 10,
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24,
          flexDirection: 'row',
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 5 },
          shadowOpacity: 0.2,
          shadowRadius: 10,
          elevation: 10,
        }}
      >
        <Image
          source={require('./assets/images/icon.png')}
          style={{ width: 44, height: 44, borderRadius: 12, marginRight: 12 }}
        />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: AppColors.text }}>
            {text1}
          </Text>
          <Text style={{ fontSize: 14, color: AppColors.subtext, marginTop: 2 }} numberOfLines={2}>
            {text2}
          </Text>
        </View>
      </TouchableOpacity>
    )
  };

  return <Toast config={toastConfig} topOffset={0} />;
};

function App() {
  useEffect(() => {
    const debugWatermelon = async () => {
      // 1. Fetch
      const users = await localDb.get("users").query().fetch();
      const rooms = await localDb.get("rooms").query().fetch();
      const messages = await localDb.get("messages").query().fetch();

      // 2. Log readable JSON
      console.log("=======WATERMELON DB=========");
      console.log(
        "=== USERS ===",
        users.map((u) => u._raw)
      );
      console.log(
        "=== ROOMS ===",
        rooms.map((r) => r._raw)
      );
      console.log(
        "=== MESSAGES ===",
        messages.map((m) => m._raw)
      );
    };
    debugWatermelon();
  }, []);
  return (
    <SafeAreaProvider>
      {/* Wrap the entire logic in the Provider */}
      <NavigationContainer>
        <AuthProvider>
          <ConfigProvider>
            <AppNavigator />
          </ConfigProvider>
        </AuthProvider>
      </NavigationContainer>
      <CustomToast />
    </SafeAreaProvider>
  );
}

export default App;
registerRootComponent(App);
