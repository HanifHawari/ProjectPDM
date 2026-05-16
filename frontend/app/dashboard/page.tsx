"use client";

import { useEffect } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { Sidebar } from "@/components/Sidebar";
import { MetricCards } from "@/components/MetricCards";
import { PredictionForm } from "@/components/PredictionForm";
import { ApplicationsTable } from "@/components/ApplicationsTable";
import { Charts } from "@/components/Charts";
import { HeatmapRisk } from "@/components/HeatmapRisk";
import { useAppStore } from "@/stores/useAppStore";
import { RefreshCw, Menu } from "lucide-react";

function DashboardContent() {
  const { summary, loadingSummary, applications, refresh, loadApplications, loadSummary, toggleSidebar } = useAppStore();

  useEffect(() => {
    loadApplications();
    loadSummary();
    // Auto-refresh every 30s
    const interval = setInterval(() => {
      loadApplications();
      loadSummary();
    }, 30_000);
    return () => clearInterval(interval);
  }, [loadApplications, loadSummary]);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-slate-50 w-full">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-slate-100 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => toggleSidebar()} 
              className="md:hidden text-slate-500 hover:text-slate-800"
            >
              <Menu size={20} />
            </button>
            <div>
              <h1 className="text-sm font-bold text-slate-800">Dashboard</h1>
              <p className="text-xs text-slate-500 hidden sm:block">Platform Persetujuan Pinjaman</p>
            </div>
          </div>
          <button onClick={() => refresh()} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors">
            <RefreshCw size={13} /> <span className="hidden sm:inline">Segarkan</span>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Hero metrics */}
          <MetricCards summary={summary} loading={loadingSummary} />

          {/* Prediction form + table */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6" style={{ minHeight: "520px" }}>
            <div className="lg:col-span-2">
              <PredictionForm />
            </div>
            <div className="lg:col-span-3">
              <ApplicationsTable />
            </div>
          </div>

          {/* Analytics charts */}
          <Charts summary={summary} />

          {/* Heatmap */}
          <HeatmapRisk applications={applications} />
        </div>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}
