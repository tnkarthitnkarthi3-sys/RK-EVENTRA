"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/src/components/layout/Navbar";
import Footer from "@/src/components/layout/Footer";
import {
  Calendar,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building,
  CreditCard,
  User,
  Search,
} from "lucide-react";

type Booking = {
  id: string;
  eventDate: string;
  eventType: string;
  location: string | null;
  totalAmount: number;
  status: string;
  createdAt: string;

  vendor?: {
    id: string;
    businessName: string;
    location: string | null;
  } | null;

  service?: {
    id: string;
    name: string;
    category: string;
    price: number;
  } | null;
};

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadBookings() {
    try {
      setLoading(true);
      setError("");

      const meResponse = await fetch("/api/auth/me", {
        cache: "no-store",
      });

      const meData = await meResponse.json();

      if (!meResponse.ok || !meData.success) {
        throw new Error("Please login to view your event bookings");
      }

      if (meData.user.role !== "CUSTOMER") {
        throw new Error("Only customer accounts can access personal bookings");
      }

      const response = await fetch(
        `/api/bookings/customer?customerId=${meData.user.id}`,
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to load bookings");
      }

      setBookings(data.bookings || []);
    } catch (err) {
      console.error("LOAD BOOKINGS ERROR:", err);
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBookings();
  }, []);

  function getStatusBadge(status: string) {
    switch (status) {
      case "CONFIRMED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20">
            <XCircle className="w-3.5 h-3.5" /> Cancelled
          </span>
        );
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Sparkles className="w-3.5 h-3.5" /> Completed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
            <Clock className="w-3.5 h-3.5" /> Pending Vendor
          </span>
        );
    }
  }

  const confirmedCount = bookings.filter((b) => b.status === "CONFIRMED").length;
  const pendingCount = bookings.filter((b) => b.status === "PENDING").length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      {/* HEADER SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border-b border-slate-800/80 pt-10 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20 mb-3">
            <Calendar className="w-3.5 h-3.5" /> MY EVENT CELEBRATIONS
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Track Your Event Bookings
          </h1>
          <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-2xl">
            Real-time status updates, vendor coordination, venue details, and payment receipts.
          </p>

          {/* Quick Stats Grid */}
          {!loading && !error && bookings.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-8 max-w-2xl">
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
                <div className="text-xs text-slate-400 font-medium">Total Bookings</div>
                <div className="text-2xl font-black text-white mt-1">
                  {bookings.length}
                </div>
              </div>
              <div className="bg-slate-900/80 border border-amber-500/20 rounded-2xl p-4">
                <div className="text-xs text-amber-400 font-medium">Pending Confirmation</div>
                <div className="text-2xl font-black text-amber-400 mt-1">
                  {pendingCount}
                </div>
              </div>
              <div className="bg-slate-900/80 border border-emerald-500/20 rounded-2xl p-4 col-span-2 sm:col-span-1">
                <div className="text-xs text-emerald-400 font-medium">Confirmed Events</div>
                <div className="text-2xl font-black text-emerald-400 mt-1">
                  {confirmedCount}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CONTENT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-8">
        {loading && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-16 text-center">
            <div className="w-12 h-12 mx-auto mb-4 border-4 border-slate-700 border-t-amber-400 rounded-full animate-spin" />
            <p className="text-slate-300 font-medium text-sm">
              Retrieving your active event bookings...
            </p>
          </div>
        )}

        {!loading && error && (
          <div className="bg-slate-900/80 border border-red-500/30 rounded-3xl p-10 max-w-lg mx-auto text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-2xl">
              🔒
            </div>
            <h2 className="text-xl font-bold text-white">Authentication Required</h2>
            <p className="text-red-400 text-sm">{error}</p>
            <div className="pt-2 flex flex-wrap justify-center gap-3">
              <Link
                href="/login?redirect=/my-bookings"
                className="px-6 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-sm shadow-md shadow-amber-500/20 hover:bg-amber-400 transition-all"
              >
                Log In Now →
              </Link>
              <button
                type="button"
                onClick={loadBookings}
                className="px-5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-200 text-sm font-semibold hover:bg-slate-700 transition-all"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {!loading && !error && bookings.length === 0 && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-16 text-center max-w-xl mx-auto space-y-5">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-3xl">
              🎉
            </div>
            <h2 className="text-2xl font-black text-white">No Bookings Yet</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              You haven&apos;t booked an event service yet. Discover verified DJs, caterers, photographers, and decorators across Tamil Nadu.
            </p>
            <Link
              href="/vendors"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Search className="w-4 h-4" />
              Explore Verified Vendors
            </Link>
          </div>
        )}

        {!loading && !error && bookings.length > 0 && (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-3xl overflow-hidden shadow-xl transition-all"
              >
                {/* Booking Header Bar */}
                <div className="px-6 py-4 bg-slate-950/60 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        BOOKING #{booking.id.slice(-8).toUpperCase()}
                      </span>
                      <div className="text-xs text-slate-400">
                        Placed on{" "}
                        {new Date(booking.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                    </div>
                  </div>

                  {getStatusBadge(booking.status)}
                </div>

                {/* Booking Details Grid */}
                <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                  {/* Left: Service & Event Info (8 cols) */}
                  <div className="lg:col-span-8 space-y-5">
                    <div>
                      <div className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20 mb-1.5">
                        {booking.eventType}
                      </div>
                      <h3 className="text-2xl font-black text-white">
                        {booking.service?.name || "Event Service"}
                      </h3>
                      {booking.service?.category && (
                        <p className="text-xs text-slate-400 mt-0.5">
                          Category: {booking.service.category}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Vendor Details */}
                      <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4">
                        <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
                          Assigned Vendor
                        </div>
                        <div className="text-sm font-bold text-white flex items-center gap-1.5">
                          <Building className="w-4 h-4 text-amber-400 shrink-0" />
                          <span className="truncate">
                            {booking.vendor?.businessName || "Verified Vendor"}
                          </span>
                        </div>
                        {booking.vendor?.location && (
                          <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-500" />
                            <span>{booking.vendor.location}</span>
                          </div>
                        )}
                      </div>

                      {/* Event Date & Location */}
                      <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4">
                        <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
                          Celebration Date & Venue
                        </div>
                        <div className="text-sm font-bold text-white flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-purple-400 shrink-0" />
                          <span>
                            {new Date(booking.eventDate).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                          <span className="truncate">
                            {booking.location || "Venue specified in notes"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Price & Actions (4 cols) */}
                  <div className="lg:col-span-4 bg-slate-950/90 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="text-xs text-slate-400 font-medium">
                        Total Amount
                      </div>
                      <div className="text-3xl font-black text-amber-400 mt-1">
                        ₹{Number(booking.totalAmount).toLocaleString("en-IN")}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Verified Razorpay Escrow</span>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-800/80">
                      {booking.vendor?.id && (
                        <Link
                          href={`/vendors/${booking.vendor.id}`}
                          className="w-full py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-slate-200 text-xs font-bold text-center block transition-all"
                        >
                          View Vendor Profile
                        </Link>
                      )}
                      <Link
                        href="/feedback"
                        className="w-full py-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-bold text-center block transition-all"
                      >
                        ★ Give Feedback / Review
                      </Link>
                      <Link
                        href="/vendors"
                        className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold text-center block transition-all shadow-md shadow-amber-500/10"
                      >
                        Book More Services →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
