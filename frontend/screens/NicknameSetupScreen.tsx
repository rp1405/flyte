import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { NicknameService } from "@/services/NicknameService";
import {
  validateNicknameFormat,
  getCharacterCount,
  getValidationRules,
} from "@/utils/nicknameValidation";
import { AppColors } from "@/constants/colors";

interface NicknameSetupScreenProps {
  navigation: any;
}

export default function NicknameSetupScreen({
  navigation,
}: NicknameSetupScreenProps) {
  const { user, token, login } = useAuth();

  // State management
  const [nickname, setNickname] = useState("");
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSetting, setIsSetting] = useState(false);
  const [charCount, setCharCount] = useState({
    current: 0,
    max: 20,
    remaining: 20,
  });

  // AbortController for request cancellation
  const abortControllerRef = useRef<AbortController | null>(null);

  // Debounced availability check with AbortController
  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    abortControllerRef.current = controller;

    // Clear previous error when user types
    setValidationError(null);
    setIsAvailable(null);

    // Update character count
    const newCharCount = getCharacterCount(nickname);
    setCharCount(newCharCount);

    // Validate format first
    const { valid, error } = validateNicknameFormat(nickname);

    if (!valid) {
      setValidationError(error || null);
      setIsAvailable(null);
      return;
    }

    // Set up debounce timer (500ms)
    const debounceTimer = setTimeout(async () => {
      setIsChecking(true);

      try {
        const result = await NicknameService.checkNicknameAvailability(
          nickname,
          signal,
        );
        setIsAvailable(result.available);
      } catch (err: any) {
        if (err.name === "AbortError" || err.code === "ECONNABORTED") {
          console.log("Nickname check request was cancelled");
        } else {
          setValidationError("Network error");
        }
      } finally {
        setIsChecking(false);
      }
    }, 500); // 500ms debounce delay

    // Cleanup: Aborts the call if nickname changes or component unmounts
    return () => {
      clearTimeout(debounceTimer);
      controller.abort();
    };
  }, [nickname]);

  // Handle nickname confirmation
  const handleContinue = async () => {
    if (!isAvailable || validationError) {
      Alert.alert("Invalid Nickname", "Please choose an available nickname");
      return;
    }

    setIsSetting(true);

    try {
      if (!user?.id) {
        throw new Error("User ID not found");
      }

      const updatedUser = await NicknameService.setNickname(nickname, user.id);

      if (updatedUser && token) {
        // Update user data with nickname
        const userWithNickname = {
          ...user,
          ...updatedUser,
        };
        await login(token, userWithNickname);
      }

      // Navigate to main app
      //navigation.replace("MainTabs");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to set nickname");
    } finally {
      setIsSetting(false);
    }
  };

  // Handle clear button
  const handleClear = () => {
    setNickname("");
    setIsAvailable(null);
    setValidationError(null);
  };

  // Get status message
  const getStatusMessage = (): string | null => {
    if (!nickname) {
      return null;
    }

    if (validationError) {
      return validationError;
    }

    if (isChecking) {
      return "Checking availability...";
    }

    if (isAvailable === true) {
      return "✓ Available!";
    }

    if (isAvailable === false) {
      return "❌ Already taken";
    }

    return null;
  };

  // Determine if continue button should be enabled
  const canContinue = isAvailable === true && !isChecking && !isSetting;

  // Get border color for input
  const getInputBorderColor = (): string => {
    if (validationError) return "border-red-500";
    if (isAvailable === true) return "border-green-500";
    return "border-border";
  };

  // Get status text color
  const getStatusTextColor = (): string => {
    if (validationError) return "text-red-500";
    if (isAvailable === true) return "text-green-500";
    if (isAvailable === false) return "text-red-500";
    return "text-subtext";
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-1 px-5 py-6 justify-between">
          {/* Header Section */}
          <View>
            <Text className="text-3xl font-bold text-text mb-2">
              Set Your Nickname
            </Text>

            <Text className="text-sm text-subtext mb-6">
              Make it unique like Instagram
            </Text>

            {/* Validation Rules */}
            <View className="bg-surface rounded-lg p-3 mb-5">
              <Text className="text-xs text-subtext mb-1.5 font-medium">
                Rules:
              </Text>
              {getValidationRules().map((rule, index) => (
                <Text
                  key={index}
                  className={`text-xs text-subtext ${
                    index < getValidationRules().length - 1 ? "mb-1" : ""
                  }`}
                >
                  • {rule}
                </Text>
              ))}
            </View>

            {/* Text Input */}
            <View className="mb-2">
              <TextInput
                className={`border rounded-lg px-3 py-3 text-base text-text bg-surface ${getInputBorderColor()}`}
                placeholder="Enter nickname"
                placeholderTextColor={AppColors.subtext}
                value={nickname}
                onChangeText={setNickname}
                maxLength={20}
                editable={!isSetting}
              />

              {/* Character Count */}
              <Text className="text-xs text-subtext text-right mt-1">
                {charCount.current}/{charCount.max}
              </Text>
            </View>

            {/* Status Message */}
            {getStatusMessage() && (
              <View className="flex-row items-center mb-4">
                {isChecking && (
                  <ActivityIndicator
                    size="small"
                    color={AppColors.brand}
                    className="mr-2"
                  />
                )}
                <Text className={`text-sm font-medium ${getStatusTextColor()}`}>
                  {getStatusMessage()}
                </Text>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View>
            {/* Clear Button */}
            <TouchableOpacity
              onPress={handleClear}
              disabled={!nickname || isSetting}
              className={`px-4 py-3 border border-border rounded-lg mb-3 ${
                !nickname || isSetting ? "opacity-50" : ""
              }`}
              activeOpacity={0.7}
            >
              <Text className="text-base font-semibold text-text text-center">
                Clear
              </Text>
            </TouchableOpacity>

            {/* Continue Button */}
            <TouchableOpacity
              onPress={handleContinue}
              disabled={!canContinue}
              className={`flex-row justify-center items-center px-4 py-3.5 rounded-lg ${
                canContinue ? "bg-brand" : "bg-gray-400"
              }`}
              activeOpacity={0.7}
            >
              {isSetting ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <Text className="text-base font-semibold text-white">
                    Continue
                  </Text>
                  <Text className="text-base text-white ml-2">→</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
