
"use client";

import { useEffect, useMemo, useState } from "react";

type Booking = {
  id: string;
  eventDate: string;
  eventType: string;
  location: string;
  amount: number;
  status: string;
  createdAt: string;

  customer?: {
    name: string;
    email: string;
  };

  vendor?: {
    businessName: string;
    email: string;
  };

  service?: {
    name: string;
    category: string;
  };
};

type FilterStatus =
  | "ALL"
  | "PENDING"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED";

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterStatus>("ALL");

  const [selectedBooking, setSelectedBooking] =
    useState<Booking | null>(null);

  const [updatingId, setUpdatingId] = useState<string | null>(
    null
  );

  const [copiedId, setCopiedId] = useState<string | null>(
    null
  );

  async function loadBookings(showRefresh = false) {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await fetch("/api/bookings", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Failed to load bookings"
        );
      }

      const bookingList = Array.isArray(data)
        ? data
        : Array.isArray(data?.bookings)
          ? data.bookings
          : [];

      setBookings(bookingList);
    } catch (err) {
      console.error("ADMIN BOOKINGS ERROR:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load bookings"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadBookings();
  }, []);

  const counts = useMemo(() => {
    return {
      total: bookings.length,

      pending: bookings.filter(
        (booking) =>
          booking.status?.toUpperCase() === "PENDING"
      ).length,

      confirmed: bookings.filter(
        (booking) =>
          booking.status?.toUpperCase() === "CONFIRMED"
      ).length,

      completed: bookings.filter(
        (booking) =>
          booking.status?.toUpperCase() === "COMPLETED"
      ).length,

      cancelled: bookings.filter(
        (booking) =>
          booking.status?.toUpperCase() === "CANCELLED"
      ).length,
    };
  }, [bookings]);

  const revenue = useMemo(() => {
    return bookings
      .filter(
        (booking) =>
          booking.status?.toUpperCase() !== "CANCELLED"
      )
      .reduce(
        (total, booking) =>
          total + Number(booking.amount || 0),
        0
      );
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    const query = search.trim().toLowerCase();

    return bookings.filter((booking) => {
      const matchesStatus =
        filter === "ALL" ||
        booking.status?.toUpperCase() === filter;

      const searchableText = [
        booking.id,
        booking.eventType,
        booking.location,
        booking.status,
        booking.customer?.name,
        booking.customer?.email,
        booking.vendor?.businessName,
        booking.vendor?.email,
        booking.service?.name,
        booking.service?.category,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !query || searchableText.includes(query);

      return matchesStatus && matchesSearch;
    });
  }, [bookings, filter, search]);

  async function updateBookingStatus(
    bookingId: string,
    status: "COMPLETED" | "CANCELLED"
  ) {
    const message =
      status === "COMPLETED"
        ? "Mark this booking as completed?"
        : "Cancel this booking?";

    if (!window.confirm(message)) {
      return;
    }

    try {
      setUpdatingId(bookingId);

      const response = await fetch(
        "/api/bookings/status",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            bookingId,
            status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data?.success) {
        throw new Error(
          data?.message ||
            "Failed to update booking status"
        );
      }

      setBookings((current) =>
        current.map((booking) =>
          booking.id === bookingId
            ? {
                ...booking,
                status,
              }
            : booking
        )
      );

      setSelectedBooking((current) =>
        current?.id === bookingId
          ? {
              ...current,
              status,
            }
          : current
      );
    } catch (err) {
      console.error(
        "BOOKING STATUS UPDATE ERROR:",
        err
      );

      alert(
        err instanceof Error
          ? err.message
          : "Failed to update booking status"
      );
    } finally {
      setUpdatingId(null);
    }
  }

  async function copyBookingId(id: string) {
    try {
      await navigator.clipboard.writeText(id);

      setCopiedId(id);

      setTimeout(() => {
        setCopiedId(null);
      }, 1800);
    } catch (error) {
      console.error("Copy error:", error);
      alert("Unable to copy booking ID");
    }
  }

  function getStatusClass(status: string) {
    switch (status?.toUpperCase()) {
      case "CONFIRMED":
        return "bg-green-100 text-green-700";

      case "COMPLETED":
        return "bg-blue-100 text-blue-700";

      case "CANCELLED":
        return "bg-red-100 text-red-700";

      default:
        return "bg-yellow-100 text-yellow-700";
    }
  }

  function getStatusIcon(status: string) {
    switch (status?.toUpperCase()) {
      case "CONFIRMED":
        return "✅";

      case "COMPLETED":
        return "🎉";

      case "CANCELLED":
        return "🚫";

      default:
        return "⏳";
    }
  }

  function formatDate(date?: string) {
    if (!date) {
      return "Not specified";
    }

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "Not specified";
    }

    return parsed.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function formatMoney(amount: number) {
    return (
      "₹" +
      Number(amount || 0).toLocaleString("en-IN")
    );
  }

  return (
    <main className="min-h-screen bg-slate-100">
      {/* HEADER */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
          <div>
            <p className="text-sm font-bold text-violet-600">
              Admin Panel
            </p>

            <h1 className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl">
              Booking Management
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              RK EVENTRA • Marketplace Operations
            </p>
          </div>

          <a
            href="/admin/dashboard"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            ← Dashboard
          </a>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        {/* HERO */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-700 via-purple-700 to-fuchsia-600 p-7 text-white shadow-xl sm:p-9">
          <div className="relative z-10 max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-widest text-violet-200">
              Marketplace Operations
            </p>

            <h2 className="mt-2 text-3xl font-black sm:text-4xl">
              Booking Management
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-violet-100 sm:text-base">
              Monitor customer bookings, vendors, services,
              event dates and booking revenue from one place.
            </p>
          </div>

          <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/10" />

          <div className="absolute -bottom-28 right-24 h-64 w-64 rounded-full bg-white/10" />
        </section>

        {/* STATS */}
        <section className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard
            title="Total Bookings"
            value={loading ? "..." : counts.total}
            icon="📋"
            gradient="from-violet-600 to-fuchsia-500"
          />

          <StatCard
            title="Pending"
            value={loading ? "..." : counts.pending}
            icon="⏳"
            gradient="from-yellow-500 to-orange-500"
          />

          <StatCard
            title="Confirmed"
            value={loading ? "..." : counts.confirmed}
            icon="✅"
            gradient="from-emerald-600 to-green-500"
          />

          <StatCard
            title="Completed"
            value={loading ? "..." : counts.completed}
            icon="🎉"
            gradient="from-blue-600 to-cyan-500"
          />

          <StatCard
            title="Revenue"
            value={loading ? "..." : formatMoney(revenue)}
            icon="💰"
            gradient="from-orange-500 to-pink-500"
          />
        </section>

        {/* DIRECTORY */}
        <section className="mt-9">
          <div className="mb-5">
            <p className="text-sm font-bold uppercase tracking-wider text-violet-600">
              Registered Bookings
            </p>

            <h3 className="mt-1 text-2xl font-black text-slate-900">
              Booking Directory
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Search and monitor all RK EVENTRA bookings.
            </p>
          </div>

          {/* SEARCH + REFRESH */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative flex-1">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg">
                  🔍
                </span>

                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search booking, customer, vendor, service..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-100"
                />
              </div>

              <button
                type="button"
                onClick={() => loadBookings(true)}
                disabled={refreshing}
                className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                {refreshing
                  ? "Refreshing..."
                  : "↻ Refresh"}
              </button>
            </div>

            {/* FILTERS */}
            <div className="mt-4 flex flex-wrap gap-2">
              <FilterButton
                active={filter === "ALL"}
                onClick={() => setFilter("ALL")}
                label={`All ${counts.total}`}
              />

              <FilterButton
                active={filter === "PENDING"}
                onClick={() => setFilter("PENDING")}
                label={`Pending ${counts.pending}`}
              />

              <FilterButton
                active={filter === "CONFIRMED"}
                onClick={() => setFilter("CONFIRMED")}
                label={`Confirmed ${counts.confirmed}`}
              />

              <FilterButton
                active={filter === "COMPLETED"}
                onClick={() => setFilter("COMPLETED")}
                label={`Completed ${counts.completed}`}
              />

              <FilterButton
                active={filter === "CANCELLED"}
                onClick={() => setFilter("CANCELLED")}
                label={`Cancelled ${counts.cancelled}`}
              />
            </div>
          </div>

          {/* RESULT COUNT */}
          {!loading && !error && (
            <p className="mt-4 text-sm text-slate-500">
              Showing{" "}
              <span className="font-bold text-slate-900">
                {filteredBookings.length}
              </span>{" "}
              of{" "}
              <span className="font-bold text-slate-900">
                {bookings.length}
              </span>{" "}
              bookings
            </p>
          )}

          {/* LOADING */}
          {loading && (
            <div className="mt-6 rounded-3xl bg-white p-12 text-center shadow-sm">
              <div className="text-5xl">📋</div>

              <h3 className="mt-4 text-xl font-black text-slate-900">
                Loading bookings...
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Please wait while we load marketplace bookings.
              </p>
            </div>
          )}

          {/* ERROR */}
          {!loading && error && (
            <div className="mt-6 rounded-3xl border border-red-200 bg-red-50 p-7">
              <div className="text-4xl">⚠️</div>

              <h3 className="mt-3 font-black text-red-700">
                Unable to load bookings
              </h3>

              <p className="mt-2 text-sm text-red-600">
                {error}
              </p>

              <button
                type="button"
                onClick={() => loadBookings(true)}
                className="mt-5 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          )}

          {/* EMPTY */}
          {!loading &&
            !error &&
            filteredBookings.length === 0 && (
              <div className="mt-6 rounded-3xl bg-white p-12 text-center shadow-sm">
                <div className="text-5xl">📋</div>

                <h3 className="mt-4 text-xl font-black text-slate-900">
                  No bookings found
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  There are no bookings under this filter.
                </p>

                {(search || filter !== "ALL") && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setFilter("ALL");
                    }}
                    className="mt-5 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-violet-700"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            )}

          {/* BOOKINGS */}
          {!loading &&
            !error &&
            filteredBookings.length > 0 && (
              <div className="mt-6 space-y-5">
                {filteredBookings.map((booking) => {
                  const status =
                    booking.status?.toUpperCase();

                  const isUpdating =
                    updatingId === booking.id;

                  return (
                    <article
                      key={booking.id}
                      className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                    >
                      {/* TOP */}
                      <div className="border-b border-slate-100 p-6">
                        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                          <div className="flex gap-4">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-100 to-fuchsia-100 text-2xl">
                              🎉
                            </div>

                            <div>
                              <div className="flex flex-wrap items-center gap-3">
                                <h3 className="text-xl font-black text-slate-900">
                                  {booking.eventType ||
                                    "Event"}
                                </h3>

                                <span
                                  className={
                                    "rounded-full px-3 py-1 text-xs font-black " +
                                    getStatusClass(
                                      booking.status
                                    )
                                  }
                                >
                                  {getStatusIcon(
                                    booking.status
                                  )}{" "}
                                  {booking.status}
                                </span>
                              </div>

                              <p className="mt-2 text-sm text-slate-500">
                                Booking ID:{" "}
                                <span className="font-mono text-xs">
                                  {booking.id}
                                </span>
                              </p>
                            </div>
                          </div>

                          <div className="text-left lg:text-right">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                              Booking Amount
                            </p>

                            <p className="mt-1 text-2xl font-black text-slate-900">
                              {formatMoney(
                                booking.amount
                              )}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* DETAILS */}
                      <div className="grid gap-5 p-6 md:grid-cols-2 lg:grid-cols-4">
                        <Info
                          icon="👤"
                          label="Customer"
                          value={
                            booking.customer?.name ||
                            "Not specified"
                          }
                          secondary={
                            booking.customer?.email
                          }
                        />

                        <Info
                          icon="🏪"
                          label="Vendor"
                          value={
                            booking.vendor?.businessName ||
                            "Not specified"
                          }
                          secondary={
                            booking.vendor?.email
                          }
                        />

                        <Info
                          icon="🛠️"
                          label="Service"
                          value={
                            booking.service?.name ||
                            "Not specified"
                          }
                          secondary={
                            booking.service?.category
                          }
                        />

                        <Info
                          icon="📅"
                          label="Event Date"
                          value={formatDate(
                            booking.eventDate
                          )}
                          secondary={
                            booking.location
                              ? "📍 " +
                                booking.location
                              : "Location not specified"
                          }
                        />
                      </div>

                      {/* ACTIONS */}
                      <div className="border-t border-slate-100 bg-slate-50 p-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedBooking(
                                booking
                              )
                            }
                            className="rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-100"
                          >
                            👁️ View Details
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              copyBookingId(
                                booking.id
                              )
                            }
                            className="rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-100"
                          >
                            📋{" "}
                            {copiedId === booking.id
                              ? "Copied!"
                              : "Copy ID"}
                          </button>

                          {status !== "COMPLETED" &&
                            status !== "CANCELLED" && (
                              <>
                                <button
                                  type="button"
                                  disabled={
                                    isUpdating
                                  }
                                  onClick={() =>
                                    updateBookingStatus(
                                      booking.id,
                                      "COMPLETED"
                                    )
                                  }
                                  className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  {isUpdating
                                    ? "Updating..."
                                    : "🎉 Mark Completed"}
                                </button>

                                <button
                                  type="button"
                                  disabled={
                                    isUpdating
                                  }
                                  onClick={() =>
                                    updateBookingStatus(
                                      booking.id,
                                      "CANCELLED"
                                    )
                                  }
                                  className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  {isUpdating
                                    ? "Updating..."
                                    : "🚫 Cancel"}
                                </button>
                              </>
                            )}

                          {status === "COMPLETED" && (
                            <span className="rounded-xl bg-blue-100 px-4 py-2.5 text-sm font-bold text-blue-700">
                              🎉 Booking Completed
                            </span>
                          )}

                          {status === "CANCELLED" && (
                            <span className="rounded-xl bg-red-100 px-4 py-2.5 text-sm font-bold text-red-700">
                              🚫 Booking Cancelled
                            </span>
                          )}
                        </div>

                        <p className="mt-3 text-xs text-slate-400">
                          Created on{" "}
                          {formatDate(
                            booking.createdAt
                          )}
                        </p>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
        </section>

        {/* FOOTER */}
        <footer className="mt-10 border-t border-slate-200 pt-6 text-center text-sm text-slate-500">
          <p className="font-bold text-slate-700">
            RK EVENTRA
          </p>

          <p className="mt-1">
            Admin Management System • © 2026 RK EVENTRA
          </p>
        </footer>
      </div>

      {/* VIEW DETAILS MODAL */}
      {selectedBooking && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          onClick={() => setSelectedBooking(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            {/* MODAL HEADER */}
            <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-violet-600">
                  Booking Details
                </p>

                <h3 className="mt-1 text-xl font-black text-slate-900">
                  {selectedBooking.eventType ||
                    "Event"}
                </h3>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedBooking(null)
                }
                className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-lg font-bold text-slate-600 hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            {/* MODAL BODY */}
            <div className="space-y-6 p-6">
              <div className="rounded-2xl bg-slate-50 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                      Status
                    </p>

                    <span
                      className={
                        "mt-2 inline-flex rounded-full px-3 py-1 text-xs font-black " +
                        getStatusClass(
                          selectedBooking.status
                        )
                      }
                    >
                      {getStatusIcon(
                        selectedBooking.status
                      )}{" "}
                      {selectedBooking.status}
                    </span>
                  </div>

                  <div className="text-right">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                      Amount
                    </p>

                    <p className="mt-1 text-2xl font-black text-slate-900">
                      {formatMoney(
                        selectedBooking.amount
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <DetailSection
                title="Booking Information"
                items={[
                  [
                    "Booking ID",
                    selectedBooking.id,
                  ],
                  [
                    "Event Type",
                    selectedBooking.eventType ||
                      "Not specified",
                  ],
                  [
                    "Event Date",
                    formatDate(
                      selectedBooking.eventDate
                    ),
                  ],
                  [
                    "Location",
                    selectedBooking.location ||
                      "Not specified",
                  ],
                  [
                    "Created",
                    formatDate(
                      selectedBooking.createdAt
                    ),
                  ],
                ]}
              />

              <DetailSection
                title="Customer"
                items={[
                  [
                    "Name",
                    selectedBooking.customer
                      ?.name || "Not specified",
                  ],
                  [
                    "Email",
                    selectedBooking.customer
                      ?.email || "Not specified",
                  ],
                ]}
              />

              <DetailSection
                title="Vendor"
                items={[
                  [
                    "Business",
                    selectedBooking.vendor
                      ?.businessName ||
                      "Not specified",
                  ],
                  [
                    "Email",
                    selectedBooking.vendor
                      ?.email || "Not specified",
                  ],
                ]}
              />

              <DetailSection
                title="Service"
                items={[
                  [
                    "Service",
                    selectedBooking.service
                      ?.name || "Not specified",
                  ],
                  [
                    "Category",
                    selectedBooking.service
                      ?.category ||
                      "Not specified",
                  ],
                ]}
              />

              {/* MODAL ACTIONS */}
              <div className="flex flex-wrap gap-3 border-t border-slate-200 pt-5">
                <button
                  type="button"
                  onClick={() =>
                    copyBookingId(
                      selectedBooking.id
                    )
                  }
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
                >
                  📋{" "}
                  {copiedId === selectedBooking.id
                    ? "Copied!"
                    : "Copy Booking ID"}
                </button>

                {selectedBooking.status !==
                  "COMPLETED" &&
                  selectedBooking.status !==
                    "CANCELLED" && (
                    <>
                      <button
                        type="button"
                        disabled={
                          updatingId ===
                          selectedBooking.id
                        }
                        onClick={() =>
                          updateBookingStatus(
                            selectedBooking.id,
                            "COMPLETED"
                          )
                        }
                        className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                      >
                        🎉 Mark Completed
                      </button>

                      <button
                        type="button"
                        disabled={
                          updatingId ===
                          selectedBooking.id
                        }
                        onClick={() =>
                          updateBookingStatus(
                            selectedBooking.id,
                            "CANCELLED"
                          )
                        }
                        className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50"
                      >
                        🚫 Cancel Booking
                      </button>
                    </>
                  )}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function StatCard({
  title,
  value,
  icon,
  gradient,
}: {
  title: string;
  value: number | string;
  icon: string;
  gradient: string;
}) {
  return (
    <div className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-2xl font-black text-slate-900">
            {value}
          </p>
        </div>

        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-xl text-white shadow-md transition group-hover:scale-110`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function FilterButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl px-4 py-2.5 text-sm font-bold transition ${
        active
          ? "bg-violet-600 text-white shadow-md"
          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
      }`}
    >
      {label}
    </button>
  );
}

function Info({
  icon,
  label,
  value,
  secondary,
}: {
  icon: string;
  label: string;
  value: string;
  secondary?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
      <div className="flex items-start gap-3">
        <div className="text-xl">{icon}</div>

        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
            {label}
          </p>

          <p className="mt-1 truncate font-bold text-slate-900">
            {value}
          </p>

          {secondary && (
            <p className="mt-1 truncate text-sm text-slate-500">
              {secondary}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailSection({
  title,
  items,
}: {
  title: string;
  items: [string, string][];
}) {
  return (
    <section>
      <h4 className="mb-3 text-sm font-black uppercase tracking-wide text-violet-600">
        {title}
      </h4>

      <div className="overflow-hidden rounded-2xl border border-slate-200">
        {items.map(([label, value], index) => (
          <div
            key={label}
            className={`grid grid-cols-3 gap-4 px-4 py-3 ${
              index !== items.length - 1
                ? "border-b border-slate-100"
                : ""
            }`}
          >
            <p className="text-sm font-semibold text-slate-500">
              {label}
            </p>

            <p className="col-span-2 break-all text-sm font-bold text-slate-900">
              {value}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

