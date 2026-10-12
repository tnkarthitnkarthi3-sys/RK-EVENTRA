"use client";

import React, { useState } from "react";
import {
  CreditCard,
  FileCheck,
  Split,
  Building,
  PiggyBank,
  Send,
  CheckCircle,
  IndianRupee,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  Sparkles,
} from "lucide-react";

export interface FinancialStatsData {
  totalCollected: number;
  bookingGross: number;
  vendorJoiningRevenue: number;
  platformFees: number;
  taxCollected: number;
  vendorServiceRevenue: number;
  pendingAmount: number;
  refundedAmount: number;
}

interface FinancialFlowchartProps {
  finance: FinancialStatsData;
}

export default function FinancialFlowchart({ finance }: FinancialFlowchartProps) {
  const [activeWorkflow, setActiveWorkflow] = useState<"BOOKING" | "JOINING">("BOOKING");

  const grossBooking = finance.bookingGross || 0;
  const platformComm = finance.platformFees || Math.round(grossBooking * 0.1);
  const vendorLiab = finance.vendorServiceRevenue || grossBooking - platformComm;
  const joiningRevenue = finance.vendorJoiningRevenue || 0;

  return (
    <div className="bg-gradient-to-b from-[#0e1329] to-[#0a0e1c] border border-cyan-500/25 rounded-2xl p-6 shadow-xl space-y-6 text-white">
      {/* Workflow Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-cyan-500/20 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#06b6d4]" />
            <h3 className="font-extrabold text-base sm:text-lg text-white tracking-wide">Interactive Admin Financial Flowchart</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Reconciliation pipeline for customer booking remittances and vendor ₹800 joining fee ledger.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#070a14] p-1 rounded-xl border border-cyan-500/30 text-xs">
          <button
            type="button"
            onClick={() => setActiveWorkflow("BOOKING")}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all ${
              activeWorkflow === "BOOKING"
                ? "bg-gradient-to-r from-cyan-600 to-violet-600 text-white shadow-[0_0_12px_rgba(6,182,212,0.4)]"
                : "text-slate-400 hover:text-white"
            }`}
          >
            1. Customer Booking Remittance
          </button>
          <button
            type="button"
            onClick={() => setActiveWorkflow("JOINING")}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all ${
              activeWorkflow === "JOINING"
                ? "bg-gradient-to-r from-amber-500 to-pink-600 text-white shadow-[0_0_12px_rgba(245,158,11,0.4)]"
                : "text-slate-400 hover:text-white"
            }`}
          >
            2. ₹800 Vendor Joining Ledger
          </button>
        </div>
      </div>

      {/* WORKFLOW 1: CUSTOMER BOOKING REVENUE SPLIT */}
      {activeWorkflow === "BOOKING" && (
        <div className="space-y-6 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center">
            {/* Step 1 */}
            <div className="bg-[#0b1020]/90 border border-cyan-500/30 p-4 rounded-xl flex flex-col justify-between h-36 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
              <div>
                <span className="text-[10px] text-cyan-400 uppercase font-mono font-bold">01. INFLOW</span>
                <h5 className="font-bold text-xs text-slate-200 mt-1">Customer Payment</h5>
                <p className="text-[10px] text-slate-400">Razorpay HMAC Verified</p>
              </div>
              <div className="text-lg font-black text-cyan-300">
                ₹{grossBooking.toLocaleString()}
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-[#0b1020]/90 border border-violet-500/30 p-4 rounded-xl flex flex-col justify-between h-36 shadow-[0_0_15px_rgba(139,92,246,0.1)]">
              <div>
                <span className="text-[10px] text-violet-400 uppercase font-mono font-bold">02. LEDGER</span>
                <h5 className="font-bold text-xs text-slate-200 mt-1">Booking Financials</h5>
                <p className="text-[10px] text-slate-400">Escrow Hold Till Event</p>
              </div>
              <div className="text-sm font-semibold text-emerald-400">
                Active Escrow
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-[#0b1020]/90 border border-pink-500/40 p-4 rounded-xl flex flex-col justify-between h-36 relative shadow-[0_0_15px_rgba(236,72,153,0.15)]">
              <div>
                <span className="text-[10px] text-pink-400 uppercase font-mono font-bold">03. COMMISSION</span>
                <h5 className="font-bold text-xs text-white mt-1">Platform Cut (10%)</h5>
                <p className="text-[10px] text-slate-400">Snapshot on Confirmation</p>
              </div>
              <div className="text-lg font-black text-pink-400">
                +₹{platformComm.toLocaleString()}
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-[#0b1020]/90 border border-emerald-500/40 p-4 rounded-xl flex flex-col justify-between h-36 shadow-[0_0_15px_rgba(16,182,129,0.15)]">
              <div>
                <span className="text-[10px] text-emerald-400 uppercase font-mono font-bold">04. PAYABLE</span>
                <h5 className="font-bold text-xs text-white mt-1">Vendor Earnings</h5>
                <p className="text-[10px] text-slate-400">Net Liability to Vendor</p>
              </div>
              <div className="text-lg font-black text-emerald-300">
                ₹{vendorLiab.toLocaleString()}
              </div>
            </div>

            {/* Step 5 */}
            <div className="bg-[#0b1020]/90 border border-indigo-500/40 p-4 rounded-xl flex flex-col justify-between h-36 shadow-[0_0_15px_rgba(99,102,241,0.15)]">
              <div>
                <span className="text-[10px] text-indigo-400 uppercase font-mono font-bold">05. SETTLED</span>
                <h5 className="font-bold text-xs text-white mt-1">Payout Settlement</h5>
                <p className="text-[10px] text-slate-400">Bank Transfer / IMPS</p>
              </div>
              <div className="text-sm font-bold text-indigo-300">
                Verified Bank Audit
              </div>
            </div>
          </div>

          {/* Formula Card */}
          <div className="bg-[#080c19] p-4 rounded-xl border border-cyan-500/20 flex flex-col sm:flex-row items-center justify-between text-xs gap-3">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Audited Financial Formula:
            </span>
            <div className="font-mono text-slate-200">
              <span className="text-cyan-400 font-bold">Gross Booking</span> (₹{grossBooking.toLocaleString()}) ={" "}
              <span className="text-pink-400 font-bold">Platform Fee</span> (₹{platformComm.toLocaleString()}) +{" "}
              <span className="text-emerald-400 font-bold">Vendor Payout Liability</span> (₹{vendorLiab.toLocaleString()})
            </div>
          </div>
        </div>
      )}

      {/* WORKFLOW 2: VENDOR JOINING FEE LEDGER */}
      {activeWorkflow === "JOINING" && (
        <div className="space-y-6 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center">
            {/* Stage 1 */}
            <div className="bg-[#0b1020]/90 border border-slate-800 p-4 rounded-xl flex flex-col justify-between h-36">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-mono font-bold">01. INTAKE</span>
                <h5 className="font-bold text-xs text-slate-200 mt-1">Vendor Application</h5>
                <p className="text-[10px] text-slate-400">Documents & Catalog</p>
              </div>
              <div className="text-xs text-amber-400 font-bold">State: DRAFT</div>
            </div>

            {/* Stage 2 */}
            <div className="bg-[#0b1020]/90 border border-amber-500/30 p-4 rounded-xl flex flex-col justify-between h-36">
              <div>
                <span className="text-[10px] text-amber-400 uppercase font-mono font-bold">02. ORDER</span>
                <h5 className="font-bold text-xs text-slate-200 mt-1">₹800 INR Order</h5>
                <p className="text-[10px] text-slate-400">Exact 80,000 paise</p>
              </div>
              <div className="text-xs text-slate-300 font-bold">PAYMENT_PENDING</div>
            </div>

            {/* Stage 3 */}
            <div className="bg-[#0b1020]/90 border border-emerald-500/40 p-4 rounded-xl flex flex-col justify-between h-36 shadow-[0_0_15px_rgba(16,182,129,0.15)]">
              <div>
                <span className="text-[10px] text-emerald-400 uppercase font-mono font-bold">03. VERIFIED</span>
                <h5 className="font-bold text-xs text-white mt-1">Gateway Signature</h5>
                <p className="text-[10px] text-slate-400">Server HMAC & Webhook</p>
              </div>
              <div className="text-lg font-black text-emerald-300">₹800.00 PAID</div>
            </div>

            {/* Stage 4 */}
            <div className="bg-[#0b1020]/90 border border-violet-500/40 p-4 rounded-xl flex flex-col justify-between h-36">
              <div>
                <span className="text-[10px] text-violet-400 uppercase font-mono font-bold">04. APPROVAL</span>
                <h5 className="font-bold text-xs text-white mt-1">Admin Audit Check</h5>
                <p className="text-[10px] text-slate-400">Verify IDs & Pricing</p>
              </div>
              <div className="text-xs text-violet-300 font-bold">PAID_PENDING_APPROVAL</div>
            </div>

            {/* Stage 5 */}
            <div className="bg-[#0b1020]/90 border border-cyan-500/50 p-4 rounded-xl flex flex-col justify-between h-36 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
              <div>
                <span className="text-[10px] text-cyan-400 uppercase font-mono font-bold">05. LIVE</span>
                <h5 className="font-bold text-xs text-white mt-1">Vendor Activation</h5>
                <p className="text-[10px] text-slate-400">Visible in AI & Explore</p>
              </div>
              <div className="text-xs text-cyan-300 font-black">APPROVED_ACTIVE</div>
            </div>
          </div>

          <div className="bg-[#080c19] p-4 rounded-xl border border-amber-500/20 flex items-center justify-between text-xs">
            <span className="text-slate-400">Total Joining Revenue Collected:</span>
            <div className="text-base font-black text-amber-400">
              ₹{joiningRevenue.toLocaleString()} INR (Recorded in FinancialLedgerEntry)
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
