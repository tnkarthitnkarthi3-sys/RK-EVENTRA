"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Building,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Search,
  Filter,
  RefreshCw,
  ArrowLeft,
  DollarSign,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  ShieldCheck,
  Check,
  X,
  CreditCard,
  UserCheck,
  Sparkles,
  ChevronDown,
  History,
  FileText,
  Ban,
  Calendar,
} from "lucide-react";
import ThemeToggle from "@/src/components/theme/ThemeToggle";

type JoinPayment = {
  id: string;
  amount: number;
  currency: string;
  status: "PENDING" | "CREATED" | "PAID" | "FAILED";
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  transactionId: string | null;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type Vendor = {
  id: string;
  businessName: string;
  description: string | null;
  location: string | null;
  profileImage: string | null;
  rating: number;
  status: "PENDING" | "PAYMENT_PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
  workflowStatus: "PAYMENT_PENDING" | "PAYMENT_FAILED" | "PAID_AWAITING_APPROVAL" | "APPROVED" | "REJECTED" | "SUSPENDED";
  rejectionReason?: string | null;
  createdAt: string;
  updatedAt: string;
  joinedAt: string;
  approvedAt: string | null;
  businessPhone?: string | null;
  whatsappNumber?: string | null;
  ownerName?: string | null;
  owner: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  };
  services: {
    id: string;
    name: string;
    description: string | null;
    category: string;
    price: number;
    active: boolean;
  }[];
  joinPayment: JoinPayment | null;
  paymentHistory: JoinPayment[];
  paymentPaid: boolean;
  verifiedPaymentAmount: number | null;
  transactionReference: string | null;
};

type Summary = {
  totalVendors: number;
  paidAwaitingApproval: number;
  paymentPending: number;
  approved: number;
  rejected: number;
  suspended: number;
  currentJoiningFee: number;
};

export default function AdminVendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [summary, setSummary] = useState<Summary>({
    totalVendors: 0,
    paidAwaitingApproval: 0,
    paymentPending: 0,
    approved: 0,
    rejected: 0,
    suspended: 0,
    currentJoiningFee: 800,
  });

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "PAYMENT_PENDING" | "PAID_AWAITING_APPROVAL" | "APPROVED" | "REJECTED" | "SUSPENDED"
  >("ALL");

  // Rejection Modal State
  const [rejectModalVendor, setRejectModalVendor] = useState<Vendor | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  // Payment Verification Modal State
  const [verifyModalVendor, setVerifyModalVendor] = useState<Vendor | null>(null);
  const [verifyTransactionRef, setVerifyTransactionRef] = useState("");
  const [verifyAmount, setVerifyAmount] = useState<number>(800);

  // History Drawer State
  const [historyModalVendor, setHistoryModalVendor] = useState<Vendor | null>(null);

  // Fee Change Inline
  const [newFeeValue, setNewFeeValue] = useState<string>("800");
  const [updatingFee, setUpdatingFee] = useState(false);

  async function loadVendors() {
    try {
      setLoading(true);
      setError("");
      const response = await fetch("/api/admin/vendors", { cache: "no-store" });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to load vendors");
      }

      setVendors(data.vendors || []);
      if (data.summary) {
        setSummary(data.summary);
        setNewFeeValue(String(data.summary.currentJoiningFee || 800));
        setVerifyAmount(data.summary.currentJoiningFee || 800);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load vendors");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadVendors();
  }, []);

  async function handleVendorAction(
    vendorId: string,
    action: "APPROVE" | "REJECT" | "VERIFY_PAYMENT" | "WAIVE_FEE" | "SUSPEND",
    additionalData?: { reason?: string; transactionRef?: string; amount?: number }
  ) {
    try {
      setActionLoading(`${vendorId}-${action}`);
      setError("");
      setSuccessMsg(null);

      const res = await fetch("/api/admin/vendors", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendorId,
          action,
          ...additionalData,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || `Failed to ${action} vendor`);
      }

      setSuccessMsg(data.message || `Action ${action} completed successfully`);
      setRejectModalVendor(null);
      setRejectReason("");
      setVerifyModalVendor(null);
      setVerifyTransactionRef("");

      loadVendors();
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleUpdateJoiningFee(e: React.FormEvent) {
    e.preventDefault();
    const feeNum = Number(newFeeValue);
    if (isNaN(feeNum) || feeNum < 0) {
      setError("Joining fee must be a non-negative number");
      return;
    }

    try {
      setUpdatingFee(true);
      setError("");
      const res = await fetch("/api/admin/vendors", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_JOINING_FEE",
          newJoiningFee: feeNum,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update joining fee");
      }

      setSuccessMsg(data.message || "Vendor joining fee updated successfully");
      loadVendors();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update fee");
    } finally {
      setUpdatingFee(false);
    }
  }

  // Filtered List
  const filteredVendors = useMemo(() => {
    return vendors.filter((v) => {
      const matchesSearch =
        v.businessName.toLowerCase().includes(search.toLowerCase()) ||
        v.owner.name.toLowerCase().includes(search.toLowerCase()) ||
        v.owner.email.toLowerCase().includes(search.toLowerCase()) ||
        (v.location && v.location.toLowerCase().includes(search.toLowerCase()));

      if (!matchesSearch) return false;

      if (statusFilter === "ALL") return true;
      return v.workflowStatus === statusFilter;
    });
  }, [vendors, search, statusFilter]);

  function getStatusBadge(workflowStatus: string) {
    switch (workflowStatus) {
      case "APPROVED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Approved
          </span>
        );
      case "PAID_AWAITING_APPROVAL":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
            <Clock className="w-3.5 h-3.5 text-amber-700" />
            Paid — Awaiting Approval
          </span>
        );
      case "PAYMENT_PENDING":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-stone-100 text-stone-700 border border-stone-300">
            <CreditCard className="w-3.5 h-3.5 text-stone-500" />
            Payment Pending
          </span>
        );
      case "PAYMENT_FAILED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            Payment Failed
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300">
            <X className="w-3.5 h-3.5 text-red-600" />
            Rejected
          </span>
        );
      case "SUSPENDED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-200 text-slate-800 border border-slate-300">
            <Ban className="w-3.5 h-3.5 text-slate-600" />
            Suspended
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-stone-100 text-stone-700">
            {workflowStatus}
          </span>
        );
    }
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* TOP HEADER */}
      <header className="sticky top-0 z-40 bg-[#070b14]/90 backdrop-blur-xl border-b border-amber-500/20 text-slate-100 shadow-xl shadow-black/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/dashboard"
              className="flex items-center gap-2 text-xs font-bold text-amber-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>
            <div className="h-5 w-px bg-slate-700 hidden sm:block" />
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-black tracking-wide text-white">
                RK <span className="text-amber-400">EVENTRA</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                Partner Approval Desk
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle variant="icon" />
            <button
              onClick={loadVendors}
              disabled={loading}
              className="p-2.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs transition-all"
              title="Refresh vendors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </header>

      {/* HERO BANNER SECTION */}
      <section className="bg-gradient-to-b from-[#0b1329] via-[#070b14] to-[#070b14] text-white border-b border-amber-500/10 pt-8 pb-10 relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-[450px] h-[450px] bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-10 left-10 w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Vendor Joining Fee & KYC Verification</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Vendor Applications & Joining Fee Approvals
              </h1>
              <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
                Inspect verified payments, enforce joining fee rules, and approve or reject partner accounts.
              </p>
            </div>

            {/* Joining Fee Quick Editor */}
            <form
              onSubmit={handleUpdateJoiningFee}
              className="bg-[#0e172e]/80 backdrop-blur-md border border-amber-500/25 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 shadow-xl"
            >
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300 block">
                  Future Application Fee
                </span>
                <span className="text-xs text-slate-400">Default: ₹800 INR</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative w-28">
                  <span className="absolute left-3 top-2 text-amber-400 font-bold text-xs">₹</span>
                  <input
                    type="number"
                    value={newFeeValue}
                    onChange={(e) => setNewFeeValue(e.target.value)}
                    min="0"
                    className="w-full pl-7 pr-3 py-1.5 rounded-xl bg-[#070b14] border border-slate-700 text-white text-xs font-mono font-bold focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={updatingFee}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-bold text-xs transition-all disabled:opacity-50"
                >
                  {updatingFee ? "Saving..." : "Update Fee"}
                </button>
              </div>
            </form>
          </div>

          {/* SUMMARY STAT CARDS */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
            <div className="p-4 rounded-2xl bg-[#0e172e]/70 border border-slate-800 backdrop-blur-sm">
              <span className="text-xs text-slate-400 font-medium">Total Vendors</span>
              <div className="text-2xl font-black text-white mt-1">{summary.totalVendors}</div>
            </div>
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 backdrop-blur-sm">
              <span className="text-xs text-amber-300 font-semibold">Paid — Awaiting</span>
              <div className="text-2xl font-black text-amber-400 mt-1">{summary.paidAwaitingApproval}</div>
            </div>
            <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/25 backdrop-blur-sm">
              <span className="text-xs text-blue-300 font-medium">Payment Pending</span>
              <div className="text-2xl font-black text-blue-400 mt-1">{summary.paymentPending}</div>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 backdrop-blur-sm">
              <span className="text-xs text-emerald-300 font-semibold">Approved</span>
              <div className="text-2xl font-black text-emerald-400 mt-1">{summary.approved}</div>
            </div>
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/25 backdrop-blur-sm">
              <span className="text-xs text-rose-300 font-medium">Rejected</span>
              <div className="text-2xl font-black text-rose-400 mt-1">{summary.rejected}</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700 backdrop-blur-sm">
              <span className="text-xs text-slate-400 font-medium">Suspended</span>
              <div className="text-2xl font-black text-slate-300 mt-1">{summary.suspended}</div>
            </div>
          </div>
        </div>
      </section>

      {/* NOTIFICATIONS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 w-full">
        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-sm flex items-start gap-3 shadow-sm animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">Action Completed</strong>
              <span>{successMsg}</span>
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-sm flex items-start gap-3 shadow-sm animate-fadeIn mt-2">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">Action Notice</strong>
              <span>{error}</span>
            </div>
          </div>
        )}
      </div>

      {/* FILTER & SEARCH BAR */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between bg-[#0e172e]/80 p-4 rounded-2xl border border-amber-500/20 shadow-xl backdrop-blur-md">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by business name, owner name, email, or city..."
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-700 bg-[#070b14] text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: "ALL", label: "All" },
              { id: "PAID_AWAITING_APPROVAL", label: `Paid (${summary.paidAwaitingApproval})` },
              { id: "PAYMENT_PENDING", label: `Unpaid (${summary.paymentPending})` },
              { id: "APPROVED", label: `Approved (${summary.approved})` },
              { id: "REJECTED", label: `Rejected (${summary.rejected})` },
              { id: "SUSPENDED", label: `Suspended (${summary.suspended})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  statusFilter === tab.id
                    ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                    : "bg-slate-800/80 text-slate-300 hover:bg-slate-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* VENDORS TABLE / CARDS */}
        {loading ? (
          <div className="bg-[#0e172e]/80 rounded-3xl p-16 text-center border border-slate-800 shadow-xl">
            <RefreshCw className="w-8 h-8 text-amber-400 mx-auto animate-spin mb-3" />
            <p className="text-sm font-semibold text-slate-400">Loading vendor records...</p>
          </div>
        ) : filteredVendors.length === 0 ? (
          <div className="bg-[#0e172e]/80 rounded-3xl p-16 text-center border border-slate-800 shadow-xl space-y-3">
            <Building className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-lg font-bold text-white">No Vendors Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No vendor records match the selected filter criteria or search keyword.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredVendors.map((vendor) => (
              <div
                key={vendor.id}
                className="bg-[#0e172e]/80 rounded-3xl border border-slate-800 hover:border-amber-500/40 shadow-xl transition-all p-6 space-y-5"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 font-black text-lg flex items-center justify-center shrink-0">
                      {vendor.businessName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-bold text-white">
                          {vendor.businessName}
                        </h3>
                        {getStatusBadge(vendor.workflowStatus)}
                      </div>
                      <div className="text-xs text-slate-400 flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                        <span>Led by: <b className="text-slate-200">{vendor.owner.name}</b></span>
                        <span>Email: <b className="text-slate-200">{vendor.owner.email}</b></span>
                        {vendor.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-amber-400" /> {vendor.location}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Payment Verification Highlight Pill */}
                  <div className="text-left sm:text-right bg-[#070b14] sm:bg-transparent p-3 sm:p-0 rounded-xl">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                      Joining Fee Status
                    </span>
                    <div className="text-sm font-bold text-white mt-0.5">
                      {vendor.paymentPaid ? (
                        <span className="text-emerald-400 flex items-center sm:justify-end gap-1">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ₹{vendor.verifiedPaymentAmount || 800} PAID
                        </span>
                      ) : (
                        <span className="text-slate-400">₹{summary.currentJoiningFee} Unpaid</span>
                      )}
                    </div>
                    {vendor.transactionReference && (
                      <span className="text-[10px] text-slate-400 font-mono block truncate max-w-[200px]">
                        Ref: {vendor.transactionReference}
                      </span>
                    )}
                  </div>
                </div>

                {/* Body Details: Services & Rejection reason if present */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  <div className="md:col-span-7 space-y-2">
                    <p className="text-xs text-slate-300 line-clamp-2">
                      {vendor.description || "No company bio provided yet."}
                    </p>

                    {/* Services Chips */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {vendor.services.length === 0 ? (
                        <span className="text-[11px] text-slate-500">No services cataloged</span>
                      ) : (
                        vendor.services.slice(0, 4).map((s) => (
                          <span
                            key={s.id}
                            className="text-[11px] px-2.5 py-0.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700"
                          >
                            {s.name} (₹{s.price.toLocaleString("en-IN")})
                          </span>
                        ))
                      )}
                      {vendor.services.length > 4 && (
                        <span className="text-[11px] text-slate-500">+{vendor.services.length - 4} more</span>
                      )}
                    </div>

                    {/* Rejection notice if present */}
                    {vendor.rejectionReason && vendor.workflowStatus === "REJECTED" && (
                      <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/30 text-xs text-rose-300 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                        <div>
                          <strong>Rejection Reason:</strong> {vendor.rejectionReason}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions Column (5 cols) */}
                  <div className="md:col-span-5 flex flex-wrap items-center justify-start md:justify-end gap-2 pt-2 md:pt-0">
                    {/* View History Drawer Button */}
                    <button
                      type="button"
                      onClick={() => setHistoryModalVendor(vendor)}
                      className="px-3 py-2 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-all flex items-center gap-1.5"
                      title="View payment & application audit history"
                    >
                      <History className="w-3.5 h-3.5" />
                      <span>History</span>
                    </button>

                    {/* Public Profile Link */}
                    <Link
                      href={`/vendors/${vendor.id}`}
                      target="_blank"
                      className="px-3 py-2 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-all flex items-center gap-1.5"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Preview</span>
                    </Link>

                    {/* Action 1: Verify Payment (if unpaid) */}
                    {!vendor.paymentPaid && (
                      <button
                        type="button"
                        onClick={() => {
                          setVerifyModalVendor(vendor);
                          setVerifyAmount(summary.currentJoiningFee);
                          setVerifyTransactionRef("");
                        }}
                        className="px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-bold text-xs transition-all flex items-center gap-1.5"
                      >
                        <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                        <span>Verify UPI Receipt</span>
                      </button>
                    )}

                    {/* Action 2: Waive Fee */}
                    {!vendor.paymentPaid && (
                      <button
                        type="button"
                        disabled={actionLoading === `${vendor.id}-WAIVE_FEE`}
                        onClick={() => handleVendorAction(vendor.id, "WAIVE_FEE")}
                        className="px-3 py-2 rounded-xl border border-purple-500/30 bg-purple-950/40 hover:bg-purple-900/50 text-purple-300 font-bold text-xs transition-all"
                      >
                        Waive Fee
                      </button>
                    )}

                    {/* Action 3: Approve (Active if paid/waived) */}
                    {vendor.workflowStatus !== "APPROVED" && (
                      <button
                        type="button"
                        disabled={actionLoading === `${vendor.id}-APPROVE`}
                        onClick={() => {
                          if (!vendor.paymentPaid) {
                            setError(`Cannot approve unpaid vendor "${vendor.businessName}". Please verify their ₹${summary.currentJoiningFee} fee payment or click "Waive Fee" first.`);
                            return;
                          }
                          handleVendorAction(vendor.id, "APPROVE");
                        }}
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                    )}

                    {/* Action 4: Reject with Reason */}
                    {vendor.workflowStatus !== "REJECTED" && (
                      <button
                        type="button"
                        onClick={() => {
                          setRejectModalVendor(vendor);
                          setRejectReason("");
                        }}
                        className="px-3 py-2 rounded-xl border border-rose-500/30 bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 font-bold text-xs transition-all"
                      >
                        Reject
                      </button>
                    )}

                    {/* Action 5: Suspend */}
                    {vendor.workflowStatus === "APPROVED" && (
                      <button
                        type="button"
                        disabled={actionLoading === `${vendor.id}-SUSPEND`}
                        onClick={() => handleVendorAction(vendor.id, "SUSPEND")}
                        className="px-3 py-2 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-all"
                      >
                        Suspend
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* REJECTION REASON MODAL */}
      {rejectModalVendor && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0e172e] rounded-3xl max-w-md w-full p-6 sm:p-7 space-y-4 shadow-2xl border border-amber-500/30">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">
                Reject Vendor Application
              </h3>
              <button
                type="button"
                onClick={() => setRejectModalVendor(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Enter the rejection rationale for <b>{rejectModalVendor.businessName}</b>. This will be stored in the vendor record.
            </p>

            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Incomplete service catalog, invalid contact documentation, or duplicate profile..."
              className="w-full p-3 rounded-xl border border-slate-700 bg-[#070b14] text-sm text-white placeholder-slate-500 focus:border-rose-500 focus:outline-none"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectModalVendor(null)}
                className="px-4 py-2 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() =>
                  handleVendorAction(rejectModalVendor.id, "REJECT", { reason: rejectReason.trim() })
                }
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PAYMENT VERIFICATION MODAL */}
      {verifyModalVendor && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0e172e] rounded-3xl max-w-md w-full p-6 sm:p-7 space-y-4 shadow-2xl border border-amber-500/30">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">
                Verify Manual UPI Payment
              </h3>
              <button
                type="button"
                onClick={() => setVerifyModalVendor(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Record verified manual UPI transfer for <b>{verifyModalVendor.businessName}</b> and activate partner account.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Verified Amount (₹ INR)
                </label>
                <input
                  type="number"
                  value={verifyAmount}
                  onChange={(e) => setVerifyAmount(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-700 bg-[#070b14] text-white text-sm font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Transaction Reference / UTR
                </label>
                <input
                  type="text"
                  value={verifyTransactionRef}
                  onChange={(e) => setVerifyTransactionRef(e.target.value)}
                  placeholder="e.g. UPI/123456789012 or GPay-Ref-9922"
                  className="w-full p-2.5 rounded-xl border border-slate-700 bg-[#070b14] text-white text-sm font-mono placeholder-slate-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setVerifyModalVendor(null)}
                className="px-4 py-2 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() =>
                  handleVendorAction(verifyModalVendor.id, "VERIFY_PAYMENT", {
                    transactionRef: verifyTransactionRef.trim() || `MANUAL_UPI_${Date.now()}`,
                    amount: verifyAmount,
                  })
                }
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20"
              >
                Verify & Approve Vendor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* APPLICATION & PAYMENT HISTORY DRAWER */}
      {historyModalVendor && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0e172e] rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-4 shadow-2xl border border-amber-500/30 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white">
                  Application & Payment History
                </h3>
                <span className="text-xs text-amber-400">{historyModalVendor.businessName}</span>
              </div>
              <button
                type="button"
                onClick={() => setHistoryModalVendor(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-[#070b14] border border-slate-800 space-y-1">
                <div className="font-bold text-white">Registration Timeline</div>
                <div className="text-slate-300">
                  Applied on: {new Date(historyModalVendor.joinedAt).toLocaleString("en-IN")}
                </div>
                {historyModalVendor.approvedAt && (
                  <div className="text-emerald-400 font-semibold">
                    Approved on: {new Date(historyModalVendor.approvedAt).toLocaleString("en-IN")}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="font-bold text-white">Payment Attempts ({historyModalVendor.paymentHistory.length})</div>
                {historyModalVendor.paymentHistory.length === 0 ? (
                  <p className="text-slate-500">No payment records initiated yet.</p>
                ) : (
                  historyModalVendor.paymentHistory.map((p, idx) => (
                    <div key={p.id} className="p-3 rounded-xl border border-slate-800 bg-[#070b14] space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-200">Attempt #{idx + 1} — ₹{p.amount}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${p.status === "PAID" ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" : "bg-amber-500/15 text-amber-300 border border-amber-500/30"}`}>
                          {p.status}
                        </span>
                      </div>
                      <div className="text-slate-400 font-mono text-[11px]">
                        Order ID: {p.razorpayOrderId || "Manual Order"}
                      </div>
                      {p.razorpayPaymentId && (
                        <div className="text-slate-400 font-mono text-[11px]">
                          Payment ID: {p.razorpayPaymentId}
                        </div>
                      )}
                      {p.transactionId && (
                        <div className="text-slate-400 font-mono text-[11px]">
                          Ref: {p.transactionId}
                        </div>
                      )}
                      <div className="text-slate-500 text-[10px]">
                        Date: {new Date(p.createdAt).toLocaleString("en-IN")}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setHistoryModalVendor(null)}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold"
              >
                Close History
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
