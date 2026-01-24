import { Airport } from "@/models/airport";
import React, { createContext, useContext, useEffect, useState } from "react";
import { ConfigService } from "../services/ConfigService";

interface ConfigContextType {
  airports: Airport[];
  isConfigLoading: boolean;
  refreshConfig: () => Promise<void>; // Added a refresh function just in case
}

const ConfigContext = createContext<ConfigContextType>({
  airports: [],
  isConfigLoading: true,
  refreshConfig: async () => {},
});

export const ConfigProvider = ({ children }: { children: React.ReactNode }) => {
  const [airports, setAirports] = useState<Airport[]>([]);
  const [isConfigLoading, setIsConfigLoading] = useState(true);

  // Define the fetch logic as a reusable function
  const fetchConfig = async () => {
    try {
      console.log("Initializing App Config...");

      // Call the Service
      const response = await ConfigService.getAirports();

      if (response.success && response.data) {
        setAirports(response.data);
      } else {
        console.warn("Config load failed:", response.error);
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
      value={{ airports, isConfigLoading, refreshConfig: fetchConfig }}
    >
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => useContext(ConfigContext);
