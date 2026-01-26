import { PlaneTakeoff, Search, X } from "lucide-react-native";
import React, { useState } from "react";
import {
  FlatList,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppColors } from "../constants/colors";
import { Airport } from "../types/airport";

// --- Interface Definition ---
interface AirportSearchModalProps {
  visible: boolean;
  onClose: () => void;
  airports: Airport[];
  onSelect: (airport: Airport) => void;
  title: string;
  // --- NEW PROP ---
  // The airport currently selected in the *other* field, which should be unselectable here.
  disabledAirport?: Airport | null;
}

const AirportSearchModal = ({
  visible,
  onClose,
  onSelect,
  title,
  airports,
  disabledAirport, // Destructure the new prop
}: AirportSearchModalProps) => {
  const [searchText, setSearchText] = useState("");
  const insets = useSafeAreaInsets();

  // Filter logic (Unchanged)
  const filteredAirports = airports.filter((airport) => {
    const searchLower = searchText.toLowerCase();
    return (
      airport.city.toLowerCase().includes(searchLower) ||
      airport.name.toLowerCase().includes(searchLower) ||
      airport.iata.toLowerCase().includes(searchLower)
    );
  });

  const handleSelect = (airport: Airport) => {
    onSelect(airport);
    setSearchText(""); // Reset search on close
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
        {/* Header (Unchanged) */}
        <View className="flex-row items-center justify-between p-4 border-b border-border bg-surface">
          <Text className="text-xl font-bold text-text">{title}</Text>
          <TouchableOpacity onPress={onClose} className="p-2">
            <X color={AppColors.text} size={24} />
          </TouchableOpacity>
        </View>

        {/* Search Bar (Unchanged) */}
        <View className="p-4 bg-surface">
          <View className="flex-row items-center bg-background border border-border rounded-xl p-3">
            <Search
              color={AppColors.subtext}
              size={20}
              style={{ marginRight: 8 }}
            />
            <TextInput
              placeholder="Search city, airport or IATA code"
              placeholderTextColor={AppColors.subtext}
              className="flex-1 text-text font-medium p-0"
              value={searchText}
              onChangeText={setSearchText}
              autoFocus={false}
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={() => setSearchText("")}>
                <X color={AppColors.subtext} size={18} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Results List */}
        <FlatList
          data={filteredAirports}
          keyExtractor={(item) => item.iata}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            padding: 16,
            paddingBottom: insets.bottom + 16,
          }}
          renderItem={({ item }) => {
            // --- LOGIC TO CHECK IF DISABLED ---
            // Check if this item matches the passed disabledAirport (comparing unique IATA codes)
            const isDisabled = disabledAirport?.iata === item.iata;

            return (
              <TouchableOpacity
                // Disable press if collision exists
                disabled={isDisabled}
                onPress={() => handleSelect(item)}
                // Conditional Styling:
                // If disabled: Lower opacity, no active background change.
                // If active: Normal opacity, active background change.
                className={`flex-row items-center p-4 border-b border-border rounded-lg mb-2 ${
                  isDisabled ? "opacity-50 bg-background" : "active:bg-surface"
                }`}
              >
                <View className="w-12 h-12 bg-brand/10 rounded-full items-center justify-center mr-4">
                  <PlaneTakeoff color={AppColors.brand} size={24} />
                </View>
                <View className="flex-1">
                  <View className="flex-row justify-between items-baseline">
                    <Text className="text-lg font-bold text-text">
                      {item.city}
                    </Text>
                    <Text className="text-brand font-bold">{item.iata}</Text>
                  </View>
                  {/* Airport Name & Disabled warning */}
                  <View className="flex-row items-center mt-1">
                    <Text
                      className="text-subtext text-sm flex-1"
                      numberOfLines={1}
                    >
                      {item.name}
                    </Text>
                    {/* Show warning text if disabled */}
                    {isDisabled && (
                      <Text className="text-red-500 text-xs ml-2 font-medium">
                        (Already selected)
                      </Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View className="items-center justify-center py-10">
              <Text className="text-subtext font-medium">
                No airports found matching "{searchText}"
              </Text>
            </View>
          }
        />
      </View>
    </Modal>
  );
};

export default AirportSearchModal;
