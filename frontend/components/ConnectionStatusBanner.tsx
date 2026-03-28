import { Check, Info, X } from "lucide-react-native";
import React from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { AppColors } from "../constants/colors";
import { ConnectionStatus } from "../services/DirectMessageService";

interface ConnectionStatusBannerProps {
  status: ConnectionStatus;
  targetUserName: string;
  onAccept: () => void;
  onReject: () => void;
  isActionLoading: boolean;
}

export const ConnectionStatusBanner = ({
  status,
  targetUserName,
  onAccept,
  onReject,
  isActionLoading,
}: ConnectionStatusBannerProps) => {
  if (status === "CONNECTED") return null;

  return (
    <View className="px-4 py-4 bg-surface border-b border-border">
      <View className="flex-row items-center mb-3">
        <View className="w-8 h-8 rounded-full bg-brand/10 items-center justify-center mr-3">
          <Info size={16} color={AppColors.brand} />
        </View>
        <Text className="flex-1 text-text font-medium leading-5">
          {status === "SENT"
            ? `${targetUserName} hasn't accepted your request yet.`
            : `${targetUserName} wants to connect with you.`}
        </Text>
      </View>

      {status === "RECEIVED" && (
        <View className="flex-row mt-2">
          <TouchableOpacity
            onPress={onAccept}
            disabled={isActionLoading}
            className="flex-1 bg-brand py-2.5 rounded-lg flex-row items-center justify-center mr-2 active:opacity-90"
          >
            {isActionLoading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <>
                <Check size={18} color="white" style={{ marginRight: 6 }} />
                <Text className="text-white font-bold">Accept</Text>
              </>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onReject}
            disabled={isActionLoading}
            className="flex-1 bg-surface border border-red-500/30 py-2.5 rounded-lg flex-row items-center justify-center active:bg-red-500/5"
          >
            <X size={18} color="#ef4444" style={{ marginRight: 6 }} />
            <Text className="text-red-500 font-bold">Reject</Text>
          </TouchableOpacity>
        </View>
      )}

      {status === "SENT" && (
        <View className="bg-surface/50 border border-border/50 py-2 px-3 rounded-lg">
          <Text className="text-subtext text-xs text-center italic">
            You can't send messages until they accept.
          </Text>
        </View>
      )}
    </View>
  );
};
