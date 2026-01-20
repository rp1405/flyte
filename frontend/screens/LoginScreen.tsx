import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Plane } from "lucide-react-native";
import { AppColors } from "../constants/colors";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";

// 1. IMPORT ASYNC STORAGE
import AsyncStorage from "@react-native-async-storage/async-storage";

const BACKEND_URL = process.env.EXPO_PUBLIC_API_BASE_URL + "/api/auth/google";

export default function LoginScreen({ navigation }: any) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_WEB_CLIENT_ID,
      offlineAccess: true,
    });
  }, []);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const idToken = userInfo.data?.idToken;

      if (idToken) {
        await authenticateWithBackend(idToken);
      } else {
        throw new Error("No ID token returned");
      }
    } catch (error: any) {
      setLoading(false);
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log("User cancelled the login flow");
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log("Sign in is in progress");
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert("Error", "Google Play Services not available or outdated");
      } else {
        console.error(error);
        Alert.alert("Login Failed", error.message);
      }
    }
  };

  const authenticateWithBackend = async (googleIdToken: string) => {
    try {
      const response = await fetch(BACKEND_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idToken: googleIdToken }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Backend Login Success!", data);

        // 2. SAVE DATA TO STORAGE
        // We save the token as a plain string
        // We save the user object by converting it to a string (JSON.stringify)
        try {
          await AsyncStorage.multiSet([
            ["userToken", data.token],
            ["userInfo", JSON.stringify(data.user)],
          ]);
        } catch (e) {
          console.error("Error saving to storage", e);
        }

        setLoading(false);
        navigation.navigate("MainTabs");
      } else {
        throw new Error(data.message || "Backend authentication failed");
      }
    } catch (error: any) {
      setLoading(false);
      Alert.alert("Backend Error", error.message);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 justify-center items-center px-6">
        <View className="items-center mb-10 w-full">
          <View className="w-16 h-16 bg-brand rounded-2xl justify-center items-center mb-4 shadow-lg shadow-brand/20">
            <Plane color={AppColors.iconWhite} size={32} />
          </View>
          <Text className="text-3xl font-bold text-text text-center">
            Welcome to Flyte
          </Text>
          <Text className="text-subtext mt-2 text-center text-base">
            Connect with fellow travelers.
          </Text>
        </View>

        <View className="bg-surface p-8 rounded-3xl w-full border border-border shadow-xl shadow-black/50">
          <Text className="text-xl font-semibold text-center mb-8 text-text">
            Sign in to continue
          </Text>

          <TouchableOpacity
            onPress={handleGoogleLogin}
            disabled={loading}
            activeOpacity={0.7}
            className={`w-full flex-row items-center justify-center space-x-3 bg-surface border border-border py-4 rounded-2xl ${loading ? "opacity-70" : ""}`}
          >
            {loading ? (
              <ActivityIndicator color={AppColors.text} />
            ) : (
              <>
                <Image
                  source={{
                    uri: "https://cdn-icons-png.flaticon.com/512/2991/2991148.png",
                  }}
                  className="w-5 h-5"
                  resizeMode="contain"
                />
                <Text className="text-text font-semibold text-base ml-2">
                  Continue with Google
                </Text>
              </>
            )}
          </TouchableOpacity>

          <View className="flex-row items-center py-8">
            <View className="flex-1 h-[1px] bg-border" />
            <Text className="mx-4 text-subtext text-sm">Secure Login</Text>
            <View className="flex-1 h-[1px] bg-border" />
          </View>

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
