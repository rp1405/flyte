import React, { ReactNode } from "react";
import { Text, TouchableOpacity, View } from "react-native";
// Make sure to adjust this import path if needed based on your project structure
import { Airport } from "../types/airport";

interface LocationSelectorProps {
  label: string;
  icon: ReactNode;
  value: Airport | null;
  placeholder: string;
  onPress: () => void;
}

const LocationSelector = ({
  label,
  icon,
  value,
  placeholder,
  onPress,
}: LocationSelectorProps) => {
  return (
    <View className={`z-10 ${label == "TO" ? "mt-2" : ""} `}>
      <View className="flex-row mb-2">
        <View className="w-10" />
        <Text className="flex-1 text-xs font-medium text-subtext ml-2">
          {label}
        </Text>
      </View>

      <View className="flex-row items-center">
        <View className="w-10 items-center justify-center">{icon}</View>

        <TouchableOpacity
          onPress={onPress}
          activeOpacity={0.7}
          className="flex-1 p-3 bg-background border border-border rounded-xl flex-row items-center"
        >
          <Text
            className={`flex-1 font-medium ${
              value ? "text-text" : "text-subtext"
            }`}
            numberOfLines={1}
          >
            {value ? `${value.city} (${value.iata})` : placeholder}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LocationSelector;
