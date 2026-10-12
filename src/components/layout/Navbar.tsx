"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sparkles,
  Menu,
  X,
  User,
  ShoppingBag,
  HelpCircle,
  Briefcase,
  Search,
  Bot,
  LogOut,
  Layers,
  ShieldCheck,
  Building,
} from "lucide-react";
import ThemeToggle from "@/src/components/theme/ThemeToggle";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: "CUSTOMER" | "VENDOR" | "ADMIN";
}

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      })
      .catch(() => setUser(null));
  }, [pathname]);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Services", href: "/services" },
    { name: "Find Vendors", href: "/vendors" },
    { name: "My Bookings", href: "/my-bookings" },
    { name: "Feedback", href: "/feedback" },
    { name: "RK AI Assistant", href: "/ai-assistant", highlight: true },
    { name: "Become Vendor", href: "/become-vendor" },
    { name: "Help & Support", href: "/help" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-[#030712]/90 backdrop-blur-xl border-b border-amber-500/20 text-slate-100 transition-all shadow-xl shadow-black/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-black text-lg shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
            RK
          </div>
          <div>
            <div className="text-xl font-black tracking-wider text-white flex items-center gap-1.5">
              <span>RK</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500">
                EVENTRA
              </span>
            </div>
            <div className="text-[10px] text-amber-300/80 font-semibold tracking-wider uppercase -mt-0.5 hidden sm:block">
              Your Event • Your Choice • Your Celebration
            </div>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center gap-6 text-xs font-bold uppercase tracking-wider">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`transition-all py-1.5 px-2 rounded-lg relative ${
                  isActive
                    ? "text-amber-400 font-extrabold"
                    : link.highlight
                    ? "text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 font-extrabold px-3 py-1.5 rounded-full shadow-md shadow-amber-500/20 hover:brightness-110 flex items-center gap-1.5 normal-case tracking-normal"
                    : "text-slate-300 hover:text-amber-300"
                }`}
              >
                {link.highlight && <Sparkles className="w-3.5 h-3.5 fill-slate-950" />}
                <span>{link.name}</span>
                {isActive && !link.highlight && (
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-amber-400 to-amber-500 rounded-full" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Auth / Profile Actions */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          {user ? (
            <div className="flex items-center gap-3">
              <Link
                href={
                  user.role === "ADMIN"
                    ? "/admin/dashboard"
                    : user.role === "VENDOR"
                    ? "/vendor-dashboard"
                    : "/customer/dashboard"
                }
                className="flex items-center gap-2 text-xs font-bold bg-slate-900 border border-amber-500/30 hover:border-amber-400 px-3.5 py-2 rounded-xl text-amber-300 transition-colors shadow-md"
              >
                {user.role === "ADMIN" ? (
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                ) : user.role === "VENDOR" ? (
                  <Building className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <User className="w-3.5 h-3.5 text-amber-400" />
                )}
                <span>{user.name.split(" ")[0]}</span>
                <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded uppercase">
                  {user.role}
                </span>
              </Link>
              <button
                onClick={async () => {
                  await fetch("/api/auth/logout", { method: "POST" });
                  window.location.href = "/";
                }}
                className="p-2 rounded-xl bg-slate-900 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-800 transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="text-xs font-bold text-slate-300 hover:text-white px-3.5 py-2 rounded-xl hover:bg-slate-900 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="text-xs font-extrabold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 px-4 py-2 rounded-xl transition-all shadow-md shadow-amber-500/20"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="lg:hidden flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-950 border-b border-amber-500/20 p-5 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block p-2 text-sm font-bold text-slate-200 hover:text-amber-400 hover:bg-slate-900 rounded-lg"
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-3 border-t border-slate-900 flex flex-col gap-2">
            {!user ? (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 text-center text-xs font-bold bg-slate-900 text-slate-200 rounded-xl"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 text-center text-xs font-black bg-amber-500 text-slate-950 rounded-xl"
                >
                  Create Account
                </Link>
              </>
            ) : (
              <button
                onClick={async () => {
                  await fetch("/api/auth/logout", { method: "POST" });
                  window.location.href = "/";
                }}
                className="w-full py-2 text-center text-xs font-bold text-rose-400 bg-rose-500/10 rounded-xl"
              >
                Sign Out ({user.name})
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
