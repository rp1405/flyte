import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Plane } from "lucide-react-native";
import { AppColors } from "../constants/colors";

export default function LoginScreen({ navigation }: any) {
  return (
    // Replaced hardcoded bg-slate-950 with bg-background
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 justify-center items-center px-6">
        {/* --- Logo Area --- */}
        <View className="items-center mb-10 w-full">
          {/* Replaced bg-blue-600 and shadow-blue-500 with bg-brand and shadow-brand */}
          <View className="w-16 h-16 bg-brand rounded-2xl justify-center items-center mb-4 shadow-lg shadow-brand/20">
            {/* Using the imported color constant for the icon prop */}
            <Plane color={AppColors.iconWhite} size={32} />
          </View>
          {/* Replaced text-white with text-text */}
          <Text className="text-3xl font-bold text-text text-center">
            Welcome to Flyte
          </Text>
          {/* Replaced text-slate-400 with text-subtext */}
          <Text className="text-subtext mt-2 text-center text-base">
            Connect with fellow travelers.
          </Text>
        </View>

        {/* --- Auth Card --- */}
        {/* Replaced bg-slate-900 with bg-surface and added border-border */}
        <View className="bg-surface p-8 rounded-3xl w-full border border-border shadow-xl shadow-black/50">
          <Text className="text-xl font-semibold text-center mb-8 text-text">
            Sign in to continue
          </Text>

          {/* Google Button */}
          <TouchableOpacity
            onPress={() => navigation.navigate("Home")}
            activeOpacity={0.7}
            // Replaced bg-slate-800/border-slate-700 with bg-surface/border-border
            className="w-full flex-row items-center justify-center space-x-3 bg-surface border border-border py-4 rounded-2xl"
          >
            <Image
              source={{
                uri: "https://cdn-icons-png.flaticon.com/512/2991/2991148.png",
              }}
              className="w-5 h-5"
              resizeMode="contain"
            />
            {/* Replaced text-white with text-text */}
            <Text className="text-text font-semibold text-base ml-2">
              Continue with Google
            </Text>
          </TouchableOpacity>

          {/* Divider */}
          <View className="flex-row items-center py-8">
            {/* Replaced bg-slate-800 with bg-border */}
            <View className="flex-1 h-[1px] bg-border" />
            {/* Replaced text-slate-500 with text-subtext */}
            <Text className="mx-4 text-subtext text-sm">Secure Login</Text>
            <View className="flex-1 h-[1px] bg-border" />
          </View>

          {/* Footer Text */}
          {/* Replaced text-slate-500/400 with text-subtext */}
          <Text className="text-center text-xs text-subtext leading-5">
            By continuing, you agree to Flyte's{"\n"}
            <Text className="font-medium text-subtext underline">
              Terms of Service
            </Text>{" "}
            and{" "}
            <Text className="font-medium text-subtext underline">
              Privacy Policy
            </Text>
            .
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
