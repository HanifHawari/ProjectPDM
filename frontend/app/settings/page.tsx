"use client";

import { AuthGuard } from "@/components/AuthGuard";
import { Sidebar } from "@/components/Sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { Shield } from "lucide-react";

function SettingsContent() {
  const { user } = useAuth();
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-slate-50">
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-slate-100 px-6 py-3">
          <h1 className="text-sm font-bold text-slate-800">Pengaturan</h1>
          <p className="text-xs text-slate-500">Konfigurasi platform (Khusus Admin)</p>
        </div>
        <div className="p-6 max-w-2xl space-y-6">
          {/* Admin info */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield size={20} className="text-amber-500" />
              <h2 className="text-sm font-bold text-slate-800">Akun Administrator</h2>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Nama</p>
                <p className="font-semibold text-slate-800">{user?.name}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Email</p>
                <p className="font-semibold text-slate-800">{user?.email ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Peran</p>
                <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200">
                  Administrator
                </span>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">ID Pengguna</p>
                <p className="font-mono text-xs text-slate-500">{user?.uid}</p>
              </div>
            </div>
          </div>
          {/* ML model info */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
            <h2 className="text-sm font-bold text-slate-800 mb-4">Informasi Model AI</h2>
            <div className="grid grid-cols-2 gap-3 text-xs">
              {[
                ["Algoritma",   "Random Forest Classifier"],
                ["Estimator",   "50 trees"],
                ["Fitur",       "27 (one-hot encoded)"],
                ["Bobot Kelas", "Seimbang (Balanced)"],
                ["Library",     "scikit-learn 1.6.1"],
                ["Kelas",       "0 = Ditolak, 1 = Disetujui"],
              ].map(([k, v]) => (
                <div key={String(k)} className="bg-slate-50 rounded-lg p-3">
                  <p className="text-slate-400 uppercase tracking-wide text-[10px]">{k}</p>
                  <p className="text-slate-800 font-semibold mt-0.5">{v}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <AuthGuard allowedRoles={["admin"]}>
      <SettingsContent />
    </AuthGuard>
  );
}
