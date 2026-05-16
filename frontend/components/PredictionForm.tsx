"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { predict, createApplication } from "@/lib/api";
import { Application, PredictRequest, PredictResponse, LoanTerm, LoanPurpose, PropertyArea } from "@/types";
import { useAppStore } from "@/stores/useAppStore";
import { ChevronRight, ChevronLeft, Loader2, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

type Step = 1 | 2 | 3 | 4;

const EMPTY: PredictRequest = {
  age: 30, gender: "Male", marital_status: "Married", dependents: 0, education_level: "Graduate",
  employment_status: "Salaried", employer_category: "Private",
  applicant_income: 0, coapplicant_income: 0, savings: 0, collateral_value: 0,
  existing_loans: 0, dti_ratio: 0.3, credit_score: 650,
  loan_amount: 0, loan_term: 36, loan_purpose: "Personal", property_area: "Urban",
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all";
const selectCls = inputCls;

export function PredictionForm() {
  const { user } = useAuth();
  const { addApplication, refresh } = useAppStore();
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<PredictRequest>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [predicting, setPredicting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<PredictResponse | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  const set = (key: keyof PredictRequest, value: unknown) =>
    setForm((f) => ({ ...f, [key]: value }));

  const validate = (s: Step): boolean => {
    const e: Record<string, string> = {};
    if (s === 1) {
      if (form.age < 18 || form.age > 80) e.age = "Usia harus antara 18–80 tahun";
    }
    if (s === 3) {
      if (form.applicant_income <= 0) e.applicant_income = "Pendapatan harus lebih dari 0";
      if (form.dti_ratio < 0 || form.dti_ratio > 1) e.dti_ratio = "Rasio harus antara 0–1";
      if (form.credit_score < 300 || form.credit_score > 850) e.credit_score = "Skor harus antara 300–850";
    }
    if (s === 4) {
      if (form.loan_amount <= 0) e.loan_amount = "Jumlah pinjaman harus lebih dari 0";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validate(step)) setStep((s) => Math.min(s + 1, 4) as Step); };
  const back = () => setStep((s) => Math.max(s - 1, 1) as Step);

  const submit = async () => {
    if (!validate(4)) {
      alert("Mohon lengkapi pengajuan (Jumlah pinjaman harus lebih dari 0)");
      return;
    }
    setPredicting(true);
    setResult(null);
    try {
      const res = await predict(form);
      setResult(res);
    } catch (e: unknown) {
      alert("Prediction failed: " + (e instanceof Error ? e.message : String(e)));
    } finally {
      setPredicting(false);
    }
  };

  const saveApp = async (appStatus: string) => {
    if (!result) return;
    setSaving(true);
    try {
      const app = await createApplication({
        ...form,
        prediction: result.prediction,
        confidence: result.confidence,
        risk_factors: result.risk_factors,
        officer_name: user?.name,
        status: appStatus as Application["status"],
      } as Parameters<typeof createApplication>[0]);
      setSavedId(app.id);
      addApplication(app);
      await refresh();
      alert(`Saved as ${app.id}`);
    } catch (e: unknown) {
      alert("Save failed: " + (e instanceof Error ? e.message : String(e)));
    } finally {
      setSaving(false);
    }
  };

  const isViewer = user?.role === "viewer";
  const canPredict = true; // Selalu aktifkan untuk pengetesan

  const steps = ["Identitas", "Pekerjaan", "Keuangan", "Pengajuan Pinjaman"];

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm flex flex-col h-full">
      <div className="px-5 py-4 border-b border-slate-100">
        <h2 className="text-sm font-bold text-slate-800">Form Prediksi Pinjaman</h2>
        <p className="text-xs text-slate-500 mt-0.5">Langkah {step} dari 4 — {steps[step - 1]}</p>
        <div className="flex gap-1 mt-3">
          {steps.map((_, i) => (
            <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i + 1 <= step ? "bg-blue-600" : "bg-slate-100"}`} />
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {!result ? (
          <>
        {/* Tahap 1: Identitas */}
        {step === 1 && (
          <div className="space-y-4 animate-in slide-in-from-right-4 duration-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Usia">
                <input type="number" value={form.age} onChange={(e) => set("age", +e.target.value)} className={inputCls} />
                {errors.age && <p className="text-red-500 text-xs mt-1">{errors.age}</p>}
              </Field>
              <Field label="Jenis Kelamin">
                <select value={form.gender} onChange={(e) => set("gender", e.target.value)} className={selectCls}>
                  <option value="Male">Laki-laki</option>
                  <option value="Female">Perempuan</option>
                </select>
              </Field>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Status Pernikahan">
                <select value={form.marital_status} onChange={(e) => set("marital_status", e.target.value)} className={selectCls}>
                  <option value="Single">Lajang</option>
                  <option value="Married">Menikah</option>
                </select>
              </Field>
              <Field label="Tanggungan">
                <input type="number" value={form.dependents} min={0} max={10} onChange={(e) => set("dependents", +e.target.value)} className={inputCls} />
              </Field>
            </div>
            <Field label="Tingkat Pendidikan">
              <select value={form.education_level} onChange={(e) => set("education_level", e.target.value)} className={selectCls}>
                <option value="Graduate">Sarjana (Lulus)</option>
                <option value="Not Graduate">Non-Sarjana</option>
              </select>
            </Field>
          </div>
        )}

        {/* Tahap 2: Pekerjaan */}
        {step === 2 && (
          <div className="space-y-4 animate-in slide-in-from-right-4 duration-200">
            <Field label="Status Pekerjaan">
              <select value={form.employment_status} onChange={(e) => set("employment_status", e.target.value)} className={selectCls}>
                <option value="Salaried">Karyawan</option>
                <option value="Self-employed">Wiraswasta</option>
                <option value="Contract">Kontrak</option>
                <option value="Unemployed">Tidak Bekerja</option>
              </select>
            </Field>
            <Field label="Kategori Pemberi Kerja">
              <select value={form.employer_category} onChange={(e) => set("employer_category", e.target.value)} className={selectCls}>
                <option value="Government">Pemerintah (PNS)</option>
                <option value="MNC">MNC (Multinasional)</option>
                <option value="Private">Swasta</option>
                <option value="Business">Bisnis Sendiri</option>
                <option value="Unemployed">Tidak Ada</option>
              </select>
            </Field>
          </div>
        )}

        {/* Tahap 3: Keuangan */}
        {step === 3 && (
          <div className="space-y-4 animate-in slide-in-from-right-4 duration-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Pendapatan Bulanan (Rp)">
                <input type="number" value={form.applicant_income} onChange={(e) => set("applicant_income", +e.target.value)} className={inputCls} />
                {errors.applicant_income && <p className="text-red-500 text-xs mt-1">{errors.applicant_income}</p>}
              </Field>
              <Field label="Pendapatan Tambahan (Rp)">
                <input type="number" value={form.coapplicant_income} onChange={(e) => set("coapplicant_income", +e.target.value)} className={inputCls} />
              </Field>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Total Tabungan (Rp)">
                <input type="number" value={form.savings} onChange={(e) => set("savings", +e.target.value)} className={inputCls} />
              </Field>
              <Field label="Nilai Agunan/Jaminan (Rp)">
                <input type="number" value={form.collateral_value} onChange={(e) => set("collateral_value", +e.target.value)} className={inputCls} />
              </Field>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Jumlah Pinjaman Lain">
                <input type="number" value={form.existing_loans} min={0} onChange={(e) => set("existing_loans", +e.target.value)} className={inputCls} />
              </Field>
              <Field label="Rasio Hutang (DTI 0–1)">
                <input type="number" step={0.01} min={0} max={1} value={form.dti_ratio} onChange={(e) => set("dti_ratio", +e.target.value)} className={inputCls} />
                {errors.dti_ratio && <p className="text-red-500 text-xs mt-1">{errors.dti_ratio}</p>}
              </Field>
            </div>
            <Field label="Skor Kredit (300–850)">
              <input type="number" value={form.credit_score} min={300} max={850} onChange={(e) => set("credit_score", +e.target.value)} className={inputCls} />
              {errors.credit_score && <p className="text-red-500 text-xs mt-1">{errors.credit_score}</p>}
            </Field>
          </div>
        )}

        {/* Tahap 4: Detail Pinjaman */}
        {step === 4 && (
          <div className="space-y-4 animate-in slide-in-from-right-4 duration-200">
            <Field label="Jumlah Pinjaman (Rp)">
              <input type="number" value={form.loan_amount} onChange={(e) => set("loan_amount", +e.target.value)} className={inputCls} />
              {errors.loan_amount && <p className="text-red-500 text-xs mt-1">{errors.loan_amount}</p>}
            </Field>
            <Field label="Tenor Pinjaman">
              <select value={form.loan_term} onChange={(e) => set("loan_term", +e.target.value as LoanTerm)} className={selectCls}>
                <option value={12}>12 Bulan</option>
                <option value={24}>24 Bulan</option>
                <option value={36}>36 Bulan</option>
                <option value={60}>60 Bulan</option>
                <option value={84}>84 Bulan</option>
              </select>
            </Field>
            <Field label="Tujuan Pinjaman">
              <select value={form.loan_purpose} onChange={(e) => set("loan_purpose", e.target.value as LoanPurpose)} className={selectCls}>
                <option value="Car">Mobil</option>
                <option value="Education">Pendidikan</option>
                <option value="Home">Rumah</option>
                <option value="Personal">Pribadi/Konsumsi</option>
                <option value="Business">Modal Usaha</option>
              </select>
            </Field>
            <Field label="Area Properti">
              <select value={form.property_area} onChange={(e) => set("property_area", e.target.value as PropertyArea)} className={selectCls}>
                <option value="Rural">Pedesaan</option>
                <option value="Semiurban">Semi-Perkotaan</option>
                <option value="Urban">Perkotaan</option>
              </select>
            </Field>
          </div>
        )}
          </>
        ) : (
          <div className="animate-in zoom-in-95 duration-300">
            {/* Hasil Prediksi */}
            <div className={`rounded-xl p-4 border ${result.prediction === "Approved" ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
              <div className="flex items-center gap-3 mb-3">
                {result.prediction === "Approved"
                  ? <CheckCircle2 className="text-green-600" size={24} />
                  : <XCircle className="text-red-500" size={24} />
                }
                <div>
                  <p className={`font-bold text-base ${result.prediction === "Approved" ? "text-green-700" : "text-red-600"}`}>
                    {result.prediction === "Approved" ? "✅ DISETUJUI" : "❌ DITOLAK"}
                  </p>
                  <p className="text-xs text-slate-500">Tingkat keyakinan {Math.round(result.confidence * 100)}%</p>
                </div>
              </div>
              {/* Indikator Keyakinan */}
              <div className="h-2 bg-white rounded-full overflow-hidden mb-3">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${result.prediction === "Approved" ? "bg-green-500" : "bg-red-500"}`}
                  style={{ width: `${Math.round(result.confidence * 100)}%` }}
                />
              </div>
              {/* Faktor Risiko */}
              {result.risk_factors.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-600 mb-2">Faktor Risiko Utama:</p>
                  {result.risk_factors.map((rf) => (
                    <div key={rf} className="flex items-center gap-2 text-xs text-slate-600">
                      <AlertTriangle size={11} className="text-amber-500 shrink-0" />
                      {rf}
                    </div>
                  ))}
                </div>
              )}
              {/* Tombol Aksi */}
              {!isViewer && !savedId && (
                <div className="flex gap-2 mt-4 flex-wrap">
                  <button onClick={() => saveApp("Pending Review")} disabled={saving}
                    className="text-xs px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 font-medium">
                    {saving ? "Menyimpan…" : "Simpan Pengajuan"}
                  </button>
                  {user?.role === "admin" && (
                    <button onClick={() => saveApp("Approved (Manual)")} disabled={saving}
                      className="text-xs px-3 py-1.5 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 font-medium">
                      Setujui (Admin)
                    </button>
                  )}
                  <button onClick={() => saveApp("Sent to Review")} disabled={saving}
                    className="text-xs px-3 py-1.5 rounded-lg bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-50 font-medium">
                    Kirim ke Reviewer
                  </button>
                </div>
              )}
              {savedId && <p className="text-xs text-green-600 mt-3 font-medium">✓ Tersimpan dengan ID {savedId}</p>}
            </div>
            
            <button 
              onClick={() => { setResult(null); setStep(1); }}
              className="w-full mt-4 py-2 text-xs text-slate-500 hover:text-blue-600 transition-colors border border-dashed border-slate-200 rounded-lg"
            >
              ← Buat Pengajuan Baru
            </button>
          </div>
        )}
      </div>

      {/* Navigasi Bawah */}
      <div className="px-5 py-4 border-t border-slate-100 flex justify-between">
        <button onClick={back} disabled={step === 1 || !!result}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
          <ChevronLeft size={16} /> Kembali
        </button>
        {step < 4 ? (
          <button onClick={next}
            className="flex items-center gap-1.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors">
            Lanjut <ChevronRight size={16} />
          </button>
        ) : (
          <button onClick={submit} disabled={predicting || !canPredict}
            className="flex items-center gap-1.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 px-4 py-2 rounded-lg transition-colors">
            {predicting ? <><Loader2 size={14} className="animate-spin" /> Memproses…</> : "Prediksi Kelayakan"}
          </button>
        )}
      </div>
    </div>
  );
}
