import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Home, MessageCircle, User } from "lucide-react-native";
import React from "react";

// Import your screens
import ChatsScreen from "./ChatScreen";
import HomeScreen from "./HomeScreen";
import ProfileScreen from "./ProfileScreen";

// Import your colors constant
import { AppColors } from "../constants/colors";

// 1. Define TypeScript types for the tab routes
export type RootTabParamList = {
  HomeTab: undefined;
  ChatsTab: undefined;
  ProfileTab: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: AppColors.brand,
        tabBarInactiveTintColor: AppColors.subtext,
        tabBarShowLabel: true,

        tabBarStyle: {
          backgroundColor: AppColors.surface, // Make sure this is a HEX string, not a class name
          borderTopColor: AppColors.border, // Make sure this is a HEX string
          borderTopWidth: 1,
          paddingTop: 2,
          height: 65,
          paddingBottom: 4,
        },

        // Styling the labels text
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500", // matches tailwind 'font-medium'
          marginBottom: 6,
        },

        // --- RENDER ICONS ---
        tabBarIcon: ({ focused, color, size }) => {
          let IconComponent;

          if (route.name === "HomeTab") {
            IconComponent = Home;
          } else if (route.name === "ChatsTab") {
            IconComponent = MessageCircle;
          } else if (route.name === "ProfileTab") {
            IconComponent = User;
          } else {
            IconComponent = Home;
          }

          // Return the Lucide icon. React Nav automatically passes the correct 'color' (active or inactive)
          // We adjust the size slightly so the icon doesn't feel cramped
          return <IconComponent color={color} size={26} />;
        },
      })}
    >
      {/* Define the tabs using the keys from RootTabParamList */}
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{ tabBarLabel: "Home" }}
      />
      <Tab.Screen
        name="ChatsTab"
        component={ChatsScreen}
        options={{ tabBarLabel: "Chats" }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{ tabBarLabel: "Profile" }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;
