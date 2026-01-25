import React, { createContext, useContext, useEffect, useState } from "react";
import { database as localDb } from "../db"; // Your initialized WatermelonDB instance
import User from "../db/models/User"; // Rename import to avoid clash with interface

// 1. Types
// Note: We use the Shape of the user for the UI, but we store it in the DB model
interface UserData {
  id: string;
  name: string;
  email: string;
  profilePictureUrl?: string;
}

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
        // Wipe the users table
        const allUsers = await localDb.get<User>("users").query().fetch();
        // batch delete is faster than iterating with await
        const deleteOps = allUsers.map((user) =>
          user.prepareDestroyPermanently()
        );
        await localDb.batch(...deleteOps);
      });

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
