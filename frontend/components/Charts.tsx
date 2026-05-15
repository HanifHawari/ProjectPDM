"use client";

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend,
  LineChart, Line, CartesianGrid,
} from "recharts";
import { AnalyticsSummary } from "@/types";

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EF4444"];

interface ChartsProps {
  summary: AnalyticsSummary | null;
}

export function Charts({ summary }: ChartsProps) {
  if (!summary) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 h-64 animate-pulse">
            <div className="h-4 w-32 bg-slate-100 rounded mb-4" />
            <div className="h-44 bg-slate-50 rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Bar: Approval rate by purpose */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-4">Tingkat Persetujuan per Tujuan</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={summary.by_purpose} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <XAxis dataKey="purpose" tick={{ fontSize: 10, fill: "#94a3b8" }} />
            <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} unit="%" />
            <Tooltip
              formatter={(v) => [`${v}%`, "Tingkat Persetujuan"]}
              contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e2e8f0" }}
            />
            <Bar dataKey="approval_rate" radius={[4, 4, 0, 0]}>
              {summary.by_purpose.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Donut: Employment distribution */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-4">Distribusi Pekerjaan</h3>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={summary.employment_distribution}
              dataKey="count"
              nameKey="status"
              cx="50%" cy="50%"
              innerRadius={50} outerRadius={80}
              paddingAngle={3}
            >
              {summary.employment_distribution.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e2e8f0" }} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 10, color: "#64748b" }} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Line: Monthly trend */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-4">Volume Pengajuan Bulanan</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={summary.monthly_trend} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize: 9, fill: "#94a3b8" }} />
            <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} />
            <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e2e8f0" }} />
            <Line type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={2} dot={{ r: 3, fill: "#3B82F6" }} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
