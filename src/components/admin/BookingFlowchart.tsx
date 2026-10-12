"use client";

import React from "react";
import {
  FileText,
  Clock,
  CheckCircle2,
  CreditCard,
  ShieldCheck,
  Wrench,
  PlayCircle,
  Award,
  DollarSign,
  AlertOctagon,
  XCircle,
  HelpCircle,
  ArrowRight,
  Filter,
} from "lucide-react";

export interface BookingStageCounts {
  TOTAL: number;
  PENDING: number;
  ACCEPTED: number;
  CONFIRMED: number;
  PREPARATION: number;
  IN_PROGRESS: number;
  COMPLETED: number;
  CANCELLED: number;
  REJECTED: number;
  DISPUTED: number;
  SETTLED: number;
}

interface BookingFlowchartProps {
  counts: BookingStageCounts;
  selectedStage: string | null;
  onSelectStage: (stage: string | null) => void;
}

export default function BookingFlowchart({
  counts,
  selectedStage,
  onSelectStage,
}: BookingFlowchartProps) {
  const total = counts.TOTAL || 1;

  const mainStages = [
    { key: "PENDING", label: "Request Placed", sub: "Awaiting Vendor", icon: Clock, count: counts.PENDING, color: "amber" },
    { key: "ACCEPTED", label: "Vendor Accepted", sub: "Ready for Payment", icon: CheckCircle2, count: counts.ACCEPTED, color: "blue" },
    { key: "CONFIRMED", label: "Payment Verified", sub: "Booking Confirmed", icon: ShieldCheck, count: counts.CONFIRMED, color: "emerald" },
    { key: "PREPARATION", label: "In Preparation", sub: "Stage & Sound Setup", icon: Wrench, count: counts.PREPARATION, color: "cyan" },
    { key: "IN_PROGRESS", label: "Event In Progress", sub: "Active Onsite", icon: PlayCircle, count: counts.IN_PROGRESS, color: "indigo" },
    { key: "COMPLETED", label: "Event Completed", sub: "Review Eligible", icon: Award, count: counts.COMPLETED, color: "emerald" },
    { key: "SETTLED", label: "Commission Settled", sub: "Payout Disbursed", icon: DollarSign, count: counts.SETTLED, color: "violet" },
  ];

  const alternativeBranches = [
    { key: "REJECTED", label: "Vendor Rejected", sub: "Capacity / Conflict", icon: XCircle, count: counts.REJECTED, color: "rose" },
    { key: "CANCELLED", label: "Customer Cancelled", sub: "Policy Applied", icon: AlertOctagon, count: counts.CANCELLED, color: "orange" },
    { key: "DISPUTED", label: "Dispute / Support", sub: "Under Admin Review", icon: HelpCircle, count: counts.DISPUTED, color: "purple" },
  ];

  return (
    <div className="bg-gradient-to-b from-[#0e1329] to-[#0a0e1c] border border-violet-500/25 rounded-2xl p-6 shadow-xl space-y-6 text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-violet-500/20 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#06b6d4]" />
            <h3 className="font-extrabold text-base sm:text-lg text-white tracking-wide">Interactive Admin Booking Flowchart</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time lifecycle pipeline of all customer event reservations. Click any milestone to filter database records.
          </p>
        </div>

        {selectedStage && (
          <button
            onClick={() => onSelectStage(null)}
            className="flex items-center gap-1.5 text-xs bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 px-3.5 py-1.5 rounded-xl border border-cyan-500/40 font-semibold shadow-[0_0_12px_rgba(6,182,212,0.3)] transition-all"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Clear Filter ({selectedStage})</span>
          </button>
        )}
      </div>

      {/* Main Path Flow */}
      <div>
        <div className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 mb-3 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
          Primary Fulfillment Pipeline
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {mainStages.map((st, i) => {
            const Icon = st.icon;
            const isSelected = selectedStage === st.key;
            const pct = Math.round((st.count / total) * 100);

            return (
              <button
                key={st.key}
                type="button"
                onClick={() => onSelectStage(isSelected ? null : st.key)}
                className={`text-left p-3.5 rounded-xl border transition-all relative flex flex-col justify-between ${
                  isSelected
                    ? "bg-gradient-to-b from-cyan-500/20 to-violet-500/20 border-cyan-400 shadow-[0_0_18px_rgba(6,182,212,0.35)] scale-105 z-10"
                    : "bg-[#0b1020]/90 border-slate-800/80 hover:border-violet-500/40 hover:bg-[#0f152d]"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-7 h-7 rounded-lg bg-violet-950/60 border border-violet-500/30 flex items-center justify-center text-cyan-400">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">0{i + 1}</span>
                  </div>

                  <h5 className="font-bold text-xs text-slate-100 line-clamp-1">{st.label}</h5>
                  <p className="text-[10px] text-slate-400 line-clamp-1">{st.sub}</p>
                </div>

                <div className="mt-3 pt-2 border-t border-violet-500/15 flex items-baseline justify-between">
                  <span className="text-base font-black text-cyan-300">{st.count}</span>
                  <span className="text-[10px] text-slate-500">{pct}%</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Alternative Branches */}
      <div className="pt-2 border-t border-violet-500/15">
        <div className="text-[11px] font-bold uppercase tracking-wider text-rose-400 mb-3 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
          Exception & Resolution Branches
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {alternativeBranches.map((st) => {
            const Icon = st.icon;
            const isSelected = selectedStage === st.key;

            return (
              <button
                key={st.key}
                type="button"
                onClick={() => onSelectStage(isSelected ? null : st.key)}
                className={`text-left p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                  isSelected
                    ? "bg-rose-500/20 border-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.35)]"
                    : "bg-[#0b1020]/90 border-slate-800/80 hover:border-rose-500/40"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-rose-950/40 border border-rose-500/30 flex items-center justify-center text-rose-400">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-slate-200">{st.label}</h5>
                    <p className="text-[10px] text-slate-400">{st.sub}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-base font-black text-rose-400">{st.count}</span>
                  <span className="block text-[9px] text-slate-500">records</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
