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
    </SafeAreaProvider>
  );
}

export default App;
registerRootComponent(App);
