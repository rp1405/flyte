import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { Clock } from "lucide-react-native";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { AppColors } from "../constants/colors";

// --- Props Interface ---
interface DateTimePickerSectionProps {
  departureDate: Date | null;
  arrivalDate: Date | null;
  // Callbacks to update state in the parent component
  onDepartureChange: (date: Date) => void;
  onArrivalChange: (date: Date | null) => void;
}

const DateTimePickerSection = ({
  departureDate,
  arrivalDate,
  onDepartureChange,
  onArrivalChange,
}: DateTimePickerSectionProps) => {
  // --- INTERNAL STATE (Only needed by the pickers themselves) ---
  const [showDepPicker, setShowDepPicker] = useState(false);
  const [showArrPicker, setShowArrPicker] = useState(false);

  // iOS specific temp state
  const [tempIOSDate, setTempIOSDate] = useState<Date>(new Date());

  // Android specific two-step state
  const [androidMode, setAndroidMode] = useState<"date" | "time">("date");
  const [tempAndroidDate, setTempAndroidDate] = useState<Date | null>(null);

  // --- HELPER FUNCTIONS ---

  const formatDateTime = (date: Date | null) => {
    if (!date) return "Select Date & Time";
    return date.toLocaleString(undefined, {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  // Internal validation: ensures arrival isn't before departure
  const handleArrivalValidation = (date: Date) => {
    if (departureDate && date.getTime() < departureDate.getTime()) {
      // Using alert here, could be replaced with a toast or error state
      setTimeout(() => {
        alert("Arrival time cannot be before departure time.");
      }, 300);
      onArrivalChange(null); // Reset parent arrival state
    } else {
      onArrivalChange(date); // Update parent arrival state
    }
  };

  // Opens the appropriate picker and initializes temp states
  const openDatePicker = (type: "dep" | "arr") => {
    const currentDate =
      type === "dep"
        ? departureDate || new Date()
        : arrivalDate || departureDate || new Date();

    if (Platform.OS === "ios") {
      setTempIOSDate(currentDate);
    } else {
      setAndroidMode("date");
      setTempAndroidDate(currentDate);
    }

    if (type === "dep") setShowDepPicker(true);
    if (type === "arr") setShowArrPicker(true);
  };

  // --- CHANGE HANDLERS ---

  const onDateChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date,
    type?: "dep" | "arr"
  ) => {
    // ANDROID LOGIC
    if (Platform.OS === "android") {
      if (event.type === "dismissed") {
        setShowDepPicker(false);
        setShowArrPicker(false);
        return;
      }

      if (event.type === "set" && selectedDate) {
        if (androidMode === "date") {
          // Step 1: Date picked, switch to time mode
          setTempAndroidDate(selectedDate);
          setAndroidMode("time");
        } else {
          // Step 2: Time picked, combine and commit
          const finalDate = new Date(tempAndroidDate!);
          finalDate.setHours(selectedDate.getHours());
          finalDate.setMinutes(selectedDate.getMinutes());

          if (type === "dep") {
            setShowDepPicker(false);
            onDepartureChange(finalDate);
          }
          if (type === "arr") {
            setShowArrPicker(false);
            handleArrivalValidation(finalDate);
          }
        }
      }
    }
    // iOS LOGIC (just update temp state while spinning)
    else {
      if (selectedDate) {
        setTempIOSDate(selectedDate);
      }
    }
  };

  // iOS "Done" button click
  const onIOSDone = (type: "dep" | "arr") => {
    if (type === "dep") {
      onDepartureChange(tempIOSDate);
      setShowDepPicker(false);
    } else {
      handleArrivalValidation(tempIOSDate);
      setShowArrPicker(false);
    }
  };

  // --- RENDERERS ---

  // The custom iOS modal wrapper
  const renderIOSPickerModal = (
    isVisible: boolean,
    setVisible: (visible: boolean) => void,
    type: "dep" | "arr"
  ) => {
    const minimumDate =
      type === "arr" ? departureDate || new Date() : new Date();

    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={isVisible}
        onRequestClose={() => setVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setVisible(false)}>
          <View className="flex-1 justify-end bg-black/50">
            <TouchableWithoutFeedback>
              <View className="bg-surface pb-8 pt-4 rounded-t-3xl shadow-xl">
                <View className="flex-row justify-between px-6 mb-2 border-b border-border/30 pb-4 items-center">
                  <Text className="text-text text-lg font-semibold">
                    Select {type === "dep" ? "Departure" : "Arrival"}
                  </Text>
                  <TouchableOpacity
                    onPress={() => onIOSDone(type)}
                    className="p-2 bg-brand/10 rounded-lg px-4"
                  >
                    <Text className="text-brand font-bold text-base">Done</Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  testID="dateTimePicker"
                  value={tempIOSDate}
                  mode="datetime"
                  is24Hour={true}
                  display="spinner"
                  onChange={(e, d) => onDateChange(e, d, type)}
                  textColor={AppColors.text}
                  themeVariant="dark"
                  minimumDate={minimumDate}
                  style={{ height: 200 }}
                  minuteInterval={5}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    );
  };

  return (
    <>
      {/* --- UI Triggers Row --- */}
      <View className="flex-row gap-4 mt-4">
        {/* Departure Trigger */}
        <View className="flex-1">
          <Text className="text-xs font-medium text-subtext mb-2 ml-2">
            Departure
          </Text>
          <TouchableOpacity
            onPress={() => openDatePicker("dep")}
            activeOpacity={0.7}
            className="flex-row items-center bg-background border border-border p-3 rounded-xl min-h-[50px]"
          >
            <Clock
              color={AppColors.brand}
              size={20}
              style={{ marginRight: 8 }}
            />
            <Text
              className={`flex-1 font-medium text-xs ${
                departureDate ? "text-text" : "text-subtext"
              }`}
              numberOfLines={2}
            >
              {formatDateTime(departureDate)}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Arrival Trigger */}
        <View className="flex-1">
          <Text className="text-xs font-medium text-subtext mb-2 ml-2">Arrival</Text>
          <TouchableOpacity
            onPress={() => openDatePicker("arr")}
            activeOpacity={0.7}
            className="flex-row items-center bg-background border border-border p-3 rounded-xl min-h-[50px]"
          >
            <Clock
              color={AppColors.subtext}
              size={20}
              style={{ marginRight: 8 }}
            />
            <Text
              className={`flex-1 font-medium text-xs ${
                arrivalDate ? "text-text" : "text-subtext"
              }`}
              numberOfLines={2}
            >
              {formatDateTime(arrivalDate)}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* --- Invisible Picker Rendering based on Platform --- */}
      {Platform.OS === "ios" ? (
        <>
          {renderIOSPickerModal(showDepPicker, setShowDepPicker, "dep")}
          {renderIOSPickerModal(showArrPicker, setShowArrPicker, "arr")}
        </>
      ) : (
        <>
          {showDepPicker && (
            <DateTimePicker
              value={tempAndroidDate || new Date()}
              mode={androidMode}
              is24Hour={true}
              display="default"
              onChange={(e, d) => onDateChange(e, d, "dep")}
              minimumDate={new Date()}
            />
          )}
          {showArrPicker && (
            <DateTimePicker
              value={tempAndroidDate || departureDate || new Date()}
              mode={androidMode}
              is24Hour={true}
              display="default"
              onChange={(e, d) => onDateChange(e, d, "arr")}
              // Use departure date as minimum if it exists
              minimumDate={departureDate || new Date()}
            />
          )}
        </>
      )}
    </>
  );
};

export default DateTimePickerSection;
