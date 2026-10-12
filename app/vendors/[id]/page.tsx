"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Navbar from "@/src/components/layout/Navbar";
import Footer from "@/src/components/layout/Footer";
import {
  Star,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  Sparkles,
  Calendar,
  CheckCircle2,
  ExternalLink,
  MessageCircle,
  Briefcase,
  Layers,
  ChevronRight,
  ArrowLeft,
  QrCode,
  Clock,
  Award,
  Video,
  Share2,
  Image as ImageIcon,
  X,
  Check,
  Globe,
} from "lucide-react";

type Package = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  features: string | null;
  isPopular?: boolean;
  basePrice?: number;
  serviceFee?: number;
  travelCharge?: number;
  estimatedTotal?: number;
};

type Service = {
  id: string;
  name: string;
  description: string | null;
  category: string;
  price: number;
  packages?: Package[];
};

type Portfolio = {
  id: string;
  title: string | null;
  imageUrl: string;
  caption?: string | null;
  createdAt: string;
};

type Charge = {
  id: string;
  name: string;
  type: string;
  amount: number;
  mode: string;
};

type Vendor = {
  id: string;
  businessName: string;
  description: string | null;
  location: string | null;
  rating: number;
  profileImage?: string | null;
  ownerName?: string | null;
  contactEmail?: string | null;
  businessPhone?: string | null;
  whatsappNumber?: string | null;
  fullAddress?: string | null;
  yearsOfExperience?: number;
  serviceArea?: string | null;
  openingHours?: string | null;
  websiteUrl?: string | null;
  instagramUrl?: string | null;
  youtubeUrl?: string | null;
  facebookUrl?: string | null;
  cancellationPolicy?: string | null;
  upiId?: string | null;
  paymentQrUrl?: string | null;
  paymentMobile?: string | null;
  paymentDisplayName?: string | null;
  paymentInstructions?: string | null;
  showManualUpi?: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  };
  services: Service[];
  portfolios?: Portfolio[];
  charges?: Charge[];
};

export default function VendorDetailPage() {
  const params = useParams();
  const vendorId = params.id as string;

  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [previewPhoto, setPreviewPhoto] = useState<Portfolio | null>(null);

  useEffect(() => {
    async function loadVendor() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`/api/vendors/${vendorId}`, {
          cache: "no-store",
        });
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data?.message || "Failed to load vendor details");
        }

        setVendor(data.vendor);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load vendor profile"
        );
      } finally {
        setLoading(false);
      }
    }

    if (vendorId) {
      loadVendor();
    }
  }, [vendorId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="bg-white border border-slate-800 rounded-3xl p-10 max-w-md w-full text-center shadow-lg">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#0A1128] text-amber-400 flex items-center justify-center animate-pulse">
              <Sparkles className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-white mb-2">
              Loading Verified Profile...
            </h2>
            <p className="text-slate-400 text-sm">
              Retrieving event services, live packages, and photo gallery.
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !vendor) {
    return (
      <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="bg-white border border-rose-200 rounded-3xl p-10 max-w-lg w-full text-center shadow-lg">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center text-3xl">
              ⚠️
            </div>
            <h2 className="text-2xl font-serif font-bold text-white mb-2">
              Vendor Profile Unavailable
            </h2>
            <p className="text-rose-600 text-sm mb-6">
              {error || "The requested vendor could not be found."}
            </p>
            <Link
              href="/vendors"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0A1128] text-amber-400 font-bold text-sm shadow-md transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Browse All Vendors
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const lowestPrice =
    vendor.services.length > 0
      ? Math.min(...vendor.services.map((service) => Number(service.price)))
      : 0;

  const categories = [
    "All",
    ...Array.from(new Set(vendor.services.map((s) => s.category))),
  ];

  const filteredServices =
    activeCategory === "All"
      ? vendor.services
      : vendor.services.filter((s) => s.category === activeCategory);

  const phoneToUse = vendor.businessPhone || vendor.user.phone;
  const whatsappToUse = vendor.whatsappNumber || phoneToUse;

  // Social link normalizer
  function formatSocialUrl(url: string, platform: "instagram" | "youtube" | "facebook"): string {
    const clean = url.trim();
    if (clean.startsWith("http://") || clean.startsWith("https://")) return clean;
    if (platform === "instagram") {
      const handle = clean.replace(/^@/, "");
      return `https://instagram.com/${handle}`;
    }
    return `https://${clean}`;
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      {/* LUXURY BREADCRUMB */}
      <div className="border-b border-slate-800 bg-[#070b14]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center gap-2 text-xs sm:text-sm text-slate-400">
          <Link href="/" className="hover:text-amber-400 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
          <Link href="/vendors" className="hover:text-amber-400 transition-colors">
            Vendors
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-white font-bold truncate max-w-[200px] sm:max-w-none">
            {vendor.businessName}
          </span>
        </div>
      </div>

      {/* LUXURY EDITORIAL HERO SECTION */}
      <section className="bg-gradient-to-b from-[#0b1329] via-[#070b14] to-[#070b14] text-white border-b border-[#D4AF37]/25 pt-12 pb-16 relative overflow-hidden">
        {/* Subtle champagne radial accents */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-96 h-96 bg-purple-900/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start lg:items-center justify-between">
            {/* Vendor Main Information */}
            <div className="flex-1 space-y-5">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Verified RK Eventra Partner
                </span>

                {vendor.yearsOfExperience && vendor.yearsOfExperience > 0 && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-amber-500/15 text-amber-300 border border-[#D4AF37]/30">
                    <Award className="w-3.5 h-3.5" />
                    {vendor.yearsOfExperience}+ Years Experience
                  </span>
                )}

                {vendor.location && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-[#0e172e]/80 text-slate-200 border border-white/15">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    {vendor.location}
                  </span>
                )}
              </div>

              <div>
                <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-tight leading-tight">
                  {vendor.businessName}
                </h1>
                {vendor.ownerName && (
                  <p className="text-sm text-slate-300 mt-1 font-medium">
                    Led by <span className="text-amber-300">{vendor.ownerName}</span>
                  </p>
                )}
              </div>

              <p className="text-slate-200 text-base sm:text-lg max-w-3xl leading-relaxed">
                {vendor.description ||
                  "Premier event service provider delivering bespoke celebrations, weddings, stage setups, and musical performances."}
              </p>

              {/* Action Buttons & Contact Options */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <a
                  href="#services"
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#E6C687] to-[#D4AF37] text-[#0A1128] font-black text-sm shadow-lg shadow-[#D4AF37]/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Explore Services & Book</span>
                </a>

                {phoneToUse && (
                  <a
                    href={`tel:${phoneToUse}`}
                    className="px-5 py-3 rounded-xl bg-slate-800/90 hover:bg-slate-800 border border-slate-700 text-white font-bold text-sm inline-flex items-center gap-2 transition-all"
                  >
                    <Phone className="w-4 h-4 text-emerald-400" />
                    <span>Call Vendor</span>
                  </a>
                )}

                {whatsappToUse && (
                  <a
                    href={`https://wa.me/${whatsappToUse.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-5 py-3 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/30 text-emerald-300 font-bold text-sm inline-flex items-center gap-2 transition-all"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-400" />
                    <span>WhatsApp</span>
                  </a>
                )}

                {vendor.websiteUrl && (
                  <a
                    href={formatSocialUrl(vendor.websiteUrl, "instagram")}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-3 rounded-xl bg-[#0e172e]/80 hover:bg-white/15 border border-white/20 text-slate-200 text-sm inline-flex items-center gap-1.5 transition-all"
                  >
                    <ExternalLink className="w-4 h-4 text-amber-400" />
                    <span>Website</span>
                  </a>
                )}
              </div>

              {/* VERIFIED SOCIAL MEDIA CHIPS */}
              {(vendor.instagramUrl || vendor.youtubeUrl || vendor.facebookUrl) && (
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider mr-1">
                    Connect:
                  </span>
                  {vendor.instagramUrl && (
                    <a
                      href={formatSocialUrl(vendor.instagramUrl, "instagram")}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1 rounded-lg bg-pink-950/40 border border-pink-500/30 text-pink-300 hover:text-pink-200 text-xs font-semibold inline-flex items-center gap-1.5 transition-all"
                    >
                      <Share2 className="w-3 h-3 text-pink-400" />
                      <span>Instagram</span>
                    </a>
                  )}
                  {vendor.youtubeUrl && (
                    <a
                      href={formatSocialUrl(vendor.youtubeUrl, "youtube")}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1 rounded-lg bg-red-950/40 border border-red-500/30 text-red-300 hover:text-red-200 text-xs font-semibold inline-flex items-center gap-1.5 transition-all"
                    >
                      <Video className="w-3 h-3 text-red-400" />
                      <span>YouTube Channel</span>
                    </a>
                  )}
                  {vendor.facebookUrl && (
                    <a
                      href={formatSocialUrl(vendor.facebookUrl, "facebook")}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1 rounded-lg bg-blue-950/40 border border-blue-500/30 text-blue-300 hover:text-blue-200 text-xs font-semibold inline-flex items-center gap-1.5 transition-all"
                    >
                      <Globe className="w-3 h-3 text-blue-400" />
                      <span>Facebook</span>
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Vendor Profile Card Sidebar / Stat summary */}
            <div className="w-full lg:w-80 shrink-0 bg-[#0E1A38]/90 border border-[#D4AF37]/30 rounded-3xl p-6 shadow-2xl backdrop-blur-xl space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-700/80">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-[#D4AF37]/30 flex items-center justify-center font-bold text-amber-300 text-base">
                    ⭐
                  </div>
                  <div>
                    <div className="text-xl font-serif font-black text-white">
                      {Number(vendor.rating).toFixed(1)}{" "}
                      <span className="text-xs text-slate-400 font-normal">/ 5.0</span>
                    </div>
                    <div className="text-xs text-slate-400">Verified Rating</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-slate-400">Starting from</div>
                  <div className="text-lg font-serif font-black text-amber-300">
                    {lowestPrice > 0 ? `₹${lowestPrice.toLocaleString("en-IN")}` : "On Request"}
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between text-slate-200">
                  <span className="flex items-center gap-2 text-slate-400">
                    <Briefcase className="w-4 h-4 text-amber-400" /> Total Services
                  </span>
                  <span className="font-bold text-white">{vendor.services.length} Listed</span>
                </div>

                {vendor.serviceArea && (
                  <div className="flex items-center justify-between text-slate-200">
                    <span className="flex items-center gap-2 text-slate-400">
                      <MapPin className="w-4 h-4 text-amber-400" /> Service Area
                    </span>
                    <span className="font-semibold text-white truncate max-w-[150px]">
                      {vendor.serviceArea}
                    </span>
                  </div>
                )}

                {vendor.openingHours && (
                  <div className="flex items-center justify-between text-slate-200">
                    <span className="flex items-center gap-2 text-slate-400">
                      <Clock className="w-4 h-4 text-amber-400" /> Working Hours
                    </span>
                    <span className="font-semibold text-white">{vendor.openingHours}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-slate-200">
                  <span className="flex items-center gap-2 text-slate-400">
                    <Mail className="w-4 h-4 text-amber-400" /> Contact Email
                  </span>
                  <span className="font-medium text-slate-200 text-xs truncate max-w-[160px]">
                    {vendor.contactEmail || vendor.user.email}
                  </span>
                </div>
              </div>

              {/* Direct UPI Payment badge if active */}
              {vendor.showManualUpi && (vendor.upiId || vendor.paymentQrUrl) && (
                <div className="pt-3 border-t border-slate-700/80">
                  <div className="bg-amber-500/10 border border-[#D4AF37]/25 rounded-2xl p-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-300 shrink-0">
                      <QrCode className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-amber-300">Direct UPI QR Enabled</div>
                      <div className="text-[11px] text-slate-300 truncate">
                        {vendor.upiId || "Direct payment supported"}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT AREA */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full space-y-16">
        {/* SERVICES SECTION */}
        <section id="services" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 tracking-wider uppercase mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                Available Services & Packages
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
                Book Verified Event Services
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                Select your service, choose package tiers, and reserve your event date.
              </p>
            </div>

            {/* Category Filter Pills */}
            {categories.length > 2 && (
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      activeCategory === cat
                        ? "bg-[#0A1128] text-amber-300 shadow-sm"
                        : "bg-white border border-slate-800 text-slate-300 hover:border-slate-700"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {filteredServices.length === 0 ? (
            <div className="bg-white border border-slate-800 rounded-3xl p-12 text-center shadow-sm">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-800 flex items-center justify-center text-3xl">
                🛠️
              </div>
              <h3 className="text-lg font-serif font-bold text-white mb-1">
                No Services in this Category
              </h3>
              <p className="text-slate-400 text-sm">
                Try selecting another category or contact the vendor directly for bespoke requirements.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map((service) => (
                <div
                  key={service.id}
                  className="group bg-white hover:bg-[#070b14] border border-slate-800 hover:border-[#D4AF37]/50 rounded-3xl p-6 transition-all duration-300 shadow-sm hover:shadow-md flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-[#D4AF37]/25">
                        {service.category}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">Instant Booking</span>
                    </div>

                    <div>
                      <h3 className="text-xl font-serif font-bold text-white group-hover:text-amber-400 transition-colors">
                        {service.name}
                      </h3>
                      <p className="text-slate-300 text-sm mt-2 line-clamp-3 leading-relaxed">
                        {service.description ||
                          "Tailored professional service with verified high-performance execution for your special day."}
                      </p>
                    </div>

                    {/* Service Packages if present */}
                    {service.packages && service.packages.length > 0 && (
                      <div className="pt-3 border-t border-slate-800 space-y-2">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                          Available Packages:
                        </div>
                        <div className="space-y-1.5">
                          {service.packages.slice(0, 3).map((pkg) => (
                            <div
                              key={pkg.id}
                              className="flex items-center justify-between text-xs py-1.5 px-3 rounded-xl bg-[#070b14] border border-slate-800"
                            >
                              <span className="text-slate-200 font-medium truncate">{pkg.name}</span>
                              <span className="text-white font-serif font-bold ml-2 shrink-0">
                                ₹{Number(pkg.price).toLocaleString("en-IN")}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-6 mt-6 border-t border-slate-800 flex items-center justify-between gap-4">
                    <div>
                      <div className="text-xs text-slate-500">Starting at</div>
                      <div className="text-2xl font-serif font-black text-white">
                        ₹{Number(service.price).toLocaleString("en-IN")}
                      </div>
                    </div>

                    <Link
                      href={`/checkout/${service.id}`}
                      className="px-5 py-2.5 rounded-xl bg-[#0A1128] hover:bg-slate-800 text-amber-400 font-bold text-sm shadow-sm transition-all inline-flex items-center gap-1.5"
                    >
                      Book Now →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* EVENT PHOTO GALLERY SHOWCASE */}
        {vendor.portfolios && vendor.portfolios.length > 0 && (
          <section className="space-y-6">
            <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 tracking-wider uppercase mb-1">
                  <ImageIcon className="w-3.5 h-3.5" />
                  Work Showcase & Real Events
                </div>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
                  Event Photo Gallery
                </h2>
              </div>
              <span className="text-xs text-slate-400 font-semibold">
                {vendor.portfolios.length} Photos
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {vendor.portfolios.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setPreviewPhoto(item)}
                  className="group rounded-3xl overflow-hidden bg-white border border-slate-800 hover:border-[#D4AF37]/50 transition-all shadow-sm cursor-pointer"
                >
                  <div className="aspect-video relative overflow-hidden bg-slate-800">
                    <img
                      src={item.imageUrl}
                      alt={item.title || "Event photo"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-4 space-y-1">
                    <h4 className="font-bold text-white text-sm truncate">
                      {item.title || item.caption || "Event Setup"}
                    </h4>
                    {item.caption && item.caption !== item.title && (
                      <p className="text-slate-400 text-xs line-clamp-2">{item.caption}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* DIRECT PAYMENT & UPI SECTION */}
        {vendor.showManualUpi && (vendor.upiId || vendor.paymentQrUrl) && (
          <section className="bg-gradient-to-r from-stone-900 to-[#0A1128] text-white border border-[#D4AF37]/30 rounded-3xl p-6 sm:p-8 shadow-xl">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-[#D4AF37]/30">
                  <QrCode className="w-3.5 h-3.5" /> Direct Payment Support
                </div>
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-white">
                  Vendor UPI & Payment Information
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  {vendor.paymentInstructions ||
                    "This vendor accepts direct UPI payments. Online Razorpay bookings are automatically verified and confirmed on the platform."}
                </p>

                <div className="pt-2 flex flex-wrap gap-4 text-xs">
                  {vendor.upiId && (
                    <div className="bg-slate-950/80 px-3.5 py-2 rounded-xl border border-slate-700">
                      <span className="text-slate-400">UPI ID: </span>
                      <span className="font-mono font-bold text-amber-300">{vendor.upiId}</span>
                    </div>
                  )}
                  {vendor.paymentMobile && (
                    <div className="bg-slate-950/80 px-3.5 py-2 rounded-xl border border-slate-700">
                      <span className="text-slate-400">Payment Mobile: </span>
                      <span className="font-bold text-white">{vendor.paymentMobile}</span>
                    </div>
                  )}
                </div>
              </div>

              {vendor.paymentQrUrl && (
                <div className="shrink-0 bg-white p-3.5 rounded-2xl shadow-xl text-center mx-auto md:mx-0">
                  <img
                    src={vendor.paymentQrUrl}
                    alt="Vendor Payment QR"
                    className="w-36 h-36 object-contain rounded-lg"
                  />
                  <div className="text-[11px] font-bold text-white mt-2">Scan to Pay via UPI</div>
                </div>
              )}
            </div>
          </section>
        )}
      </main>

      {/* FULL PHOTO PREVIEW MODAL */}
      {previewPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setPreviewPhoto(null)}
        >
          <div
            className="bg-[#0e172e]/80 rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-video bg-black flex items-center justify-center">
              <img
                src={previewPhoto.imageUrl}
                alt={previewPhoto.title || "Preview"}
                className="w-full h-full object-contain"
              />
              <button
                type="button"
                onClick={() => setPreviewPhoto(null)}
                className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white hover:bg-black transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-1">
              <h3 className="text-lg font-serif font-bold text-white">
                {previewPhoto.title || previewPhoto.caption || "Event Setup"}
              </h3>
              {previewPhoto.caption && <p className="text-sm text-slate-300">{previewPhoto.caption}</p>}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
