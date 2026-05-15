"use client";

import { AuthGuard } from "@/components/AuthGuard";
import { Sidebar } from "@/components/Sidebar";
import { PredictionForm } from "@/components/PredictionForm";

function NewApplicationContent() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-slate-50">
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-slate-100 px-6 py-3">
          <h1 className="text-sm font-bold text-slate-800">Pengajuan Baru</h1>
          <p className="text-xs text-slate-500">Masukkan data pemohon untuk mendapatkan prediksi AI secara instan</p>
        </div>
        <div className="p-6 max-w-xl">
          <PredictionForm />
        </div>
      </main>
    </div>
  );
}

export default function NewApplicationPage() {
  return (
    <AuthGuard allowedRoles={["admin", "credit_officer"]}>
      <NewApplicationContent />
    </AuthGuard>
  );
}
