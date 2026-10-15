import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { getMe } from "../services/api";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: "user" | "driver" | "admin" | string;
  userId?: string;
  phone?: string;
  avatar?: string;
  image?: string;
  location?: string;
  isVerified?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string, userData: User) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => {},
  logout: async () => {},
  updateUser: async () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from AsyncStorage on app initialization
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const [storedToken, storedUser] = await Promise.all([
          AsyncStorage.getItem("token"),
          AsyncStorage.getItem("user"),
        ]);

        if (storedToken && storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setToken(storedToken);
          setUser(parsedUser);

          // Asynchronously verify & refresh session with server
          getMe()
            .then(async (res) => {
              if (res.data) {
                setUser(res.data);
                await AsyncStorage.setItem("user", JSON.stringify(res.data));
              }
            })
            .catch(async (err) => {
              // If server returns 401 or user was banned/deleted
              if (err.response?.status === 401 || err.response?.status === 403) {
                console.warn("Session expired or unauthorized. Clearing stored credentials.");
                await AsyncStorage.multiRemove(["token", "user"]);
                setToken(null);
                setUser(null);
              }
            });
        }
      } catch (error) {
        console.error("Error restoring auth session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (newToken: string, userData: User) => {
    try {
      setToken(newToken);
      setUser(userData);
      await Promise.all([
        AsyncStorage.setItem("token", newToken),
        AsyncStorage.setItem("user", JSON.stringify(userData)),
      ]);
    } catch (error) {
      console.error("Error persisting login session:", error);
    }
  };

  const logout = async () => {
    try {
      setToken(null);
      setUser(null);
      await AsyncStorage.multiRemove(["token", "user", "lastRoute"]);
    } catch (error) {
      console.error("Error clearing session on logout:", error);
    }
  };

  const updateUser = async (updatedFields: Partial<User>) => {
    try {
      if (!user) return;
      const updatedUser = { ...user, ...updatedFields };
      setUser(updatedUser);
      await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
    } catch (error) {
      console.error("Error updating user session:", error);
    }
  };

  const refreshProfile = async () => {
    try {
      const res = await getMe();
      if (res.data) {
        setUser(res.data);
        await AsyncStorage.setItem("user", JSON.stringify(res.data));
      }
    } catch (error) {
      console.error("Error refreshing user profile:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token && !!user,
        login,
        logout,
        updateUser,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
