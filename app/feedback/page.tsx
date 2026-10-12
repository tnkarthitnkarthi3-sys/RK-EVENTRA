"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/src/components/layout/Navbar";
import Footer from "@/src/components/layout/Footer";
import {
  Star,
  Sparkles,
  MessageSquare,
  ThumbsUp,
  CheckCircle2,
  Filter,
  Send,
  Building,
  Calendar,
  Award,
  Heart,
  User,
  ShieldCheck,
  ChevronDown,
} from "lucide-react";

type FeedbackItem = {
  id: string;
  customerName: string;
  customerEmail: string | null;
  rating: number;
  category: string;
  vendorName: string | null;
  comment: string;
  isFeatured: boolean;
  helpfulCount: number;
  createdAt: string;
};

type FeedbackStats = {
  totalCount: number;
  avgRating: number;
  breakdown: Record<number, number>;
};

export default function CustomerFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [stats, setStats] = useState<FeedbackStats>({
    totalCount: 0,
    avgRating: 5.0,
    breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedRatingFilter, setSelectedRatingFilter] = useState<number | null>(null);

  // Form state
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [category, setCategory] = useState("VENDOR_SERVICE");
  const [vendorName, setVendorName] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [helpfulLiked, setHelpfulLiked] = useState<Record<string, boolean>>({});

  // Auto-load current user if logged in
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.user) {
          if (!customerName) setCustomerName(d.user.name || "");
          if (!customerEmail) setCustomerEmail(d.user.email || "");
        }
      })
      .catch(() => {});
  }, []);

  const loadFeedbacks = async () => {
    try {
      setLoading(true);
      const url = new URL("/api/feedback", window.location.origin);
      if (selectedCategory !== "ALL") url.searchParams.set("category", selectedCategory);
      if (selectedRatingFilter) url.searchParams.set("rating", String(selectedRatingFilter));

      const res = await fetch(url.toString());
      const data = await res.json();
      if (data.success) {
        setFeedbacks(data.feedbacks || []);
        if (data.stats) setStats(data.stats);
      }
    } catch (e) {
      console.error("Error loading feedbacks:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeedbacks();
  }, [selectedCategory, selectedRatingFilter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || comment.trim().length < 5) {
      setToastMessage({ type: "error", text: "Please enter a detailed feedback comment (minimum 5 characters)." });
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          customerName: customerName.trim() || "Verified Guest",
          customerEmail: customerEmail.trim() || undefined,
          category,
          vendorName: vendorName.trim() || undefined,
          comment: comment.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setToastMessage({ type: "success", text: "Thank you! Your feedback has been published." });
        setComment("");
        setVendorName("");
        loadFeedbacks();
      } else {
        setToastMessage({ type: "error", text: data.message || "Failed to submit feedback." });
      }
    } catch {
      setToastMessage({ type: "error", text: "Network error submitting feedback." });
    } finally {
      setSubmitting(false);
      setTimeout(() => setToastMessage(null), 5000);
    }
  };

  const handleHelpful = async (feedbackId: string) => {
    if (helpfulLiked[feedbackId]) return;
    try {
      setHelpfulLiked((prev) => ({ ...prev, [feedbackId]: true }));
      setFeedbacks((prev) =>
        prev.map((f) => (f.id === feedbackId ? { ...f, helpfulCount: f.helpfulCount + 1 } : f))
      );
      await fetch("/api/feedback", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedbackId }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const categoryLabels: Record<string, string> = {
    ALL: "All Feedback",
    VENDOR_SERVICE: "Vendor Service",
    PLATFORM: "Platform Experience",
    BOOKING_EXPERIENCE: "Booking & Payments",
    RK_AI: "RK AI Assistant",
  };

  const ratingWord = (r: number) => {
    switch (r) {
      case 5: return "Exceptional Experience ★★★★★";
      case 4: return "Very Good & Satisfied ★★★★☆";
      case 3: return "Good & Met Expectations ★★★☆☆";
      case 2: return "Fair / Room for Improvement ★★☆☆☆";
      default: return "Needs Significant Improvement ★☆☆☆☆";
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-amber-500/30">
      <Navbar />

      {/* LUXURY HERO HEADER */}
      <section className="relative overflow-hidden pt-12 pb-16 bg-gradient-to-b from-[#0b1329] via-[#070b14] to-[#070b14] border-b border-amber-500/10">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 left-10 w-[450px] h-[450px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase bg-amber-500/10 text-amber-300 border border-amber-500/25 shadow-lg shadow-amber-500/5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>REAL CLIENT EXPERIENCES</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white">
            Customer <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 bg-clip-text text-transparent">Feedback & Reviews</span>
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-300 font-light leading-relaxed">
            Discover genuine testimonials from families, planners, and corporate hosts who celebrated with RK Eventra across Tamil Nadu. Your honest feedback inspires excellence.
          </p>

          {/* SUMMARY CARDS GRID */}
          <div className="pt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <div className="p-5 rounded-2xl bg-[#0e172e]/80 border border-amber-500/20 backdrop-blur-md shadow-xl text-center">
              <div className="text-3xl sm:text-4xl font-black text-amber-400">
                {stats.avgRating.toFixed(1)} <span className="text-lg text-slate-400 font-normal">/ 5.0</span>
              </div>
              <div className="flex justify-center gap-1 my-1.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <div className="text-xs text-slate-400 font-medium">Average Overall Satisfaction</div>
            </div>

            <div className="p-5 rounded-2xl bg-[#0e172e]/80 border border-amber-500/20 backdrop-blur-md shadow-xl text-center">
              <div className="text-3xl sm:text-4xl font-black text-white">
                {stats.totalCount}+
              </div>
              <div className="text-xs text-amber-400 font-bold my-2 tracking-wide uppercase">
                Verified Reviews
              </div>
              <div className="text-xs text-slate-400 font-medium">100% Genuine Celebrations</div>
            </div>

            <div className="p-5 rounded-2xl bg-[#0e172e]/80 border border-amber-500/20 backdrop-blur-md shadow-xl text-center">
              <div className="text-3xl sm:text-4xl font-black text-emerald-400">
                99.4%
              </div>
              <div className="text-xs text-emerald-300 font-bold my-2 tracking-wide uppercase">
                Recommendation Rate
              </div>
              <div className="text-xs text-slate-400 font-medium">Weddings, Sangeet & Galas</div>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        {/* TOAST BANNER */}
        {toastMessage && (
          <div
            className={`mb-8 p-4 rounded-2xl border flex items-center justify-between gap-3 text-sm font-semibold shadow-2xl transition-all ${
              toastMessage.type === "success"
                ? "bg-emerald-950/80 border-emerald-500/40 text-emerald-200"
                : "bg-red-950/80 border-red-500/40 text-red-200"
            }`}
          >
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{toastMessage.text}</span>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-xs opacity-70 hover:opacity-100 uppercase font-bold"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* LEFT COLUMN: SUBMISSION FORM (5 COLS) */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#0e172e] to-[#0a1122] border border-amber-500/20 shadow-2xl backdrop-blur-xl space-y-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400 tracking-wider uppercase">
                  <MessageSquare className="w-4 h-4" /> Share Your Thoughts
                </div>
                <h2 className="text-2xl font-black text-white">Give Your Feedback</h2>
                <p className="text-xs text-slate-300 leading-relaxed">
                  How was your experience booking vendors or using RK Eventra? We cherish your feedback!
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* INTERACTIVE STAR RATING PICKER */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Overall Experience Rating *
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setRating(s)}
                        onMouseEnter={() => setHoverRating(s)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 rounded-lg hover:scale-110 active:scale-95 transition-transform"
                      >
                        <Star
                          className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${
                            s <= (hoverRating || rating)
                              ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                              : "text-slate-600 fill-transparent"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <div className="text-xs text-amber-300/90 font-medium">
                    {ratingWord(hoverRating || rating)}
                  </div>
                </div>

                {/* FEEDBACK CATEGORY */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Feedback Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#070b14] border border-slate-700 text-sm text-white focus:outline-none focus:border-amber-400 transition-colors"
                  >
                    <option value="VENDOR_SERVICE">Vendor Service Quality</option>
                    <option value="PLATFORM">Overall Platform & Experience</option>
                    <option value="BOOKING_EXPERIENCE">Booking & Online Payments</option>
                    <option value="RK_AI">RK AI Event Assistant</option>
                  </select>
                </div>

                {/* VENDOR NAME (OPTIONAL) */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Vendor or Service Name <span className="text-slate-500 font-normal lowercase">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={vendorName}
                    onChange={(e) => setVendorName(e.target.value)}
                    placeholder="e.g. Grand Royal Decors, DJ Alex Beats"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#070b14] border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>

                {/* CUSTOMER NAME */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Karthikeyan R"
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-[#070b14] border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>

                {/* CUSTOMER EMAIL */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Your Email <span className="text-slate-500 font-normal lowercase">(optional)</span>
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="karthi@gmail.com"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#070b14] border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>

                {/* FEEDBACK COMMENT */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Your Experience & Feedback *
                  </label>
                  <textarea
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Describe what you liked, event atmosphere, punctuality, sound clarity, floral work, or suggestions for us..."
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-[#070b14] border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors resize-none"
                  />
                </div>

                {/* SUBMIT BUTTON */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm tracking-wide uppercase shadow-lg shadow-amber-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Feedback Now</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* RIGHT COLUMN: REVIEWS FEED & FILTERS (7 COLS) */}
          <div className="lg:col-span-7 space-y-6">
            {/* CATEGORY FILTER TABS */}
            <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-[#0e172e]/60 border border-slate-800">
              {Object.entries(categoryLabels).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedCategory === key
                      ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* FEEDBACK CARDS LIST */}
            {loading ? (
              <div className="p-16 text-center space-y-3">
                <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-400 rounded-full animate-spin mx-auto" />
                <p className="text-xs text-slate-400">Loading verified feedbacks...</p>
              </div>
            ) : feedbacks.length === 0 ? (
              <div className="p-12 rounded-3xl bg-[#0e172e]/40 border border-slate-800 text-center space-y-3">
                <MessageSquare className="w-10 h-10 text-slate-600 mx-auto" />
                <h3 className="text-lg font-bold text-white">No reviews found in this filter</h3>
                <p className="text-xs text-slate-400">Be the first to share your experience with RK Eventra!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {feedbacks.map((f) => (
                  <div
                    key={f.id}
                    className="p-6 rounded-3xl bg-[#0e172e]/80 border border-slate-800 hover:border-amber-500/30 transition-all duration-300 shadow-xl space-y-4 relative overflow-hidden group"
                  >
                    {/* Top ambient gold accent */}
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500/20 to-transparent group-hover:via-amber-400/50 transition-all" />

                    {/* Review Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-purple-500/20 border border-amber-500/30 flex items-center justify-center font-black text-amber-300 text-sm">
                          {f.customerName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-white">{f.customerName}</span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              <ShieldCheck className="w-3 h-3" /> Verified
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {new Date(f.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Stars */}
                      <div className="flex items-center gap-1 bg-[#070b14] px-2.5 py-1 rounded-lg border border-slate-800">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${
                              s <= f.rating
                                ? "fill-amber-400 text-amber-400"
                                : "text-slate-700 fill-transparent"
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Vendor or Category Badge */}
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      {f.vendorName && (
                        <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/20 font-medium flex items-center gap-1">
                          <Building className="w-3 h-3" /> {f.vendorName}
                        </span>
                      )}
                      <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20 font-medium">
                        {categoryLabels[f.category] || f.category}
                      </span>
                    </div>

                    {/* Comment Body */}
                    <p className="text-sm text-slate-200 leading-relaxed font-light">
                      &ldquo;{f.comment}&rdquo;
                    </p>

                    {/* Footer: Helpful upvote button */}
                    <div className="pt-2 border-t border-slate-800/70 flex items-center justify-between text-xs text-slate-400">
                      <span className="italic text-[11px]">Experienced with RK Eventra</span>
                      <button
                        type="button"
                        onClick={() => handleHelpful(f.id)}
                        disabled={helpfulLiked[f.id]}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
                          helpfulLiked[f.id]
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            : "hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800"
                        }`}
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>Helpful ({f.helpfulCount})</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
