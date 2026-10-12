
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Booking = {
  id: string;
  eventDate: string;
  eventType: string;
  location?: string | null;
  totalAmount: number;
  serviceAmount?: number;
  deliveryFee?: number;
  platformFee?: number;
  subtotal?: number;
  taxAmount?: number;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  createdAt: string;
  customer?: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
  };
  service?: {
    id: string;
    name: string;
    category: string;
  };
};

type ApiResponse = {
  success: boolean;
  message?: string;
  bookings?: Booking[];
};

const statusConfig = {
  PENDING: {
    label: "Pending",
    icon: "⏳",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  CONFIRMED: {
    label: "Confirmed",
    icon: "✓",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  CANCELLED: {
    label: "Cancelled",
    icon: "✕",
    className: "bg-red-50 text-red-700 border-red-200",
  },
  COMPLETED: {
    label: "Completed",
    icon: "🎉",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function VendorBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<
    "ALL" | "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED"
  >("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function loadBookings() {
    try {
      setLoading(true);
      setError("");

      const meResponse = await fetch("/api/auth/me", {
        cache: "no-store",
      });

      const meData = await meResponse.json();

      if (!meResponse.ok || !meData.success) {
        throw new Error(meData.message || "Please login first.");
      }

      if (meData.user?.role !== "VENDOR") {
        throw new Error("Only vendors can access this page.");
      }

      const response = await fetch("/api/bookings/vendor", {
        cache: "no-store",
      });

      const data: ApiResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to load bookings.");
      }

      setBookings(data.bookings || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while loading bookings."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBookings();
  }, []);

  async function updateBookingStatus(
    bookingId: string,
    status: "CONFIRMED" | "CANCELLED" | "COMPLETED"
  ) {
    const message =
      status === "CONFIRMED"
        ? "Confirm this booking?"
        : status === "CANCELLED"
        ? "Cancel this booking?"
        : "Mark this booking as completed?";

    if (!window.confirm(message)) {
      return;
    }

    try {
      setUpdatingId(bookingId);

      const response = await fetch("/api/bookings/status", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingId,
          status,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to update booking."
        );
      }

      await loadBookings();
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "Failed to update booking."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  const filteredBookings = useMemo(() => {
    if (filter === "ALL") {
      return bookings;
    }

    return bookings.filter(
      (booking) => booking.status === filter
    );
  }, [bookings, filter]);

  const stats = useMemo(() => {
    return {
      total: bookings.length,
      pending: bookings.filter(
        (booking) => booking.status === "PENDING"
      ).length,
      confirmed: bookings.filter(
        (booking) => booking.status === "CONFIRMED"
      ).length,
      completed: bookings.filter(
        (booking) => booking.status === "COMPLETED"
      ).length,
      cancelled: bookings.filter(
        (booking) => booking.status === "CANCELLED"
      ).length,
      revenue: bookings
        .filter(
          (booking) =>
            booking.status === "CONFIRMED" ||
            booking.status === "COMPLETED"
        )
        .reduce(
          (sum, booking) => sum + Number(booking.totalAmount || 0),
          0
        ),
    };
  }, [bookings]);

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="text-2xl font-black tracking-tight text-slate-900"
          >
            RK <span className="text-indigo-600">EVENTRA</span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <Link
              href="/vendor/dashboard"
              className="text-sm font-semibold text-slate-600 hover:text-indigo-600"
            >
              Dashboard
            </Link>

            <Link
              href="/vendor/bookings"
              className="text-sm font-bold text-indigo-600"
            >
              Bookings
            </Link>

            <Link
              href="/vendor/services"
              className="text-sm font-semibold text-slate-600 hover:text-indigo-600"
            >
              Services
            </Link>

            <Link
              href="/vendor/portfolio"
              className="text-sm font-semibold text-slate-600 hover:text-indigo-600"
            >
              Portfolio
            </Link>

            <Link
              href="/vendor/availability"
              className="text-sm font-semibold text-slate-600 hover:text-indigo-600"
            >
              Availability
            </Link>
          </nav>

          <Link
            href="/vendor/dashboard"
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-800"
          >
            Dashboard
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Hero */}
        <section className="mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-6 text-white shadow-xl sm:p-8">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            <div>
              <p className="mb-2 text-sm font-bold uppercase tracking-[0.2em] text-indigo-200">
                Vendor Workspace
              </p>

              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                Booking Management
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-indigo-100 sm:text-base">
                Manage customer requests, confirm events, track completed
                bookings and keep your event business running smoothly.
              </p>
            </div>

            <button
              onClick={loadBookings}
              disabled={loading}
              className="rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-bold backdrop-blur transition hover:bg-white/20 disabled:opacity-50"
            >
              ↻ Refresh Bookings
            </button>
          </div>
        </section>

        {/* Stats */}
        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon="📋"
            label="Total Bookings"
            value={stats.total}
            description="All customer requests"
          />

          <StatCard
            icon="⏳"
            label="Pending"
            value={stats.pending}
            description="Needs your attention"
          />

          <StatCard
            icon="✓"
            label="Confirmed"
            value={stats.confirmed}
            description="Upcoming confirmed events"
          />

          <StatCard
            icon="₹"
            label="Confirmed Revenue"
            value={formatCurrency(stats.revenue)}
            description="Confirmed + completed"
          />
        </section>

        {/* Filters */}
        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="flex flex-wrap gap-2">
            {(
              [
                ["ALL", `All (${stats.total})`],
                ["PENDING", `Pending (${stats.pending})`],
                ["CONFIRMED", `Confirmed (${stats.confirmed})`],
                ["COMPLETED", `Completed (${stats.completed})`],
                ["CANCELLED", `Cancelled (${stats.cancelled})`],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                onClick={() => setFilter(value)}
                className={`rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                  filter === value
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </section>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
            <div className="flex items-start gap-3">
              <span className="text-xl">⚠️</span>

              <div>
                <p className="font-bold">
                  Unable to load bookings
                </p>

                <p className="mt-1 text-sm">
                  {error}
                </p>

                <button
                  onClick={loadBookings}
                  className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <section className="space-y-5">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-3xl border border-slate-200 bg-white p-6"
              >
                <div className="h-5 w-40 rounded bg-slate-200" />
                <div className="mt-4 h-8 w-72 rounded bg-slate-200" />
                <div className="mt-5 h-20 rounded bg-slate-100" />
              </div>
            ))}
          </section>
        )}

        {/* Empty */}
        {!loading &&
          !error &&
          filteredBookings.length === 0 && (
            <section className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-indigo-50 text-4xl">
                📅
              </div>

              <h2 className="mt-5 text-2xl font-black text-slate-900">
                No bookings found
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                {filter === "ALL"
                  ? "Customer bookings will appear here when someone requests one of your services."
                  : `There are no ${filter.toLowerCase()} bookings right now.`}
              </p>

              {filter !== "ALL" && (
                <button
                  onClick={() => setFilter("ALL")}
                  className="mt-5 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white hover:bg-indigo-700"
                >
                  View All Bookings
                </button>
              )}
            </section>
          )}

        {/* Booking List */}
        {!loading && filteredBookings.length > 0 && (
          <section className="space-y-5">
            {filteredBookings.map((booking) => {
              const status = statusConfig[booking.status];
              const isUpdating =
                updatingId === booking.id;

              return (
                <article
                  key={booking.id}
                  className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
                >
                  {/* Card Header */}
                  <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-2xl">
                        🎉
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-lg font-black text-slate-900">
                            {booking.service?.name ||
                              "Event Service"}
                          </h2>

                          <span
                            className={`rounded-full border px-3 py-1 text-xs font-black ${status.className}`}
                          >
                            {status.icon} {status.label}
                          </span>
                        </div>

                        <p className="mt-1 text-sm text-slate-500">
                          Booking #{booking.id}
                        </p>

                        {booking.service?.category && (
                          <p className="mt-1 text-xs font-semibold text-indigo-600">
                            {booking.service.category}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-left lg:text-right">
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                        Booking Value
                      </p>

                      <p className="mt-1 text-2xl font-black text-slate-900">
                        {formatCurrency(
                          Number(booking.totalAmount || 0)
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="grid gap-6 p-5 sm:p-6 md:grid-cols-2 lg:grid-cols-4">
                    <Detail
                      icon="👤"
                      label="Customer"
                      value={
                        booking.customer?.name ||
                        "Customer"
                      }
                      subValue={
                        booking.customer?.email ||
                        undefined
                      }
                    />

                    <Detail
                      icon="📅"
                      label="Event Date"
                      value={
                        booking.eventDate
                          ? formatDate(booking.eventDate)
                          : "Not specified"
                      }
                      subValue={
                        booking.eventType ||
                        undefined
                      }
                    />

                    <Detail
                      icon="📍"
                      label="Event Location"
                      value={
                        booking.location ||
                        "Location not provided"
                      }
                      subValue={
                        booking.customer?.phone ||
                        undefined
                      }
                    />

                    <Detail
                      icon="🕐"
                      label="Booking Created"
                      value={
                        booking.createdAt
                          ? formatDateTime(
                              booking.createdAt
                            )
                          : "—"
                      }
                      subValue="Customer request"
                    />
                  </div>

                  {/* Amount Breakdown */}
                  <div className="mx-5 mb-5 rounded-2xl bg-slate-50 p-4 sm:mx-6 sm:mb-6">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-sm font-black text-slate-900">
                        Payment Summary
                      </p>

                      <p className="text-xs font-semibold text-slate-400">
                        INR
                      </p>
                    </div>

                    <div className="grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-5">
                      <Amount
                        label="Service"
                        value={
                          booking.serviceAmount ??
                          booking.subtotal ??
                          booking.totalAmount
                        }
                      />

                      <Amount
                        label="Delivery"
                        value={
                          booking.deliveryFee ?? 0
                        }
                      />

                      <Amount
                        label="Platform Fee"
                        value={
                          booking.platformFee ?? 0
                        }
                      />

                      <Amount
                        label="Tax"
                        value={
                          booking.taxAmount ?? 0
                        }
                      />

                      <div className="rounded-xl bg-white p-3 shadow-sm">
                        <p className="text-xs font-semibold text-slate-400">
                          Total
                        </p>
                        <p className="mt-1 font-black text-indigo-600">
                          {formatCurrency(
                            Number(
                              booking.totalAmount || 0
                            )
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/70 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                    <p className="text-xs leading-5 text-slate-500">
                      {booking.status === "PENDING" &&
                        "Review the customer request and confirm the event if you can provide the service."}

                      {booking.status === "CONFIRMED" &&
                        "This booking is confirmed. Mark it completed after the event is successfully delivered."}

                      {booking.status === "COMPLETED" &&
                        "This event has been completed successfully."}

                      {booking.status === "CANCELLED" &&
                        "This booking has been cancelled."}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {booking.status === "PENDING" && (
                        <>
                          <button
                            onClick={() =>
                              updateBookingStatus(
                                booking.id,
                                "CANCELLED"
                              )
                            }
                            disabled={isUpdating}
                            className="rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                          >
                            ✕ Decline
                          </button>

                          <button
                            onClick={() =>
                              updateBookingStatus(
                                booking.id,
                                "CONFIRMED"
                              )
                            }
                            disabled={isUpdating}
                            className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                          >
                            {isUpdating
                              ? "Updating..."
                              : "✓ Confirm Booking"}
                          </button>
                        </>
                      )}

                      {booking.status === "CONFIRMED" && (
                        <>
                          <button
                            onClick={() =>
                              updateBookingStatus(
                                booking.id,
                                "CANCELLED"
                              )
                            }
                            disabled={isUpdating}
                            className="rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 disabled:opacity-50"
                          >
                            ✕ Cancel
                          </button>

                          <button
                            onClick={() =>
                              updateBookingStatus(
                                booking.id,
                                "COMPLETED"
                              )
                            }
                            disabled={isUpdating}
                            className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-50"
                          >
                            {isUpdating
                              ? "Updating..."
                              : "🎉 Mark Completed"}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-12 border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-8 text-center sm:px-6 lg:px-8">
          <p className="font-black text-slate-900">
            RK <span className="text-indigo-600">EVENTRA</span>
          </p>

          <p className="text-sm text-slate-500">
            Your event. Our network. Your unforgettable moments.
          </p>

          <p className="text-xs text-slate-400">
            © 2026 RK EVENTRA. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}

function StatCard({
  icon,
  label,
  value,
  description,
}: {
  icon: string;
  label: string;
  value: string | number;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-xl">
          {icon}
        </div>

        <span className="text-xs font-bold uppercase tracking-wide text-emerald-600">
          Live
        </span>
      </div>

      <p className="mt-5 text-sm font-semibold text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-2xl font-black text-slate-900">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-400">
        {description}
      </p>
    </div>
  );
}

function Detail({
  icon,
  label,
  value,
  subValue,
}: {
  icon: string;
  label: string;
  value: string;
  subValue?: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <p className="mt-1 truncate text-sm font-black text-slate-800">
          {value}
        </p>

        {subValue && (
          <p className="mt-0.5 truncate text-xs text-slate-500">
            {subValue}
          </p>
        )}
      </div>
    </div>
  );
}

function Amount({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl bg-white p-3">
      <p className="text-xs font-semibold text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-black text-slate-800">
        {formatCurrency(Number(value || 0))}
      </p>
    </div>
  );
}
