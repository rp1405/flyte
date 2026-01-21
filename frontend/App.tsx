import { registerRootComponent } from "expo";
import React from "react";
import { View, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import {
  createNativeStackNavigator,
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "./global.css";

// --- IMPORTS ---
import { AuthProvider, useAuth } from "./context/AuthContext"; // Ensure this path is correct
import { AppColors } from "./constants/colors";

import LoginScreen from "./screens/LoginScreen";
import TabNavigator from "./screens/TabNavigator";
import ChatDetailScreen from "./screens/ChatDetailScreen";

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
  const { user, isLoading } = useAuth();

  // A. Loading State
  // While checking storage, show a spinner (or a Splash Screen)
  if (isLoading) {
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
  return (
    <SafeAreaProvider>
      {/* Wrap the entire logic in the Provider */}
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

export default App;
registerRootComponent(App);
