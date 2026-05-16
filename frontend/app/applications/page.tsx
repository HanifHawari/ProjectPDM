"use client";

import { useEffect } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { Sidebar } from "@/components/Sidebar";
import { ApplicationsTable } from "@/components/ApplicationsTable";
import { useAppStore } from "@/stores/useAppStore";

import { Menu } from "lucide-react";

function ApplicationsContent() {
  const { loadApplications, toggleSidebar } = useAppStore();
  useEffect(() => { loadApplications(); }, [loadApplications]);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-slate-50 w-full">
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-slate-100 px-6 py-3 flex items-center gap-3">
          <button 
            onClick={() => toggleSidebar()} 
            className="md:hidden text-slate-500 hover:text-slate-800"
          >
            <Menu size={20} />
          </button>
          <div>
            <h1 className="text-sm font-bold text-slate-800">SEMUA APLIKASI</h1>
            <p className="text-xs text-slate-500 hidden sm:block">Telusuri, saring, dan kelola aplikasi pinjaman</p>
          </div>
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
