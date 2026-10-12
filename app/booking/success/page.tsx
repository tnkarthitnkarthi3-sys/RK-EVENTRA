"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function BookingSuccessContent() {
  const searchParams = useSearchParams();

  const bookingId = searchParams.get("bookingId");
  const paymentId = searchParams.get("paymentId");
  const status = searchParams.get("status");

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-white">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center shadow-2xl backdrop-blur">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20">
            <span className="text-4xl text-emerald-400">✓</span>
          </div>

          <h1 className="text-3xl font-bold">Booking Successful</h1>

          <p className="mt-3 text-slate-300">
            Your RK EVENTRA booking has been processed successfully.
          </p>

          {status && (
            <div className="mt-6 rounded-2xl bg-black/20 p-4 text-left">
              <p className="text-sm text-slate-400">Payment Status</p>
              <p className="mt-1 font-semibold text-emerald-400">
                {status}
              </p>
            </div>
          )}

          {bookingId && (
            <div className="mt-4 rounded-2xl bg-black/20 p-4 text-left">
              <p className="text-sm text-slate-400">Booking ID</p>
              <p className="mt-1 break-all font-mono text-sm">
                {bookingId}
              </p>
            </div>
          )}

          {paymentId && (
            <div className="mt-4 rounded-2xl bg-black/20 p-4 text-left">
              <p className="text-sm text-slate-400">Payment ID</p>
              <p className="mt-1 break-all font-mono text-sm">
                {paymentId}
              </p>
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <a
              href="/bookings"
              className="rounded-xl bg-white px-6 py-3 font-semibold text-slate-950 hover:bg-slate-200"
            >
              View My Bookings
            </a>

            <a
              href="/"
              className="rounded-xl border border-white/15 px-6 py-3 font-semibold hover:bg-white/10"
            >
              Back to Home
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function BookingSuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
          <p>Loading booking details...</p>
        </main>
      }
    >
      <BookingSuccessContent />
    </Suspense>
  );
}
