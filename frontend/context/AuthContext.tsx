import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

// 1. User Interface
interface User {
  id: string;
  name: string;
  email: string;
  profilePictureUrl?: string;
  // Add other fields as needed
}

// 2. Context State Interface
interface AuthContextType {
  user: User | null;
  token: string | null; // <--- Token is now available here
  isLoading: boolean;
  login: (token: string, userData: User) => Promise<void>;
  logout: () => Promise<void>;
  getAuthHeaders: () => { [key: string]: string }; // <--- Helper for API calls
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load data on app startup
  useEffect(() => {
    loadStorageData();
  }, []);

  const loadStorageData = async () => {
    try {
      const storedUser = await AsyncStorage.getItem("userInfo");
      const storedToken = await AsyncStorage.getItem("userToken");

      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      }
    } catch (e) {
      console.error("Failed to load auth data", e);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (newToken: string, userData: User) => {
    setIsLoading(true);
    try {
      await AsyncStorage.setItem("userToken", newToken);
      await AsyncStorage.setItem("userInfo", JSON.stringify(userData));

      setToken(newToken);
      setUser(userData);
    } catch (e) {
      console.error("Login error", e);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await AsyncStorage.removeItem("userToken");
      await AsyncStorage.removeItem("userInfo");
      setToken(null);
      setUser(null);
    } catch (e) {
      console.error("Logout error", e);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to easily get headers for backend requests
  const getAuthHeaders = () => {
    return {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    };
  };

  return (
    <AuthContext.Provider
      value={{ user, token, isLoading, login, logout, getAuthHeaders }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
