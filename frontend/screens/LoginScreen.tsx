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

// REPLACE THIS WITH YOUR ACTUAL BACKEND URL (Use your machine's IP if testing on device, e.g., 192.168.1.5)
const BACKEND_URL = process.env.EXPO_PUBLIC_API_BASE_URL+"/api/auth/google";

export default function LoginScreen({ navigation }: any) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    GoogleSignin.configure({
      // IMPORTANT: Use the WEB CLIENT ID from Google Cloud Console here.
      // This MUST match the 'googleClientId' you used in your Spring Boot Backend.
      webClientId:
        "846080902275-t1fmmtm2bgarbjtu34b8o2lr4s1uh7pu.apps.googleusercontent.com",
      offlineAccess: true,
    });
  }, []);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      // 1. Check if play services are available
      await GoogleSignin.hasPlayServices();

      // 2. Perform the native login
      const userInfo = await GoogleSignin.signIn();
      console.log(userInfo);
      const idToken = userInfo.data?.idToken;

      if (idToken) {
        // 3. Send token to your Spring Boot Backend
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

        // TODO: Save data.token to SecureStore or AsyncStorage here
        // await AsyncStorage.setItem('jwt_token', data.token);

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
        {/* --- Logo Area --- */}
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

        {/* --- Auth Card --- */}
        <View className="bg-surface p-8 rounded-3xl w-full border border-border shadow-xl shadow-black/50">
          <Text className="text-xl font-semibold text-center mb-8 text-text">
            Sign in to continue
          </Text>

          {/* Google Button */}
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

          {/* Divider */}
          <View className="flex-row items-center py-8">
            <View className="flex-1 h-[1px] bg-border" />
            <Text className="mx-4 text-subtext text-sm">Secure Login</Text>
            <View className="flex-1 h-[1px] bg-border" />
          </View>

          {/* Footer Text */}
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
