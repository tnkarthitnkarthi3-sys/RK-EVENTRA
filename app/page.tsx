"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/src/components/layout/Navbar";
import Footer from "@/src/components/layout/Footer";
import RKVendorCard, { VendorCardData } from "@/src/components/ai/RKVendorCard";
import RKComparisonModal from "@/src/components/ai/RKComparisonModal";
import {
  Sparkles,
  Search,
  MapPin,
  Bot,
  Star,
  CheckCircle,
  Shield,
  Zap,
  ArrowRight,
  Disc3,
  Volume2,
  Camera,
  Video,
  Utensils,
  Layers,
  Heart,
  Flower2,
  Power,
  Calendar,
  ChevronDown,
  CreditCard,
  UserCheck,
  ShieldCheck,
  Award,
} from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [nlQuery, setNlQuery] = useState("");
  const [featuredVendors, setFeaturedVendors] = useState<VendorCardData[]>([]);
  const [loadingVendors, setLoadingVendors] = useState(true);
  const [comparedVendors, setComparedVendors] = useState<VendorCardData[]>([]);
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  // Load real featured vendors from API
  useEffect(() => {
    fetch("/api/vendors")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.vendors)) {
          setFeaturedVendors(data.vendors.slice(0, 6));
        }
      })
      .catch((err) => console.error("Error loading vendors:", err))
      .finally(() => setLoadingVendors(false));
  }, []);

  const handleAiSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nlQuery.trim()) return;
    router.push(`/vendors?q=${encodeURIComponent(nlQuery.trim())}`);
  };

  const handleCompareToggle = (vendor: VendorCardData) => {
    if (comparedVendors.some((v) => v.id === vendor.id)) {
      setComparedVendors((prev) => prev.filter((v) => v.id !== vendor.id));
    } else {
      if (comparedVendors.length >= 3) {
        alert("You can compare up to 3 vendors simultaneously.");
        return;
      }
      setComparedVendors((prev) => [...prev, vendor]);
      setShowComparisonModal(true);
    }
  };

  const categories = [
    { name: "DJ & Entertainment", icon: Disc3, count: "Concert DJs & MCs", href: "/vendors?category=DJ and Entertainment" },
    { name: "Live Audio & Sound", icon: Volume2, count: "JBL Line Arrays & Subwoofers", href: "/vendors?category=Audio and Sound Systems" },
    { name: "Intelligent Lighting", icon: Zap, count: "Beam Moving Heads & Lasers", href: "/vendors?category=Lighting Systems" },
    { name: "Royal Wedding Decor", icon: Sparkles, count: "Traditional Mandap & Drapes", href: "/vendors?category=Wedding Decoration" },
    { name: "Stage & LED Walls", icon: Layers, count: "P3 LED Walls & Custom Arches", href: "/vendors?category=Stage Decoration" },
    { name: "Candid Photography", icon: Camera, count: "Cinematic & Drone Coverage", href: "/vendors?category=Photography" },
    { name: "Cinematography 4K", icon: Video, count: "Teaser Reels & Live Broadcast", href: "/vendors?category=Videography" },
    { name: "Royal Feast Catering", icon: Utensils, count: "Elai Saapadu & Buffets", href: "/vendors?category=Catering" },
    { name: "Fresh Flower Decor", icon: Flower2, count: "Jasmine & Orchid Floral Sets", href: "/vendors?category=Flower Decoration" },
    { name: "Generator Power", icon: Power, count: "Silent 15kVA - 125kVA Backup", href: "/vendors?category=Generator Services" },
  ];

  const occasions = [
    {
      title: "Royal Weddings & Receptions",
      tagline: "Unforgettable Moments",
      desc: "Traditional South Indian ceremonies and grand destination receptions with synchronized line array acoustics, moving beam lighting, and authentic feast catering.",
      image: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80",
    },
    {
      title: "Sangeet & High-Energy DJ Nights",
      tagline: "Pure Celebration",
      desc: "Top concert wedding DJs playing Tamil cinematic, Bollywood, and EDM hits with smoke haze, dual subwoofers, and LED dance floors.",
      image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80",
    },
    {
      title: "Milestone Birthdays & Anniversaries",
      tagline: "Joyful Memories",
      desc: "Custom themed stages, cold fire sparkular entries, balloon arches, live sound mixing, and gourmet dessert counters.",
      image: "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&q=80",
    },
    {
      title: "College Fests & Corporate Galas",
      tagline: "Stadium Grade",
      desc: "Concert trussing, powerful line arrays, multi-kVA silent generator backup, digital mixers, and seamless artist coordination.",
      image: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&q=80",
    },
  ];

  const quickPrompts = [
    "Enakku marriage-ku DJ venum.",
    "Chengalpattu-la 15000 kulla DJ",
    "Wedding decoration and catering package",
    "I need a DJ for my wedding",
    "Chennai wedding photography",
  ];

  const faqs = [
    {
      q: "How does the Multilingual RK AI Assistant work?",
      a: "You can talk to RK AI in Tanglish, Tamil, or English (e.g. 'Enakku Chengalpattu-la 15000 kulla DJ venum'). RK AI automatically identifies your event type, location, date, and budget, querying our real database of approved vendors with zero hallucination.",
    },
    {
      q: "How are prices managed and guaranteed on RK Eventra?",
      a: "Our Platform Administrators control pricing baselines, categories, and promotional rules through the Admin Price Management portal. When you book, a financial price snapshot is created so your price never changes after booking.",
    },
    {
      q: "What is the ₹800 Vendor Joining Fee?",
      a: "Every vendor undergoes verification and pays a one-time activation fee of ₹800 INR. This ensures only genuine, committed event service professionals with real equipment operate on RK Eventra.",
    },
    {
      q: "Can I pay directly via vendor UPI QR code?",
      a: "Yes! While online gateway checkouts use bank-grade Razorpay, vendors also display their verified UPI ID and payment QR standee for direct client transfers when permitted.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950">
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative pt-16 pb-28 overflow-hidden border-b border-amber-500/10">
        {/* LUXURY RADIAL ILLUMINATION */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-b from-amber-500/15 via-amber-500/5 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute -top-40 right-10 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-slate-900/90 border border-amber-500/30 px-4 py-1.5 rounded-full text-xs font-bold text-amber-300 mb-8 shadow-xl shadow-amber-500/5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Tamil Nadu's Premier AI Event Marketplace • Tamil • Tanglish • English</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight max-w-5xl mx-auto leading-[1.1]">
            Your Event. Your Choice.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500">
              Your Celebration.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Discover verified DJs, sound systems, intelligent lighting, stage decorators, royal catering chefs, and 4K photographers with admin-protected pricing.
          </p>

          {/* AI NATURAL LANGUAGE SEARCH BOX */}
          <div className="mt-10 max-w-3xl mx-auto">
            <form
              onSubmit={handleAiSearch}
              className="bg-slate-900/95 border-2 border-amber-500/50 focus-within:border-amber-400 rounded-3xl p-3 shadow-2xl flex flex-col sm:flex-row items-center gap-3 backdrop-blur-xl transition-all"
            >
              <div className="flex items-center gap-3 flex-1 w-full px-3">
                <Bot className="w-5 h-5 text-amber-400 shrink-0" />
                <input
                  type="text"
                  value={nlQuery}
                  onChange={(e) => setNlQuery(e.target.value)}
                  placeholder="Enakku Chengalpattu-la ₹15,000 kulla wedding DJ venum..."
                  className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-400 outline-none font-medium"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="submit"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider px-6 py-3.5 rounded-2xl transition-all shadow-lg shadow-amber-500/25 cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                  <span>Ask RK AI</span>
                </button>
              </div>
            </form>

            {/* QUICK TANGLISH / ENGLISH PROMPT PILLS */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
              <span className="text-slate-500 font-semibold">Quick Prompts:</span>
              {quickPrompts.map((pill, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setNlQuery(pill);
                    router.push(`/vendors?q=${encodeURIComponent(pill)}`);
                  }}
                  className="bg-slate-900/80 hover:bg-slate-800 text-amber-300/90 border border-amber-500/20 hover:border-amber-400 px-3 py-1 rounded-full transition-all text-[11px] font-medium"
                >
                  "{pill}"
                </button>
              ))}
            </div>
          </div>

          {/* 4 TRUST PILLARS */}
          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8 border-t border-slate-900 text-xs">
            <div className="flex items-center justify-center gap-2.5 text-slate-300 bg-slate-900/40 p-3 rounded-2xl border border-slate-800">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-semibold">₹800 Verified Partners</span>
            </div>
            <div className="flex items-center justify-center gap-2.5 text-slate-300 bg-slate-900/40 p-3 rounded-2xl border border-slate-800">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="font-semibold">Admin Pricing Snapshot</span>
            </div>
            <div className="flex items-center justify-center gap-2.5 text-slate-300 bg-slate-900/40 p-3 rounded-2xl border border-slate-800">
              <CreditCard className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-semibold">Razorpay & Direct UPI</span>
            </div>
            <div className="flex items-center justify-center gap-2.5 text-slate-300 bg-slate-900/40 p-3 rounded-2xl border border-slate-800">
              <Bot className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="font-semibold">Tamil & Tanglish AI</span>
            </div>
          </div>
        </div>
      </section>

      {/* POPULAR EVENT SERVICE CATEGORIES */}
      <section className="py-24 bg-[#030712] border-b border-amber-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-baseline justify-between mb-12 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs uppercase tracking-wider font-extrabold text-amber-400 mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Verified Service Catalog</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white">One Platform. Every Celebration.</h2>
              <p className="text-sm text-slate-400 mt-1">Browse 14 specialized categories of verified event professionals.</p>
            </div>
            <Link
              href="/services"
              className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 group bg-amber-500/10 border border-amber-500/30 px-4 py-2 rounded-xl transition-all"
            >
              <span>View All 14 Categories</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {categories.map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={idx}
                  href={cat.href}
                  className="bg-slate-900/60 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-900 rounded-3xl p-6 flex flex-col items-center text-center transition-all duration-200 group hover:-translate-y-1 shadow-xl shadow-black/40"
                >
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:bg-gradient-to-br group-hover:from-amber-400 group-hover:to-amber-500 group-hover:text-slate-950 transition-all mb-4 shadow-md">
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="font-bold text-white text-sm group-hover:text-amber-300 transition-colors">
                    {cat.name}
                  </h3>
                  <span className="text-[11px] text-slate-400 mt-1">{cat.count}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* FEATURED VENDORS SECTION */}
      <section className="py-24 bg-slate-950/60 border-b border-amber-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-baseline justify-between mb-12 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs uppercase tracking-wider font-extrabold text-emerald-400 mb-2">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Verified & Approved Partners</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white">Featured Event Specialists</h2>
              <p className="text-sm text-slate-400 mt-1">
                Approved vendors with verified equipment, live packages, and transparent pricing.
              </p>
            </div>
            <Link
              href="/vendors"
              className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 group bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl transition-all"
            >
              <span>Explore All Vendors</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {loadingVendors ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-80 rounded-3xl bg-slate-900/50 animate-pulse border border-slate-800" />
              ))}
            </div>
          ) : featuredVendors.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              No approved vendors found. Seed the database to view live vendors.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredVendors.map((vendor) => (
                <RKVendorCard
                  key={vendor.id}
                  vendor={vendor}
                  onCompare={handleCompareToggle}
                  isCompared={comparedVendors.some((v) => v.id === vendor.id)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* GRAND OCCASIONS & EVENT EXPERIENCES */}
      <section className="py-24 bg-[#030712] border-b border-amber-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs uppercase tracking-wider font-extrabold text-amber-400">Curated Experiences</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white mt-2">Tailored for Every Occasion</h2>
            <p className="text-sm text-slate-400 mt-2">
              From intimate family ceremonies to massive stadium festivals, RK Eventra provides turnkey solutions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {occasions.map((occ, i) => (
              <div
                key={i}
                className="relative rounded-3xl overflow-hidden border border-slate-800 group shadow-2xl h-80 flex flex-col justify-end p-8"
              >
                <img
                  src={occ.image}
                  alt={occ.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent" />
                <div className="relative z-10 space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded bg-amber-500 text-slate-950 inline-block">
                    {occ.tagline}
                  </span>
                  <h3 className="text-2xl font-black text-white">{occ.title}</h3>
                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">{occ.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FREQUENTLY ASKED QUESTIONS */}
      <section className="py-24 bg-slate-950 border-b border-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs uppercase tracking-wider font-extrabold text-amber-400">Clear Answers</span>
            <h2 className="text-3xl font-black text-white mt-1">Frequently Asked Questions</h2>
            <p className="text-xs text-slate-400 mt-1">Everything you need to know about RK Eventra marketplace.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => {
              const isOpen = faqOpen === i;
              return (
                <div
                  key={i}
                  className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setFaqOpen(isOpen ? null : i)}
                    className="w-full p-5 text-left flex items-center justify-between text-sm font-bold text-white hover:text-amber-300"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-amber-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* COMPARISON MODAL */}
      {showComparisonModal && (
        <RKComparisonModal
          vendors={comparedVendors}
          onClose={() => setShowComparisonModal(false)}
          onRemove={(id) => setComparedVendors((prev) => prev.filter((v) => v.id !== id))}
        />
      )}

      <Footer />
    </div>
  );
}
