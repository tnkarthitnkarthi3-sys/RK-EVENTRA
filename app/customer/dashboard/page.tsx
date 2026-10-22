"use client";

import React, { useEffect, useState, FormEvent } from "react";
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
  Edit3,
  Save,
  X,
  Lock,
  Layers,
  Activity,
  HeartHandshake,
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

  // Edit Profile States
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

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
        setEditName(data.user.name || "");
        setEditPhone(data.user.phone || "");
      } catch (error) {
        console.error("Failed to load user:", error);
        window.location.href = "/login?redirect=/customer/dashboard";
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  async function handleUpdateProfile(e: FormEvent) {
    e.preventDefault();
    setStatusMessage(null);
    setSaveLoading(true);

    try {
      const payload: {
        name: string;
        phone: string;
        currentPassword?: string;
        newPassword?: string;
      } = {
        name: editName.trim(),
        phone: editPhone.trim(),
      };

      if (newPassword.trim()) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword.trim();
      }

      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        setStatusMessage({
          type: "error",
          text: result.message || "Failed to update profile details.",
        });
        return;
      }

      setUser((prev) => (prev ? { ...prev, name: result.user.name, phone: result.user.phone } : prev));
      setStatusMessage({
        type: "success",
        text: "Your profile details have been successfully updated!",
      });
      setCurrentPassword("");
      setNewPassword("");
      setIsEditing(false);
    } catch (err) {
      console.error("Profile update error:", err);
      setStatusMessage({
        type: "error",
        text: "Network error occurred while updating profile.",
      });
    } finally {
      setSaveLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-10 max-w-md w-full text-center shadow-2xl backdrop-blur-xl">
            <div className="w-12 h-12 mx-auto mb-4 border-4 border-slate-700 border-t-amber-400 rounded-full animate-spin" />
            <p className="text-slate-300 font-medium text-sm">
              Loading your 3D luxury dashboard...
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-400 selection:text-slate-950">
      <Navbar />

      {/* 3D LUXURY HERO BANNER */}
      <section className="relative overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950 border-b border-slate-800/80 pt-10 pb-14">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-96 h-96 bg-amber-500/15 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black bg-gradient-to-r from-amber-500/15 to-purple-500/15 text-amber-300 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            3D CUSTOMER CONTROL CENTER
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Welcome back, <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent">{user.name}</span> 👋
          </h1>

          <p className="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
            Manage your personal profile, review event bookings, explore Tamil Nadu's elite verified vendors, and get instant recommendations via RK AI.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              href="/vendors"
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 font-black text-sm shadow-[0_10px_25px_-5px_rgba(245,158,11,0.3)] hover:scale-[1.03] active:scale-[0.98] transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <Search className="w-4 h-4 text-slate-950" />
              Find Verified Vendors
            </Link>

            <Link
              href="/my-bookings"
              className="px-6 py-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-amber-400/50 text-slate-100 font-bold text-sm shadow-lg hover:shadow-purple-500/10 hover:scale-[1.02] active:scale-[0.98] transition-all inline-flex items-center gap-2"
            >
              <Calendar className="w-4 h-4 text-purple-400" />
              Track My Bookings
            </Link>

            <button
              onClick={() => {
                setIsEditing(true);
                window.scrollTo({ top: 800, behavior: "smooth" });
              }}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-purple-900/60 to-indigo-900/60 hover:from-purple-800/70 hover:to-indigo-800/70 border border-purple-500/40 text-purple-200 font-bold text-sm shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <Edit3 className="w-4 h-4 text-purple-400" />
              Edit My Details
            </button>
          </div>
        </div>
      </section>

      {/* DASHBOARD CONTENT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full space-y-12">
        {statusMessage && (
          <div
            className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-sm font-bold animate-fadeIn ${
              statusMessage.type === "success"
                ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                : "bg-red-500/15 border-red-500/30 text-red-300"
            }`}
          >
            <span>{statusMessage.text}</span>
            <button
              onClick={() => setStatusMessage(null)}
              className="text-xs opacity-70 hover:opacity-100"
            >
              ✕
            </button>
          </div>
        )}

        {/* 3D ACTION TILES */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link
            href="/vendors"
            className="group relative bg-gradient-to-b from-slate-900/90 to-slate-950/90 hover:from-slate-900 hover:to-slate-900 border border-slate-800/80 hover:border-amber-400/50 rounded-3xl p-6 transition-all duration-300 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] hover:shadow-[0_20px_40px_-10px_rgba(245,158,11,0.2)] hover:-translate-y-1.5 space-y-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <Search className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white group-hover:text-amber-400 transition-colors">
                Explore Vendors
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm mt-1 leading-relaxed">
                Filter verified DJs, decorators, caterers, and photographers across Tamil Nadu.
              </p>
            </div>
            <div className="text-xs font-bold text-amber-400 inline-flex items-center gap-1">
              Browse Directory <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/my-bookings"
            className="group relative bg-gradient-to-b from-slate-900/90 to-slate-950/90 hover:from-slate-900 hover:to-slate-900 border border-slate-800/80 hover:border-purple-400/50 rounded-3xl p-6 transition-all duration-300 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] hover:shadow-[0_20px_40px_-10px_rgba(168,85,247,0.2)] hover:-translate-y-1.5 space-y-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white group-hover:text-purple-400 transition-colors">
                My Bookings
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm mt-1 leading-relaxed">
                Review payment receipts, check confirmation milestones, and event dates.
              </p>
            </div>
            <div className="text-xs font-bold text-purple-400 inline-flex items-center gap-1">
              View Active Bookings <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/feedback"
            className="group relative bg-gradient-to-b from-slate-900/90 to-slate-950/90 hover:from-slate-900 hover:to-slate-900 border border-slate-800/80 hover:border-amber-400/50 rounded-3xl p-6 transition-all duration-300 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] hover:shadow-[0_20px_40px_-10px_rgba(245,158,11,0.2)] hover:-translate-y-1.5 space-y-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white group-hover:text-amber-400 transition-colors">
                Customer Feedback
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm mt-1 leading-relaxed">
                Rate your booked vendors, share reviews, and help the community.
              </p>
            </div>
            <div className="text-xs font-bold text-amber-400 inline-flex items-center gap-1">
              Share Feedback <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/ai-assistant"
            className="group relative bg-gradient-to-b from-slate-900/90 to-slate-950/90 hover:from-slate-900 hover:to-slate-900 border border-slate-800/80 hover:border-cyan-400/50 rounded-3xl p-6 transition-all duration-300 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] hover:shadow-[0_20px_40px_-10px_rgba(6,182,212,0.2)] hover:-translate-y-1.5 space-y-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white group-hover:text-cyan-400 transition-colors">
                RK AI Concierge
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm mt-1 leading-relaxed">
                Speak or type in Tamil or English to compare packages, budget, and services.
              </p>
            </div>
            <div className="text-xs font-bold text-cyan-400 inline-flex items-center gap-1">
              Start Voice / Chat <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>

        {/* 3D CUSTOMER PROFILE DETAILS & EDITING SECTION */}
        <section className="relative rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900/90 via-slate-900/70 to-slate-950/90 p-6 sm:p-10 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.6)] backdrop-blur-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20 font-black">
                <User className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  My Profile Details
                  <span className="text-xs font-normal text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
                    Editable by You
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Update your personal name, contact phone, or secure password anytime
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                  isEditing
                    ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                    : "bg-amber-400 text-slate-950 hover:bg-amber-300 shadow-md shadow-amber-500/20 hover:scale-105"
                }`}
              >
                {isEditing ? (
                  <>
                    <X className="w-4 h-4" /> Cancel Editing
                  </>
                ) : (
                  <>
                    <Edit3 className="w-4 h-4" /> Edit My Profile
                  </>
                )}
              </button>

              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="w-3.5 h-3.5" /> Verified Customer
              </span>
            </div>
          </div>

          {!isEditing ? (
            /* VIEW MODE */
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8">
              <div className="bg-slate-950/50 border border-slate-800/80 rounded-2xl p-5 hover:border-amber-500/30 transition-all">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" /> Full Name
                </span>
                <p className="text-base font-bold text-white mt-1.5">{user.name}</p>
              </div>

              <div className="bg-slate-950/50 border border-slate-800/80 rounded-2xl p-5 hover:border-amber-500/30 transition-all">
                <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" /> Email Address
                </span>
                <p className="text-base font-bold text-slate-200 mt-1.5 truncate">
                  {user.email}
                </p>
                <span className="text-[10px] text-slate-500">(Primary login account)</span>
              </div>

              <div className="bg-slate-950/50 border border-slate-800/80 rounded-2xl p-5 hover:border-amber-500/30 transition-all">
                <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" /> Contact Phone
                </span>
                <p className="text-base font-bold text-slate-200 mt-1.5">
                  {user.phone || (
                    <span className="text-slate-500 italic">Not added yet — click edit to add</span>
                  )}
                </p>
              </div>
            </div>
          ) : (
            /* EDIT FORM MODE */
            <form onSubmit={handleUpdateProfile} className="pt-8 space-y-6 animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                    Your Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      required
                      placeholder="e.g. Karthikeyan"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950/80 pl-10 pr-4 py-3 text-sm text-white outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                    Contact Mobile Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="tel"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      placeholder="+91 98400 12345"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950/80 pl-10 pr-4 py-3 text-sm text-white outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Password Change Sub-section */}
              <div className="pt-4 border-t border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-4 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" /> Change Password (Optional)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">
                      Current Password (if setting a new one)
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Current password"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-4 py-2.5 text-sm text-white outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">
                      New Password (minimum 6 characters)
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="New strong password"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-4 py-2.5 text-sm text-white outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 font-bold text-xs hover:bg-slate-800 transition-all cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saveLoading}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  <Save className="w-4 h-4 text-slate-950" />
                  {saveLoading ? "Saving Details..." : "Save Profile Details"}
                </button>
              </div>
            </form>
          )}
        </section>

        {/* SERVICE CATEGORIES QUICK ACCESS */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-400" />
              Event Service Categories
            </h3>
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
                className="bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/30 rounded-2xl p-4 text-center transition-all group hover:-translate-y-1 shadow"
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
      </main>

      <Footer />
    </div>
  );
}
