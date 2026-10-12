"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, Phone, Mail, MapPin, ShieldCheck, Clock } from "lucide-react";

export default function Footer() {
  const [supportInfo, setSupportInfo] = useState({
    email: "support@rkeventra.com",
    phone: "+91 9840011223",
    hours: "Mon - Sun: 9:00 AM - 9:00 PM IST",
    joiningFee: "800",
  });

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) {
          setSupportInfo({
            email: data.settings.support_email || "support@rkeventra.com",
            phone: data.settings.admin_contact_mobile || "+91 9840011223",
            hours: data.settings.support_contact_info || "Mon - Sun: 9:00 AM - 9:00 PM IST",
            joiningFee: data.settings.vendor_joining_fee || "800",
          });
        }
      })
      .catch(() => {});
  }, []);

  return (
    <footer className="bg-[#0A1128] border-t border-[#D4AF37]/25 text-slate-300 text-xs mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
        {/* Brand */}
        <div className="lg:col-span-2 space-y-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-[#D4AF37] flex items-center justify-center text-[#0A1128] font-serif font-black text-xl shadow-md">
              RK
            </div>
            <span className="font-serif text-2xl font-bold tracking-wide text-white">
              RK <span className="text-[#D4AF37]">EVENTRA</span>
            </span>
          </Link>

          <p className="text-slate-300 text-xs leading-relaxed max-w-sm">
            “Your Event. Your Choice. Your Celebration.”
            <br />
            India&apos;s premier luxury event booking marketplace connecting you with verified wedding DJs, audio systems, decorative lighting, royal feast catering, stage setups, and candid photography.
          </p>

          {/* Contact Details */}
          <div className="space-y-1.5 pt-2 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <Mail className="w-3.5 h-3.5 text-[#D4AF37]" />
              <a href={`mailto:${supportInfo.email}`} className="hover:text-white transition-colors">
                {supportInfo.email}
              </a>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <Phone className="w-3.5 h-3.5 text-[#D4AF37]" />
              <a href={`tel:${supportInfo.phone}`} className="hover:text-white transition-colors">
                {supportInfo.phone}
              </a>
            </div>
            <div className="flex items-center gap-2 text-slate-400 text-[11px]">
              <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>{supportInfo.hours}</span>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-3">
          <h4 className="font-serif font-bold text-white text-sm">Platform</h4>
          <ul className="space-y-2">
            <li><Link href="/" className="hover:text-[#D4AF37] transition-colors">Home</Link></li>
            <li><Link href="/services" className="hover:text-[#D4AF37] transition-colors">Explore Services</Link></li>
            <li><Link href="/vendors" className="hover:text-[#D4AF37] transition-colors">Find Vendors</Link></li>
            <li><Link href="/ai-assistant" className="hover:text-[#D4AF37] transition-colors">RK AI Assistant</Link></li>
            <li>
              <Link href="/become-vendor" className="text-[#E6C687] font-bold hover:underline">
                Become a Vendor (₹{supportInfo.joiningFee})
              </Link>
            </li>
          </ul>
        </div>

        {/* Categories */}
        <div className="space-y-3">
          <h4 className="font-serif font-bold text-white text-sm">Top Services</h4>
          <ul className="space-y-2">
            <li><Link href="/vendors?category=DJ and Entertainment" className="hover:text-[#D4AF37] transition-colors">Wedding & Party DJs</Link></li>
            <li><Link href="/vendors?category=Audio and Sound Systems" className="hover:text-[#D4AF37] transition-colors">Live Sound Systems</Link></li>
            <li><Link href="/vendors?category=Lighting Systems" className="hover:text-[#D4AF37] transition-colors">Decorative Lighting</Link></li>
            <li><Link href="/vendors?category=Catering" className="hover:text-[#D4AF37] transition-colors">Royal Feast Catering</Link></li>
            <li><Link href="/vendors?category=Photography" className="hover:text-[#D4AF37] transition-colors">4K Candid Photography</Link></li>
            <li><Link href="/vendors?category=Stage Decoration" className="hover:text-[#D4AF37] transition-colors">Grand Stage Decoration</Link></li>
          </ul>
        </div>

        {/* Support & Governance */}
        <div className="space-y-3">
          <h4 className="font-serif font-bold text-white text-sm">Help & Governance</h4>
          <ul className="space-y-2">
            <li><Link href="/help" className="hover:text-[#D4AF37] transition-colors">Help & FAQ</Link></li>
            <li><Link href="/help#cancellation" className="hover:text-[#D4AF37] transition-colors">Cancellation & Refunds</Link></li>
            <li><Link href="/help#payment" className="hover:text-[#D4AF37] transition-colors">Payment Protection</Link></li>
            <li><Link href="/help#disputes" className="hover:text-[#D4AF37] transition-colors">Dispute Resolution</Link></li>
            <li><Link href="/admin/login" className="hover:text-[#D4AF37] transition-colors text-[11px]">Admin Control Center</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-800 py-6 px-4 text-center text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            © {new Date().getFullYear()} RK Eventra Marketplace. All rights reserved.
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Secure 256-bit Encrypted Platform</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
