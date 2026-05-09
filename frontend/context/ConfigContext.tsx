import { Airport } from "@/types/airport";
import React, { createContext, useContext, useEffect, useState } from "react";
import { ConfigService, AppConfig } from "../services/ConfigService";

interface ConfigContextType {
  airports: Airport[];
  appConfig: AppConfig | null;
  isConfigLoading: boolean;
  refreshConfig: () => Promise<void>; // Added a refresh function just in case
}

const ConfigContext = createContext<ConfigContextType>({
  airports: [],
  appConfig: null,
  isConfigLoading: true,
  refreshConfig: async () => {},
});

export const ConfigProvider = ({ children }: { children: React.ReactNode }) => {
  const [airports, setAirports] = useState<Airport[]>([]);
  const [appConfig, setAppConfig] = useState<AppConfig | null>(null);
  const [isConfigLoading, setIsConfigLoading] = useState(true);

  // Define the fetch logic as a reusable function
  const fetchConfig = async () => {
    try {
      console.log("Initializing App Config...");

      // Call the Services
      const [airportsResponse, appConfigResponse] = await Promise.all([
        ConfigService.getAirports(),
        ConfigService.getAppConfig()
      ]);

      if (airportsResponse.success && airportsResponse.data) {
        setAirports(airportsResponse.data);
      } else {
        console.warn("Airports config load failed:", airportsResponse.error);
      }

      if (appConfigResponse) {
        setAppConfig(appConfigResponse);
      } else {
        console.warn("App config load failed");
      }
    } catch (error) {
      console.error("Critical config error:", error);
    } finally {
      setIsConfigLoading(false);
    }
  };

  // Run on mount
  useEffect(() => {
    fetchConfig();
  }, []);

  return (
    <ConfigContext.Provider
      value={{ airports, appConfig, isConfigLoading, refreshConfig: fetchConfig }}
    >
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => useContext(ConfigContext);
