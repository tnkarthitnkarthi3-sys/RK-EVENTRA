"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Users,
  Briefcase,
  Calendar,
  DollarSign,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  Building,
  Sparkles,
  Layers,
  CheckCircle2,
  Clock,
  ExternalLink,
  Zap,
  Activity,
  ArrowDownRight,
  Award,
} from "lucide-react";

interface LiveEcosystem3DFlowchartProps {
  stats: {
    vendors: number;
    services: number;
    customers: number;
    bookings: number;
  };
  finance: {
    totalCollected: number;
    bookingGross: number;
    vendorJoiningRevenue: number;
    platformFees: number;
    taxCollected: number;
    vendorServiceRevenue: number;
    pendingAmount: number;
    refundedAmount: number;
  };
  bookingCounts: {
    TOTAL: number;
    PENDING: number;
    ACCEPTED: number;
    CONFIRMED: number;
    COMPLETED: number;
    CANCELLED: number;
  };
}

export default function LiveEcosystem3DFlowchart({
  stats,
  finance,
  bookingCounts,
}: LiveEcosystem3DFlowchartProps) {
  const [activeNode, setActiveNode] = useState<string | null>(null);

  return (
    <div className="relative rounded-3xl border border-violet-500/30 bg-gradient-to-b from-[#0b0f24] via-[#0d132e] to-[#080b1a] p-6 sm:p-8 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.8)] backdrop-blur-2xl overflow-hidden text-white">
      {/* 3D Ambient Glowing Background elements */}
      <div className="absolute top-0 right-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-violet-600/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 right-10 w-64 h-64 bg-amber-500/10 rounded-full blur-[90px] pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-violet-500/20 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_12px_#06b6d4]" />
            <span className="text-[11px] font-black uppercase tracking-widest text-cyan-400">
              3D Live Marketplace Architecture
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1 flex items-center gap-2">
            RK Eventra Live Flowchart
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
              Live Database Stream
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Visual pipeline demonstrating customer acquisition, event booking lifecycle, vendor dispatch, and platform financial settlement.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-[#0e1633] border border-cyan-500/30 text-xs font-bold text-cyan-300 flex items-center gap-2 shadow-inner">
            <Activity className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
            <span>Telemetry Active</span>
          </div>
        </div>
      </div>

      {/* 3D INTERACTIVE FLOWCHART PIPELINE */}
      <div className="relative z-10 pt-8 pb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 relative">
          
          {/* ============================================================ */}
          {/* STEP 1: REGISTERED CUSTOMERS (CYAN 3D NODE) */}
          {/* ============================================================ */}
          <div
            onMouseEnter={() => setActiveNode("customers")}
            onMouseLeave={() => setActiveNode(null)}
            className={`group relative rounded-2xl border transition-all duration-300 p-5 ${
              activeNode === "customers"
                ? "border-cyan-400 bg-gradient-to-b from-[#10233b] to-[#0c182b] shadow-[0_15px_35px_-5px_rgba(6,182,212,0.35)] -translate-y-2 scale-[1.02]"
                : "border-cyan-500/30 bg-[#0d162a]/90 hover:border-cyan-400/60 shadow-lg"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-cyan-300 bg-cyan-500/15 border border-cyan-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" /> STAGE 1
              </span>
              <span className="text-xs font-bold text-slate-400">Demand Source</span>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)] group-hover:rotate-6 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-300">Registered Customers</h3>
                <div className="text-3xl font-black text-white tracking-tight flex items-baseline gap-1 mt-0.5">
                  {stats.customers}
                  <span className="text-xs font-normal text-slate-400">accounts</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-3 border-t border-cyan-500/15 text-xs">
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-400">Browse & Searches:</span>
                <span className="font-bold text-cyan-300">Active</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-400">AI Assistant Interactions:</span>
                <span className="font-bold text-white">Live 24/7</span>
              </div>
            </div>

            <Link
              href="/admin/customers"
              className="mt-4 w-full py-2 px-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all group-hover:border-cyan-400"
            >
              <span>Manage Customers</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* ============================================================ */}
          {/* STEP 2: BOOKINGS & EVENT REQUESTS (PURPLE 3D NODE) */}
          {/* ============================================================ */}
          <div
            onMouseEnter={() => setActiveNode("bookings")}
            onMouseLeave={() => setActiveNode(null)}
            className={`group relative rounded-2xl border transition-all duration-300 p-5 ${
              activeNode === "bookings"
                ? "border-purple-400 bg-gradient-to-b from-[#25153d] to-[#150d24] shadow-[0_15px_35px_-5px_rgba(168,85,247,0.35)] -translate-y-2 scale-[1.02]"
                : "border-purple-500/30 bg-[#120f26]/90 hover:border-purple-400/60 shadow-lg"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-purple-300 bg-purple-500/15 border border-purple-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400" /> STAGE 2
              </span>
              <span className="text-xs font-bold text-slate-400">Event Orders</span>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.3)] group-hover:rotate-6 transition-transform">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-300">Total Bookings</h3>
                <div className="text-3xl font-black text-purple-300 tracking-tight flex items-baseline gap-1 mt-0.5">
                  {stats.bookings}
                  <span className="text-xs font-normal text-slate-400">reservations</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-purple-500/15 text-[11px]">
              <div className="bg-purple-950/40 border border-purple-500/20 p-2 rounded-lg text-center">
                <span className="text-slate-400 block">Confirmed</span>
                <span className="font-black text-emerald-400 text-sm">
                  {bookingCounts.CONFIRMED + bookingCounts.COMPLETED}
                </span>
              </div>
              <div className="bg-purple-950/40 border border-purple-500/20 p-2 rounded-lg text-center">
                <span className="text-slate-400 block">Pending</span>
                <span className="font-black text-amber-400 text-sm">
                  {bookingCounts.PENDING}
                </span>
              </div>
            </div>

            <Link
              href="/admin/bookings"
              className="mt-4 w-full py-2 px-3 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all group-hover:border-purple-400"
            >
              <span>View All Bookings</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* ============================================================ */}
          {/* STEP 3: VENDORS & SPECIALISTS (AMBER 3D NODE) */}
          {/* ============================================================ */}
          <div
            onMouseEnter={() => setActiveNode("vendors")}
            onMouseLeave={() => setActiveNode(null)}
            className={`group relative rounded-2xl border transition-all duration-300 p-5 ${
              activeNode === "vendors"
                ? "border-amber-400 bg-gradient-to-b from-[#35250c] to-[#1c1407] shadow-[0_15px_35px_-5px_rgba(245,158,11,0.35)] -translate-y-2 scale-[1.02]"
                : "border-amber-500/30 bg-[#17141f]/90 hover:border-amber-400/60 shadow-lg"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> STAGE 3
              </span>
              <span className="text-xs font-bold text-slate-400">Supply & Service</span>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.3)] group-hover:rotate-6 transition-transform">
                <Building className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-300">Verified Vendors</h3>
                <div className="text-3xl font-black text-amber-300 tracking-tight flex items-baseline gap-1 mt-0.5">
                  {stats.vendors}
                  <span className="text-xs font-normal text-slate-400">businesses</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-3 border-t border-amber-500/15 text-xs">
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-400">Catalog Services:</span>
                <span className="font-bold text-white">{stats.services} listed</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-400">Joining Fee:</span>
                <span className="font-bold text-amber-300">₹800 INR</span>
              </div>
            </div>

            <Link
              href="/admin/vendors"
              className="mt-4 w-full py-2 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all group-hover:border-amber-400"
            >
              <span>Review Vendors</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* ============================================================ */}
          {/* STEP 4: PLATFORM TREASURY & REVENUE (EMERALD 3D NODE) */}
          {/* ============================================================ */}
          <div
            onMouseEnter={() => setActiveNode("treasury")}
            onMouseLeave={() => setActiveNode(null)}
            className={`group relative rounded-2xl border transition-all duration-300 p-5 ${
              activeNode === "treasury"
                ? "border-emerald-400 bg-gradient-to-b from-[#0b3323] to-[#071d14] shadow-[0_15px_35px_-5px_rgba(16,185,129,0.35)] -translate-y-2 scale-[1.02]"
                : "border-emerald-500/30 bg-[#0d1a1b]/90 hover:border-emerald-400/60 shadow-lg"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> STAGE 4
              </span>
              <span className="text-xs font-bold text-slate-400">Financial Yield</span>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)] group-hover:rotate-6 transition-transform">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-300">Platform Treasury</h3>
                <div className="text-3xl font-black text-emerald-400 tracking-tight flex items-baseline gap-1 mt-0.5">
                  ₹{(finance.platformFees + finance.vendorJoiningRevenue).toLocaleString()}
                </div>
              </div>
            </div>

            <div className="space-y-1.5 pt-3 border-t border-emerald-500/15 text-xs">
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-400">Joining Fees (₹800):</span>
                <span className="font-bold text-amber-300">
                  ₹{finance.vendorJoiningRevenue.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-400">10% Platform Cut:</span>
                <span className="font-bold text-pink-300">
                  ₹{finance.platformFees.toLocaleString()}
                </span>
              </div>
            </div>

            <Link
              href="/admin/settings"
              className="mt-4 w-full py-2 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all group-hover:border-emerald-400"
            >
              <span>Platform Settings</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

        </div>

        {/* FLOW SUMMARY BAR WITH CONNECTORS */}
        <div className="mt-8 p-4 rounded-2xl bg-[#090d1f]/80 border border-violet-500/20 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
            </span>
            <span className="text-slate-300">
              <strong className="text-white">{stats.customers} Customers</strong> generating{" "}
              <strong className="text-purple-300">{stats.bookings} Bookings</strong> serviced by{" "}
              <strong className="text-amber-300">{stats.vendors} Vendors</strong> across Tamil Nadu.
            </span>
          </div>

          <div className="flex items-center gap-3 text-slate-400">
            <span className="text-[11px] font-bold text-slate-400">
              Gross Handled: <span className="text-emerald-400 font-black">₹{finance.bookingGross.toLocaleString()}</span>
            </span>
            <span>•</span>
            <Link
              href="/admin/pricing"
              className="text-cyan-400 hover:text-cyan-300 font-bold underline flex items-center gap-1"
            >
              Configure Pricing & Fee Splits →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
