import AirportSearchModal from "@/components/AirportSearchModal";
import DateTimePickerSection from "@/components/DateTimePickerSection";
import LocationSelector from "@/components/LocationSelector";
import { useAuth } from "@/context/AuthContext";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import {
  ArrowRight,
  Building2,
  ChevronRight,
  MapPin,
  Plane,
  Ticket,
  Users,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppColors } from "../constants/colors";
import { useConfig } from "../context/ConfigContext";
import { Airport } from "../models/airport";
import { CreateJourneyRequestPayload } from "../models/journey";
import { createJourneyService } from "../services/JourneyService";
import { RootTabParamList } from "./TabNavigator";

type HomeScreenNavigationProp = NavigationProp<RootTabParamList>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { user, isAuthLoading } = useAuth();
  const { airports, isConfigLoading } = useConfig();

  const [sourceAirport, setSourceAirport] = useState<Airport | null>(null);
  const [destAirport, setDestAirport] = useState<Airport | null>(null);
  const [flightNumber, setFlightNumber] = useState<string>("");

  const [departureDate, setDepartureDate] = useState<Date | null>(null);
  const [arrivalDate, setArrivalDate] = useState<Date | null>(null);

  const [showSourceModal, setShowSourceModal] = useState(false);
  const [showDestModal, setShowDestModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (isConfigLoading || isAuthLoading) return <ActivityIndicator />;
  if (!user) {
    //TODO : Create a separate component for cases like this rather than using alerts
    Alert.alert("Error", "You must be logged in to create a journey.");
    return;
  }

  const handleCreateJourney = async () => {
    // 1. Client-side Validation
    if (
      !sourceAirport ||
      !destAirport ||
      !departureDate ||
      !arrivalDate ||
      !flightNumber.trim()
    ) {
      console.log(
        "Missing Details",
        "Please fill in all locations, dates, and flight number before proceeding."
      );
      return;
    }

    // 2. Format data for backend (match DTO structure)
    // Java 'Instant' expects an ISO-8601 string (e.g., 2023-10-27T15:30:00.000Z)
    // .toISOString() provides exactly this format.
    const requestPayload: CreateJourneyRequestPayload = {
      source: sourceAirport.iata, // Send IATA code (e.g., "BOM")
      destination: destAirport.iata, // Send IATA code (e.g., "DEL")
      departureTime: departureDate.toISOString(),
      arrivalTime: arrivalDate.toISOString(),
      flightNumber: flightNumber.trim(),
      userId: user.id,
    };

    try {
      setIsLoading(true);
      const response = await createJourneyService(requestPayload);
      console.log("Journey created successfully:", response);
      setSourceAirport(null);
      setDestAirport(null);
      setFlightNumber("");
      setDepartureDate(null);
      setArrivalDate(null);
      navigation.navigate("ChatsTab");
    } catch (error: any) {
      console.error("Creation Error:", error);
    } finally {
      setIsLoading(false); // Stop spinner regardless of outcome
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* --- Top Navigation --- */}
      <View className="flex-row justify-between items-center px-6 py-4 bg-surface border-b border-border z-50">
        <View className="flex-row items-center space-x-2">
          <View className="w-8 h-8 bg-brand rounded-lg items-center justify-center">
            <Plane color={AppColors.iconWhite} size={20} />
          </View>
          <Text className="text-xl font-bold text-text ml-4">Flyte</Text>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-4 pt-4"
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {/* --- Greeting --- */}
        <View className="mt-3 mb-5 ml-2">
          <Text className="text-2xl font-bold text-text">
            Hey, {user.name} 👋
          </Text>
          <Text className="text-subtext text-base">
            Where are you flying today?
          </Text>
        </View>

        {/* --- Journey Creator Widget --- */}
        <View className="bg-surface p-6 rounded-3xl border border-border shadow-sm mb-6">
          <View className="flex-row">
            <Text className="text-lg font-semibold text-text mb-4 flex-row items-center">
              <MapPin
                color={AppColors.brand}
                size={20}
                style={{ marginRight: 8 }}
              />
            </Text>
            <Text className="font-semibold text-text mb-4 flex-row items-center ml-2">
              Create New Journey
            </Text>
          </View>

          <View className="space-y-4 relative">
            {/* Connector Line */}
            <View className="absolute left-[16px] top-[50px] bottom-[32px] w-0.5 bg-border z-0" />

            {/* --- Source Selection --- */}
            <LocationSelector
              label="FROM"
              icon={
                <View className="w-3 h-3 rounded-full border-2 border-brand bg-surface" />
              }
              value={sourceAirport}
              placeholder="Select Source Airport"
              onPress={() => setShowSourceModal(true)}
            />

            {/* --- Destination Selection --- */}
            <LocationSelector
              label="TO"
              icon={<MapPin color="#ef4444" size={16} />}
              value={destAirport}
              placeholder="Select Destination Airport"
              onPress={() => setShowDestModal(true)}
            />
          </View>

          {/* Row 1: Flight Number */}
          <View className="mt-4">
            <Text className="text-xs font-medium text-subtext mb-2 ml-2">
              Flight Number
            </Text>
            <View className="flex-row items-center bg-background border border-border p-3 rounded-xl">
              <Ticket
                color={AppColors.subtext}
                size={20}
                style={{ marginRight: 8 }}
              />
              <TextInput
                placeholder="6E 1496"
                placeholderTextColor={AppColors.subtext}
                className="flex-1 text-text font-medium p-0"
                value={flightNumber}
                onChangeText={setFlightNumber}
              />
            </View>
          </View>

          {/* Row 2: Dates & Times Section */}
          <DateTimePickerSection
            departureDate={departureDate}
            arrivalDate={arrivalDate}
            onDepartureChange={setDepartureDate}
            onArrivalChange={setArrivalDate}
          />

          <TouchableOpacity
            onPress={handleCreateJourney}
            disabled={isLoading} // Prevent double submission
            activeOpacity={0.9}
            // Dynamically change opacity if loading
            className={`w-full mt-6 bg-brand py-4 rounded-2xl flex-row items-center justify-center ${
              isLoading ? "opacity-80" : ""
            }`}
          >
            {isLoading ? (
              // Show spinner while loading
              <ActivityIndicator size="small" color="white" />
            ) : (
              // Show Text and Icon normally
              <>
                <Text className="text-white font-semibold text-base mr-2">
                  Find Travelers
                </Text>
                <ArrowRight color="white" size={20} />
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* --- Active Chat Rooms Section --- */}
        <View>
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold text-text">
              Your Active Rooms
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("ChatsTab")}
              activeOpacity={0.7}
            >
              <Text className="text-sm text-brand font-medium">See All</Text>
            </TouchableOpacity>
          </View>
          {/* ... Chat cards would go here ... */}
          <View className="space-y-3">
            {/* Card 1: Source Room */}

            <TouchableOpacity className="bg-surface p-4 rounded-2xl border border-border flex-row justify-between items-center active:bg-background">
              <View className="flex-row items-center gap-4 flex-1">
                <View className="w-12 h-12 bg-orange-900/30 rounded-xl items-center justify-center">
                  <Building2 color="#f97316" size={24} />
                </View>

                <View>
                  <Text className="font-bold text-text text-base">
                    Mumbai International
                  </Text>

                  <View className="flex-row items-center mt-1">
                    <Users
                      color={AppColors.subtext}
                      size={12}
                      style={{ marginRight: 4 }}
                    />

                    <Text className="text-sm text-subtext">
                      24 active travelers
                    </Text>
                  </View>
                </View>
              </View>

              <View className="w-8 h-8 bg-background rounded-full items-center justify-center">
                <ChevronRight color={AppColors.subtext} size={20} />
              </View>
            </TouchableOpacity>

            {/* Card 2 (omitted for brevity, same as before) */}
          </View>
        </View>
      </ScrollView>

      {/* --- Render Airport Selection Modals --- */}
      <AirportSearchModal
        visible={showSourceModal}
        onClose={() => setShowSourceModal(false)}
        onSelect={(airport) => setSourceAirport(airport)}
        title="Select Source Airport"
        airports={airports}
        disabledAirport={destAirport}
      />
      <AirportSearchModal
        visible={showDestModal}
        onClose={() => setShowDestModal(false)}
        onSelect={(airport) => setDestAirport(airport)}
        title="Select Destination Airport"
        airports={airports}
        disabledAirport={sourceAirport}
      />
    </SafeAreaView>
  );
}
