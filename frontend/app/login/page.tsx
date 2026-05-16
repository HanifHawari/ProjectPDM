"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Building2, Lock, Mail } from "lucide-react";

export default function LoginPage() {
  const { signIn } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await signIn(email, password);
      router.replace("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0f1e",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "1.5rem",
      position: "relative",
      overflow: "hidden",
      fontFamily: "Inter, system-ui, sans-serif",
    }}>
      {/* Dot grid overlay */}
      <div style={{
        position: "absolute",
        inset: 0,
        backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.035) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
        pointerEvents: "none",
      }} />

      <div style={{
        position: "absolute",
        width: 560,
        height: 560,
        background: "radial-gradient(circle, rgba(37,99,235,0.06) 0%, transparent 70%)",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        pointerEvents: "none",
      }} />

      <div style={{
        position: "relative",
        width: "100%",
        maxWidth: 370,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "1.5rem",
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 48,
            height: 48,
            background: "#2563eb",
            borderRadius: 14,
            marginBottom: "0.75rem",
            boxShadow: "0 0 24px rgba(37,99,235,0.28)",
          }}>
            <Building2 size={22} color="#fff" />
          </div>
          <h1 style={{ fontSize: "1.35rem", fontWeight: 700, color: "#fff", letterSpacing: "0.06em", margin: 0 }}>
            BANK
          </h1>
          <p style={{ fontSize: "0.72rem", color: "#475569", margin: "0.25rem 0 0" }}>
            Pusat Layanan Pinjaman
          </p>
        </div>

        {/* Card — animated shimmer border via CSS class */}
        <div className="login-shimmer-card" style={{ width: "100%" }}>
          <div style={{
            background: "#0f172a",
            borderRadius: 17,
            padding: "2rem",
          }}>
            <p style={{
              fontSize: "0.7rem",
              fontWeight: 600,
              color: "#334155",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              margin: "0 0 1.5rem",
            }}>
              Masuk ke Sistem
            </p>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                <label style={{ fontSize: "0.68rem", fontWeight: 600, color: "#475569", textTransform: "uppercase", letterSpacing: "0.07em" }}>
                  Email
                </label>
                <div style={{ position: "relative" }}>
                  <div style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "#334155", pointerEvents: "none", display: "flex" }}>
                    <Mail size={13} />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="petugas@bank.co.id"
                    required
                    className="login-input"
                    style={{
                      width: "100%",
                      background: "#1e293b",
                      border: "1px solid #1e293b",
                      borderRadius: 9,
                      padding: "0.625rem 0.875rem 0.625rem 2.25rem",
                      fontSize: "0.8125rem",
                      color: "#cbd5e1",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                <label style={{ fontSize: "0.68rem", fontWeight: 600, color: "#475569", textTransform: "uppercase", letterSpacing: "0.07em" }}>
                  Password
                </label>
                <div style={{ position: "relative" }}>
                  <div style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "#334155", pointerEvents: "none", display: "flex" }}>
                    <Lock size={13} />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="login-input"
                    style={{
                      width: "100%",
                      background: "#1e293b",
                      border: "1px solid #1e293b",
                      borderRadius: 9,
                      padding: "0.625rem 0.875rem 0.625rem 2.25rem",
                      fontSize: "0.8125rem",
                      color: "#cbd5e1",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>

              {error && (
                <div style={{
                  fontSize: "0.73rem",
                  color: "#f87171",
                  background: "rgba(239,68,68,0.07)",
                  border: "1px solid rgba(239,68,68,0.15)",
                  borderRadius: 8,
                  padding: "0.5rem 0.75rem",
                }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="login-btn"
                style={{
                  width: "100%",
                  padding: "0.7rem",
                  background: "#2563eb",
                  color: "#fff",
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  border: "none",
                  borderRadius: 9,
                  cursor: loading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  marginTop: "0.25rem",
                  opacity: loading ? 0.5 : 1,
                  transition: "all 0.2s",
                }}
              >
                {loading ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    <span>Memproses...</span>
                  </>
                ) : "Masuk"}
              </button>
            </form>
          </div>
        </div>

        <p style={{ fontSize: "0.68rem", color: "#1e293b", textAlign: "center" }}>
          © 2025 BANK · Platform Analisis Kredit Berbasis AI
        </p>
      </div>
    </div>
  );
}
