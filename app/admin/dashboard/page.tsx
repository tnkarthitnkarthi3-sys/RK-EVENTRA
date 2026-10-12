"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BookingFlowchart, { BookingStageCounts } from "@/src/components/admin/BookingFlowchart";
import FinancialFlowchart, { FinancialStatsData } from "@/src/components/admin/FinancialFlowchart";
import AdminAnalyticsCharts from "@/src/components/admin/AdminAnalyticsCharts";
import {
  Users,
  Briefcase,
  Layers,
  Calendar,
  CreditCard,
  DollarSign,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  LogOut,
  RefreshCw,
  Search,
  Filter,
  ShieldCheck,
  Building,
  Sparkles,
  Zap,
} from "lucide-react";
import ThemeToggle from "@/src/components/theme/ThemeToggle";

export default function AdminDashboardPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Stats & Financials
  const [stats, setStats] = useState({
    vendors: 0,
    services: 0,
    customers: 0,
    bookings: 0,
  });

  const [bookingCounts, setBookingCounts] = useState<BookingStageCounts>({
    TOTAL: 0,
    PENDING: 0,
    ACCEPTED: 0,
    CONFIRMED: 0,
    PREPARATION: 0,
    IN_PROGRESS: 0,
    COMPLETED: 0,
    CANCELLED: 0,
    REJECTED: 0,
    DISPUTED: 0,
    SETTLED: 0,
  });

  const [finance, setFinance] = useState<FinancialStatsData>({
    totalCollected: 0,
    bookingGross: 0,
    vendorJoiningRevenue: 0,
    platformFees: 0,
    taxCollected: 0,
    vendorServiceRevenue: 0,
    pendingAmount: 0,
    refundedAmount: 0,
  });

  const [transactions, setTransactions] = useState<any[]>([]);
  const [bookingsList, setBookingsList] = useState<any[]>([]);
  const [selectedStage, setSelectedStage] = useState<string | null>(null);

  async function loadAdminData() {
    try {
      setLoading(true);
      setError(null);

      // 1. Fetch stats
      const statsRes = await fetch("/api/admin/stats");
      const statsData = await statsRes.json();
      if (!statsRes.ok) {
        if (statsRes.status === 401 || statsRes.status === 403) {
          router.replace("/admin/login");
          return;
        }
        throw new Error(statsData.message || "Failed to load admin stats");
      }
      setStats(statsData.stats || {});

      // 2. Fetch finance data
      const finRes = await fetch("/api/admin/finance");
      const finData = await finRes.json();
      if (finRes.ok && finData.summary) {
        setFinance(finData.summary);
        if (Array.isArray(finData.transactions)) {
          setTransactions(finData.transactions);
        }
      }

      // 3. Fetch bookings for flowchart counts & charts
      const bRes = await fetch("/api/admin/bookings");
      const bData = await bRes.json();
      if (bRes.ok && Array.isArray(bData.bookings)) {
        setBookingsList(bData.bookings);
        const counts: BookingStageCounts = {
          TOTAL: bData.bookings.length,
          PENDING: bData.bookings.filter((b: any) => b.status === "PENDING").length,
          ACCEPTED: bData.bookings.filter((b: any) => b.status === "ACCEPTED").length,
          CONFIRMED: bData.bookings.filter((b: any) => b.status === "CONFIRMED").length,
          PREPARATION: bData.bookings.filter((b: any) => b.status === "PREPARATION").length,
          IN_PROGRESS: bData.bookings.filter((b: any) => b.status === "IN_PROGRESS").length,
          COMPLETED: bData.bookings.filter((b: any) => b.status === "COMPLETED").length,
          CANCELLED: bData.bookings.filter((b: any) => b.status === "CANCELLED").length,
          REJECTED: bData.bookings.filter((b: any) => b.status === "REJECTED").length,
          DISPUTED: bData.bookings.filter((b: any) => b.status === "DISPUTED").length,
          SETTLED: bData.bookings.filter((b: any) => b.status === "COMPLETED").length,
        };
        setBookingCounts(counts);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error fetching admin data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAdminData();
  }, []);

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col lg:flex-row selection:bg-cyan-500 selection:text-black">
      {/* SIDEBAR - FUTURISTIC DARK NAVY WITH NEON HIGHLIGHTS */}
      <aside className="w-full lg:w-64 bg-[#0a0d17] border-b lg:border-b-0 lg:border-r border-violet-500/20 p-6 flex flex-col justify-between shrink-0 shadow-2xl relative">
        <div className="space-y-6">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-violet-600 to-pink-500 flex items-center justify-center text-white font-black text-lg shadow-[0_0_15px_rgba(6,182,212,0.4)] group-hover:scale-105 transition-transform">
              RK
            </div>
            <div>
              <div className="text-lg font-black text-white tracking-wider flex items-center gap-1.5">
                <span>RK EVENTRA</span>
              </div>
              <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                Admin Command
              </div>
            </div>
          </Link>

          <nav className="space-y-1.5 text-xs font-semibold">
            <Link
              href="/admin/dashboard"
              className="flex items-center gap-2.5 p-2.5 rounded-xl bg-gradient-to-r from-violet-600/20 to-cyan-600/20 text-cyan-300 font-bold border border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.2)]"
            >
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <span>Live Control Center</span>
            </Link>
            <Link
              href="/admin/pricing"
              className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-[#11172a] text-slate-300 hover:text-white border border-transparent hover:border-violet-500/20 transition-all"
            >
              <DollarSign className="w-4 h-4 text-violet-400" />
              <span>Pricing & Packages</span>
            </Link>
            <Link
              href="/admin/settings"
              className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-[#11172a] text-slate-300 hover:text-white border border-transparent hover:border-violet-500/20 transition-all"
            >
              <ShieldCheck className="w-4 h-4 text-pink-400" />
              <span>Business Settings</span>
            </Link>
            <Link
              href="/admin/vendors"
              className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-[#11172a] text-slate-300 hover:text-white border border-transparent hover:border-violet-500/20 transition-all"
            >
              <Building className="w-4 h-4 text-amber-400" />
              <span>Vendor Applications</span>
            </Link>
            <Link
              href="/admin/bookings"
              className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-[#11172a] text-slate-300 hover:text-white border border-transparent hover:border-violet-500/20 transition-all"
            >
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span>Event Bookings</span>
            </Link>
            <Link
              href="/admin/customers"
              className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-[#11172a] text-slate-300 hover:text-white border border-transparent hover:border-violet-500/20 transition-all"
            >
              <Users className="w-4 h-4 text-cyan-400" />
              <span>Customers</span>
            </Link>
            <Link
              href="/admin/services"
              className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-[#11172a] text-slate-300 hover:text-white border border-transparent hover:border-violet-500/20 transition-all"
            >
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Categories & Catalog</span>
            </Link>
          </nav>
        </div>

        <div className="pt-6 border-t border-violet-500/15">
          <button
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              window.location.href = "/login";
            }}
            className="w-full flex items-center gap-2 text-xs font-bold text-rose-400 hover:text-rose-300 p-2.5 rounded-xl hover:bg-rose-950/20 border border-transparent hover:border-rose-500/20 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Admin</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-6 lg:p-8 space-y-8 overflow-y-auto">
        {/* TOP HEADER */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-[#0d1226] via-[#101633] to-[#0d1226] border border-violet-500/25 shadow-xl">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Live Operations Control Center
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center gap-1 shadow-[0_0_10px_rgba(6,182,212,0.25)]">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                Live Real-Time
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Database-backed live telemetry, verified Razorpay payments, ₹800 joining fee ledger, and booking lifecycles.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <ThemeToggle variant="pill" />
            <button
              onClick={loadAdminData}
              className="flex items-center gap-1.5 text-xs bg-[#0b1020] hover:bg-[#111730] text-cyan-300 border border-cyan-500/30 px-4 py-2.5 rounded-xl transition-all font-semibold shadow-[0_0_12px_rgba(6,182,212,0.2)]"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-cyan-400" : ""}`} />
              <span>Refresh Telemetry</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-rose-950/40 border border-rose-500/30 rounded-2xl text-xs text-rose-300 flex items-center gap-2 shadow-[0_0_15px_rgba(244,63,94,0.2)]">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* METRICS CARDS GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {/* Card 1 */}
          <div className="bg-[#0b1020]/90 border border-violet-500/25 p-4 rounded-xl shadow-lg hover:border-violet-500/50 transition-all">
            <span className="text-[11px] text-slate-400 font-semibold block">Total Vendors</span>
            <div className="text-2xl font-black text-white mt-1">{stats.vendors}</div>
            <span className="text-[10px] text-cyan-400 font-medium">Approved & Active</span>
          </div>

          {/* Card 2 */}
          <div className="bg-[#0b1020]/90 border border-violet-500/25 p-4 rounded-xl shadow-lg hover:border-violet-500/50 transition-all">
            <span className="text-[11px] text-slate-400 font-semibold block">Total Bookings</span>
            <div className="text-2xl font-black text-cyan-400 mt-1">{stats.bookings}</div>
            <span className="text-[10px] text-slate-400">All Reservations</span>
          </div>

          {/* Card 3 */}
          <div className="bg-[#0b1020]/90 border border-violet-500/25 p-4 rounded-xl shadow-lg hover:border-violet-500/50 transition-all">
            <span className="text-[11px] text-slate-400 font-semibold block">Customers</span>
            <div className="text-2xl font-black text-white mt-1">{stats.customers}</div>
            <span className="text-[10px] text-slate-400">Registered Accounts</span>
          </div>

          {/* Card 4 */}
          <div className="bg-[#0b1020]/90 border border-violet-500/25 p-4 rounded-xl shadow-lg hover:border-violet-500/50 transition-all">
            <span className="text-[11px] text-slate-400 font-semibold block">Gross Booking Value</span>
            <div className="text-2xl font-black text-emerald-400 mt-1">₹{finance.bookingGross.toLocaleString()}</div>
            <span className="text-[10px] text-emerald-400">Verified Paid</span>
          </div>

          {/* Card 5 */}
          <div className="bg-[#0b1020]/90 border border-violet-500/25 p-4 rounded-xl shadow-lg hover:border-violet-500/50 transition-all">
            <span className="text-[11px] text-slate-400 font-semibold block">Platform Commission</span>
            <div className="text-2xl font-black text-pink-400 mt-1">₹{finance.platformFees.toLocaleString()}</div>
            <span className="text-[10px] text-pink-400">10% Platform Cut</span>
          </div>

          {/* Card 6 */}
          <div className="bg-[#0b1020]/90 border border-violet-500/25 p-4 rounded-xl shadow-lg hover:border-violet-500/50 transition-all">
            <span className="text-[11px] text-slate-400 font-semibold block">Joining Fee Revenue</span>
            <div className="text-2xl font-black text-amber-300 mt-1">₹{finance.vendorJoiningRevenue.toLocaleString()}</div>
            <span className="text-[10px] text-amber-400">₹800 Per Vendor</span>
          </div>
        </div>

        {/* SECTION: LIVE ADMIN ANALYTICS CHARTS (RECHARTS) */}
        <AdminAnalyticsCharts
          finance={finance}
          transactions={transactions}
          bookings={bookingsList}
        />

        {/* SECTION: INTERACTIVE BOOKING FLOWCHART */}
        <BookingFlowchart
          counts={bookingCounts}
          selectedStage={selectedStage}
          onSelectStage={(st) => setSelectedStage(st)}
        />

        {/* SECTION: INTERACTIVE FINANCIAL FLOWCHART */}
        <FinancialFlowchart finance={finance} />
      </main>
    </div>
  );
}