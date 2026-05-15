"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/stores/useAppStore";
import { Application, ApplicationStatus } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { Search, ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";

const STATUS_BADGE: Record<string, string> = {
  "Approved":         "bg-green-100 text-green-700 border-green-200",
  "Rejected":         "bg-red-100 text-red-600 border-red-200",
  "Pending Review":   "bg-amber-100 text-amber-700 border-amber-200",
  "Approved (Manual)":"bg-emerald-100 text-emerald-700 border-emerald-200",
  "Sent to Review":   "bg-blue-100 text-blue-700 border-blue-200",
};

const STATUS_LABELS: Record<string, string> = {
  "Approved":         "Disetujui",
  "Rejected":         "Ditolak",
  "Pending Review":   "Menunggu Review",
  "Approved (Manual)":"Disetujui (Manual)",
  "Sent to Review":   "Dikirim ke Reviewer",
};

function fmt(n: number) {
  return `Rp ${n.toLocaleString("id-ID")}`;
}

interface SlideOutPanelProps {
  app: Application;
  onClose: () => void;
  onUpdateStatus: (id: string, status: ApplicationStatus) => void;
}

function SlideOutPanel({ app, onClose, onUpdateStatus }: SlideOutPanelProps) {
  const { user } = useAuth();
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="w-[400px] bg-white h-full shadow-2xl overflow-y-auto animate-in slide-in-from-right-full duration-300">
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-800">{app.id}</h3>
            <p className="text-xs text-slate-500">{app.applicant_name ?? "—"}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-xl font-light">✕</button>
        </div>
        <div className="px-6 py-5 space-y-5">
          {/* Status */}
          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold border ${STATUS_BADGE[app.status] ?? ""}`}>
            {STATUS_LABELS[app.status] || app.status}
          </span>

          {/* Prediction result */}
          {app.prediction && (
            <div className={`rounded-xl p-4 ${app.prediction === "Approved" ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
              <p className={`font-bold text-sm ${app.prediction === "Approved" ? "text-green-700" : "text-red-600"}`}>
                AI: {app.prediction === "Approved" ? "✅ DISETUJUI" : "❌ DITOLAK"}
              </p>
              {app.confidence && (
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>Tingkat Keyakinan</span>
                    <span>{Math.round(app.confidence * 100)}%</span>
                  </div>
                  <div className="h-1.5 bg-white rounded-full">
                    <div className={`h-full rounded-full ${app.prediction === "Approved" ? "bg-green-500" : "bg-red-500"}`}
                      style={{ width: `${Math.round(app.confidence * 100)}%` }} />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Key financials */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Keuangan</p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ["Pendapatan",     fmt(app.applicant_income)],
                ["Jml Pinjaman",   fmt(app.loan_amount)],
                ["Skor Kredit",    app.credit_score],
                ["Rasio DTI",      `${(app.dti_ratio * 100).toFixed(0)}%`],
                ["Tabungan",       fmt(app.savings)],
                ["Jaminan",        fmt(app.collateral_value)],
              ].map(([k, v]) => (
                <div key={String(k)} className="bg-slate-50 rounded-lg p-2.5">
                  <p className="text-slate-400 text-[10px] uppercase">{k}</p>
                  <p className="text-slate-800 font-semibold text-xs mt-0.5">{v}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Risk factors */}
          {app.risk_factors && app.risk_factors.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Faktor Risiko</p>
              {app.risk_factors.map((rf) => (
                <div key={rf} className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-1.5 mb-1.5">
                  ⚠ {rf}
                </div>
              ))}
            </div>
          )}

          {/* Officer actions */}
          {user?.role !== "viewer" && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Tindakan</p>
              <div className="flex flex-col gap-2">
                {user?.role === "admin" && (
                  <button onClick={() => onUpdateStatus(app.id, "Approved (Manual)")}
                    className="w-full py-2 rounded-lg bg-green-600 text-white text-xs font-semibold hover:bg-green-700 transition-colors">
                    Setujui (Admin)
                  </button>
                )}
                <button onClick={() => onUpdateStatus(app.id, "Rejected")}
                  className="w-full py-2 rounded-lg bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 border border-red-200 transition-colors">
                  Tolak Pengajuan
                </button>
                <button onClick={() => onUpdateStatus(app.id, "Sent to Review")}
                  className="w-full py-2 rounded-lg bg-amber-50 text-amber-700 text-xs font-semibold hover:bg-amber-100 border border-amber-200 transition-colors">
                  Kirim ke Reviewer
                </button>
              </div>
            </div>
          )}

          {/* Meta */}
          <div className="text-xs text-slate-400 pt-2 border-t border-slate-100">
            <p>Dibuat: {new Date(app.created_at).toLocaleDateString("id-ID")}</p>
            {app.officer_name && <p>Petugas: {app.officer_name}</p>}
            {app.officer_override && <p>Disetujui oleh: {app.officer_override}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ApplicationsTable() {
  const { applications, totalApps, totalPages, loadingApps, filters, setFilter, resetFilters, loadApplications, updateApplicationStatus } = useAppStore();
  const { user } = useAuth();
  const [selected, setSelected] = useState<Application | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => { loadApplications(); }, []);

  const filtered = search
    ? applications.filter((a) =>
        a.id.toLowerCase().includes(search.toLowerCase()) ||
        (a.applicant_name ?? "").toLowerCase().includes(search.toLowerCase())
      )
    : applications;

  const handleStatus = async (id: string, status: ApplicationStatus) => {
    await updateApplicationStatus(id, status, user?.name);
    setSelected(null);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm flex flex-col h-full">
      {/* Toolbar */}
      <div className="px-5 py-4 border-b border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-800">Daftar Pengajuan <span className="text-slate-400 font-normal">({totalApps})</span></h2>
          <button onClick={resetFilters} className="text-xs text-slate-400 hover:text-slate-700 flex items-center gap-1">
            <SlidersHorizontal size={12} /> Reset
          </button>
        </div>
        <div className="flex gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[160px]">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari ID atau nama…"
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40" />
          </div>
          {[
            { label: "Tujuan",    key: "loan_purpose",    opts: ["","Car","Education","Home","Personal","Business"], labels: ["Semua Tujuan", "Mobil", "Pendidikan", "Rumah", "Pribadi", "Bisnis"] },
            { label: "Area",      key: "property_area",   opts: ["","Rural","Semiurban","Urban"], labels: ["Semua Area", "Pedesaan", "Semi-Perkotaan", "Perkotaan"] },
            { label: "Pekerjaan", key: "employment_status",opts: ["","Salaried","Self-employed","Contract","Unemployed"], labels: ["Semua Pekerjaan", "Karyawan", "Wirausaha", "Kontrak", "Pengangguran"] },
            { label: "Status",    key: "status",          opts: ["","Approved","Rejected","Pending Review","Approved (Manual)","Sent to Review"], labels: ["Semua Status", "Disetujui", "Ditolak", "Menunggu Review", "Disetujui (Manual)", "Dikirim ke Reviewer"] },
          ].map(({ label, key, opts, labels }) => (
            <select key={key} value={filters[key as keyof typeof filters] as string}
              onChange={(e) => setFilter(key as keyof typeof filters, e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/40 bg-white text-slate-600">
              {opts.map((o, i) => <option key={o} value={o}>{labels[i] || label}</option>)}
            </select>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-slate-50 border-b border-slate-100">
            <tr>
              {["ID", "Pendapatan", "Jml Pinjaman", "Skor", "DTI", "Tujuan", "Status"].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loadingApps ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="border-b border-slate-50">
                  {Array.from({ length: 7 }).map((_, j) => (
                    <td key={j} className="px-4 py-3"><div className="h-3 bg-slate-100 rounded animate-pulse" /></td>
                  ))}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-slate-400">Tidak ada pengajuan ditemukan</td></tr>
            ) : (
              filtered.map((app) => (
                <tr key={app.id} onClick={() => setSelected(app)}
                  className="border-b border-slate-50 hover:bg-blue-50/40 cursor-pointer transition-colors">
                  <td className="px-4 py-3 font-mono font-semibold text-blue-700">{app.id}</td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{(app.applicant_income / 1_000_000).toFixed(1)}jt</td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{(app.loan_amount / 1_000_000).toFixed(0)}jt</td>
                  <td className="px-4 py-3 font-medium text-slate-700">{app.credit_score}</td>
                  <td className="px-4 py-3 text-slate-600">{(app.dti_ratio * 100).toFixed(0)}%</td>
                  <td className="px-4 py-3 text-slate-600">{app.loan_purpose}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold border ${STATUS_BADGE[app.status] ?? "bg-slate-100 text-slate-600"}`}>
                      {STATUS_LABELS[app.status] || app.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
        <p className="text-xs text-slate-500">Halaman {filters.page} dari {totalPages}</p>
        <div className="flex gap-1">
          <button disabled={filters.page <= 1} onClick={() => setFilter("page", filters.page - 1)}
            className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 text-slate-500">
            <ChevronLeft size={14} />
          </button>
          <button disabled={filters.page >= totalPages} onClick={() => setFilter("page", filters.page + 1)}
            className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 text-slate-500">
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Slide-out panel */}
      {selected && (
        <SlideOutPanel app={selected} onClose={() => setSelected(null)} onUpdateStatus={handleStatus} />
      )}
    </div>
  );
}
