import {
  Building2,
  Plane,
  PlaneLanding,
  PlaneTakeoff,
} from "lucide-react-native";
import React from "react";
import { View } from "react-native";
import { AppColors } from "../constants/colors";

interface RoomAvatarProps {
  type?: string; // The room type (e.g. "FLIGHT", "SOURCE")
  size?: "sm" | "md" | "lg" | "xl"; // To control sizing
  className?: string; // To add margins or extra styles
}

export const RoomAvatar = ({
  type,
  size = "md",
  className = "",
}: RoomAvatarProps) => {
  const typeUpper = type?.toUpperCase() || "DEFAULT";
  let iconConfig;

  // 1. Define Styles based on Type
  switch (typeUpper) {
    case "SOURCE":
      iconConfig = {
        icon: PlaneTakeoff,
        bgColor: "bg-blue-900/30",
        color: AppColors.brand,
      };
      break;
    case "DESTINATION":
      iconConfig = {
        icon: PlaneLanding,
        bgColor: "bg-orange-900/30",
        color: "#f97316", // Orange
      };
      break;
    case "FLIGHT":
      iconConfig = {
        icon: Plane,
        bgColor: "bg-purple-900/30",
        color: "#9333ea", // Purple
      };
      break;
    default:
      iconConfig = {
        icon: Building2,
        bgColor: "bg-slate-800/30",
        color: AppColors.subtext,
      };
      break;
  }

  // 2. Define Dimensions based on Size prop
  const sizeMap = {
    sm: { container: "w-10 h-10", iconSize: 20 },
    md: { container: "w-12 h-12", iconSize: 24 },
    lg: { container: "w-14 h-14", iconSize: 28 },
    xl: { container: "w-24 h-24", iconSize: 48 }, // <--- ADD THIS
  };

  const currentSize = sizeMap[size];
  const IconComponent = iconConfig.icon;

  return (
    <View
      className={`${currentSize.container} rounded-full items-center justify-center ${iconConfig.bgColor} ${className}`}
    >
      <IconComponent color={iconConfig.color} size={currentSize.iconSize} />
    </View>
  );
};
