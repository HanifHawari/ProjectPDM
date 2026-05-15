"use client";

import { useMemo } from "react";
import { Application } from "@/types";

interface HeatmapRiskProps {
  applications: Application[];
}

const CREDIT_BUCKETS = [550, 600, 650, 700, 750, 800];
const DTI_BUCKETS    = [0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1]; // top to bottom

export function HeatmapRisk({ applications }: HeatmapRiskProps) {
  const matrix = useMemo(() => {
    const grid: Record<string, { approved: number; total: number }> = {};
    CREDIT_BUCKETS.forEach((cs) =>
      DTI_BUCKETS.forEach((dti) => { grid[`${cs}_${dti}`] = { approved: 0, total: 0 }; })
    );
    applications.forEach((app) => {
      const cs = CREDIT_BUCKETS.reduce((prev, cur) =>
        Math.abs(cur - app.credit_score) < Math.abs(prev - app.credit_score) ? cur : prev
      );
      const dti = DTI_BUCKETS.reduce((prev, cur) =>
        Math.abs(cur - app.dti_ratio) < Math.abs(prev - app.dti_ratio) ? cur : prev
      );
      const key = `${cs}_${dti}`;
      if (grid[key]) {
        grid[key].total++;
        if (app.status === "Approved" || app.status === "Approved (Manual)") {
          grid[key].approved++;
        }
      }
    });
    return grid;
  }, [applications]);

  function cellColor(key: string): string {
    const cell = matrix[key];
    if (!cell || cell.total === 0) return "#f8fafc";
    const rate = cell.approved / cell.total;
    if (rate >= 0.7) return "#bbf7d0";  // green-200
    if (rate >= 0.5) return "#86efac";  // green-300
    if (rate >= 0.35) return "#fef08a"; // yellow-200
    if (rate >= 0.2) return "#fdba74";  // orange-300
    return "#fca5a5";                   // red-300
  }

  function cellText(key: string): string {
    const cell = matrix[key];
    if (!cell || cell.total === 0) return "";
    return `${Math.round((cell.approved / cell.total) * 100)}%`;
  }

  const CELL_W = 56;
  const CELL_H = 36;

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Peta Sebaran Risiko</h3>
          <p className="text-[10px] text-slate-400 mt-0.5">Skor Kredit × Rasio DTI — densitas persetujuan</p>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-slate-500">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-300 inline-block" /> Risiko Tinggi</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-300 inline-block" /> Risiko Rendah</span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <div className="inline-flex flex-col">
          {/* X-axis labels */}
          <div className="flex ml-10 mb-1">
            {CREDIT_BUCKETS.map((cs) => (
              <div key={cs} style={{ width: CELL_W }} className="text-center text-[9px] text-slate-400 font-medium">{cs}</div>
            ))}
          </div>
          {/* Grid */}
          {DTI_BUCKETS.map((dti) => (
            <div key={dti} className="flex items-center">
              <div style={{ width: 36 }} className="text-right pr-2 text-[9px] text-slate-400 shrink-0">{dti}</div>
              {CREDIT_BUCKETS.map((cs) => {
                const key = `${cs}_${dti}`;
                const count = matrix[key]?.total ?? 0;
                return (
                  <div
                    key={key}
                    title={`CS:${cs} DTI:${dti} — ${matrix[key]?.approved ?? 0}/${count} approved`}
                    style={{ width: CELL_W, height: CELL_H, backgroundColor: cellColor(key) }}
                    className="flex items-center justify-center text-[9px] font-semibold text-slate-700 border border-white rounded transition-opacity hover:opacity-80"
                  >
                    {cellText(key)}
                  </div>
                );
              })}
            </div>
          ))}
          {/* Axis labels */}
          <div className="flex ml-10 mt-1">
            <div className="text-[9px] text-slate-400 text-center" style={{ width: CELL_W * CREDIT_BUCKETS.length }}>
              ← Skor Kredit →
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
