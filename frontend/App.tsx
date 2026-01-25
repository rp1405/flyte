import { NavigationContainer } from "@react-navigation/native";
import {
  createNativeStackNavigator,
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";
import { registerRootComponent } from "expo";
import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { database as localDb } from "./db";
import "./global.css";

import { AppColors } from "./constants/colors";
import { AuthProvider, useAuth } from "./context/AuthContext"; // Ensure this path is correct

import { ConfigProvider } from "./context/ConfigContext";
import ChatDetailScreen from "./screens/ChatDetailScreen";
import LoginScreen from "./screens/LoginScreen";
import TabNavigator from "./screens/TabNavigator";

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
};

export type RootStackNavigationProp =
  NativeStackNavigationProp<RootStackParamList>;

const Stack = createNativeStackNavigator<RootStackParamList>();

// --- 1. SEPARATE NAVIGATION LOGIC ---
// We need a separate component here because we can only call 'useAuth'
// INSIDE a component that is wrapped by <AuthProvider>
function AppNavigator() {
  const { user, isAuthLoading } = useAuth();

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
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          // --- AUTHENTICATED ROUTES ---
          // If user exists, show the App Stack. Login screen is NOT rendered.
          <>
            <Stack.Screen name="MainTabs" component={TabNavigator} />
            <Stack.Screen name="ChatDetail" component={ChatDetailScreen} />
          </>
        ) : (
          // --- GUEST ROUTES ---
          // If no user, show ONLY the Login screen.
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
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
      <AuthProvider>
        <ConfigProvider>
          <AppNavigator />
        </ConfigProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

export default App;
registerRootComponent(App);
