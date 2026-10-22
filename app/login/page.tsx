"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Sparkles,
  Lock,
  Mail,
  Building,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle,
} from "lucide-react";

type UserType = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: "CUSTOMER" | "VENDOR" | "ADMIN";
};

type VendorAccess = {
  isVendor: boolean;
  paymentPaid: boolean;
  vendorStatus: string | null;
};

export default function LoginPage() {
  const router = useRouter();

  // Role: ONLY CUSTOMER or VENDOR (Admin is excluded and has separate portal)
  const [selectedRole, setSelectedRole] = useState<"CUSTOMER" | "VENDOR">("CUSTOMER");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function selectRole(role: "CUSTOMER" | "VENDOR") {
    setSelectedRole(role);
    setMessage("");
  }

  function fillDemoAccount(role: "CUSTOMER" | "VENDOR") {
    setSelectedRole(role);
    setMessage("");
    if (role === "CUSTOMER") {
      setEmail("customer@rkeventra.com");
      setPassword("Customer@12345");
    } else {
      setEmail("chengalpattu.dj@rkeventra.com");
      setPassword("Vendor@12345");
    }
  }

  function redirectByRole(user: UserType, vendorAccess?: VendorAccess) {
    if (user.role === "ADMIN") {
      router.replace("/admin/dashboard");
      return;
    }

    if (user.role === "VENDOR") {
      if (vendorAccess?.paymentPaid) {
        router.replace("/vendor-dashboard");
      } else {
        router.replace("/vendor-pending");
      }
      return;
    }

    if (user.role === "CUSTOMER") {
      router.replace("/customer/dashboard");
      return;
    }

    setMessage("Unknown user role.");
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const cleanEmail = email.trim().toLowerCase();

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: cleanEmail,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setMessage(data?.message || "Invalid email or password.");
        return;
      }

      localStorage.setItem("rk_saved_email", cleanEmail);
      redirectByRole(data.user, data.vendorAccess);
    } catch (error) {
      console.error("Login error:", error);
      setMessage("Unable to connect to the server. Please check your network or database connection.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen bg-[#030712] text-slate-100 flex flex-col justify-between overflow-hidden selection:bg-amber-500 selection:text-slate-950">
      {/* 3D LUXURY AMBIENT GLOWS */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-amber-500/15 via-amber-500/5 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* TOP NAVBAR */}
      <header className="relative z-10 border-b border-amber-500/15 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-slate-950 font-black text-lg shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
              RK
            </div>
            <div>
              <div className="text-lg font-black tracking-wider text-white">
                RK <span className="text-amber-400">EVENTRA</span>
              </div>
              <p className="text-[10px] font-semibold tracking-wider text-amber-300/80 uppercase">
                Luxury Event Marketplace
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-4 text-xs font-bold">
            <span className="text-slate-400 hidden sm:inline">Don't have an account?</span>
            <Link
              href="/register"
              className="px-4 py-2 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 hover:bg-amber-500/25 transition-all shadow-sm font-black"
            >
              Register Here →
            </Link>
          </div>
        </div>
      </header>

      {/* LOGIN CARD CONTAINER */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 my-6">
        <div className="w-full max-w-md bg-slate-900/90 border border-amber-500/25 rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.8)] backdrop-blur-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>User Sign In Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Sign In to RK Eventra
            </h1>
            <p className="text-xs text-slate-400">
              Select your account type to access bookings, inquiries, and services.
            </p>
          </div>

          {/* ROLE SELECTOR: CUSTOMER & VENDOR ONLY */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block text-center">
              Choose Account Type
            </label>
            <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-950/80 rounded-2xl border border-slate-800">
              <button
                type="button"
                onClick={() => selectRole("CUSTOMER")}
                className={`py-3 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  selectedRole === "CUSTOMER"
                    ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/20 scale-[1.02] font-black"
                    : "text-slate-300 hover:text-white hover:bg-slate-900"
                }`}
              >
                <User className="w-4 h-4" />
                <span>Customer</span>
              </button>

              <button
                type="button"
                onClick={() => selectRole("VENDOR")}
                className={`py-3 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  selectedRole === "VENDOR"
                    ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/20 scale-[1.02] font-black"
                    : "text-slate-300 hover:text-white hover:bg-slate-900"
                }`}
              >
                <Building className="w-4 h-4" />
                <span>Vendor Partner</span>
              </button>
            </div>
          </div>

          {/* 1-CLICK DEMO AUTOFILL BAR */}
          <div className="flex items-center justify-between text-[11px] px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-400">
            <span>Try demo test account:</span>
            <button
              type="button"
              onClick={() => fillDemoAccount(selectedRole)}
              className="text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer"
            >
              Auto-fill {selectedRole === "CUSTOMER" ? "Customer" : "Vendor"} demo
            </button>
          </div>

          {message && (
            <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-xs text-rose-300 font-semibold flex items-center gap-2 animate-shake">
              <span>⚠️</span>
              <span>{message}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Email Address</span>
                <span className="text-[10px] text-amber-400 font-normal">
                  {selectedRole === "CUSTOMER" ? "Customer Account" : "Registered Vendor"}
                </span>
              </label>
              <div className="relative mt-1">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={selectedRole === "CUSTOMER" ? "e.g. karthi@gmail.com" : "e.g. vendor@gmail.com"}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Password</span>
                <span className="text-[10px] text-slate-500 font-normal">Min 4 chars</span>
              </label>
              <div className="relative mt-1">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <span>{loading ? "Authenticating..." : `Sign In as ${selectedRole === "CUSTOMER" ? "Customer" : "Vendor"}`}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <Link href="/register" className="text-amber-400 hover:underline font-bold">
              + Create New Account
            </Link>

            <Link href="/become-vendor" className="hover:text-slate-300">
              Become a Vendor →
            </Link>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-slate-900 py-4 text-center text-xs text-slate-500">
        © 2026 RK Eventra. Your Event • Your Choice • Your Celebration.
      </footer>
    </main>
  );
}
