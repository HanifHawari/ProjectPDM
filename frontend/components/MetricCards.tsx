"use client";

import { TrendingUp, TrendingDown, Users, CheckCircle, Banknote, Star } from "lucide-react";
import { AnalyticsSummary } from "@/types";

function fmt(n: number) {
  if (n >= 1_000_000_000) return `Rp ${(n / 1_000_000_000).toFixed(1)} M`;
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)} jt`;
  return `Rp ${n.toLocaleString("id-ID")}`;
}

interface MetricCardProps {
  label: string;
  value: string;
  icon: React.ElementType;
  trend?: number;
  color: string;
  loading?: boolean;
}

function MetricCard({ label, value, icon: Icon, trend, color, loading }: MetricCardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 p-5 flex items-start justify-between shadow-sm hover:shadow-md transition-shadow">
      <div>
        <p className="text-slate-500 text-xs font-medium uppercase tracking-wide mb-1">{label}</p>
        {loading ? (
          <div className="h-7 w-24 bg-slate-100 rounded animate-pulse" />
        ) : (
          <p className="text-2xl font-bold text-slate-800">{value}</p>
        )}
        {trend !== undefined && (
          <div className={`flex items-center gap-1 mt-1.5 text-xs font-medium ${trend >= 0 ? "text-green-600" : "text-red-500"}`}>
            {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            <span>{Math.abs(trend)}% vs periode terakhir</span>
          </div>
        )}
      </div>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={20} className="opacity-80" />
      </div>
    </div>
  );
}

interface MetricCardsProps {
  summary: AnalyticsSummary | null;
  loading?: boolean;
}

export function MetricCards({ summary, loading }: MetricCardsProps) {
  const cards: MetricCardProps[] = [
    {
      label: "Total Pengajuan",
      value: summary ? summary.total_applications.toLocaleString() : "—",
      icon: Users,
      trend: 4.2,
      color: "bg-blue-50 text-blue-600",
      loading,
    },
    {
      label: "Tingkat Persetujuan",
      value: summary ? `${summary.approval_rate}%` : "—",
      icon: CheckCircle,
      trend: -1.8,
      color: "bg-green-50 text-green-600",
      loading,
    },
    {
      label: "Rata-rata Pinjaman",
      value: summary ? fmt(summary.avg_loan_amount) : "—",
      icon: Banknote,
      trend: 2.1,
      color: "bg-amber-50 text-amber-600",
      loading,
    },
    {
      label: "Rata-rata Skor Kredit",
      value: summary ? summary.avg_credit_score.toString() : "—",
      icon: Star,
      trend: 0.5,
      color: "bg-purple-50 text-purple-600",
      loading,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => (
        <MetricCard key={c.label} {...c} />
      ))}
    </div>
  );
}
