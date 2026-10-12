"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building,
  CheckCircle2,
  Clock,
  CreditCard,
  QrCode,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
  ArrowRight,
  Phone,
  Mail,
  Sparkles,
} from "lucide-react";
import ThemeToggle from "@/src/components/theme/ThemeToggle";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => {
      open: () => void;
    };
  }
}

type PaymentStatus = {
  exists: boolean;
  paid: boolean;
  status: string | null;
  amount: number;
  currency: string;
  razorpayPaymentId?: string | null;
  transactionId?: string | null;
  paidAt?: string | null;
  adminUpiId?: string;
  adminPaymentQrUrl?: string | null;
  adminContactMobile?: string;
  supportEmail?: string;
  paymentInstructions?: string;
};

export default function VendorPendingPage() {
  const router = useRouter();

  const [payment, setPayment] = useState<PaymentStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");
  const [showUpiDetails, setShowUpiDetails] = useState(false);

  async function loadStatus() {
    try {
      const response = await fetch("/api/vendor/join-payment", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to load payment status");
      }

      setPayment(data);

      if (data.paid) {
        router.replace("/vendor-dashboard");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load payment status"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStatus();

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  async function startPayment() {
    try {
      setPaying(true);
      setError("");

      const orderResponse = await fetch("/api/vendor/join-payment/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const orderData = await orderResponse.json();

      if (!orderResponse.ok) {
        if (!orderData.configured) {
          setShowUpiDetails(true);
          setError("Gateway credentials pending. Please pay directly via the verified Admin UPI ID below.");
          return;
        }
        throw new Error(orderData.error || "Unable to create payment order");
      }

      if (orderData.alreadyPaid) {
        router.replace("/vendor-dashboard");
        return;
      }

      if (!window.Razorpay) {
        throw new Error("Razorpay gateway is still loading. Please try again.");
      }

      const options = {
        key: orderData.keyId,
        amount: orderData.amount * 100,
        currency: orderData.currency || "INR",
        name: "RK EVENTRA",
        description: "Vendor Partner Joining & Verification Fee",
        order_id: orderData.orderId,
        theme: {
          color: "#D4AF37",
        },
        modal: {
          ondismiss: () => {
            setPaying(false);
          },
        },
        handler: async function (response: any) {
          try {
            const verifyResponse = await fetch("/api/vendor/join-payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                paymentRecordId: orderData.paymentRecordId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyResponse.json();

            if (!verifyResponse.ok || !verifyData.success) {
              throw new Error(verifyData.error || "Payment verification failed");
            }

            router.replace("/vendor-dashboard");
          } catch (err) {
            setError(
              err instanceof Error ? err.message : "Payment verification failed"
            );
            setPaying(false);
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment initialization failed");
      setPaying(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF9F6] p-4 text-[#0F172A]">
        <div className="text-center space-y-3">
          <RefreshCw className="w-8 h-8 mx-auto animate-spin text-[#D4AF37]" />
          <p className="text-xs font-semibold text-stone-500">Checking partner activation status...</p>
        </div>
      </div>
    );
  }

  const joinAmount = payment?.amount ?? 800;
  const adminUpi = payment?.adminUpiId || "7530041288@fam";
  const adminQr = payment?.adminPaymentQrUrl;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FAF9F6] p-4 text-[#0F172A] font-sans">
      <div className="w-full max-w-lg rounded-3xl border border-[#D4AF37]/30 bg-white p-6 sm:p-8 shadow-xl space-y-6">
        {/* Brand header */}
        <div className="flex items-center justify-between border-b border-stone-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#0A1128] text-[#D4AF37] font-serif font-black text-lg flex items-center justify-center">
              RK
            </div>
            <div>
              <div className="text-base font-serif font-bold text-stone-900 tracking-wide">RK EVENTRA</div>
              <div className="text-[10px] text-[#996515] font-bold uppercase tracking-widest">
                Partner Activation Portal
              </div>
            </div>
          </div>
          <ThemeToggle variant="icon" />
        </div>

        {/* Hero title */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0A1128] text-[#D4AF37] shadow-md">
            <Building className="w-8 h-8" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
            Vendor Partner Activation
          </h1>

          <p className="text-xs text-stone-600 max-w-md mx-auto leading-relaxed">
            Complete the one-time platform joining fee to publish your service catalog and accept customer event bookings.
          </p>
        </div>

        {/* Pricing summary card */}
        <div className="rounded-2xl border border-stone-200 bg-[#FDFCF7] p-5 shadow-sm space-y-3">
          <div className="flex items-baseline justify-between border-b border-stone-200 pb-3">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                Mandatory Joining Fee
              </span>
              <span className="block text-[10px] text-[#996515] font-bold">One-Time Lifetime Partnership</span>
            </div>

            <div className="text-3xl font-serif font-black text-stone-900 font-mono">
              ₹{joinAmount.toLocaleString("en-IN")}
            </div>
          </div>

          <div className="space-y-2 text-xs text-stone-600">
            <div className="flex justify-between">
              <span>Platform Network</span>
              <span className="text-stone-900 font-bold">RK Eventra Marketplace</span>
            </div>
            <div className="flex justify-between">
              <span>Supported Payment Methods</span>
              <span className="text-stone-900 font-medium">UPI, QR, Cards, NetBanking</span>
            </div>
            <div className="flex justify-between">
              <span>Account Activation</span>
              <span className="text-emerald-700 font-bold">Instant Upon Verification</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2 shadow-sm">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={startPayment}
            disabled={paying}
            className="w-full py-3.5 px-6 rounded-2xl bg-[#0A1128] hover:bg-slate-800 text-[#D4AF37] font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {paying ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Opening Gateway...</span>
              </>
            ) : (
              <>
                <span>Pay ₹{joinAmount.toLocaleString("en-IN")} & Activate Partner Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Direct Admin UPI Toggle Option */}
          <button
            type="button"
            onClick={() => setShowUpiDetails(!showUpiDetails)}
            className="w-full text-center text-xs text-[#996515] hover:text-stone-900 font-bold py-1 transition-colors flex items-center justify-center gap-1.5"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>{showUpiDetails ? "Hide Direct Admin UPI Details" : "Pay via Direct Admin UPI ID / QR"}</span>
          </button>

          {showUpiDetails && (
            <div className="p-4 rounded-xl bg-[#FDFCF7] border border-[#D4AF37]/40 text-xs space-y-3 animate-fadeIn">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#996515] block">
                Direct Admin UPI Payment Fallback
              </span>

              <p className="text-stone-700">
                Send <b>₹{joinAmount}</b> to Admin UPI:{" "}
                <code className="text-stone-900 font-bold bg-white px-2 py-0.5 rounded border border-stone-300 font-mono">
                  {adminUpi}
                </code>
              </p>

              {adminQr && (
                <div className="text-center p-2 bg-white rounded-xl border border-stone-200 inline-block mx-auto">
                  <img src={adminQr} alt="Admin Payment QR" className="w-32 h-32 object-contain mx-auto" />
                  <span className="text-[10px] text-stone-500 font-bold mt-1 block">Scan Admin QR to Pay</span>
                </div>
              )}

              <p className="text-[11px] text-stone-500 leading-relaxed">
                {payment?.paymentInstructions ||
                  "Once paid, admin will verify your payment in the admin panel and immediately approve your partner profile!"}
              </p>
            </div>
          )}
        </div>

        <div className="pt-2 border-t border-stone-100 text-center">
          <Link
            href="/login"
            className="text-xs text-stone-500 hover:text-stone-800 transition-colors"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    </main>
  );
}
