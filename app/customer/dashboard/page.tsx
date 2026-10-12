"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/src/components/layout/Navbar";
import Footer from "@/src/components/layout/Footer";
import {
  Sparkles,
  Calendar,
  Search,
  User,
  ShieldCheck,
  Mail,
  Phone,
  ArrowRight,
  Bot,
  Star,
  CheckCircle2,
  Building,
} from "lucide-react";

type UserProfile = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: string;
};

export default function CustomerDashboard() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const response = await fetch("/api/auth/me", {
          cache: "no-store",
        });

        if (!response.ok) {
          window.location.href = "/login?redirect=/customer/dashboard";
          return;
        }

        const data = await response.json();

        if (!data.success || data.user?.role !== "CUSTOMER") {
          window.location.href = "/login?redirect=/customer/dashboard";
          return;
        }

        setUser(data.user);
      } catch (error) {
        console.error("Failed to load user:", error);
        window.location.href = "/login?redirect=/customer/dashboard";
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-10 max-w-md w-full text-center shadow-2xl backdrop-blur-xl">
            <div className="w-12 h-12 mx-auto mb-4 border-4 border-slate-700 border-t-amber-400 rounded-full animate-spin" />
            <p className="text-slate-300 font-medium text-sm">
              Loading your dashboard...
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      {/* HERO BANNER */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border-b border-slate-800/80 pt-10 pb-12">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
            <Sparkles className="w-3.5 h-3.5" /> CUSTOMER CONTROL CENTER
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Welcome back, <span className="text-amber-400">{user.name}</span> 👋
          </h1>

          <p className="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
            Discover verified DJs, sound and lighting systems, catering, and photographers. Coordinate bookings and track celebration milestones seamlessly.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              href="/vendors"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all inline-flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              Find Verified Vendors
            </Link>

            <Link
              href="/my-bookings"
              className="px-6 py-3 rounded-xl bg-slate-900/90 hover:bg-slate-900 border border-slate-700 hover:border-amber-500/40 text-slate-100 font-bold text-sm transition-all inline-flex items-center gap-2"
            >
              <Calendar className="w-4 h-4 text-purple-400" />
              Track My Bookings
            </Link>

            <Link
              href="/ai-assistant"
              className="px-5 py-3 rounded-xl bg-purple-950/40 hover:bg-purple-900/50 border border-purple-500/30 text-purple-300 font-bold text-sm transition-all inline-flex items-center gap-2"
            >
              <Bot className="w-4 h-4 text-purple-400" />
              Chat with RK AI
            </Link>
          </div>
        </div>
      </section>

      {/* DASHBOARD CONTENT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full space-y-12">
        {/* ACTION TILES */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link
            href="/vendors"
            className="group bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-3xl p-6 transition-all shadow-xl space-y-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Search className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors">
                Explore Vendors
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm mt-1 leading-relaxed">
                Filter by service type, city, and budget across Tamil Nadu.
              </p>
            </div>
            <div className="text-xs font-bold text-amber-400 inline-flex items-center gap-1">
              Browse Directory <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/my-bookings"
            className="group bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-purple-500/40 rounded-3xl p-6 transition-all shadow-xl space-y-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors">
                My Bookings
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm mt-1 leading-relaxed">
                Review payment receipts, check confirmation statuses, and details.
              </p>
            </div>
            <div className="text-xs font-bold text-purple-400 inline-flex items-center gap-1">
              View Active Bookings <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/feedback"
            className="group bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-3xl p-6 transition-all shadow-xl space-y-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors">
                Give Feedback
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm mt-1 leading-relaxed">
                Rate vendors, share your experience, and post reviews.
              </p>
            </div>
            <div className="text-xs font-bold text-amber-400 inline-flex items-center gap-1">
              Share Feedback <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/ai-assistant"
            className="group bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/40 rounded-3xl p-6 transition-all shadow-xl space-y-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">
                RK AI Concierge
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm mt-1 leading-relaxed">
                Speak or type in Tamil or English to compare packages & budget.
              </p>
            </div>
            <div className="text-xs font-bold text-cyan-400 inline-flex items-center gap-1">
              Start Voice / Chat <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>

        {/* SERVICE CATEGORIES QUICK ACCESS */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xl font-bold text-white">Event Categories</h3>
            <Link
              href="/vendors"
              className="text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors"
            >
              All Categories →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { icon: "🎧", name: "DJ & Sound", cat: "DJ and Entertainment" },
              { icon: "✨", name: "Decoration", cat: "Wedding Decoration" },
              { icon: "🍽️", name: "Catering", cat: "Catering" },
              { icon: "📸", name: "Photography", cat: "Photography" },
              { icon: "💡", name: "Lighting", cat: "Lighting Systems" },
              { icon: "🌸", name: "Flowers", cat: "Flower Decoration" },
            ].map((item) => (
              <Link
                key={item.name}
                href={`/vendors?category=${encodeURIComponent(item.cat)}`}
                className="bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/30 rounded-2xl p-4 text-center transition-all group"
              >
                <div className="text-2xl mb-1.5 group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <div className="text-xs font-bold text-slate-200 group-hover:text-amber-400 transition-colors">
                  {item.name}
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* CUSTOMER PROFILE CARD */}
        <section className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Profile Information</h3>
                <p className="text-xs text-slate-400">
                  Your registered account credentials and contact info
                </p>
              </div>
            </div>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 w-fit">
              <ShieldCheck className="w-3.5 h-3.5" /> Customer Account Active
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Full Name
              </span>
              <p className="text-sm font-bold text-white">{user.name}</p>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Email Address
              </span>
              <p className="text-sm font-bold text-slate-200 truncate">{user.email}</p>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Contact Phone
              </span>
              <p className="text-sm font-bold text-slate-200">
                {user.phone || "Not configured"}
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
