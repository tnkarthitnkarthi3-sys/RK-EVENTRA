"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Lock, Mail, KeyRound, Sparkles } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function fillFixedAdmin() {
    setEmail("admineventra@gmail.com");
    setPassword("admineventra");
  }

  async function handleAdminLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data?.message || "Admin login failed.");
        return;
      }

      if (data.user?.role !== "ADMIN") {
        setMessage("Only administrators can access this page.");
        return;
      }

      router.push("/admin/dashboard");
    } catch (error) {
      console.error("Admin login error:", error);
      setMessage("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-purple-950 to-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* 3D Ambient Glowing Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/15 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md rounded-3xl border border-amber-400/30 bg-slate-900/80 p-8 sm:p-10 shadow-[0_20px_60px_-15px_rgba(245,158,11,0.25)] backdrop-blur-2xl relative z-10 transition-all hover:border-amber-400/50">
        <div className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600 text-3xl shadow-xl shadow-amber-500/20 border border-amber-300/40 transform hover:scale-105 transition-transform duration-300">
            👑
          </div>

          <h1 className="mt-5 text-3xl font-black text-white tracking-tight flex items-center justify-center gap-2">
            RK EVENTRA
          </h1>

          <p className="mt-1 font-bold text-amber-400 text-sm tracking-wide flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            SUPER ADMINISTRATOR PORTAL
          </p>

          <p className="mt-2 text-xs text-slate-400">
            Secure administrative control & live ecosystem management
          </p>
        </div>

        {/* Fixed Admin Helper Banner */}
        <div className="mt-6 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Fixed Admin Credentials
            </div>
            <div className="text-[11px] text-amber-200/80">
              admineventra@gmail.com
            </div>
          </div>
          <button
            type="button"
            onClick={fillFixedAdmin}
            className="px-3 py-1.5 rounded-lg bg-amber-400 text-slate-950 font-black text-[11px] hover:bg-amber-300 shadow transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
          >
            Auto-Fill
          </button>
        </div>

        <form onSubmit={handleAdminLogin} className="mt-6 space-y-5">
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-300">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admineventra@gmail.com"
                required
                className="w-full rounded-xl border border-slate-700/80 bg-slate-950/70 pl-10 pr-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-300">
              Admin Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full rounded-xl border border-slate-700/80 bg-slate-950/70 pl-10 pr-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 px-4 py-3.5 font-black text-slate-950 shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
          >
            <KeyRound className="w-4 h-4 text-slate-950" />
            {loading ? "Authenticating..." : "Sign In to Admin Console"}
          </button>
        </form>

        {message && (
          <p className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-center text-xs font-bold text-red-300 animate-shake">
            {message}
          </p>
        )}

        <div className="mt-6 text-center">
          <a
            href="/login"
            className="text-xs font-bold text-slate-400 hover:text-amber-400 transition-colors inline-flex items-center gap-1"
          >
            ← Back to Customer & Vendor Login
          </a>
        </div>
      </div>
    </main>
  );
}
