"use client";

import { useEffect } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { Sidebar } from "@/components/Sidebar";
import { ApplicationsTable } from "@/components/ApplicationsTable";
import { useAppStore } from "@/stores/useAppStore";

function ApplicationsContent() {
  const { loadApplications } = useAppStore();
  useEffect(() => { loadApplications(); }, []);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-slate-50">
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-slate-100 px-6 py-3">
          <h1 className="text-sm font-bold text-slate-800">SEMUA APLIKASI</h1>
          <p className="text-xs text-slate-500">Telusuri, saring, dan kelola aplikasi pinjaman</p>
        </div>
        <div className="p-6" style={{ height: "calc(100vh - 64px)" }}>
          <ApplicationsTable />
        </div>
      </main>
    </div>
  );
}

export default function ApplicationsPage() {
  return <AuthGuard><ApplicationsContent /></AuthGuard>;
}
