"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { AuthUser, Role } from "@/types";


interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const stored = localStorage.getItem("auth_user");
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch {}
      setLoading(false);
    } else {
      // Auto-login for demo purposes
      // To disable auto-login and make the website public, set this to false
      const ENABLE_AUTO_LOGIN = true; 
      
      if (ENABLE_AUTO_LOGIN) {
        const mockAdmin: AuthUser = {
          uid: "local-admin",
          name: "Admin Lokal",
          email: "petugas@bank.co.id",
          role: "admin",
        };
        localStorage.setItem("auth_token", "mock-token");
        localStorage.setItem("auth_user", JSON.stringify(mockAdmin));
        setUser(mockAdmin);
      }
      setLoading(false);
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    // Mock login for local mode
    const authUser: AuthUser = {
      uid: "local-admin",
      name: "Admin Lokal",
      email: email,
      role: "admin",
    };
    localStorage.setItem("auth_token", "mock-token");
    localStorage.setItem("auth_user", JSON.stringify(authUser));
    setUser(authUser);
  };

  const signOut = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
