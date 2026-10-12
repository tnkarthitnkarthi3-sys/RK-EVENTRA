"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

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
    phone?: string | null;
  };

  vendor?: {
    businessName: string;
    email: string;
    phone?: string | null;
  };

  service?: {
    name: string;
    category: string;
    price?: number;
    description?: string;
  };
};

export default function BookingDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const bookingId = params?.id as string;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [copied, setCopied] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    async function loadBooking() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/bookings");

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message || "Failed to load booking"
          );
        }

        const bookings: Booking[] = Array.isArray(data)
          ? data
          : Array.isArray(data?.bookings)
            ? data.bookings
            : [];

        const foundBooking = bookings.find(
          (item) => item.id === bookingId
        );

        if (!foundBooking) {
          throw new Error("Booking not found");
        }

        setBooking(foundBooking);
      } catch (err) {
        console.error("Booking details error:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load booking"
        );
      } finally {
        setLoading(false);
      }
    }

    if (bookingId) {
      loadBooking();
    }
  }, [bookingId]);

  async function updateStatus(status: string) {
    if (!booking) return;

    const confirmMessage =
      status === "CANCELLED"
        ? "Are you sure you want to cancel this booking?"
        : status === "COMPLETED"
          ? "Mark this booking as completed?"
          : `Change booking status to ${status}?`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      setUpdating(true);

      const response = await fetch(
        "/api/bookings/status",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            bookingId: booking.id,
            status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data?.message || "Failed to update booking"
        );
      }

      setBooking((previous) =>
        previous
          ? {
              ...previous,
              status,
            }
          : previous
      );
    } catch (err) {
      console.error("Update booking error:", err);

      alert(
        err instanceof Error
          ? err.message
          : "Failed to update booking"
      );
    } finally {
      setUpdating(false);
    }
  }

  async function copyBookingId() {
    if (!booking) return;

    try {
      await navigator.clipboard.writeText(booking.id);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      alert("Unable to copy booking ID");
    }
  }

  function getStatusClass(status: string) {
    switch (status.toUpperCase()) {
      case "CONFIRMED":
        return "bg-green-100 text-green-700 border-green-200";

      case "COMPLETED":
        return "bg-blue-100 text-blue-700 border-blue-200";

      case "CANCELLED":
        return "bg-red-100 text-red-700 border-red-200";

      default:
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
    }
  }

  function getStatusIcon(status: string) {
    switch (status.toUpperCase()) {
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

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="rounded-3xl bg-white p-12 text-center shadow-sm">
            <div className="text-5xl">📋</div>

            <h1 className="mt-5 text-2xl font-bold">
              Loading Booking...
            </h1>

            <p className="mt-2 text-gray-500">
              Please wait while we load the booking details.
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !booking) {
    return (
      <main className="min-h-screen bg-gray-100">
        <header className="border-b bg-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
            <div>
              <h1 className="text-2xl font-bold">
                RK EVENTRA
              </h1>

              <p className="text-sm text-gray-500">
                Admin Panel • Booking Details
              </p>
            </div>

            <button
              onClick={() => router.push("/admin/bookings")}
              className="rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-gray-50"
            >
              ← Back to Bookings
            </button>
          </div>
        </header>

        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="rounded-3xl border border-red-200 bg-red-50 p-10 text-center">
            <div className="text-5xl">❌</div>

            <h2 className="mt-4 text-2xl font-bold text-red-700">
              Booking Not Found
            </h2>

            <p className="mt-2 text-red-600">
              {error || "Unable to find this booking."}
            </p>

            <button
              onClick={() => router.push("/admin/bookings")}
              className="mt-6 rounded-xl bg-black px-6 py-3 font-semibold text-white hover:bg-gray-800"
            >
              Back to Booking Management
            </button>
          </div>
        </div>
      </main>
    );
  }

  const servicePrice = Number(
    booking.service?.price ?? booking.amount ?? 0
  );

  const deliveryFee =
    servicePrice > 0 ? Math.round(servicePrice * 0.07) : 0;

  const platformFee =
    servicePrice > 0 ? Math.round(servicePrice * 0.03) : 0;

  const subtotal =
    servicePrice + deliveryFee + platformFee;

  const tax = Math.round(subtotal * 0.18);

  const total = subtotal + tax;

  return (
    <main className="min-h-screen bg-gray-100">
      {/* HEADER */}
      <header className="sticky top-0 z-20 border-b bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold">
              RK EVENTRA
            </h1>

            <p className="text-sm text-gray-500">
              Admin Panel • Booking Details
            </p>
          </div>

          <button
            onClick={() => router.push("/admin/bookings")}
            className="rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-gray-50"
          >
            ← Back to Bookings
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* BREADCRUMB */}
        <div className="mb-6 flex flex-wrap items-center gap-2 text-sm text-gray-500">
          <button
            onClick={() => router.push("/admin/dashboard")}
            className="hover:text-black"
          >
            Dashboard
          </button>

          <span>›</span>

          <button
            onClick={() => router.push("/admin/bookings")}
            className="hover:text-black"
          >
            Bookings
          </button>

          <span>›</span>

          <span className="font-medium text-gray-900">
            Booking Details
          </span>
        </div>

        {/* TITLE */}
        <div className="mb-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                Booking Details
              </p>

              <h2 className="mt-1 text-3xl font-bold">
                {booking.eventType || "Event Booking"}
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Booking ID: {booking.id}
              </p>
            </div>

            <div
              className={
                "inline-flex w-fit items-center gap-2 rounded-full border px-5 py-2 text-sm font-bold " +
                getStatusClass(booking.status)
              }
            >
              <span>
                {getStatusIcon(booking.status)}
              </span>

              {booking.status}
            </div>
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* LEFT - PRODUCT */}
          <div className="lg:col-span-2">
            <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
              {/* PRODUCT IMAGE */}
              <div className="relative h-[360px] overflow-hidden bg-gradient-to-br from-gray-900 via-gray-700 to-gray-500">
                <img
                  src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1400&q=85"
                  alt="Event service"
                  className="h-full w-full object-cover"
                />

                <div className="absolute inset-0 bg-black/25" />

                <div className="absolute left-6 top-6 rounded-full bg-white/95 px-4 py-2 text-sm font-bold shadow-lg">
                  🎉 RK EVENTRA Service
                </div>

                <div className="absolute bottom-6 left-6 right-6">
                  <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-white/80">
                        {booking.service?.category ||
                          "Event Service"}
                      </p>

                      <h3 className="mt-1 text-3xl font-bold text-white">
                        {booking.service?.name ||
                          "Event Service"}
                      </h3>
                    </div>

                    <div className="rounded-2xl bg-white px-5 py-3 shadow-xl">
                      <p className="text-xs text-gray-500">
                        Service Price
                      </p>

                      <p className="text-2xl font-bold">
                        ₹
                        {servicePrice.toLocaleString(
                          "en-IN"
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* PRODUCT INFO */}
              <div className="p-6">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1 rounded-full bg-yellow-50 px-3 py-1.5 text-sm font-semibold text-yellow-700">
                    ⭐ 4.8
                  </div>

                  <span className="rounded-full bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-600">
                    {booking.service?.category ||
                      "Event Service"}
                  </span>

                  <span className="rounded-full bg-green-50 px-3 py-1.5 text-sm font-semibold text-green-700">
                    ✓ Verified Vendor
                  </span>
                </div>

                <h3 className="mt-6 text-2xl font-bold">
                  {booking.service?.name ||
                    "Event Service"}
                </h3>

                <p className="mt-3 leading-7 text-gray-600">
                  {booking.service?.description ||
                    "Professional event service for weddings, birthdays, receptions and other special occasions. RK EVENTRA connects customers with trusted event professionals."}
                </p>

                {/* SERVICE FEATURES */}
                <div className="mt-7 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl bg-gray-50 p-4">
                    <div className="text-2xl">🛠️</div>

                    <p className="mt-2 text-sm font-bold">
                      Professional Service
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      Verified event professional
                    </p>
                  </div>

                  <div className="rounded-2xl bg-gray-50 p-4">
                    <div className="text-2xl">🚚</div>

                    <p className="mt-2 text-sm font-bold">
                      Setup & Delivery
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      Service arranged at venue
                    </p>
                  </div>

                  <div className="rounded-2xl bg-gray-50 p-4">
                    <div className="text-2xl">⭐</div>

                    <p className="mt-2 text-sm font-bold">
                      Trusted Vendor
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      RK EVENTRA verified
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* CUSTOMER + VENDOR */}
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {/* CUSTOMER */}
              <div className="rounded-3xl bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-900 text-xl text-white">
                    👤
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Customer
                    </p>

                    <h3 className="font-bold">
                      {booking.customer?.name ||
                        "Not specified"}
                    </h3>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  <InfoRow
                    icon="📧"
                    label="Email"
                    value={
                      booking.customer?.email ||
                      "Not provided"
                    }
                  />

                  <InfoRow
                    icon="📞"
                    label="Phone"
                    value={
                      booking.customer?.phone ||
                      "Not provided"
                    }
                  />
                </div>
              </div>

              {/* VENDOR */}
              <div className="rounded-3xl bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-900 text-xl text-white">
                    🏪
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Vendor
                    </p>

                    <h3 className="font-bold">
                      {booking.vendor?.businessName ||
                        "Not specified"}
                    </h3>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  <InfoRow
                    icon="📧"
                    label="Email"
                    value={
                      booking.vendor?.email ||
                      "Not provided"
                    }
                  />

                  <InfoRow
                    icon="📞"
                    label="Phone"
                    value={
                      booking.vendor?.phone ||
                      "Not provided"
                    }
                  />
                </div>
              </div>
            </div>

            {/* EVENT DETAILS */}
            <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm">
              <h3 className="text-xl font-bold">
                📅 Event Information
              </h3>

              <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <DetailBox
                  icon="🎉"
                  label="Event Type"
                  value={
                    booking.eventType || "Not specified"
                  }
                />

                <DetailBox
                  icon="📅"
                  label="Event Date"
                  value={
                    booking.eventDate
                      ? new Date(
                          booking.eventDate
                        ).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "Not specified"
                  }
                />

                <DetailBox
                  icon="📍"
                  label="Location"
                  value={
                    booking.location ||
                    "Location not specified"
                  }
                />
              </div>
            </div>
          </div>

          {/* RIGHT - PRICE */}
          <div>
            <div className="sticky top-24 overflow-hidden rounded-3xl bg-white shadow-sm">
              {/* PRICE HEADER */}
              <div className="border-b p-6">
                <p className="text-sm font-semibold uppercase tracking-wide text-gray-400">
                  Price Details
                </p>

                <h3 className="mt-2 text-2xl font-bold">
                  Booking Summary
                </h3>
              </div>

              {/* PRICE BREAKUP */}
              <div className="p-6">
                <div className="space-y-5">
                  <PriceRow
                    label="Service Price"
                    value={servicePrice}
                  />

                  <PriceRow
                    label="Delivery / Setup Fee"
                    value={deliveryFee}
                  />

                  <PriceRow
                    label="Platform Fee"
                    value={platformFee}
                  />

                  <div className="border-t pt-5">
                    <PriceRow
                      label="Subtotal"
                      value={subtotal}
                    />
                  </div>

                  <PriceRow
                    label="GST / Tax (18%)"
                    value={tax}
                  />
                </div>

                {/* TOTAL */}
                <div className="mt-6 rounded-2xl bg-gray-900 p-5 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-300">
                        Total Amount
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        Inclusive of taxes & fees
                      </p>
                    </div>

                    <p className="text-3xl font-bold">
                      ₹
                      {total.toLocaleString(
                        "en-IN"
                      )}
                    </p>
                  </div>
                </div>

                {/* EVENT LOCATION */}
                <div className="mt-6 rounded-2xl border bg-gray-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    📍 Delivery / Event Location
                  </p>

                  <p className="mt-2 font-semibold">
                    {booking.location ||
                      "Location not specified"}
                  </p>
                </div>

                {/* ACTIONS */}
                <div className="mt-6 space-y-3">
                  {booking.status === "PENDING" && (
                    <button
                      disabled={updating}
                      onClick={() =>
                        updateStatus("CONFIRMED")
                      }
                      className="w-full rounded-xl bg-green-600 px-5 py-3 font-bold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {updating
                        ? "Updating..."
                        : "✓ Confirm Booking"}
                    </button>
                  )}

                  {booking.status === "CONFIRMED" && (
                    <button
                      disabled={updating}
                      onClick={() =>
                        updateStatus("COMPLETED")
                      }
                      className="w-full rounded-xl bg-blue-600 px-5 py-3 font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {updating
                        ? "Updating..."
                        : "🎉 Mark Completed"}
                    </button>
                  )}

                  {booking.status !==
                    "CANCELLED" &&
                    booking.status !==
                      "COMPLETED" && (
                      <button
                        disabled={updating}
                        onClick={() =>
                          updateStatus("CANCELLED")
                        }
                        className="w-full rounded-xl border border-red-200 px-5 py-3 font-bold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {updating
                          ? "Updating..."
                          : "🚫 Cancel Booking"}
                      </button>
                    )}
                </div>

                {/* COPY */}
                <button
                  onClick={copyBookingId}
                  className="mt-4 w-full rounded-xl border px-5 py-3 text-sm font-semibold hover:bg-gray-50"
                >
                  {copied
                    ? "✓ Booking ID Copied"
                    : "📋 Copy Booking ID"}
                </button>
              </div>

              {/* SECURE */}
              <div className="border-t bg-gray-50 p-5 text-center">
                <p className="text-xs text-gray-500">
                  🔒 Secure booking managed by
                </p>

                <p className="mt-1 text-sm font-bold">
                  RK EVENTRA
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* BOOKING ID */}
        <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Booking ID
          </p>

          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <code className="break-all rounded-xl bg-gray-100 px-4 py-3 text-sm font-semibold">
              {booking.id}
            </code>

            <button
              onClick={copyBookingId}
              className="rounded-xl border px-5 py-3 text-sm font-bold hover:bg-gray-50"
            >
              📋 {copied ? "Copied" : "Copy ID"}
            </button>
          </div>

          <p className="mt-4 text-xs text-gray-400">
            Booking created on{" "}
            {booking.createdAt
              ? new Date(
                  booking.createdAt
                ).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              : "Unknown"}
          </p>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="mt-10 border-t bg-white">
        <div className="mx-auto max-w-7xl px-6 py-8 text-center">
          <p className="font-bold">RK EVENTRA</p>

          <p className="mt-1 text-sm text-gray-500">
            Admin Management System • © 2026 RK EVENTRA
          </p>
        </div>
      </footer>
    </main>
  );
}

function PriceRow({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-gray-600">
        {label}
      </span>

      <span className="text-sm font-semibold text-gray-900">
        ₹{value.toLocaleString("en-IN")}
      </span>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-lg">{icon}</span>

      <div className="min-w-0">
        <p className="text-xs text-gray-400">
          {label}
        </p>

        <p className="mt-0.5 break-all text-sm font-semibold">
          {value}
        </p>
      </div>
    </div>
  );
}

function DetailBox({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-gray-50 p-4">
      <div className="flex items-center gap-2">
        <span>{icon}</span>

        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
          {label}
        </p>
      </div>

      <p className="mt-2 font-bold text-gray-900">
        {value}
      </p>
    </div>
  );
}