import {
  Building2,
  Plane,
  PlaneLanding,
  PlaneTakeoff,
  Users,
} from "lucide-react-native";
import React from "react";
import { Image, View } from "react-native";
import { AppColors } from "../constants/colors";

interface RoomAvatarProps {
  type?: string; 
  imageUrl?: string; // Optinal image URL for DMs
  size?: "sm" | "md" | "lg" | "xl"; 
  className?: string; 
}

export const RoomAvatar = ({
  type,
  imageUrl,
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
    case "DM":
      iconConfig = {
        icon: Users,
        bgColor: "bg-teal-900/30",
        color: "#14b8a6", // Teal
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
    xl: { container: "w-24 h-24", iconSize: 48 },
  };

  const currentSize = sizeMap[size];
  const IconComponent = iconConfig.icon;

  console.log("ImageUrl:",imageUrl);

  return (
    <View
      className={`${currentSize.container} rounded-full items-center justify-center overflow-hidden ${iconConfig.bgColor} ${className}`}
    >
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={{ width: "100%", height: "100%" }}
          resizeMode="cover"
        />
      ) : (
        <IconComponent color={iconConfig.color} size={currentSize.iconSize} />
      )}
    </View>
  );
};
