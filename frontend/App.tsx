// App.tsx

import { registerRootComponent } from "expo";
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
// 1. Import types for TS support
import {
  createNativeStackNavigator,
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "./global.css";

// Import Screens
import LoginScreen from "./screens/LoginScreen";
// import HomeScreen from "./screens/HomeScreen"; // Not needed here directly anymore
import TabNavigator from "./screens/TabNavigator";
import ChatDetailScreen from "./screens/ChatDetailScreen"; // Import the detail screen

// 2. Define the Parameter List for the ROOT Stack
// This tells TypeScript what screens exist and what params they take.
export type RootStackParamList = {
  MainTabs: undefined; // This names our TabNavigator "MainTabs"
  Login: undefined;
  // Define params for ChatDetail (matches what ChatDetailScreen expects)
  ChatDetail: {
    chatId: string;
    title: string;
    type: "group" | "direct";
    avatarUrl?: string;
  };
};

// Export the navigation prop type for use in other screens
export type RootStackNavigationProp =
  NativeStackNavigationProp<RootStackParamList>;

const Stack = createNativeStackNavigator<RootStackParamList>();

function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        {/* 3. The Stack Navigator is now the root */}
        {/* Change initialRouteName to "Login" later when auth is ready */}
        <Stack.Navigator initialRouteName="MainTabs">
          {/* The TabNavigator is just one screen within this stack */}
          <Stack.Screen
            name="MainTabs"
            component={TabNavigator}
            options={{ headerShown: false }}
          />

          {/* ChatDetailScreen is a SIBLING to MainTabs.
              When navigated to, it sits ON TOP of the tabs. */}
          <Stack.Screen
            name="ChatDetail"
            component={ChatDetailScreen}
            // We set header false because ChatDetailScreen has its own custom header
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;
registerRootComponent(App); // Not usually needed if using default Expo router entry, but keep if your setup requires it.
