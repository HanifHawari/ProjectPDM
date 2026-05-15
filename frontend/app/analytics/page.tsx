"use client";

import { useEffect } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { Sidebar } from "@/components/Sidebar";
import { Charts } from "@/components/Charts";
import { HeatmapRisk } from "@/components/HeatmapRisk";
import { MetricCards } from "@/components/MetricCards";
import { useAppStore } from "@/stores/useAppStore";

function AnalyticsContent() {
  const { summary, loadingSummary, applications, loadSummary, loadApplications } = useAppStore();
  useEffect(() => { loadSummary(); loadApplications(); }, []);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-slate-50">
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-slate-100 px-6 py-3">
          <h1 className="text-sm font-bold text-slate-800">Analisis</h1>
          <p className="text-xs text-slate-500">Analisis kinerja portofolio dan tren</p>
        </div>
        <div className="p-6 space-y-6">
          <MetricCards summary={summary} loading={loadingSummary} />
          <Charts summary={summary} />
          <HeatmapRisk applications={applications} />
        </div>
      </main>
    </div>
  );
}

export default function AnalyticsPage() {
  return <AuthGuard><AnalyticsContent /></AuthGuard>;
}
