// app/providers/AuthProvider.tsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { apiClient } from "@/app/lib/api-client";
import { Role } from "@prisma/client";

type User = {
  id: string;
  name: string | null;
  email: string;
  role: Role;
  teamId: string | null;
};

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const data = await apiClient.getCurrentUser();
        setUser(data?.user || data || null);
      } catch (error) {
        console.error("No active user session");
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const logout = async () => {
    try {
      await apiClient.logout();
      setUser(null);
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
