"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Building,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Save,
  ArrowLeft,
  RefreshCw,
  Globe,
  Share2,
  Clock,
  Award,
  FileText,
  DollarSign,
  QrCode,
  ShieldCheck,
  Upload,
  Trash2,
  Edit2,
  Plus,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  MessageCircle,
  Video,
  Layers,
  Sparkles,
  Info,
  CreditCard,
} from "lucide-react";
import ThemeToggle from "@/src/components/theme/ThemeToggle";

type PortfolioItem = {
  id: string;
  imageUrl: string;
  title: string | null;
  caption: string | null;
  createdAt: string;
};

type ServiceItem = {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string | null;
  packages?: any[];
};

export default function VendorProfileEditorPage() {
  const router = useRouter();
  const qrInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<"business" | "social" | "gallery" | "payment" | "packages">("business");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Profile Form State
  const [form, setForm] = useState({
    businessName: "",
    ownerName: "",
    description: "",
    yearsOfExperience: 1,
    location: "",
    serviceArea: "",
    fullAddress: "",
    contactEmail: "",
    businessPhone: "",
    whatsappNumber: "",
    openingHours: "",
    websiteUrl: "",
    instagramUrl: "",
    youtubeUrl: "",
    facebookUrl: "",
    cancellationPolicy: "",
    profileImage: "",
    upiId: "",
    paymentMobile: "",
    paymentDisplayName: "",
    paymentQrUrl: "",
    paymentInstructions: "",
    showManualUpi: true,
  });

  // Gallery state
  const [portfolios, setPortfolios] = useState<PortfolioItem[]>([]);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [newPhotoCaption, setNewPhotoCaption] = useState("");
  const [uploadingQr, setUploadingQr] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // Services list for preview
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [vendorId, setVendorId] = useState<string>("");

  async function loadProfile() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/vendor/profile", { credentials: "include", cache: "no-store" });
      if (res.status === 401 || res.status === 403) {
        router.replace("/login");
        return;
      }
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to load vendor profile");
      }

      const v = data.vendor;
      setVendorId(v.id);
      setForm({
        businessName: v.businessName || "",
        ownerName: v.ownerName || v.user?.name || "",
        description: v.description || "",
        yearsOfExperience: v.yearsOfExperience || 1,
        location: v.location || "",
        serviceArea: v.serviceArea || "",
        fullAddress: v.fullAddress || "",
        contactEmail: v.contactEmail || v.user?.email || "",
        businessPhone: v.businessPhone || v.user?.phone || "",
        whatsappNumber: v.whatsappNumber || "",
        openingHours: v.openingHours || "",
        websiteUrl: v.websiteUrl || "",
        instagramUrl: v.instagramUrl || "",
        youtubeUrl: v.youtubeUrl || "",
        facebookUrl: v.facebookUrl || "",
        cancellationPolicy: v.cancellationPolicy || "",
        profileImage: v.profileImage || "",
        upiId: v.upiId || "",
        paymentMobile: v.paymentMobile || "",
        paymentDisplayName: v.paymentDisplayName || "",
        paymentQrUrl: v.paymentQrUrl || "",
        paymentInstructions: v.paymentInstructions || "",
        showManualUpi: v.showManualUpi ?? true,
      });

      if (Array.isArray(v.portfolios)) {
        setPortfolios(v.portfolios);
      }
      if (Array.isArray(v.services)) {
        setServices(v.services);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading profile");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProfile();
  }, []);

  // Save full profile form
  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();

    // Validation
    if (!form.businessName.trim()) {
      setError("Business / Company name is required");
      return;
    }

    if (form.websiteUrl && !form.websiteUrl.startsWith("http://") && !form.websiteUrl.startsWith("https://")) {
      setError("Website URL must start with https:// or http://");
      return;
    }
    if (form.youtubeUrl && !form.youtubeUrl.startsWith("http://") && !form.youtubeUrl.startsWith("https://")) {
      setError("YouTube URL must start with https:// or http://");
      return;
    }
    if (form.facebookUrl && !form.facebookUrl.startsWith("http://") && !form.facebookUrl.startsWith("https://")) {
      setError("Facebook URL must start with https:// or http://");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const res = await fetch("/api/vendor/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update profile");
      }

      setSuccessMsg("Profile details saved successfully! Public profile is now updated.");
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setSaving(false);
    }
  }

  // Upload image handler
  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>, field: "qr" | "logo" | "gallery") {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Please select a valid image file (JPG, PNG, WEBP)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("File exceeds 5MB size limit");
      return;
    }

    try {
      if (field === "qr") setUploadingQr(true);
      else if (field === "logo") setUploadingLogo(true);
      else setUploadingGallery(true);

      setError(null);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", `vendor_${field}`);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to upload image");
      }

      if (field === "qr") {
        setForm((prev) => ({ ...prev, paymentQrUrl: data.url }));
        setSuccessMsg("Payment QR uploaded! Remember to click Save.");
      } else if (field === "logo") {
        setForm((prev) => ({ ...prev, profileImage: data.url }));
        setSuccessMsg("Company logo uploaded! Remember to click Save.");
      } else if (field === "gallery") {
        // Add photo directly to Portfolio via API
        const portRes = await fetch("/api/portfolio", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageUrl: data.url,
            title: newPhotoCaption.trim() || "Event Showcase",
            caption: newPhotoCaption.trim() || null,
          }),
        });
        const portData = await portRes.json();
        if (portData.success && portData.portfolio) {
          setPortfolios((prev) => [portData.portfolio, ...prev]);
          setNewPhotoCaption("");
          setSuccessMsg("Event photo added to your public portfolio showcase!");
        }
      }

      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Image upload failed");
    } finally {
      setUploadingQr(false);
      setUploadingLogo(false);
      setUploadingGallery(false);
      if (e.target) e.target.value = "";
    }
  }

  // Delete portfolio photo
  async function handleDeletePhoto(id: string) {
    if (!confirm("Are you sure you want to remove this photo from your portfolio?")) return;
    try {
      setError(null);
      const res = await fetch("/api/portfolio", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to delete photo");
      }
      setPortfolios((prev) => prev.filter((p) => p.id !== id));
      setSuccessMsg("Photo removed from gallery.");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete photo");
    }
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* LUXURY TOP NAV */}
      <header className="sticky top-0 z-40 bg-[#070b14]/90 backdrop-blur-xl border-b border-amber-500/20 text-slate-100 shadow-xl shadow-black/40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/vendor-dashboard"
              className="flex items-center gap-2 text-xs font-bold text-amber-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Vendor Dashboard</span>
            </Link>
            <div className="h-5 w-px bg-slate-700 hidden sm:block" />
            <div className="flex items-center gap-2">
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-wide text-white">
                RK <span className="text-amber-400">EVENTRA</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                Vendor Profile Studio
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {vendorId && (
              <Link
                href={`/vendors/${vendorId}`}
                target="_blank"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-xs font-bold text-amber-300 transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>View Public Profile</span>
              </Link>
            )}
            <ThemeToggle variant="icon" />
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="bg-gradient-to-b from-[#0b1329] via-[#070b14] to-[#070b14] text-white border-b border-amber-500/20 pt-8 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Verified Partner Showcase</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight">
                {form.businessName || "Vendor Profile Studio"}
              </h1>
              <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
                Showcase your event artistry, manage public contact details, social handles, event photo gallery, and payment settings.
              </p>
            </div>

            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-[#0A1128] font-black text-sm shadow-lg shadow-[#D4AF37]/25 hover:brightness-105 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save All Changes</span>
                </>
              )}
            </button>
          </div>

          {/* SECTION NAVIGATION TABS */}
          <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-800">
            {[
              { id: "business", label: "Business Information", icon: Building },
              { id: "social", label: "Social Media Links", icon: Share2 },
              { id: "gallery", label: `Event Gallery (${portfolios.length})`, icon: ImageIcon },
              { id: "payment", label: "Payment & UPI Settings", icon: CreditCard },
              { id: "packages", label: `Services & Packages (${services.length})`, icon: Layers },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    activeTab === tab.id
                      ? "bg-amber-500 text-slate-950 shadow-md shadow-[#D4AF37]/20"
                      : "bg-white/10 hover:bg-white/15 text-slate-200 border border-white/10"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* NOTIFICATIONS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 w-full">
        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-sm flex items-start gap-3 shadow-sm animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">Update Successful</strong>
              <span>{successMsg}</span>
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-sm flex items-start gap-3 shadow-sm animate-fadeIn mt-2">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">Please Note</strong>
              <span>{error}</span>
            </div>
          </div>
        )}
      </div>

      {/* MAIN CONTENT AREA */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        <form onSubmit={handleSaveProfile} className="space-y-8">
          {/* TAB 1: BUSINESS INFORMATION */}
          {activeTab === "business" && (
            <div className="bg-[#0e172e]/80 rounded-3xl p-6 sm:p-8 border border-amber-500/20 shadow-xl backdrop-blur-md space-y-6 animate-fadeIn">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
                <div className="w-10 h-10 rounded-xl bg-[#0A1128] text-amber-400 flex items-center justify-center font-bold">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-serif font-bold text-white">
                    Business Profile & Credentials
                  </h2>
                  <p className="text-xs text-slate-400">
                    Essential business information shown to customers exploring event services.
                  </p>
                </div>
              </div>

              {/* Logo / Profile Image */}
              <div className="p-4 rounded-2xl bg-[#070b14] border border-slate-800 flex flex-col sm:flex-row items-center gap-5">
                <div className="w-20 h-20 rounded-2xl bg-white border border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                  {form.profileImage ? (
                    <img src={form.profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <Building className="w-8 h-8 text-slate-500" />
                  )}
                </div>
                <div className="space-y-1.5 text-center sm:text-left flex-1">
                  <span className="text-xs font-bold text-slate-200 block">Company Logo / Display Avatar</span>
                  <p className="text-[11px] text-slate-400">High-resolution logo (JPG, PNG, WEBP max 5MB)</p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <input
                      type="file"
                      ref={logoInputRef}
                      onChange={(e) => handleImageUpload(e, "logo")}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      disabled={uploadingLogo}
                      onClick={() => logoInputRef.current?.click()}
                      className="px-3.5 py-1.5 rounded-xl bg-[#0A1128] text-amber-300 text-xs font-bold transition-all"
                    >
                      {uploadingLogo ? "Uploading..." : form.profileImage ? "Replace Logo" : "Upload Logo"}
                    </button>
                    {form.profileImage && (
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, profileImage: "" })}
                        className="px-3 py-1.5 rounded-xl border border-slate-700 bg-[#070b14] text-slate-300 text-xs font-semibold"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                    Business / Event Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.businessName}
                    onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                    placeholder="e.g. RK Events & Sound System"
                    className="w-full rounded-xl border border-slate-700 bg-[#070b14] px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                    Owner / Founder Name
                  </label>
                  <input
                    type="text"
                    value={form.ownerName}
                    onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
                    placeholder="e.g. Karthikeyan Beats"
                    className="w-full rounded-xl border border-slate-700 bg-[#070b14] px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                    Business Bio & Description
                  </label>
                  <textarea
                    rows={4}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Describe your event specialization, quality equipment, past achievements, and celebrations handled..."
                    className="w-full rounded-xl border border-slate-700 bg-[#070b14] px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                    Primary Service Location (City / District)
                  </label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder="e.g. Chengalpattu, Tamil Nadu"
                    className="w-full rounded-xl border border-slate-700 bg-[#070b14] px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                    Service Areas Covered
                  </label>
                  <input
                    type="text"
                    value={form.serviceArea}
                    onChange={(e) => setForm({ ...form, serviceArea: e.target.value })}
                    placeholder="e.g. Chengalpattu, Tambaram, Kanchipuram, Chennai"
                    className="w-full rounded-xl border border-slate-700 bg-[#070b14] px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                    Years of Experience in Event Industry
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={form.yearsOfExperience}
                    onChange={(e) => setForm({ ...form, yearsOfExperience: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-700 bg-[#070b14] px-4 py-3 text-sm text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                    Working Hours
                  </label>
                  <input
                    type="text"
                    value={form.openingHours}
                    onChange={(e) => setForm({ ...form, openingHours: e.target.value })}
                    placeholder="e.g. Mon - Sun: 8:00 AM - 10:00 PM"
                    className="w-full rounded-xl border border-slate-700 bg-[#070b14] px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                    Physical Studio / Office Address
                  </label>
                  <input
                    type="text"
                    value={form.fullAddress}
                    onChange={(e) => setForm({ ...form, fullAddress: e.target.value })}
                    placeholder="e.g. No. 45, GST Road, Chengalpattu, Tamil Nadu 603001"
                    className="w-full rounded-xl border border-slate-700 bg-[#070b14] px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Public Contact Details */}
              <div className="pt-4 border-t border-slate-800">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
                  Public Contact Channels
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-300">
                      Public Phone Number
                    </label>
                    <input
                      type="text"
                      value={form.businessPhone}
                      onChange={(e) => setForm({ ...form, businessPhone: e.target.value })}
                      placeholder="e.g. 9840011223"
                      className="w-full rounded-xl border border-slate-700 bg-[#070b14] px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-300">
                      WhatsApp Contact Number
                    </label>
                    <input
                      type="text"
                      value={form.whatsappNumber}
                      onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })}
                      placeholder="e.g. 9840011223"
                      className="w-full rounded-xl border border-slate-700 bg-[#070b14] px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-300">
                      Public Contact Email
                    </label>
                    <input
                      type="email"
                      value={form.contactEmail}
                      onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                      placeholder="e.g. info@rkevents.com"
                      className="w-full rounded-xl border border-slate-700 bg-[#070b14] px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SOCIAL MEDIA LINKS */}
          {activeTab === "social" && (
            <div className="bg-[#0e172e]/80 rounded-3xl p-6 sm:p-8 border border-amber-500/20 shadow-xl backdrop-blur-md space-y-6 animate-fadeIn">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-serif font-bold text-white">
                    Social Media & Online Presence
                  </h2>
                  <p className="text-xs text-slate-400">
                    Connect your portfolio channels so customers can inspect live videos, reels, and past event galleries.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                    Instagram Profile URL or Handle
                  </label>
                  <input
                    type="text"
                    value={form.instagramUrl}
                    onChange={(e) => setForm({ ...form, instagramUrl: e.target.value })}
                    placeholder="https://instagram.com/rkevents or @rkevents"
                    className="w-full rounded-xl border border-slate-700 bg-[#070b14] px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                  <span className="text-[11px] text-slate-400 block">
                    Displays verified Instagram link on your customer profile.
                  </span>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                    YouTube Channel URL
                  </label>
                  <input
                    type="url"
                    value={form.youtubeUrl}
                    onChange={(e) => setForm({ ...form, youtubeUrl: e.target.value })}
                    placeholder="https://youtube.com/@rkeventchannel"
                    className="w-full rounded-xl border border-slate-700 bg-[#070b14] px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                  <span className="text-[11px] text-slate-400 block">
                    Showcase wedding DJ mixes, stage lighting videos, and sound checks.
                  </span>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                    Facebook Page URL
                  </label>
                  <input
                    type="url"
                    value={form.facebookUrl}
                    onChange={(e) => setForm({ ...form, facebookUrl: e.target.value })}
                    placeholder="https://facebook.com/rkeventra"
                    className="w-full rounded-xl border border-slate-700 bg-[#070b14] px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                    Official Business Website URL
                  </label>
                  <input
                    type="url"
                    value={form.websiteUrl}
                    onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })}
                    placeholder="https://www.rkevents.com"
                    className="w-full rounded-xl border border-slate-700 bg-[#070b14] px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: EVENT PHOTOS & GALLERY */}
          {activeTab === "gallery" && (
            <div className="bg-[#0e172e]/80 rounded-3xl p-6 sm:p-8 border border-amber-500/20 shadow-xl backdrop-blur-md space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#0A1128] text-amber-400 flex items-center justify-center font-bold">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-serif font-bold text-white">
                      Event Photo Showcase & Gallery
                    </h2>
                    <p className="text-xs text-slate-400">
                      Upload high-res event photography for wedding setups, DJ nights, catering, and flower decoration.
                    </p>
                  </div>
                </div>

                <div className="text-xs text-slate-400 font-semibold">
                  {portfolios.length} Photos Published
                </div>
              </div>

              {/* Upload New Photo Box */}
              <div className="p-5 rounded-2xl bg-[#070b14] border border-amber-500/30 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block">
                  Add New Event Photo
                </span>

                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                  <input
                    type="text"
                    value={newPhotoCaption}
                    onChange={(e) => setNewPhotoCaption(e.target.value)}
                    placeholder="Enter short caption (e.g. Grand Reception Stage, Chennai 2026)"
                    className="flex-1 p-2.5 rounded-xl border border-slate-700 text-sm focus:border-amber-400 focus:outline-none bg-white"
                  />

                  <input
                    type="file"
                    ref={galleryInputRef}
                    onChange={(e) => handleImageUpload(e, "gallery")}
                    accept="image/*"
                    className="hidden"
                  />

                  <button
                    type="button"
                    disabled={uploadingGallery}
                    onClick={() => galleryInputRef.current?.click()}
                    className="px-5 py-2.5 rounded-xl bg-[#0A1128] hover:bg-slate-800 text-amber-400 font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingGallery ? "Uploading Photo..." : "Select & Upload Photo"}</span>
                  </button>
                </div>
                <span className="text-[11px] text-slate-400 block">
                  Supported formats: JPG, PNG, WEBP (Max 5MB each). Photos appear immediately in your public showcase.
                </span>
              </div>

              {/* Responsive Photo Gallery Grid */}
              {portfolios.length === 0 ? (
                <div className="py-12 text-center text-slate-500 space-y-2">
                  <ImageIcon className="w-12 h-12 mx-auto stroke-1 text-slate-600" />
                  <p className="text-sm">No event photos uploaded yet. Add photos above to showcase your work!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pt-2">
                  {portfolios.map((item) => (
                    <div
                      key={item.id}
                      className="group rounded-2xl border border-slate-800 overflow-hidden bg-white shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div className="aspect-video relative overflow-hidden bg-stone-100">
                        <img
                          src={item.imageUrl}
                          alt={item.title || "Event photo"}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <button
                          type="button"
                          onClick={() => handleDeletePhoto(item.id)}
                          className="absolute top-2.5 right-2.5 p-2 rounded-xl bg-white/90 hover:bg-rose-50 text-rose-600 shadow-md transition-all"
                          title="Remove photo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="p-4 space-y-1">
                        <h4 className="text-sm font-bold text-white truncate">
                          {item.title || item.caption || "Event Showcase"}
                        </h4>
                        {item.caption && item.caption !== item.title && (
                          <p className="text-xs text-slate-400 line-clamp-2">{item.caption}</p>
                        )}
                        <span className="text-[10px] text-slate-500 block pt-1">
                          Added {new Date(item.createdAt).toLocaleDateString("en-IN")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: PAYMENT & UPI SETTINGS */}
          {activeTab === "payment" && (
            <div className="bg-[#0e172e]/80 rounded-3xl p-6 sm:p-8 border border-amber-500/20 shadow-xl backdrop-blur-md space-y-6 animate-fadeIn">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
                <div className="w-10 h-10 rounded-xl bg-[#0A1128] text-amber-400 flex items-center justify-center font-bold">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-serif font-bold text-white">
                    Vendor Payment & UPI Settings
                  </h2>
                  <p className="text-xs text-slate-400">
                    Set up your business UPI VPA, QR code, and optional manual transfer instructions.
                  </p>
                </div>
              </div>

              {/* Informational notice */}
              <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-xs text-amber-200 flex items-start gap-3">
                <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <strong className="block font-bold">Payment Method Notice</strong>
                  <p className="leading-relaxed">
                    A vendor-uploaded QR code is displayed to customers as a direct contact/payment option. It is never treated as automatic proof of payment. Formal platform bookings are verified through the secure payment gateway.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                    Business UPI ID
                  </label>
                  <input
                    type="text"
                    value={form.upiId}
                    onChange={(e) => setForm({ ...form, upiId: e.target.value })}
                    placeholder="e.g. rkevents@upi or 9840011223@paytm"
                    className="w-full rounded-xl border border-slate-700 bg-[#070b14] px-4 py-3 text-sm text-white font-mono font-bold focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                    Public Payment Mobile Number
                  </label>
                  <input
                    type="text"
                    value={form.paymentMobile}
                    onChange={(e) => setForm({ ...form, paymentMobile: e.target.value })}
                    placeholder="e.g. 9840011223"
                    className="w-full rounded-xl border border-slate-700 bg-[#070b14] px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                    Payment Display Name
                  </label>
                  <input
                    type="text"
                    value={form.paymentDisplayName}
                    onChange={(e) => setForm({ ...form, paymentDisplayName: e.target.value })}
                    placeholder="e.g. RK Sound & DJ Services"
                    className="w-full rounded-xl border border-slate-700 bg-[#070b14] px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                    Show Direct UPI Option to Customers
                  </label>
                  <div className="flex items-center gap-3 pt-2">
                    <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.showManualUpi}
                        onChange={(e) => setForm({ ...form, showManualUpi: e.target.checked })}
                        className="w-4 h-4 rounded text-amber-400 focus:ring-[#D4AF37]"
                      />
                      <span>Enable direct UPI QR on service detail and checkout pages</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                    Customer Payment Instructions
                  </label>
                  <textarea
                    rows={2}
                    value={form.paymentInstructions}
                    onChange={(e) => setForm({ ...form, paymentInstructions: e.target.value })}
                    placeholder="e.g. Mention your event date in the payment remark and send screenshot over WhatsApp..."
                    className="w-full rounded-xl border border-slate-700 bg-[#070b14] px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* QR Upload & Preview */}
              <div className="p-5 rounded-2xl bg-[#070b14] border border-slate-800 space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200 block">
                  Vendor Payment QR Code
                </span>

                <div className="flex flex-col sm:flex-row items-center gap-5">
                  <div className="w-36 h-36 rounded-2xl bg-white border border-slate-700 p-2 flex items-center justify-center shrink-0">
                    {form.paymentQrUrl ? (
                      <img src={form.paymentQrUrl} alt="Vendor Payment QR" className="w-full h-full object-contain rounded-lg" />
                    ) : (
                      <QrCode className="w-12 h-12 text-slate-600 stroke-1" />
                    )}
                  </div>

                  <div className="space-y-2 text-center sm:text-left">
                    <div className="text-xs font-bold text-slate-200">
                      {form.paymentQrUrl ? "Active Vendor Payment QR" : "No QR Code Uploaded"}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Upload your GPay, PhonePe, or Paytm QR code image (JPG, PNG max 5MB).
                    </p>

                    <div className="flex flex-wrap gap-2 pt-1 justify-center sm:justify-start">
                      <input
                        type="file"
                        ref={qrInputRef}
                        onChange={(e) => handleImageUpload(e, "qr")}
                        accept="image/*"
                        className="hidden"
                      />
                      <button
                        type="button"
                        disabled={uploadingQr}
                        onClick={() => qrInputRef.current?.click()}
                        className="px-4 py-2 rounded-xl bg-[#0A1128] hover:bg-slate-800 text-amber-400 font-bold text-xs transition-all flex items-center gap-1.5"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{uploadingQr ? "Uploading..." : form.paymentQrUrl ? "Replace QR" : "Upload QR"}</span>
                      </button>

                      {form.paymentQrUrl && (
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, paymentQrUrl: "" })}
                          className="px-3.5 py-2 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 font-bold text-xs hover:bg-rose-100 transition-all"
                        >
                          Remove QR
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SERVICES & PACKAGES */}
          {activeTab === "packages" && (
            <div className="bg-[#0e172e]/80 rounded-3xl p-6 sm:p-8 border border-amber-500/20 shadow-xl backdrop-blur-md space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#0A1128] text-amber-400 flex items-center justify-center font-bold">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-serif font-bold text-white">
                      Service Catalog & Packages
                    </h2>
                    <p className="text-xs text-slate-400">
                      Manage your listed services, package tiers, pricing, travel charges, and cancellation policy.
                    </p>
                  </div>
                </div>

                <Link
                  href="/vendor-dashboard/services/new"
                  className="px-4 py-2 rounded-xl bg-[#0A1128] hover:bg-slate-800 text-amber-400 font-bold text-xs transition-all flex items-center gap-1.5 w-fit"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Service</span>
                </Link>
              </div>

              {/* Cancellation policy */}
              <div className="space-y-2 p-5 rounded-2xl bg-[#070b14] border border-slate-800">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-200">
                  Standard Vendor Cancellation & Refund Policy
                </label>
                <textarea
                  rows={2}
                  value={form.cancellationPolicy}
                  onChange={(e) => setForm({ ...form, cancellationPolicy: e.target.value })}
                  placeholder="e.g. Free cancellation up to 15 days before event date. 50% refund within 7 days..."
                  className="w-full p-3 rounded-xl border border-slate-700 text-xs bg-white focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Services List */}
              {services.length === 0 ? (
                <div className="py-12 text-center text-slate-500 space-y-3">
                  <Layers className="w-12 h-12 mx-auto stroke-1 text-slate-600" />
                  <p className="text-sm">You haven&apos;t added any services yet.</p>
                  <Link
                    href="/vendor-dashboard/services/new"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
                  >
                    Create Your First Service
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      className="p-5 rounded-2xl border border-slate-800 bg-[#070b14] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div>
                        <div className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 mb-1">
                          {service.category}
                        </div>
                        <h4 className="text-base font-bold text-white">{service.name}</h4>
                        <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                          {service.description || "No description cataloged"}
                        </p>
                      </div>

                      <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800">
                        <div className="text-right">
                          <span className="text-[10px] text-slate-500 block">Starting Price</span>
                          <span className="text-base font-serif font-black text-white">
                            ₹{service.price.toLocaleString("en-IN")}
                          </span>
                        </div>

                        <Link
                          href={`/vendor-dashboard/services/edit/${service.id}`}
                          className="px-3 py-1.5 rounded-xl border border-slate-700 bg-[#070b14] hover:bg-stone-50 text-slate-300 text-xs font-bold"
                        >
                          Edit Service
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Bottom Save Bar */}
          <div className="pt-4 flex items-center justify-between border-t border-slate-800">
            <span className="text-xs text-slate-400">
              Changes update immediately on your public marketplace profile.
            </span>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 rounded-xl bg-[#0A1128] hover:bg-slate-800 text-amber-400 font-black text-sm shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "Saving Changes..." : "Save All Profile Changes"}</span>
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
