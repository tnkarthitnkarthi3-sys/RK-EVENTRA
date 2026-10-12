"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  QrCode,
  CreditCard,
  Building,
  Save,
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Upload,
  Trash2,
  Lock,
  Smartphone,
  Info,
} from "lucide-react";

export default function VendorPaymentSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [form, setForm] = useState({
    upiId: "",
    paymentMobile: "",
    paymentDisplayName: "",
    paymentQrUrl: "",
    bankAccountDetails: "",
    paymentInstructions: "",
    showManualUpi: true,
  });

  const [qrFilePreview, setQrFilePreview] = useState<string | null>(null);

  async function loadPaymentSettings() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/vendor/payment-settings", { credentials: "include" });
      if (res.status === 401 || res.status === 403) {
        router.replace("/login");
        return;
      }
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to load payment settings");
      }
      const s = data.settings || {};
      setForm({
        upiId: s.upiId || "",
        paymentMobile: s.paymentMobile || "",
        paymentDisplayName: s.paymentDisplayName || s.businessName || "",
        paymentQrUrl: s.paymentQrUrl || "",
        bankAccountDetails: s.bankAccountDetails || "",
        paymentInstructions: s.paymentInstructions || "",
        showManualUpi: s.showManualUpi !== undefined ? Boolean(s.showManualUpi) : true,
      });
      setQrFilePreview(s.paymentQrUrl || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading payment settings");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPaymentSettings();
  }, []);

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (PNG, JPG, or WEBP).");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("QR code image size must be under 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setQrFilePreview(dataUrl);
      setForm((prev) => ({ ...prev, paymentQrUrl: dataUrl }));
    };
    reader.readAsDataURL(file);
  }

  function handleRemoveQr() {
    setQrFilePreview(null);
    setForm((prev) => ({ ...prev, paymentQrUrl: "" }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);

      const confirmChange = confirm(
        "Are you sure you want to update your payment & UPI settings? Previous transactions and payout snapshots will remain immutable."
      );
      if (!confirmChange) {
        setSaving(false);
        return;
      }

      const res = await fetch("/api/vendor/payment-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update payment settings");
      }

      setSuccessMsg("UPI ID and Payment QR settings updated successfully in database!");
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error saving payment settings");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col lg:flex-row">
      {/* VENDOR SIDEBAR */}
      <aside className="w-full lg:w-64 bg-slate-900 border-b lg:border-b-0 lg:border-r border-slate-800 p-6 flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          <Link href="/vendor-dashboard" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-black text-lg">
              RK
            </div>
            <div>
              <div className="text-lg font-black text-white">RK EVENTRA</div>
              <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Vendor Partner</div>
            </div>
          </Link>

          <nav className="space-y-1.5 text-xs font-semibold">
            <Link
              href="/vendor-dashboard"
              className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-slate-400" />
              <span>Back to Overview</span>
            </Link>
            <Link
              href="/vendor/profile"
              className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
            >
              <Building className="w-4 h-4 text-slate-400" />
              <span>Edit Business Profile</span>
            </Link>
            <Link
              href="/vendor/payment-settings"
              className="flex items-center gap-2.5 p-2.5 rounded-xl bg-amber-500/10 text-amber-400 font-bold border border-amber-500/30"
            >
              <QrCode className="w-4 h-4" />
              <span>Payment & UPI Settings</span>
            </Link>
          </nav>
        </div>
      </aside>

      {/* MAIN FORM */}
      <main className="flex-1 p-6 lg:p-8 space-y-8 overflow-y-auto max-w-4xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
              <QrCode className="w-8 h-8 text-amber-400" />
              Payment & UPI Settings
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Configure your verified UPI ID, upload payment QR code, and provide payout instructions.
            </p>
          </div>

          <button
            onClick={loadPaymentSettings}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Reload</span>
          </button>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm font-semibold">
            {successMsg}
          </div>
        )}

        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-3">
          <Info className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Security Notice: </span>
            A static vendor UPI QR is displayed only for customer direct transfers where permitted. All verified
            gateway transactions are processed through Razorpay orders. Changes made here are version-tracked in audit
            logs and will not alter completed historical transactions.
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5">
            <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Smartphone className="w-5 h-5 text-amber-400" />
              UPI & Mobile Payment Coordinates
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300">UPI ID / VPA</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. yourname@upi or 9876543210@fam"
                  value={form.upiId}
                  onChange={(e) => setForm({ ...form, upiId: e.target.value })}
                  className="mt-1 w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Business Payment Mobile Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 9840011223"
                  value={form.paymentMobile}
                  onChange={(e) => setForm({ ...form, paymentMobile: e.target.value })}
                  className="mt-1 w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300">Payment Display Name</label>
              <input
                type="text"
                placeholder="e.g. Chengalpattu Beats Audio & DJ"
                value={form.paymentDisplayName}
                onChange={(e) => setForm({ ...form, paymentDisplayName: e.target.value })}
                className="mt-1 w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
              />
              <p className="text-[11px] text-slate-400 mt-1">Name shown to the customer when scanning your UPI.</p>
            </div>
          </div>

          {/* QR CODE MANAGEMENT */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5">
            <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <QrCode className="w-5 h-5 text-amber-400" />
              Payment QR Code (UPI Standee / Scanner)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr] gap-6 items-center">
              <div className="space-y-3">
                <p className="text-xs text-slate-300">
                  Upload an image of your authorized business UPI QR code. Customers can scan this for direct UPI
                  transfers where manual verification is approved.
                </p>

                <div className="flex items-center gap-3">
                  <label className="cursor-pointer flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700">
                    <Upload className="w-4 h-4 text-amber-400" />
                    <span>Upload New QR Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>

                  {qrFilePreview && (
                    <button
                      type="button"
                      onClick={handleRemoveQr}
                      className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-xs font-bold text-rose-400"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Remove QR</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="flex justify-center p-4 rounded-2xl bg-slate-950 border border-slate-800">
                {qrFilePreview ? (
                  <img
                    src={qrFilePreview}
                    alt="Vendor Payment QR Preview"
                    className="max-h-48 rounded-xl object-contain"
                  />
                ) : (
                  <div className="text-center py-8 text-slate-500 text-xs">
                    <QrCode className="w-12 h-12 mx-auto text-slate-700 mb-2" />
                    <span>No QR code uploaded yet</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* BANK PAYOUT DETAILS & INSTRUCTIONS */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5">
            <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <CreditCard className="w-5 h-5 text-amber-400" />
              Bank Payout Details & Custom Customer Instructions
            </h2>

            <div>
              <label className="text-xs font-semibold text-slate-300">Bank Account Payout Details (Private)</label>
              <textarea
                rows={2}
                placeholder="Bank Name, Account Number, IFSC Code, Account Holder Name"
                value={form.bankAccountDetails}
                onChange={(e) => setForm({ ...form, bankAccountDetails: e.target.value })}
                className="mt-1 w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Kept strictly confidential and never displayed on public pages.
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300">Payment Instructions for Customer</label>
              <textarea
                rows={2}
                placeholder="e.g. Please share UTR reference number on WhatsApp at 9840011223 after transfer."
                value={form.paymentInstructions}
                onChange={(e) => setForm({ ...form, paymentInstructions: e.target.value })}
                className="mt-1 w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
              />
            </div>

            <label className="flex items-center gap-2.5 text-xs text-slate-300 pt-2">
              <input
                type="checkbox"
                checked={form.showManualUpi}
                onChange={(e) => setForm({ ...form, showManualUpi: e.target.checked })}
                className="rounded bg-slate-950 border-slate-800 text-amber-500"
              />
              <span>Display manual UPI transfer instructions alongside gateway checkout</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={loadPaymentSettings}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "Saving Settings..." : "Save Payment & UPI Details"}</span>
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
