"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Building,
  ArrowLeft,
  RefreshCw,
  Save,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  QrCode,
  Upload,
  Trash2,
  Edit3,
  X,
  Mail,
  Phone,
  DollarSign,
  Clock,
  Sparkles,
  Lock,
  Image as ImageIcon,
  HelpCircle,
  FileText,
} from "lucide-react";
import ThemeToggle from "@/src/components/theme/ThemeToggle";

interface SettingsState {
  admin_display_name: string;
  admin_contact_mobile: string;
  support_email: string;
  admin_upi_id: string;
  admin_payment_qr_url: string;
  platform_logo_url: string;
  support_contact_info: string;
  vendor_joining_fee: string;
  admin_payment_instructions: string;
  payment_gateway_status: string;
  payment_gateway_provider: string;
  payment_gateway_mode: string;
  platform_commission_percent: string;
  gst_percent: string;
}

export default function AdminSettingsPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingQr, setUploadingQr] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [gatewayConfigured, setGatewayConfigured] = useState<boolean>(false);
  const [adminUser, setAdminUser] = useState<{ name: string; email: string } | null>(null);

  // Original saved form to restore on Cancel
  const [savedForm, setSavedForm] = useState<SettingsState>({
    admin_display_name: "RK Eventra Admin",
    admin_contact_mobile: "+91 9840011223",
    support_email: "support@rkeventra.com",
    admin_upi_id: "7530041288@fam",
    admin_payment_qr_url: "",
    platform_logo_url: "",
    support_contact_info: "Mon - Sun: 9:00 AM - 9:00 PM IST",
    vendor_joining_fee: "800",
    admin_payment_instructions: "Send exact joining fee or booking deposit to admin UPI. Include vendor name in payment notes.",
    payment_gateway_status: "ACTIVE",
    payment_gateway_provider: "Razorpay",
    payment_gateway_mode: "TEST",
    platform_commission_percent: "10",
    gst_percent: "18",
  });

  const [form, setForm] = useState<SettingsState>(savedForm);

  async function loadSettings() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/settings", { cache: "no-store" });
      if (res.status === 401 || res.status === 403) {
        router.replace("/admin/login");
        return;
      }
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to load platform settings");
      }

      if (data.settings) {
        const loaded: SettingsState = {
          ...savedForm,
          ...data.settings,
        };
        setSavedForm(loaded);
        setForm(loaded);
      }
      if (data.lastUpdatedAt) {
        setLastUpdated(data.lastUpdatedAt);
      }
      setGatewayConfigured(Boolean(data.gatewayConfigured));
      if (data.adminProfile) {
        setAdminUser(data.adminProfile);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading settings");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSettings();
  }, []);

  function handleCancel() {
    setForm(savedForm);
    setIsEditing(false);
    setError(null);
  }

  // Handle QR upload
  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>, field: "admin_payment_qr_url" | "platform_logo_url") {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp", "image/svg+xml"].includes(file.type)) {
      setError("Please select a valid image file (PNG, JPG, WEBP, SVG)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("File size cannot exceed 5MB");
      return;
    }

    try {
      if (field === "admin_payment_qr_url") setUploadingQr(true);
      else setUploadingLogo(true);
      setError(null);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", field === "admin_payment_qr_url" ? "admin_qr" : "admin_logo");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to upload image");
      }

      setForm((prev) => ({
        ...prev,
        [field]: data.url,
      }));

      setSuccessMsg(`${field === "admin_payment_qr_url" ? "QR Code" : "Logo"} uploaded! Click "Save Changes" to apply.`);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload image");
    } finally {
      setUploadingQr(false);
      setUploadingLogo(false);
      if (e.target) e.target.value = "";
    }
  }

  function handleRemoveImage(field: "admin_payment_qr_url" | "platform_logo_url") {
    setForm((prev) => ({
      ...prev,
      [field]: "",
    }));
  }

  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();

    // Client-side form validation
    if (!form.admin_display_name.trim()) {
      setError("Admin display name is required");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.support_email.trim())) {
      setError("Please enter a valid support email address (e.g. support@rkeventra.com)");
      return;
    }

    const phoneDigits = form.admin_contact_mobile.replace(/[^0-9]/g, "");
    if (phoneDigits.length < 10) {
      setError("Admin contact mobile must contain at least 10 digits");
      return;
    }

    const upiRegex = /^[\w.-]+@[\w.-]+$/;
    if (!upiRegex.test(form.admin_upi_id.trim())) {
      setError("Please enter a valid UPI ID (e.g. name@bank or 7530041288@fam)");
      return;
    }

    const feeNum = Number(form.vendor_joining_fee);
    if (isNaN(feeNum) || feeNum < 0) {
      setError("Vendor joining fee must be a non-negative number");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: form }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to save settings");
      }

      setSavedForm(form);
      setIsEditing(false);
      setSuccessMsg("Platform settings saved and applied securely across the marketplace!");
      if (data.lastUpdatedAt) setLastUpdated(data.lastUpdatedAt);
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error saving settings");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* TOP LUXURY NAVIGATION BAR */}
      <header className="sticky top-0 z-40 bg-[#070b14]/90 backdrop-blur-xl border-b border-amber-500/20 text-slate-100 shadow-xl shadow-black/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/dashboard"
              className="flex items-center gap-2 text-xs font-bold text-amber-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Link>
            <div className="h-5 w-px bg-slate-700 hidden sm:block" />
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-black tracking-wide text-white">
                RK <span className="text-amber-400">EVENTRA</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                Admin Console
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle variant="icon" />
            <button
              onClick={loadSettings}
              disabled={loading}
              className="p-2.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs transition-all"
              title="Refresh settings"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </header>

      {/* HERO BANNER SECTION */}
      <section className="bg-gradient-to-b from-[#0b1329] via-[#070b14] to-[#070b14] text-white border-b border-amber-500/10 pt-8 pb-12 relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-[450px] h-[450px] bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-10 left-10 w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Platform Governance & Payment Settings</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Platform & Payment Settings
              </h1>
              <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
                Control official platform contact details, Admin UPI payment ID, QR code, vendor joining fees, and payment gateway status.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit Settings</span>
                </button>
              ) : (
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={saving}
                    className="px-5 py-3 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-semibold text-sm transition-all flex items-center gap-1.5"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel Changes</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveSettings}
                    disabled={saving}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/25 hover:brightness-105 transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Last updated timestamp indicator */}
          {lastUpdated && (
            <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>
                Last Updated: {new Date(lastUpdated).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
              </span>
            </div>
          )}
        </div>
      </section>

      {/* NOTIFICATIONS (Success / Error Banners) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 w-full">
        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-sm flex items-start gap-3 shadow-sm animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">Settings Saved Successfully</strong>
              <span>{successMsg}</span>
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-sm flex items-start gap-3 shadow-sm animate-fadeIn mt-2">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">Validation Notice</strong>
              <span>{error}</span>
            </div>
          </div>
        )}
      </div>

      {/* MAIN FORM GRID */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        <form onSubmit={handleSaveSettings} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT COLUMN: PLATFORM & PAYMENT DETAILS (7 COLS) */}
            <div className="lg:col-span-7 space-y-8">
              {/* SECTION 1: ADMIN DISPLAY & CONTACT INFORMATION */}
              <div className="bg-[#0e172e]/80 rounded-3xl p-6 sm:p-8 border border-amber-500/20 shadow-xl backdrop-blur-md space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center font-bold">
                    <Building className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      Platform Brand & Contact Details
                    </h2>
                    <p className="text-xs text-slate-400">
                      Official contact identity shown to customers, vendors, and support requests.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                      Admin Display Name *
                    </label>
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={form.admin_display_name}
                      onChange={(e) => setForm({ ...form, admin_display_name: e.target.value })}
                      placeholder="e.g. RK Eventra Platform Admin"
                      className="w-full rounded-xl border border-slate-700 bg-[#070b14] disabled:bg-[#070b14]/50 px-4 py-3 text-sm text-white disabled:text-slate-400 focus:outline-none focus:border-amber-400 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                      Support Email / Gmail ID *
                    </label>
                    <input
                      type="email"
                      disabled={!isEditing}
                      value={form.support_email}
                      onChange={(e) => setForm({ ...form, support_email: e.target.value })}
                      placeholder="e.g. support@rkeventra.com"
                      className="w-full rounded-xl border border-slate-700 bg-[#070b14] disabled:bg-[#070b14]/50 px-4 py-3 text-sm text-white disabled:text-slate-400 focus:outline-none focus:border-amber-400 transition-all"
                    />
                    <span className="text-[11px] text-slate-400 block">
                      Note: Changing public support email does NOT alter administrator login identity.
                    </span>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                      Admin Contact Mobile Number *
                    </label>
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={form.admin_contact_mobile}
                      onChange={(e) => setForm({ ...form, admin_contact_mobile: e.target.value })}
                      placeholder="e.g. +91 9840011223"
                      className="w-full rounded-xl border border-slate-700 bg-[#070b14] disabled:bg-[#070b14]/50 px-4 py-3 text-sm text-white disabled:text-slate-400 focus:outline-none focus:border-amber-400 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                      Support Working Hours / Info
                    </label>
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={form.support_contact_info}
                      onChange={(e) => setForm({ ...form, support_contact_info: e.target.value })}
                      placeholder="e.g. Mon - Sun: 9:00 AM - 9:00 PM IST"
                      className="w-full rounded-xl border border-slate-700 bg-[#070b14] disabled:bg-[#070b14]/50 px-4 py-3 text-sm text-white disabled:text-slate-400 focus:outline-none focus:border-amber-400 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: VENDOR JOINING FEE MANAGEMENT */}
              <div className="bg-[#0e172e]/80 rounded-3xl p-6 sm:p-8 border border-amber-500/20 shadow-xl backdrop-blur-md space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center font-bold">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      Vendor Joining Fee Policy
                    </h2>
                    <p className="text-xs text-slate-400">
                      Adjust the mandatory partner activation fee for new vendor applications.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                      Vendor Joining Fee (INR ₹) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-3 text-amber-400 font-bold text-sm">₹</span>
                      <input
                        type="number"
                        disabled={!isEditing}
                        value={form.vendor_joining_fee}
                        onChange={(e) => setForm({ ...form, vendor_joining_fee: e.target.value })}
                        placeholder="800"
                        min="0"
                        className="w-full rounded-xl border border-slate-700 bg-[#070b14] disabled:bg-[#070b14]/50 pl-9 pr-4 py-3 text-sm text-white disabled:text-slate-400 font-mono font-bold focus:outline-none focus:border-amber-400 transition-all"
                      />
                    </div>
                    <span className="text-[11px] text-slate-400 block">
                      Default standard fee: ₹800 INR. Changes apply to future applications.
                    </span>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                      Platform Booking Commission (%)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        disabled={!isEditing}
                        value={form.platform_commission_percent}
                        onChange={(e) => setForm({ ...form, platform_commission_percent: e.target.value })}
                        placeholder="10"
                        min="0"
                        max="50"
                        className="w-full rounded-xl border border-slate-700 bg-[#070b14] disabled:bg-[#070b14]/50 px-4 py-3 text-sm text-white disabled:text-slate-400 font-mono font-bold focus:outline-none focus:border-amber-400 transition-all"
                      />
                      <span className="absolute right-4 top-3 text-amber-400 font-bold text-sm">%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 3: PAYMENT INSTRUCTIONS & NOTES */}
              <div className="bg-[#0e172e]/80 rounded-3xl p-6 sm:p-8 border border-amber-500/20 shadow-xl backdrop-blur-md space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center font-bold">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      Official Payment Instructions
                    </h2>
                    <p className="text-xs text-slate-400">
                      Public directions displayed on payment checkout and manual UPI transfers.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <textarea
                    rows={3}
                    disabled={!isEditing}
                    value={form.admin_payment_instructions}
                    onChange={(e) => setForm({ ...form, admin_payment_instructions: e.target.value })}
                    placeholder="Enter instructions for vendors sending direct manual UPI payments..."
                    className="w-full rounded-xl border border-slate-700 bg-[#070b14] disabled:bg-[#070b14]/50 px-4 py-3 text-sm text-white disabled:text-slate-400 focus:outline-none focus:border-amber-400 transition-all resize-y"
                  />
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: UPI & QR MANAGEMENT + GATEWAY STATUS (5 COLS) */}
            <div className="lg:col-span-5 space-y-8">
              {/* SECTION 4: ADMIN PAYMENT QR & UPI DETAILS */}
              <div className="bg-[#0e172e]/80 rounded-3xl p-6 sm:p-7 border border-amber-500/25 shadow-xl backdrop-blur-md space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center font-bold">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">
                      Admin Payment & UPI Details
                    </h2>
                    <p className="text-xs text-slate-400">
                      Official QR code & VPA used for direct platform fee receipts.
                    </p>
                  </div>
                </div>

                {/* UPI ID */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                    Admin Official UPI ID *
                  </label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={form.admin_upi_id}
                    onChange={(e) => setForm({ ...form, admin_upi_id: e.target.value })}
                    placeholder="e.g. 7530041288@fam"
                    className="w-full rounded-xl border border-slate-700 bg-[#070b14] disabled:bg-[#070b14]/50 px-4 py-3 text-sm text-white disabled:text-slate-400 font-mono font-bold focus:outline-none focus:border-amber-400 transition-all"
                  />
                </div>

                {/* QR Code Upload, Preview & Controls */}
                <div className="space-y-3">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                    Admin Payment QR Code
                  </label>

                  <div className="p-5 rounded-2xl bg-[#070b14] border border-amber-500/20 text-center space-y-4">
                    {form.admin_payment_qr_url ? (
                      <div className="space-y-3">
                        <div className="relative inline-block mx-auto p-2 rounded-2xl bg-white border border-slate-700 shadow-md">
                          <img
                            src={form.admin_payment_qr_url}
                            alt="Admin Payment QR Code"
                            className="w-44 h-44 object-contain rounded-xl mx-auto"
                          />
                        </div>
                        <div className="text-xs font-bold text-amber-400">
                          Active Payment QR Code
                        </div>
                      </div>
                    ) : (
                      <div className="py-8 space-y-2 text-slate-500">
                        <QrCode className="w-16 h-16 mx-auto stroke-1 text-slate-600" />
                        <p className="text-xs font-medium">No payment QR code currently uploaded</p>
                      </div>
                    )}

                    {/* QR Action Buttons */}
                    {isEditing && (
                      <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={(e) => handleFileUpload(e, "admin_payment_qr_url")}
                          accept="image/*"
                          className="hidden"
                        />

                        <button
                          type="button"
                          disabled={uploadingQr}
                          onClick={() => fileInputRef.current?.click()}
                          className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>{form.admin_payment_qr_url ? "Replace QR Code" : "Upload QR Code"}</span>
                        </button>

                        {form.admin_payment_qr_url && (
                          <button
                            type="button"
                            onClick={() => handleRemoveImage("admin_payment_qr_url")}
                            className="px-3.5 py-2 rounded-xl border border-rose-500/30 bg-rose-950/40 hover:bg-rose-950/70 text-rose-300 font-bold text-xs transition-all flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove QR</span>
                          </button>
                        )}
                      </div>
                    )}

                    {uploadingQr && (
                      <div className="text-xs text-amber-400 font-semibold animate-pulse">
                        Uploading and validating image...
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* SECTION 4.5: ADMIN AUTHENTICATION IDENTITY */}
              <div className="bg-[#0e172e]/80 rounded-3xl p-6 sm:p-7 border border-cyan-500/25 shadow-xl backdrop-blur-md space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">Fixed Admin Security Identity</h2>
                    <p className="text-xs text-slate-400">Master authentication credentials for platform governance.</p>
                  </div>
                </div>
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#070b14] border border-slate-800">
                    <span className="font-semibold text-slate-300">Admin Email (Fixed)</span>
                    <span className="font-mono font-bold text-cyan-300">admineventra@gmail.com</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#070b14] border border-slate-800">
                    <span className="font-semibold text-slate-300">Admin Password (Fixed)</span>
                    <span className="font-mono font-bold text-amber-300">admineventra</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#070b14] border border-slate-800">
                    <span className="font-semibold text-slate-300">Security Clearance</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-bold">
                      SUPER ADMIN
                    </span>
                  </div>
                </div>
              </div>

              {/* SECTION 5: PAYMENT GATEWAY STATUS BADGE */}
              <div className="bg-[#0e172e]/80 rounded-3xl p-6 sm:p-7 border border-amber-500/20 shadow-xl backdrop-blur-md space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 text-slate-200 flex items-center justify-center font-bold">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">
                      Payment Gateway Integration
                    </h2>
                    <p className="text-xs text-slate-400">
                      Real-time payment gateway credentials and connection health.
                    </p>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#070b14] border border-slate-800">
                    <span className="font-semibold text-slate-300">Provider</span>
                    <span className="font-bold text-white">{form.payment_gateway_provider}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#070b14] border border-slate-800">
                    <span className="font-semibold text-slate-300">Gateway Status</span>
                    {gatewayConfigured ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" /> ACTIVE (Connected)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                        <AlertCircle className="w-3 h-3 text-amber-400" /> Pending Credentials
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#070b14] border border-slate-800">
                    <span className="font-semibold text-slate-300">Environment Mode</span>
                    <span className="font-mono font-bold text-purple-400 uppercase">
                      {form.payment_gateway_mode}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2">
                  <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    API secrets (`RAZORPAY_KEY_SECRET`) are secured strictly in environment variables and never exposed to the frontend.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </main>

      {/* FOOTER */}
      <footer className="mt-auto border-t border-slate-800 bg-[#070b14] py-6 text-center text-xs text-slate-400">
        <p className="font-bold text-slate-300">RK EVENTRA • Administrator Security & Governance Console</p>
        <p className="mt-1">All settings persist securely in the central database across sessions.</p>
      </footer>
    </div>
  );
}
