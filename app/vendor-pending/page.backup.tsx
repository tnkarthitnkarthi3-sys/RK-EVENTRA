"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type PaymentData = {
  id: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string;
  upiId: string;
  utr: string | null;
  paymentNote: string | null;
};

type VendorData = {
  id: string;
  businessName: string;
  status: string;
};

type JoinPaymentResponse = {
  success: boolean;
  vendor: VendorData;
  payment: PaymentData;
  joinFee: number;
  adminUpiId: string;
  message?: string;
};

export default function VendorPendingPage() {
  const router = useRouter();

  const [data, setData] = useState<JoinPaymentResponse | null>(null);
  const [utr, setUtr] = useState("");
  const [paymentNote, setPaymentNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadPayment() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/vendor/join-payment", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          router.replace("/login?next=/vendor-pending");
          return;
        }

        throw new Error(result.message || "Unable to load vendor payment.");
      }

      setData(result);

      if (result.payment?.utr) {
        setUtr(result.payment.utr);
      }

      if (result.payment?.paymentNote) {
        setPaymentNote(result.payment.paymentNote);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load vendor payment."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPayment();
  }, []);

  async function submitPayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanUtr = utr.trim();

    if (!cleanUtr) {
      setError("Please enter the UTR / UPI transaction reference.");
      return;
    }

    if (cleanUtr.length < 6) {
      setError("Please enter a valid UTR / transaction reference.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      const response = await fetch("/api/vendor/join-payment", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          utr: cleanUtr,
          paymentNote: paymentNote.trim() || null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          router.replace("/login?next=/vendor-pending");
          return;
        }

        throw new Error(result.message || "Payment submission failed.");
      }

      setData(result);
      setSuccess(
        "Your ₹800 payment reference has been submitted. Admin verification is required before vendor approval."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Payment submission failed."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-white" />
          <p className="text-slate-300">Loading vendor payment...</p>
        </div>
      </main>
    );
  }

  if (error && !data) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
        <div className="w-full max-w-md rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-center">
          <h1 className="text-xl font-bold">Vendor Payment</h1>
          <p className="mt-3 text-sm text-red-200">{error}</p>

          <button
            onClick={() => router.push("/login")}
            className="mt-6 rounded-xl bg-white px-5 py-3 font-semibold text-slate-950"
          >
            Go to Login
          </button>
        </div>
      </main>
    );
  }

  const vendor = data?.vendor;
  const payment = data?.payment;
  const joinFee = data?.joinFee ?? 800;
  const adminUpiId = data?.adminUpiId ?? "7530041288@fam";

  const isSubmitted =
    payment?.status === "SUBMITTED" ||
    payment?.status === "VERIFIED" ||
    vendor?.status === "PAYMENT_PENDING" ||
    vendor?.status === "APPROVED";

  const isApproved = vendor?.status === "APPROVED";
  const isRejected = vendor?.status === "REJECTED";

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-white">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">
            RK EVENTRA
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Vendor Partner Activation
          </h1>

          <p className="mt-2 text-slate-400">
            Complete the one-time ₹800 vendor joining payment to continue to
            admin verification.
          </p>
        </div>

        <div className="space-y-5">
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-slate-400">Vendor Status</p>
                <p className="mt-1 text-lg font-bold">
                  {vendor?.status ?? "PENDING"}
                </p>
              </div>

              <span className="rounded-full bg-amber-500/10 px-4 py-2 text-sm font-semibold text-amber-300">
                {vendor?.status ?? "PENDING"}
              </span>
            </div>

            <div className="mt-6 rounded-xl bg-slate-800/70 p-4">
              <p className="text-sm text-slate-400">Business</p>
              <p className="mt-1 font-semibold">
                {vendor?.businessName ?? "Vendor"}
              </p>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">
                  Vendor Joining Fee
                </p>
                <p className="mt-1 text-3xl font-bold">₹{joinFee}</p>
              </div>

              <div className="rounded-xl bg-cyan-500/10 px-4 py-3 text-right">
                <p className="text-xs text-cyan-300">Payment Method</p>
                <p className="font-semibold text-cyan-200">UPI</p>
              </div>
            </div>

            <p className="mt-3 text-sm text-slate-400">
              One-time activation fee payable to RK EVENTRA admin.
            </p>

            <div className="mt-5 space-y-3 text-sm text-slate-300">
              <p>✓ Payment method: UPI</p>
              <p>✓ Admin UPI: {adminUpiId}</p>
              <p>✓ Admin verifies the UTR before approval</p>
              <p>✓ Vendor approval is blocked until payment is verified</p>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-bold">Pay ₹{joinFee}</h2>

            <p className="mt-2 text-sm text-slate-400">
              Scan the QR code using your UPI app and pay exactly ₹{joinFee}.
            </p>

            <div className="mt-6 flex justify-center">
              <div className="rounded-2xl bg-white p-4">
                <img
                  src="/payments/vendor-join-qr.jpeg"
                  alt="RK EVENTRA vendor joining fee UPI QR"
                  className="h-72 w-72 rounded-xl object-contain"
                />
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-slate-700 bg-slate-800/60 p-5">
              <p className="text-sm text-slate-400">Pay to</p>

              <p className="mt-1 text-lg font-bold">Karthikeyan</p>

              <p className="mt-1 break-all font-mono text-cyan-300">
                {adminUpiId}
              </p>

              <p className="mt-4 text-sm text-slate-400">
                Amount
              </p>

              <p className="text-2xl font-bold">₹{joinFee}</p>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-bold">
              Payment Verification
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              After completing the UPI payment, enter the UTR / transaction
              reference below. Admin will verify the payment manually.
            </p>

            {success && (
              <div className="mt-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300">
                {success}
              </div>
            )}

            {error && (
              <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
                {error}
              </div>
            )}

            {isApproved ? (
              <div className="mt-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5">
                <h3 className="font-bold text-emerald-300">
                  Vendor Approved
                </h3>

                <p className="mt-2 text-sm text-emerald-200">
                  Your ₹800 joining payment has been verified by admin.
                </p>

                <button
                  onClick={() => router.push("/vendor-dashboard")}
                  className="mt-5 rounded-xl bg-emerald-500 px-5 py-3 font-bold text-slate-950"
                >
                  Continue to Vendor Dashboard
                </button>
              </div>
            ) : isRejected ? (
              <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-5">
                <h3 className="font-bold text-red-300">
                  Vendor Application Rejected
                </h3>

                <p className="mt-2 text-sm text-red-200">
                  Please contact RK EVENTRA admin for further assistance.
                </p>
              </div>
            ) : isSubmitted ? (
              <div className="mt-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-5">
                <h3 className="font-bold text-amber-300">
                  Payment Submitted
                </h3>

                <p className="mt-2 text-sm text-amber-200">
                  Your payment reference is waiting for admin verification.
                </p>

                {payment?.utr && (
                  <p className="mt-3 text-sm text-slate-300">
                    UTR:{" "}
                    <span className="font-mono font-semibold">
                      {payment.utr}
                    </span>
                  </p>
                )}
              </div>
            ) : (
              <form onSubmit={submitPayment} className="mt-6 space-y-5">
                <div>
                  <label
                    htmlFor="utr"
                    className="mb-2 block text-sm font-semibold text-slate-200"
                  >
                    UTR / UPI Transaction Reference
                  </label>

                  <input
                    id="utr"
                    value={utr}
                    onChange={(event) => setUtr(event.target.value)}
                    placeholder="Enter the UTR / transaction reference"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
                    autoComplete="off"
                  />
                </div>

                <div>
                  <label
                    htmlFor="paymentNote"
                    className="mb-2 block text-sm font-semibold text-slate-200"
                  >
                    Payment Note (Optional)
                  </label>

                  <textarea
                    id="paymentNote"
                    value={paymentNote}
                    onChange={(event) =>
                      setPaymentNote(event.target.value)
                    }
                    placeholder="Optional payment information"
                    rows={3}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-xl bg-cyan-400 px-5 py-3 font-bold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting
                    ? "Submitting Payment..."
                    : `I Paid ₹${joinFee} — Submit for Verification`}
                </button>
              </form>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
