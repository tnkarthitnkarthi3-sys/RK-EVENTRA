"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/src/components/layout/Navbar";
import Footer from "@/src/components/layout/Footer";
import {
  CheckCircle,
  Briefcase,
  IndianRupee,
  ShieldCheck,
  Upload,
  ArrowRight,
  AlertCircle,
  CreditCard,
  QrCode,
  Building,
  Phone,
  Layers,
  Sparkles,
} from "lucide-react";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => {
      open: () => void;
    };
  }
}

const serviceCategories = [
  "DJ and Entertainment",
  "Audio and Sound Systems",
  "Lighting Systems",
  "Wedding Decoration",
  "Stage Decoration",
  "Photography",
  "Videography",
  "Catering",
  "Makeup and Styling",
  "Flower Decoration",
  "Generator Services",
  "Event Planning",
  "Furniture and Seating",
  "Other Event Services",
];

export default function BecomeVendorPage() {
  const router = useRouter();

  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Form, 2: Review, 3: ₹800 Payment
  const [formData, setFormData] = useState({
    businessName: "",
    description: "",
    location: "Chennai, Tamil Nadu",
    phone: "",
    category: "DJ and Entertainment",
    serviceName: "",
    servicePrice: "",
    serviceDescription: "",
    packageFeatures: "Complete equipment setup, Sound engineer, On-time delivery",
    idDocumentUrl: "https://rkeventra.com/uploads/doc-placeholder.pdf",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gatewayError, setGatewayError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.businessName || !formData.serviceName || !formData.servicePrice) {
      setError("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/vendor/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          router.push("/login?redirect=/become-vendor");
          return;
        }
        throw new Error(data.error || "Failed to submit application");
      }

      setStep(3); // Proceed to payment
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error submitting application");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePayJoiningFee = async () => {
    setPaying(true);
    setGatewayError(null);

    try {
      const orderRes = await fetch("/api/vendor/join-payment/order", {
        method: "POST",
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok) {
        if (orderData.error?.includes("incomplete") || orderData.message?.includes("incomplete") || orderRes.status === 503) {
          setGatewayError(
            orderData.error ||
              orderData.message ||
              "Payment gateway setup is incomplete. Please configure the server credentials before accepting payments."
          );
          return;
        }
        throw new Error(orderData.error || "Unable to initialize ₹800 payment order");
      }

      if (orderData.alreadyPaid) {
        setPaymentSuccess(true);
        return;
      }

      // Initialize Razorpay checkout modal
      if (!window.Razorpay) {
        throw new Error("Razorpay SDK not loaded in browser");
      }

      const rzp = new window.Razorpay({
        key: orderData.keyId,
        amount: orderData.amount * 100, // 80000 paise
        currency: orderData.currency,
        name: "RK EVENTRA",
        description: "Vendor Onboarding & Verification Fee (₹800 INR)",
        order_id: orderData.orderId,
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch("/api/vendor/join-payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              setPaymentSuccess(true);
            } else {
              setGatewayError(verifyData.error || "Payment signature verification failed");
            }
          } catch (verErr) {
            setGatewayError("Server error verifying payment signature");
          }
        },
        theme: {
          color: "#f59e0b",
        },
      });

      rzp.open();
    } catch (err) {
      setGatewayError(err instanceof Error ? err.message : "Payment error occurred");
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 flex-1 w-full">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 text-xs text-amber-400 font-bold bg-amber-500/10 border border-amber-500/30 px-3.5 py-1 rounded-full mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Join Tamil Nadu's Premier Event Network</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white">Vendor Application & Onboarding</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-xl mx-auto">
            Expand your booking reach, accept high-intent event requests, and join verified DJs, catering, and decorators.
          </p>
        </div>

        {/* Stepper Progress */}
        <div className="grid grid-cols-3 gap-2 max-w-md mx-auto mb-10 text-center text-xs">
          <div className={`p-2.5 rounded-xl border ${step === 1 ? "bg-amber-500/10 border-amber-400 text-amber-400 font-bold" : "bg-slate-900 border-slate-800 text-slate-400"}`}>
            1. Business Details
          </div>
          <div className={`p-2.5 rounded-xl border ${step === 2 ? "bg-amber-500/10 border-amber-400 text-amber-400 font-bold" : "bg-slate-900 border-slate-800 text-slate-400"}`}>
            2. Review
          </div>
          <div className={`p-2.5 rounded-xl border ${step === 3 ? "bg-amber-500/10 border-amber-400 text-amber-400 font-bold" : "bg-slate-900 border-slate-800 text-slate-400"}`}>
            3. ₹800 Joining Fee
          </div>
        </div>

        {/* STEP 1: FORM */}
        {step === 1 && (
          <form onSubmit={() => setStep(2)} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Building className="w-5 h-5 text-amber-400" />
              <span>Business & Service Information</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Business Name *</label>
                <input
                  type="text"
                  required
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  placeholder="e.g. Chengalpattu Sound & DJ Beats"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Primary Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 outline-none cursor-pointer"
                >
                  {serviceCategories.map((c) => (
                    <option key={c} value={c} className="bg-slate-900">{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Service Location / Area *</label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. Chengalpattu, Tamil Nadu"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Contact Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g. 9840011223"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">Business Bio / Description</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your event experience, equipment quality, and specialties..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 outline-none resize-none"
              />
            </div>

            <div className="pt-4 border-t border-slate-800">
              <h4 className="text-sm font-bold text-amber-400 mb-3 flex items-center gap-1.5">
                <Layers className="w-4 h-4" />
                <span>Initial Service & Package Offering</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">Service Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.serviceName}
                    onChange={(e) => setFormData({ ...formData, serviceName: e.target.value })}
                    placeholder="e.g. Wedding Reception DJ Package"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">Package Price (₹ INR) *</label>
                  <input
                    type="number"
                    required
                    value={formData.servicePrice}
                    onChange={(e) => setFormData({ ...formData, servicePrice: e.target.value })}
                    placeholder="e.g. 15000"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 outline-none"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Included Features & Equipment</label>
                <input
                  type="text"
                  value={formData.packageFeatures}
                  onChange={(e) => setFormData({ ...formData, packageFeatures: e.target.value })}
                  placeholder="e.g. 4 JBL Tops, 2 Subwoofers, Wireless Mics, Par Can Lights"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 outline-none"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs px-6 py-3 rounded-xl transition-all shadow"
              >
                <span>Continue to Review</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: REVIEW */}
        {step === 2 && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>Review Your Application</span>
            </h3>

            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div>
                <span className="text-slate-500">Business Name</span>
                <p className="font-bold text-white mt-0.5">{formData.businessName}</p>
              </div>
              <div>
                <span className="text-slate-500">Category</span>
                <p className="font-bold text-amber-400 mt-0.5">{formData.category}</p>
              </div>
              <div>
                <span className="text-slate-500">Location</span>
                <p className="font-bold text-white mt-0.5">{formData.location}</p>
              </div>
              <div>
                <span className="text-slate-500">Starting Price</span>
                <p className="font-bold text-amber-400 mt-0.5">₹{Number(formData.servicePrice).toLocaleString()}</p>
              </div>
            </div>

            <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-4 text-xs text-slate-300">
              <span className="font-bold text-amber-300">Next Step: ₹800 Joining Fee Verification</span>
              <p className="mt-1 text-slate-400">
                To guarantee genuine vendors on RK Eventra, a one-time non-refundable ₹800 INR platform joining fee is required. After verified payment, our team reviews your business profile for activation.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-rose-950/40 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs text-slate-400 hover:text-white"
              >
                ← Back to Edit
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleFormSubmit}
                className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-40 text-slate-950 font-bold text-xs px-6 py-3 rounded-xl transition-all shadow"
              >
                {submitting ? "Submitting Application..." : "Submit & Proceed to ₹800 Payment"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: ₹800 JOINING FEE PAYMENT */}
        {step === 3 && (
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl p-6 sm:p-10 space-y-6 shadow-2xl">
            {paymentSuccess ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mx-auto text-emerald-400">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-white">Payment Verified Successfully!</h3>
                <p className="text-xs text-slate-300 max-w-md mx-auto">
                  Your ₹800 INR joining fee has been cryptographically confirmed. Your application status is now <span className="font-bold text-amber-400">PAID_PENDING_APPROVAL</span>.
                </p>
                <div className="pt-4">
                  <Link
                    href="/vendor-dashboard"
                    className="inline-block bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-6 py-3 rounded-xl shadow"
                  >
                    Open Vendor Dashboard
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <div className="text-center max-w-md mx-auto">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/40 flex items-center justify-center mx-auto text-amber-400 mb-3">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Vendor Onboarding Fee</h3>
                  <div className="text-3xl font-black text-amber-400 mt-2">₹800 <span className="text-xs font-normal text-slate-400">INR</span></div>
                  <p className="text-xs text-slate-400 mt-1">Exactly 80,000 paise processed through secure Razorpay Gateway</p>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Onboarding Account</span>
                    <span className="font-bold text-white">{formData.businessName || "Vendor"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Category</span>
                    <span className="text-amber-400 font-semibold">{formData.category}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-800">
                    <span className="font-bold text-slate-300">Total Payable</span>
                    <span className="font-bold text-amber-400">₹800.00 INR</span>
                  </div>
                </div>

                {gatewayError && (
                  <div className="p-4 bg-rose-950/40 border border-rose-500/40 rounded-xl text-xs text-rose-300 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-rose-400">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>Gateway Status Notice</span>
                    </div>
                    <p className="leading-relaxed">{gatewayError}</p>
                    <p className="text-[11px] text-slate-400">
                      To activate live/test payments, configure <code className="text-amber-300">RAZORPAY_KEY_ID</code> and <code className="text-amber-300">RAZORPAY_KEY_SECRET</code> in the server <code className="text-amber-300">.env</code> file.
                    </p>
                  </div>
                )}

                <div className="pt-2 text-center">
                  <button
                    type="button"
                    disabled={paying}
                    onClick={handlePayJoiningFee}
                    className="w-full sm:w-auto min-w-[240px] bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-40 text-slate-950 font-black text-sm px-8 py-3.5 rounded-xl transition-all shadow-xl shadow-amber-500/20"
                  >
                    {paying ? "Processing Order..." : "Pay ₹800 Joining Fee via Razorpay"}
                  </button>
                  <p className="text-[11px] text-slate-500 mt-2">
                    Secured by Razorpay • UPI, QR Code, Cards, Net Banking accepted
                  </p>
                </div>
              </>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
