"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Layers,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  MapPin,
  QrCode,
  DollarSign,
  User as UserIcon,
  Phone,
  Mail,
  Zap,
} from "lucide-react";
import ThemeToggle from "@/src/components/theme/ThemeToggle";

type User = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
};

type Vendor = {
  id: string;
  businessName: string;
  location: string | null;
};

type Service = {
  id: string;
  name: string;
  description: string | null;
  category: string;
  price: number;
};

type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
};

type BookingService = {
  id: string;
  name: string;
  category: string;
  price: number;
};

type Booking = {
  id: string;
  eventDate: string;
  eventType: string;
  location: string | null;
  totalAmount: number;
  status: string;
  createdAt: string;

  customer: Customer | null;

  service: BookingService | null;
};

export default function VendorDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [vendor, setVendor] = useState<Vendor | null>(null);

  const [services, setServices] = useState<Service[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState("");

  const [error, setError] = useState("");

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");

      // ------------------------------------
      // STEP 1: GET CURRENT LOGGED USER
      // ------------------------------------

      const meResponse = await fetch("/api/auth/me", {
        method: "GET",
        cache: "no-store",
        credentials: "include",
      });

      const meData = await meResponse.json();

      console.log("AUTH ME:", meData);

      if (!meResponse.ok || !meData.success || !meData.user) {
        setError(
          meData?.message ||
            "You are not logged in. Please login as a vendor."
        );

        return;
      }

      const currentUser = meData.user;

      if (currentUser.role !== "VENDOR") {
        setError(
          `This account is ${currentUser.role}. Only VENDOR accounts can access this dashboard.`
        );

        return;
      }

      setUser(currentUser);

      // ------------------------------------
      // STEP 2: GET VENDOR BOOKINGS + SERVICES
      // ------------------------------------

      const dashboardResponse = await fetch(
        `/api/bookings/vendor?userId=${encodeURIComponent(
          currentUser.id
        )}`,
        {
          method: "GET",
          cache: "no-store",
          credentials: "include",
        }
      );

      const dashboardData = await dashboardResponse.json();

      console.log("VENDOR DASHBOARD API:", dashboardData);

      if (!dashboardResponse.ok || !dashboardData.success) {
        setError(
          dashboardData?.message ||
            "Unable to load vendor information."
        );

        return;
      }

      // ------------------------------------
      // STEP 3: SET VENDOR
      // ------------------------------------

      setVendor(dashboardData.vendor || null);

      // ------------------------------------
      // STEP 4: SET BOOKINGS
      // ------------------------------------

      setBookings(
        Array.isArray(dashboardData.bookings)
          ? dashboardData.bookings
          : []
      );

      // ------------------------------------
      // STEP 5: SET SERVICES
      // ------------------------------------

      setServices(
        Array.isArray(dashboardData.services)
          ? dashboardData.services
          : []
      );
    } catch (error) {
      console.error("VENDOR DASHBOARD ERROR:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to connect to the server."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  // ------------------------------------
  // UPDATE BOOKING STATUS
  // ------------------------------------

  async function updateBookingStatus(
    bookingId: string,
    status: "CONFIRMED" | "CANCELLED"
  ) {
    try {
      setBookingLoading(bookingId);

      const response = await fetch("/api/bookings/status", {
        method: "PATCH",

        headers: {
          "Content-Type": "application/json",
        },

        credentials: "include",

        body: JSON.stringify({
          bookingId,
          status,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        alert(
          data?.message ||
            "Failed to update booking status."
        );

        return;
      }

      await loadDashboard();
    } catch (error) {
      console.error("UPDATE STATUS ERROR:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Network error occurred."
      );
    } finally {
      setBookingLoading("");
    }
  }

  const pendingBookings = bookings.filter(
    (b) => b.status === "PENDING"
  );

  const confirmedBookings = bookings.filter(
    (b) => b.status === "CONFIRMED"
  );

  const cancelledBookings = bookings.filter(
    (b) => b.status === "CANCELLED"
  );

  return (
    <main className="min-h-screen bg-[#070914] text-slate-100 px-5 py-8 selection:bg-cyan-500 selection:text-black">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* =====================================
            HEADER - FUTURISTIC NEON GLOW
        ===================================== */}
        <header className="rounded-3xl bg-gradient-to-r from-[#0d1226] via-[#101736] to-[#0d1226] border border-violet-500/30 p-6 shadow-2xl">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 via-violet-600 to-pink-500 flex items-center justify-center font-black text-white text-xl shadow-[0_0_20px_rgba(6,182,212,0.4)]">
                RK
              </div>
              <div>
                <h1 className="text-2xl font-black text-white tracking-wider flex items-center gap-2">
                  <span>RK EVENTRA</span>
                  <span className="text-[10px] bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest shadow-[0_0_10px_rgba(6,182,212,0.25)]">
                    Vendor Partner
                  </span>
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Real-time vendor operations, booking reservations, and catalog pricing.
                </p>
              </div>
            </div>

            <nav className="flex flex-wrap gap-2.5">
              <Link
                href="/"
                className="rounded-xl bg-[#0b1020] border border-violet-500/25 px-4 py-2.5 text-xs font-bold text-slate-200 hover:text-white hover:border-cyan-500/40 transition-all"
              >
                Home
              </Link>

              <Link
                href="/vendor/profile"
                className="rounded-xl bg-[#0b1020] border border-amber-500/30 px-4 py-2.5 text-xs font-bold text-amber-300 hover:bg-amber-500/10 transition-all shadow-[0_0_10px_rgba(245,158,11,0.15)]"
              >
                Edit Business Profile
              </Link>

              <Link
                href="/vendor/payment-settings"
                className="rounded-xl bg-[#0b1020] border border-cyan-500/40 px-4 py-2.5 text-xs font-bold text-cyan-300 hover:bg-cyan-500/10 transition-all shadow-[0_0_12px_rgba(6,182,212,0.2)] flex items-center gap-1.5"
              >
                <QrCode className="w-3.5 h-3.5 text-cyan-400" />
                <span>UPI & Payment QR</span>
              </Link>

              <Link
                href="/vendor/pricing"
                className="rounded-xl bg-[#0b1020] border border-violet-500/25 px-4 py-2.5 text-xs font-bold text-violet-300 hover:bg-violet-500/10 transition-all"
              >
                Packages & Pricing
              </Link>

              <button
                type="button"
                onClick={loadDashboard}
                className="rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 px-4 py-2.5 text-xs font-bold text-white shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:brightness-110 flex items-center gap-1.5 transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh</span>
              </button>

              <ThemeToggle variant="pill" />
            </nav>
          </div>
        </header>

        {/* =====================================
            LOADING
        ===================================== */}
        {loading && (
          <section className="rounded-3xl bg-[#0b1022] border border-violet-500/25 p-12 text-center shadow-2xl">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-violet-500/20 border-t-cyan-400" />
            <p className="mt-5 font-bold text-slate-300 text-sm">
              Connecting to verified vendor database...
            </p>
          </section>
        )}

        {/* =====================================
            ERROR
        ===================================== */}
        {!loading && error && (
          <section className="rounded-3xl border border-rose-500/30 bg-rose-950/30 p-8 shadow-xl">
            <div className="text-3xl">⚠️</div>
            <h2 className="mt-3 text-xl font-black text-rose-300">
              Vendor Dashboard Notice
            </h2>
            <p className="mt-2 text-sm text-rose-200">{error}</p>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={loadDashboard}
                className="rounded-xl bg-cyan-600 px-6 py-2.5 text-xs font-bold text-white shadow hover:bg-cyan-500 transition-colors"
              >
                Try Again
              </button>
              <Link
                href="/login"
                className="rounded-xl bg-[#0b1020] border border-slate-700 px-6 py-2.5 text-xs font-bold text-slate-200 hover:text-white transition-colors"
              >
                Login Again
              </Link>
            </div>
          </section>
        )}

        {/* =====================================
            MAIN DASHBOARD
        ===================================== */}
        {!loading && !error && user && (
          <>
            {/* WELCOME BANNER */}
            <section className="rounded-3xl bg-gradient-to-r from-[#0d1226] via-[#101736] to-[#0d1226] border border-violet-500/30 p-8 shadow-2xl">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Vendor Partner Portal</span>
                  </p>
                  <h2 className="mt-2 text-3xl font-black text-white">
                    Welcome, {user.name}! 👋
                  </h2>
                  <p className="mt-1 text-xs text-slate-400">
                    Manage your event catalog, live customer reservations, and instant payouts.
                  </p>
                </div>

                {vendor && (
                  <div className="flex flex-wrap gap-2.5">
                    <span className="rounded-xl bg-gradient-to-r from-violet-600/30 to-cyan-600/30 border border-cyan-500/40 px-4 py-2 text-xs font-bold text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.2)]">
                      {vendor.businessName}
                    </span>
                    {vendor.location && (
                      <span className="rounded-xl bg-[#0b1020] border border-slate-800 px-4 py-2 text-xs font-bold text-slate-300 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{vendor.location}</span>
                      </span>
                    )}
                  </div>
                )}
              </div>
            </section>

            {/* STATS TILES */}
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <StatCard
                title="Services in Catalog"
                value={services.length}
                color="cyan"
              />
              <StatCard
                title="Total Bookings"
                value={bookings.length}
                color="violet"
              />
              <StatCard
                title="Awaiting Response"
                value={pendingBookings.length}
                color="amber"
              />
              <StatCard
                title="Confirmed Events"
                value={confirmedBookings.length}
                color="emerald"
              />
              <StatCard
                title="Cancelled / Declined"
                value={cancelledBookings.length}
                color="rose"
              />
            </section>

            {/* BOOKING REQUESTS */}
            <section className="rounded-3xl bg-[#0a0d1e] border border-violet-500/25 p-8 shadow-2xl space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-violet-500/20 pb-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Marketplace Bookings</span>
                  </p>
                  <h2 className="mt-1 text-2xl font-black text-white">
                    Event Booking Requests
                  </h2>
                  <p className="mt-1 text-xs text-slate-400">
                    Review incoming customer inquiries and confirm reservations.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold font-mono">
                  {bookings.length} Total
                </span>
              </div>

              {bookings.length === 0 ? (
                <div className="rounded-2xl bg-[#070914] border border-slate-800/80 p-10 text-center">
                  <div className="text-4xl">📋</div>
                  <h3 className="mt-3 text-lg font-black text-white">
                    No booking requests yet
                  </h3>
                  <p className="mt-1 text-xs text-slate-400">
                    New customer booking requests will appear here as orders come in.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <BookingCard
                      key={booking.id}
                      booking={booking}
                      loading={bookingLoading === booking.id}
                      onAccept={() =>
                        updateBookingStatus(booking.id, "CONFIRMED")
                      }
                      onReject={() =>
                        updateBookingStatus(booking.id, "CANCELLED")
                      }
                    />
                  ))}
                </div>
              )}
            </section>

            {/* MY SERVICES */}
            <section className="rounded-3xl bg-[#0a0d1e] border border-violet-500/25 p-8 shadow-2xl space-y-6">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center border-b border-violet-500/20 pb-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-pink-400 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-pink-400" />
                    <span>Vendor Catalog</span>
                  </p>
                  <h2 className="mt-1 text-2xl font-black text-white">
                    My Services & Packages
                  </h2>
                  <p className="mt-1 text-xs text-slate-400">
                    Live services visible to customer search and RK AI Assistant.
                  </p>
                </div>

                <Link
                  href="/vendor-dashboard/services/new"
                  className="rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 px-5 py-2.5 text-center text-xs font-bold text-white shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:brightness-110 transition-all"
                >
                  + Add Service
                </Link>
              </div>

              {services.length === 0 ? (
                <div className="rounded-2xl bg-[#070914] border border-slate-800/80 p-10 text-center">
                  <div className="text-4xl">🛠️</div>
                  <h3 className="mt-3 text-lg font-black text-white">
                    No services published yet
                  </h3>
                  <p className="mt-1 text-xs text-slate-400">
                    Add your first event service to start receiving verified bookings.
                  </p>
                  <Link
                    href="/vendor-dashboard/services/new"
                    className="mt-5 inline-block rounded-xl bg-cyan-600 px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-cyan-500 transition-colors"
                  >
                    Add Your First Service
                  </Link>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      className="rounded-2xl border border-violet-500/20 bg-[#0b1022] p-5 shadow-lg hover:border-cyan-500/40 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <span className="inline-flex rounded-md bg-cyan-500/15 border border-cyan-500/30 px-2.5 py-0.5 text-[11px] font-bold text-cyan-300">
                          {service.category}
                        </span>

                        <h3 className="mt-3 text-lg font-black text-white">
                          {service.name}
                        </h3>

                        <p className="mt-2 text-xs leading-relaxed text-slate-400 line-clamp-2">
                          {service.description || "No description provided."}
                        </p>
                      </div>

                      <div className="mt-4 border-t border-slate-800/80 pt-4 flex items-baseline justify-between">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Starting Price
                          </p>
                          <p className="text-xl font-black text-cyan-300 mt-0.5">
                            ₹{Number(service.price).toLocaleString("en-IN")}
                          </p>
                        </div>
                        <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          Active Catalog
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}

/* =========================================
   FUTURISTIC STAT CARD
========================================= */

function StatCard({
  title,
  value,
  color,
}: {
  title: string;
  value: number;
  color: "cyan" | "violet" | "amber" | "emerald" | "rose";
}) {
  const colorMap = {
    cyan: "border-cyan-500/30 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.12)]",
    violet: "border-violet-500/30 text-violet-300 shadow-[0_0_15px_rgba(139,92,246,0.12)]",
    amber: "border-amber-500/30 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.12)]",
    emerald: "border-emerald-500/30 text-emerald-300 shadow-[0_0_15px_rgba(16,182,129,0.12)]",
    rose: "border-rose-500/30 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.12)]",
  };

  return (
    <div
      className={`rounded-2xl bg-[#0b1022] border p-5 shadow-xl transition-all hover:scale-[1.02] ${colorMap[color]}`}
    >
      <p className="text-xs font-semibold text-slate-400">{title}</p>
      <p className="mt-2 text-3xl font-black text-white">{value}</p>
    </div>
  );
}

/* =========================================
   FUTURISTIC BOOKING CARD
========================================= */

function BookingCard({
  booking,
  loading,
  onAccept,
  onReject,
}: {
  booking: Booking;
  loading: boolean;
  onAccept: () => void;
  onReject: () => void;
}) {
  const eventDate = new Date(booking.eventDate);

  const statusClasses =
    booking.status === "PENDING"
      ? "bg-amber-500/15 text-amber-300 border-amber-500/30 shadow-[0_0_8px_rgba(245,158,11,0.2)]"
      : booking.status === "CONFIRMED"
      ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30 shadow-[0_0_8px_rgba(16,182,129,0.2)]"
      : booking.status === "CANCELLED"
      ? "bg-rose-500/15 text-rose-300 border-rose-500/30"
      : "bg-slate-800 text-slate-300 border-slate-700";

  return (
    <article className="overflow-hidden rounded-2xl border border-violet-500/25 bg-[#0b1022] shadow-xl">
      {/* Header */}
      <div className="border-b border-violet-500/15 bg-[#070914] p-5">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <span
              className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-wider ${statusClasses}`}
            >
              {booking.status}
            </span>

            <h3 className="mt-2 text-xl font-black text-white">
              {booking.customer?.name || "Customer Reservation"}
            </h3>

            <p className="text-xs text-slate-400 mt-0.5">
              {booking.service?.name || "Event Service"}
            </p>
          </div>

          <div className="text-2xl font-black text-cyan-300 font-mono">
            ₹{Number(booking.totalAmount).toLocaleString("en-IN")}
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="p-5 space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <InfoItem label="Event Type" value={booking.eventType} />
          <InfoItem
            label="Event Date"
            value={eventDate.toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          />
          <InfoItem label="Location" value={booking.location || "Tamil Nadu"} />
          <InfoItem label="Category" value={booking.service?.category || "-"} />
        </div>

        {/* Customer Contact */}
        {booking.customer && (
          <div className="rounded-xl bg-[#070914] border border-slate-800/80 p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-300 font-bold">
              <UserIcon className="w-3.5 h-3.5 text-cyan-400" />
              <span>{booking.customer.name}</span>
            </div>
            <div className="flex items-center gap-4 text-slate-400">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span>{booking.customer.email}</span>
              </span>
              {booking.customer.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  <span>{booking.customer.phone}</span>
                </span>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        {booking.status === "PENDING" && (
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="button"
              onClick={onAccept}
              disabled={loading}
              className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-xs font-bold text-white shadow-[0_0_12px_rgba(16,182,129,0.3)] hover:brightness-110 disabled:opacity-50 transition-all"
            >
              {loading ? "Updating..." : "✓ Accept & Confirm Booking"}
            </button>

            <button
              type="button"
              onClick={onReject}
              disabled={loading}
              className="rounded-xl bg-gradient-to-r from-rose-600 to-red-700 px-5 py-2.5 text-xs font-bold text-white shadow hover:brightness-110 disabled:opacity-50 transition-all"
            >
              {loading ? "Updating..." : "✕ Decline Booking"}
            </button>
          </div>
        )}

        {booking.status === "CONFIRMED" && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3 text-xs font-bold text-emerald-300 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>This booking has been confirmed. Payout scheduled upon event completion.</span>
          </div>
        )}

        {booking.status === "CANCELLED" && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-3 text-xs font-bold text-rose-300 flex items-center gap-2">
            <XCircle className="w-4 h-4 text-rose-400" />
            <span>This booking has been cancelled.</span>
          </div>
        )}
      </div>
    </article>
  );
}

/* =========================================
   INFO ITEM
========================================= */

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-[#070914] border border-slate-800/80 p-3">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="mt-1 font-bold text-white text-xs">{value}</p>
    </div>
  );
}