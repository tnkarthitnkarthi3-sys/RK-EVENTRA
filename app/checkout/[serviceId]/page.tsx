"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/src/components/layout/Navbar";
import Footer from "@/src/components/layout/Footer";
import {
  ShieldCheck,
  CreditCard,
  Calendar,
  MapPin,
  Sparkles,
  Lock,
  CheckCircle2,
  AlertCircle,
  Truck,
  Building,
  QrCode,
  ArrowLeft,
  ChevronRight,
  Info,
} from "lucide-react";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => {
      open: () => void;
    };
  }
}

type Charge = {
  id: string;
  name: string;
  type: string;
  amount: number;
  mode: string;
  description?: string | null;
};

type Service = {
  id: string;
  name: string;
  description?: string | null;
  category: string;
  price: number;
  vendor?: {
    id: string;
    businessName: string;
    description?: string | null;
    location?: string | null;
    profileImage?: string | null;
    rating?: number;
    status?: string;
    owner?: string;
    email?: string;
    phone?: string | null;
    upiId?: string | null;
    paymentQrUrl?: string | null;
    paymentMobile?: string | null;
    paymentDisplayName?: string | null;
    paymentInstructions?: string | null;
    showManualUpi?: boolean;
    charges?: Charge[];
  };
};

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();

  const serviceId = String(params.serviceId);

  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventType, setEventType] = useState("Wedding");
  const [location, setLocation] = useState("");

  useEffect(() => {
    async function loadService() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`/api/services/${serviceId}`, {
          credentials: "include",
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok || !data.success || !data.service) {
          throw new Error(data.message || "Failed to load service details");
        }

        setService(data.service);
      } catch (err) {
        console.error("CHECKOUT SERVICE ERROR:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load service details"
        );
      } finally {
        setLoading(false);
      }
    }

    if (serviceId) {
      loadService();
    }
  }, [serviceId]);

  /* Preload Razorpay Checkout SDK */
  useEffect(() => {
    if (document.getElementById("razorpay-checkout-script")) {
      return;
    }

    const script = document.createElement("script");
    script.id = "razorpay-checkout-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const pricing = useMemo(() => {
    const servicePrice = Number(service?.price || 0);

    let deliveryFee = 0;
    let extraCharges = 0;

    const charges = service?.vendor?.charges || [];

    for (const charge of charges) {
      const rawAmount = Number(charge.amount || 0);
      const amount =
        charge.mode === "PERCENTAGE"
          ? servicePrice * (rawAmount / 100)
          : rawAmount;

      const safeAmount = roundMoney(amount);
      const type = String(charge.type || "").trim().toUpperCase();

      if (type === "DELIVERY" || type === "DELIVERY_CHARGE") {
        deliveryFee += safeAmount;
      } else {
        extraCharges += safeAmount;
      }
    }

    deliveryFee = roundMoney(deliveryFee);
    extraCharges = roundMoney(extraCharges);

    const vendorAmount = roundMoney(servicePrice + deliveryFee + extraCharges);
    const platformFee = Math.min(2000, vendorAmount);
    const subtotal = roundMoney(vendorAmount + platformFee);
    const tax = roundMoney(subtotal * 0.18);
    const total = roundMoney(subtotal + tax);

    return {
      servicePrice,
      deliveryFee,
      extraCharges,
      vendorAmount,
      platformFee,
      subtotal,
      tax,
      total,
    };
  }, [service]);

  async function createBooking() {
    setError("");

    if (!eventDate) {
      setError("Please select your event date.");
      return;
    }

    if (!location.trim()) {
      setError("Please enter your event / venue location.");
      return;
    }

    if (!service?.vendor?.id) {
      setError("Vendor information is unavailable.");
      return;
    }

    try {
      setBooking(true);

      /* Check customer login */
      const meResponse = await fetch("/api/auth/me", {
        credentials: "include",
        cache: "no-store",
      });

      const meData = await meResponse.json();

      if (!meResponse.ok || !meData.success || !meData.user) {
        router.push(`/login?redirect=${encodeURIComponent(`/checkout/${serviceId}`)}`);
        return;
      }

      if (meData.user.role !== "CUSTOMER") {
        setError("Only customer accounts can create bookings.");
        setBooking(false);
        return;
      }

      /* Create server-side booking */
      const response = await fetch("/api/bookings", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          vendorId: service.vendor.id,
          serviceId,
          eventDate,
          eventType,
          location: location.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success || !data.booking) {
        throw new Error(data.message || "Unable to create booking");
      }

      /* Create Razorpay order */
      const paymentResponse = await fetch("/api/payments", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingId: data.booking.id,
        }),
      });

      const paymentData = await paymentResponse.json();

      if (!paymentResponse.ok || !paymentData.success) {
        throw new Error(paymentData.message || "Unable to start Razorpay payment");
      }

      if (!window.Razorpay) {
        throw new Error("Razorpay checkout is still loading. Please try again in a few seconds.");
      }

      /* Open Razorpay Checkout modal */
      const options = {
        key: paymentData.keyId,
        amount: Math.round(Number(paymentData.amount) * 100),
        currency: paymentData.currency || "INR",
        name: "RK EVENTRA",
        description: `${data.booking.service?.name || "Event Service"} Booking`,
        order_id: paymentData.orderId,
        prefill: {
          name: paymentData.customer?.name || meData.user.name || "",
          email: paymentData.customer?.email || meData.user.email || "",
          contact: paymentData.customer?.phone || meData.user.phone || "",
        },
        notes: {
          bookingId: data.booking.id,
          vendorId: service.vendor.id,
          serviceId,
        },
        theme: {
          color: "#f59e0b",
        },
        modal: {
          ondismiss: () => {
            setBooking(false);
            setError(
              "Payment was cancelled. Your booking is pending and has not been confirmed."
            );
          },
        },
        handler: async function (razorpayResponse: any) {
          try {
            setError("");

            const verifyResponse = await fetch("/api/payments/verify", {
              method: "POST",
              credentials: "include",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                bookingId: data.booking.id,
                razorpay_order_id: razorpayResponse.razorpay_order_id,
                razorpay_payment_id: razorpayResponse.razorpay_payment_id,
                razorpay_signature: razorpayResponse.razorpay_signature,
              }),
            });

            const verifyData = await verifyResponse.json();

            if (!verifyResponse.ok || !verifyData.success) {
              throw new Error(verifyData.message || "Payment verification failed");
            }

            router.push(
              `/booking/success?bookingId=${encodeURIComponent(data.booking.id)}`
            );
          } catch (err) {
            console.error("PAYMENT VERIFY UI ERROR:", err);
            setError(
              err instanceof Error
                ? err.message
                : "Payment verification failed"
            );
            setBooking(false);
          }
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      console.error("BOOKING PAYMENT ERROR:", err);
      setError(
        err instanceof Error ? err.message : "Booking initialization failed"
      );
      setBooking(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-10 max-w-md w-full text-center shadow-2xl backdrop-blur-xl">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center animate-pulse">
              <Sparkles className="w-8 h-8 text-amber-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Preparing Checkout...
            </h2>
            <p className="text-slate-400 text-sm">
              Loading service package details and calculating dynamic fee schedules.
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="bg-slate-900/80 border border-red-500/30 rounded-3xl p-10 max-w-lg w-full text-center shadow-2xl backdrop-blur-xl">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-3xl">
              ⚠️
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Service Not Found
            </h2>
            <p className="text-red-400 text-sm mb-6">
              {error || "The requested service could not be retrieved."}
            </p>
            <Link
              href="/vendors"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold hover:shadow-lg hover:shadow-amber-500/20 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Return to Vendors
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      {/* BREADCRUMB */}
      <div className="border-b border-slate-800/80 bg-slate-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center gap-2 text-xs sm:text-sm text-slate-400">
          <Link href="/" className="hover:text-amber-400 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <Link href="/vendors" className="hover:text-amber-400 transition-colors">
            Vendors
          </Link>
          {service.vendor && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              <Link
                href={`/vendors/${service.vendor.id}`}
                className="hover:text-amber-400 transition-colors truncate max-w-[150px]"
              >
                {service.vendor.businessName}
              </Link>
            </>
          )}
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-slate-200 font-medium">Checkout</span>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-8">
        {/* HEADER TITLE */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
            <Lock className="w-3.5 h-3.5" /> SECURE RAZORPAY ESCROW CHECKOUT
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Complete Your Event Booking
          </h1>
          <p className="text-slate-400 text-sm sm:text-base">
            Select your celebration date, confirm venue location, and secure your event professional.
          </p>
        </div>

        {error && (
          <div className="max-w-4xl mx-auto bg-red-950/40 border border-red-500/40 rounded-2xl p-4 flex items-start gap-3 text-red-300 text-sm">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-semibold">Booking Notice:</strong>
              {error}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-6xl mx-auto">
          {/* LEFT: EVENT DETAILS & BOOKING FORM (7 COLS) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Event Particulars</h2>
                  <p className="text-xs text-slate-400">
                    Provide the date, occasion, and venue location for your booking.
                  </p>
                </div>
              </div>

              {/* Event Type */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Occasion / Event Type
                </label>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 text-sm focus:outline-none focus:border-amber-500 transition-colors"
                >
                  <option value="Wedding">Wedding</option>
                  <option value="Reception">Reception</option>
                  <option value="Engagement">Engagement</option>
                  <option value="Birthday">Birthday Celebration</option>
                  <option value="Anniversary">Anniversary</option>
                  <option value="Corporate">Corporate Conference / Gala</option>
                  <option value="Housewarming">Housewarming Ceremony</option>
                  <option value="College Fest">College Cultural Fest / DJ Night</option>
                  <option value="Other">Other Private Event</option>
                </select>
              </div>

              {/* Event Date */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Event Date
                </label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 text-sm focus:outline-none focus:border-amber-500 transition-colors [color-scheme:dark]"
                />
              </div>

              {/* Event Location */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Event / Venue Location Address
                </label>
                <textarea
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Sri Krishna Mahal, GST Road, Chengalpattu / Anna Nagar, Chennai"
                  rows={4}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 text-sm focus:outline-none focus:border-amber-500 transition-colors resize-y"
                />
              </div>

              {/* Vendor Charge notification notice */}
              <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 flex items-start gap-3">
                <Truck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300 space-y-1">
                  <strong className="text-white block font-semibold">
                    Dynamic Vendor Logistics & Delivery
                  </strong>
                  <p className="text-slate-400 leading-relaxed">
                    Logistics, sound setup, and delivery fees are calculated transparently and securely on our server based on vendor parameters.
                  </p>
                </div>
              </div>

              {/* Submit / Pay Button */}
              <button
                onClick={createBooking}
                disabled={booking}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-base shadow-xl shadow-amber-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {booking ? (
                  <>
                    <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    Opening Secure Gateway...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    Pay ₹{pricing.total.toLocaleString("en-IN")} via Razorpay
                  </>
                )}
              </button>

              <div className="text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>100% Secure Payment • Server-Side Signature Verification</span>
              </div>
            </div>

            {/* Direct Vendor UPI info if active */}
            {service.vendor?.showManualUpi &&
              (service.vendor.upiId || service.vendor.paymentQrUrl) && (
                <div className="bg-gradient-to-r from-slate-900 to-amber-950/20 border border-amber-500/20 rounded-3xl p-6 shadow-xl space-y-4">
                  <div className="flex items-center gap-2.5">
                    <QrCode className="w-5 h-5 text-amber-400" />
                    <h3 className="text-base font-bold text-white">
                      Direct Vendor UPI Option Available
                    </h3>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {service.vendor.paymentInstructions ||
                      "Prefer manual UPI transfer? You may send payment directly using the details below. Our team verifies manual receipts prior to event confirmation."}
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between pt-2">
                    <div className="space-y-1.5 text-xs">
                      {service.vendor.upiId && (
                        <div className="bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800">
                          <span className="text-slate-400">UPI ID: </span>
                          <span className="font-mono font-bold text-amber-300">
                            {service.vendor.upiId}
                          </span>
                        </div>
                      )}
                      {service.vendor.paymentMobile && (
                        <div className="bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800">
                          <span className="text-slate-400">Mobile: </span>
                          <span className="font-bold text-white">
                            {service.vendor.paymentMobile}
                          </span>
                        </div>
                      )}
                    </div>

                    {service.vendor.paymentQrUrl && (
                      <div className="bg-white p-2 rounded-xl text-center shrink-0">
                        <img
                          src={service.vendor.paymentQrUrl}
                          alt="Vendor UPI QR"
                          className="w-24 h-24 object-contain rounded"
                        />
                        <div className="text-[10px] font-bold text-slate-950 mt-1">
                          Scan to Pay
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
          </div>

          {/* RIGHT: ORDER SUMMARY & TRUST BADGES (5 COLS) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-900/80 border border-amber-500/20 rounded-3xl p-6 sm:p-7 shadow-2xl backdrop-blur-xl space-y-6">
              {/* Selected Service Card */}
              <div className="flex items-start gap-4 pb-5 border-b border-slate-800">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-purple-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 text-xl">
                  ✨
                </div>
                <div className="min-w-0">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/20">
                    {service.category}
                  </span>
                  <h3 className="text-lg font-bold text-white mt-1 leading-snug">
                    {service.name}
                  </h3>
                  {service.vendor && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1 font-medium">
                      <Building className="w-3.5 h-3.5 text-amber-400" />
                      <span>{service.vendor.businessName}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 text-sm">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider pb-1">
                  Price Calculation
                </div>

                <div className="flex justify-between items-center text-slate-300">
                  <span>Base Service Fee</span>
                  <span className="font-semibold text-white">
                    ₹{pricing.servicePrice.toLocaleString("en-IN")}
                  </span>
                </div>

                {pricing.deliveryFee > 0 && (
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-amber-400" />
                      Delivery & Setup
                    </span>
                    <span className="font-semibold text-white">
                      ₹{pricing.deliveryFee.toLocaleString("en-IN")}
                    </span>
                  </div>
                )}

                {pricing.extraCharges > 0 && (
                  <div className="flex justify-between items-center text-slate-300">
                    <span>Vendor Extra Charges</span>
                    <span className="font-semibold text-white">
                      ₹{pricing.extraCharges.toLocaleString("en-IN")}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center text-slate-300">
                  <span>Platform & Service Assurance</span>
                  <span className="font-semibold text-white">
                    ₹{pricing.platformFee.toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-slate-300">
                  <span>Subtotal</span>
                  <span className="font-semibold text-white">
                    ₹{pricing.subtotal.toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="flex justify-between items-center text-slate-300">
                  <span>GST (18% Applicable)</span>
                  <span className="font-semibold text-white">
                    ₹{pricing.tax.toLocaleString("en-IN")}
                  </span>
                </div>

                {/* Grand Total Highlight */}
                <div className="pt-4 border-t-2 border-slate-800 flex justify-between items-baseline">
                  <div>
                    <div className="text-base font-bold text-white">Total Payable</div>
                    <div className="text-[11px] text-slate-400">Inclusive of all taxes</div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-amber-400">
                    ₹{pricing.total.toLocaleString("en-IN")}
                  </div>
                </div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 space-y-3 text-xs text-slate-400">
              <div className="flex items-center gap-2.5 text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>256-Bit Razorpay Encrypted Transaction</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Verified Event Service Provider Protection</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Server-Validated Pricing (Tamper-Proof)</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>24/7 Dedicated RK Eventra Booking Assistance</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
