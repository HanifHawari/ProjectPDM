"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Role } from "@/types";

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

export function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
    if (!loading && user && allowedRoles && !allowedRoles.includes(user.role)) {
      router.replace("/dashboard");
    }
  }, [user, loading, router, allowedRoles]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0B1929]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Memuat...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;
  if (allowedRoles && !allowedRoles.includes(user.role)) return null;

  return <>{children}</>;
}
