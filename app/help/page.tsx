"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "@/src/components/layout/Navbar";
import Footer from "@/src/components/layout/Footer";
import {
  HelpCircle,
  ShieldAlert,
  CreditCard,
  RotateCcw,
  MessageSquare,
  ChevronDown,
  CheckCircle,
  Send,
  AlertCircle,
  Sparkles,
} from "lucide-react";

export default function HelpSupportPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [ticketData, setTicketData] = useState({
    subject: "",
    category: "BOOKING_INQUIRY",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const faqs = [
    {
      q: "How does the Multilingual RK AI Assistant work?",
      a: "RK AI understands natural Tamil script, English, and Tanglish (Tamil transliterated in Latin letters). You can ask questions such as 'Macha enakku Chengalpattu-la 15000 kulla DJ venum'. The AI extracts the event, location, date, and budget, and returns verified database vendors.",
    },
    {
      q: "What is the vendor ₹800 joining fee policy?",
      a: "All vendors pay a one-time non-refundable ₹800 INR platform onboarding fee. After payment verification and admin document approval, vendors become active. The joining fee is completely separate from customer booking payments and platform commission.",
    },
    {
      q: "What is the platform booking cancellation policy?",
      a: "Cancellations made 7 or more days prior to the event date are eligible for full refund minus processing fees. Cancellations made between 3 to 6 days receive 50% refund. Cancellations within 48 hours of the event date are non-refundable as the vendor has already committed equipment and crew.",
    },
    {
      q: "How are payments verified on RK Eventra?",
      a: "All payments are processed through Razorpay using server-side HMAC-SHA256 signature verification. No booking or joining fee is confirmed without verified gateway webhooks and transaction records.",
    },
    {
      q: "Can I compare multiple vendors before booking?",
      a: "Yes! Use the 'Compare' button on vendor cards or ask RK AI 'compare these two DJ vendors' to open the side-by-side comparison modal.",
    },
  ];

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketData.subject || !ticketData.message) return;
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full space-y-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 text-xs text-amber-400 font-bold bg-amber-500/10 border border-amber-500/30 px-3.5 py-1 rounded-full mb-3">
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>Customer & Vendor Assistance</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white">Help & Dispute Resolution</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            Find answers to platform policies, payment guarantees, and raise official support tickets.
          </p>
        </div>

        {/* Policy Highlights Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
            <RotateCcw className="w-6 h-6 text-amber-400 mb-2" />
            <h4 className="font-bold text-sm text-white">Transparent Cancellation</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Clear refund tiers based on advance notice days. Safe for both customers and vendors.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
            <CreditCard className="w-6 h-6 text-emerald-400 mb-2" />
            <h4 className="font-bold text-sm text-white">Payment Escrow</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Customer payments are securely reconciled. Vendor earnings are released upon successful event execution.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
            <ShieldAlert className="w-6 h-6 text-rose-400 mb-2" />
            <h4 className="font-bold text-sm text-white">Admin Dispute Mediation</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              In case of service mismatch or cancellations, administrators review logs and mediate resolutions.
            </p>
          </div>
        </div>

        {/* FAQs */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8">
          <h3 className="text-lg font-bold text-white mb-6">Frequently Asked Questions</h3>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-slate-950 border border-slate-800/80 rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full p-4 text-left flex items-center justify-between text-xs sm:text-sm font-bold text-slate-200 hover:text-amber-400"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openFaq === i ? "rotate-180 text-amber-400" : ""}`} />
                </button>
                {openFaq === i && (
                  <div className="p-4 pt-0 text-xs text-slate-300 leading-relaxed border-t border-slate-800 mt-1">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Raise a Support Ticket Form */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8">
          <h3 className="text-lg font-bold text-white mb-2">Raise Support Request or Dispute</h3>
          <p className="text-xs text-slate-400 mb-6">
            Need assistance with a booking or payment? Submit your query to our customer care and mediation team.
          </p>

          {submitted ? (
            <div className="bg-emerald-950/30 border border-emerald-500/40 rounded-xl p-6 text-center space-y-2">
              <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto" />
              <h4 className="font-bold text-white text-sm">Ticket Submitted Successfully</h4>
              <p className="text-xs text-slate-300">
                Ticket Reference: <span className="font-mono text-amber-400 font-bold">#TCK-{Date.now().toString().slice(-6)}</span>
              </p>
              <p className="text-xs text-slate-400">Our operations team will review your inquiry within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleTicketSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Subject</label>
                  <input
                    type="text"
                    required
                    value={ticketData.subject}
                    onChange={(e) => setTicketData({ ...ticketData, subject: e.target.value })}
                    placeholder="e.g. Booking #123 Date Modification Request"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl p-2.5 text-xs text-slate-100 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Inquiry Category</label>
                  <select
                    value={ticketData.category}
                    onChange={(e) => setTicketData({ ...ticketData, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl p-2.5 text-xs text-slate-100 outline-none"
                  >
                    <option value="BOOKING_INQUIRY">Booking Inquiry</option>
                    <option value="PAYMENT_ISSUE">Payment / Refund Issue</option>
                    <option value="VENDOR_DISPUTE">Vendor Service Dispute</option>
                    <option value="ACCOUNT">Account Support</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Message Details</label>
                <textarea
                  rows={4}
                  required
                  value={ticketData.message}
                  onChange={(e) => setTicketData({ ...ticketData, message: e.target.value })}
                  placeholder="Provide all relevant booking IDs, dates, and issue details..."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl p-2.5 text-xs text-slate-100 outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-40 text-slate-950 font-bold text-xs px-6 py-2.5 rounded-xl shadow"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitting ? "Submitting..." : "Submit Support Request"}</span>
              </button>
            </form>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
