import UserData from "@/types/UserData";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import React, { createContext, useContext, useEffect, useState } from "react";
import { database as localDb } from "../db"; // Your initialized WatermelonDB instance
import Message from "../db/models/Message";
import Room from "../db/models/Room";
import User from "../db/models/User"; // Rename import to avoid clash with interface

interface AuthContextType {
  user: UserData | null;
  token: string | null;
  isAuthLoading: boolean;
  login: (token: string, userData: UserData) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Load data on app startup
  useEffect(() => {
    loadUserFromDB();
  }, []);

  const loadUserFromDB = async () => {
    try {
      // Fetch the first user found in the DB
      const users = await localDb.get<User>("users").query().fetch();

      if (users.length > 0) {
        const loggedInUser = users[0];

        // Hydrate State
        setUser({
          id: loggedInUser.id,
          name: loggedInUser.name,
          email: loggedInUser.email,
          profilePictureUrl: loggedInUser.profilePictureUrl,
        });
        setToken(loggedInUser.token);
      }
    } catch (e) {
      console.error("Failed to load auth data from DB", e);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const login = async (newToken: string, userData: UserData) => {
    setIsAuthLoading(true);
    try {
      await localDb.write(async () => {
        // 1. OPTIONAL: Clear any existing users to ensure only 1 active user
        // (If your app supports multi-account, skip this)
        const allUsers = await localDb.get<User>("users").query().fetch();
        const deleteOps = allUsers.map((u) => u.prepareDestroyPermanently());

        // 2. Create the new user
        const usersCollection = localDb.get<User>("users");
        const createUserOp = usersCollection.prepareCreate((u) => {
          u._raw.id = userData.id; // Sync ID from Backend
          u.name = userData.name;
          u.email = userData.email;
          u.profilePictureUrl = userData.profilePictureUrl;
          u.token = newToken; // Store token in DB
        });

        // 3. Execute batch
        await localDb.batch(...deleteOps, createUserOp);
      });

      // Update Local State
      setToken(newToken);
      setUser(userData);
    } catch (e) {
      console.error("Login error", e);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const logout = async () => {
    setIsAuthLoading(true);
    try {
      await localDb.write(async () => {
        // 1. Fetch all records from all tables you want to clear
        const allUsers = await localDb.get<User>("users").query().fetch();
        const allRooms = await localDb.get<Room>("rooms").query().fetch();
        const allMessages = await localDb
          .get<Message>("messages")
          .query()
          .fetch();

        // 2. Prepare Destroy Operations for each collection
        const userDeleteOps = allUsers.map((u) =>
          u.prepareDestroyPermanently(),
        );
        const roomDeleteOps = allRooms.map((r) =>
          r.prepareDestroyPermanently(),
        );
        const msgDeleteOps = allMessages.map((m) =>
          m.prepareDestroyPermanently(),
        );

        // 3. Combine into a single batch operation
        const allOperations = [
          ...userDeleteOps,
          ...roomDeleteOps,
          ...msgDeleteOps,
        ];

        if (allOperations.length > 0) {
          await localDb.batch(...allOperations);
        }
      });

      try {
        await GoogleSignin.signOut();
      } catch (error) {
        console.log("Google signout ignored:", error);
      }

      setToken(null);
      setUser(null);
    } catch (e) {
      console.error("Logout error", e);
    } finally {
      setIsAuthLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthLoading, login, logout }}>
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
