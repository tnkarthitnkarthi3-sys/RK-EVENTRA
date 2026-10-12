"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Stats = {
  vendors: number;
  services: number;
  customers: number;
  bookings: number;
};

const management = [
  {
    href: "/admin/vendors",
    icon: "🏪",
    number: "01",
    title: "Manage Vendors",
    description:
      "Review registered vendors, profiles and event businesses.",
  },
  {
    href: "/admin/customers",
    icon: "👥",
    number: "02",
    title: "Manage Customers",
    description:
      "View customer accounts and manage marketplace users.",
  },
  {
    href: "/admin/services",
    icon: "🛠️",
    number: "03",
    title: "Manage Services",
    description:
      "Review vendor services, pricing and service details.",
  },
  {
    href: "/admin/bookings",
    icon: "📋",
    number: "04",
    title: "Manage Bookings",
    description:
      "Monitor event bookings and manage booking status.",
  },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    vendors: 0,
    services: 0,
    customers: 0,
    bookings: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const response = await fetch("/api/admin/stats", {
          cache: "no-store",
        });

        const data = await response.json();

        if (data.success) {
          setStats({
            vendors: data.vendors ?? 0,
            services: data.services ?? 0,
            customers: data.customers ?? 0,
            bookings: data.bookings ?? 0,
          });
        }
      } catch (error) {
        console.error("Failed to load admin stats:", error);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  return (
    <main className="min-h-screen bg-[#f5f6fa] text-slate-900">

      {/* TOP NAV */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1450px] items-center justify-between px-5 py-4 lg:px-8">

          <Link href="/" className="group flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-700 text-lg font-black text-white shadow-lg shadow-violet-200">
              RK
            </div>

            <div>
              <div className="text-lg font-black tracking-tight">
                RK <span className="text-violet-600">EVENTRA</span>
              </div>

              <div className="text-[10px] font-bold tracking-[0.22em] text-slate-400">
                ADMIN PANEL
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-3">

            <div className="hidden items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 sm:flex">
              <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-300" />
              <span className="text-xs font-bold text-emerald-700">
                SYSTEM ONLINE
              </span>
            </div>

            <Link
              href="/"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:border-violet-300 hover:text-violet-700"
            >
              ← Back to Website
            </Link>

          </div>
        </div>
      </header>

      {/* PAGE */}
      <div className="mx-auto max-w-[1450px] px-5 py-7 lg:px-8 lg:py-10">

        {/* HERO */}
        <section className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-[#17112f] via-[#352078] to-[#6d28d9] px-7 py-10 text-white shadow-2xl shadow-violet-200 lg:px-12 lg:py-14">

          <div className="absolute -right-28 -top-32 h-80 w-80 rounded-full bg-violet-400/20 blur-3xl" />
          <div className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-indigo-400/20 blur-3xl" />

          <div className="relative grid items-center gap-10 lg:grid-cols-[1fr_auto]">

            <div>
              <div className="mb-5 flex items-center gap-2">
                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-black tracking-[0.22em] text-violet-200">
                  ADMINISTRATION CENTER
                </span>
              </div>

              <h1 className="max-w-3xl text-4xl font-black leading-[1.05] tracking-[-0.04em] sm:text-5xl lg:text-6xl">
                Welcome,
                <br />
                <span className="text-violet-300">
                  Administrator.
                </span>
              </h1>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-violet-100/80 sm:text-base">
                Manage your entire RK EVENTRA marketplace from one
                powerful administration dashboard.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/admin/vendors"
                  className="rounded-xl bg-white px-5 py-3 text-sm font-black text-violet-700 shadow-xl transition hover:-translate-y-0.5 hover:bg-violet-50"
                >
                  Manage Marketplace →
                </Link>

                <Link
                  href="/admin/bookings"
                  className="rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-black text-white backdrop-blur transition hover:bg-white/15"
                >
                  View Bookings
                </Link>
              </div>
            </div>

            {/* ADMIN BADGE */}
            <div className="hidden lg:block">
              <div className="relative flex h-44 w-44 flex-col items-center justify-center rounded-[35px] border border-white/15 bg-white/10 shadow-2xl backdrop-blur-xl">
                <div className="text-5xl">👑</div>

                <div className="mt-3 text-xs font-black tracking-[0.25em] text-violet-200">
                  RK ADMIN
                </div>

                <div className="mt-2 flex items-center gap-2 text-[10px] font-bold text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  SECURE ACCESS
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* STATS */}
        <section className="mt-7">

          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black tracking-[0.25em] text-violet-600">
                OVERVIEW
              </p>
              <h2 className="mt-1 text-xl font-black tracking-tight">
                Marketplace Statistics
              </h2>
            </div>

            <div className="hidden text-xs font-semibold text-slate-400 sm:block">
              Live database statistics
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

            <StatCard
              icon="🏪"
              title="Total Vendors"
              value={stats.vendors}
              description="Registered event vendors"
              loading={loading}
              href="/admin/vendors"
            />

            <StatCard
              icon="🛠️"
              title="Total Services"
              value={stats.services}
              description="Services available"
              loading={loading}
              href="/admin/services"
            />

            <StatCard
              icon="👥"
              title="Total Customers"
              value={stats.customers}
              description="Registered customers"
              loading={loading}
              href="/admin/customers"
            />

            <StatCard
              icon="📋"
              title="Total Bookings"
              value={stats.bookings}
              description="Event bookings"
              loading={loading}
              href="/admin/bookings"
            />

          </div>
        </section>

        {/* QUICK MANAGEMENT */}
        <section className="mt-12">

          <div className="mb-6 flex items-end justify-between">
            <div>
              <p className="text-[10px] font-black tracking-[0.25em] text-violet-600">
                ADMINISTRATION
              </p>

              <h2 className="mt-1 text-2xl font-black tracking-tight">
                Quick Management
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Select an area to manage your marketplace.
              </p>
            </div>

            <div className="hidden rounded-full bg-white px-4 py-2 text-xs font-black text-slate-400 shadow-sm sm:block">
              04 AREAS
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">

            {management.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group relative overflow-hidden rounded-[25px] border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-violet-200 hover:shadow-xl hover:shadow-violet-100/60"
              >

                <div className="absolute right-0 top-0 h-32 w-32 translate-x-10 -translate-y-10 rounded-full bg-violet-50 transition group-hover:scale-150" />

                <div className="relative flex items-start justify-between">

                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-2xl">
                    {item.icon}
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black tracking-widest text-slate-300">
                      {item.number}
                    </span>

                    <span className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-400 transition group-hover:border-violet-200 group-hover:bg-violet-600 group-hover:text-white">
                      ↗
                    </span>
                  </div>

                </div>

                <div className="relative mt-7">
                  <h3 className="text-xl font-black tracking-tight transition group-hover:text-violet-700">
                    {item.title}
                  </h3>

                  <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                    {item.description}
                  </p>
                </div>

                <div className="relative mt-7 flex items-center gap-2 text-xs font-black text-violet-600">
                  Open Management
                  <span className="transition group-hover:translate-x-1">
                    →
                  </span>
                </div>

              </Link>
            ))}

          </div>
        </section>

        {/* OVERVIEW */}
        <section className="mt-12">

          <div className="overflow-hidden rounded-[27px] border border-slate-200 bg-white shadow-sm">

            <div className="flex flex-col justify-between gap-5 border-b border-slate-100 p-6 sm:flex-row sm:items-center lg:p-8">

              <div>
                <p className="text-[10px] font-black tracking-[0.25em] text-violet-600">
                  PLATFORM OVERVIEW
                </p>

                <h2 className="mt-1 text-2xl font-black tracking-tight">
                  Marketplace Overview
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Quickly access and manage every major area of RK EVENTRA.
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-sm font-black text-white shadow-lg shadow-violet-200">
                RK
              </div>

            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4">

              <OverviewItem
                href="/admin/vendors"
                icon="🏪"
                title="Vendors"
                value={stats.vendors}
                text="Registered vendors"
                loading={loading}
              />

              <OverviewItem
                href="/admin/services"
                icon="🛠️"
                title="Services"
                value={stats.services}
                text="Available services"
                loading={loading}
              />

              <OverviewItem
                href="/admin/customers"
                icon="👥"
                title="Customers"
                value={stats.customers}
                text="Registered customers"
                loading={loading}
              />

              <OverviewItem
                href="/admin/bookings"
                icon="📋"
                title="Bookings"
                value={stats.bookings}
                text="Event bookings"
                loading={loading}
              />

            </div>
          </div>
        </section>

        {/* SECURITY */}
        <section className="mt-7 rounded-[25px] border border-emerald-200 bg-gradient-to-r from-emerald-50 to-white p-6">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-xl">
              🔐
            </div>

            <div className="flex-1">
              <div className="text-xs font-black tracking-[0.18em] text-emerald-700">
                SECURE
              </div>

              <h3 className="mt-1 font-black text-slate-900">
                Administrator Access
              </h3>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                You are viewing the RK EVENTRA administration area.
                Handle customer, vendor and booking information responsibly.
              </p>
            </div>

            <div className="rounded-full bg-emerald-100 px-4 py-2 text-[10px] font-black text-emerald-700">
              PROTECTED
            </div>

          </div>
        </section>

        {/* FOOTER */}
        <footer className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 py-8 text-center sm:flex-row sm:text-left">

          <div>
            <div className="font-black text-violet-700">
              RK EVENTRA
            </div>

            <div className="text-xs text-slate-400">
              Admin Management System
            </div>
          </div>

          <div className="text-xs text-slate-400">
            © 2026 RK EVENTRA • Administration Center
          </div>

        </footer>

      </div>
    </main>
  );
}


/* =========================
   STAT CARD
========================= */

function StatCard({
  icon,
  title,
  value,
  description,
  loading,
  href,
}: {
  icon: string;
  title: string;
  value: number;
  description: string;
  loading: boolean;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-[23px] border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-violet-200 hover:shadow-xl hover:shadow-violet-100/50"
    >

      <div className="flex items-start justify-between">

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-xl transition group-hover:scale-105">
          {icon}
        </div>

        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 text-slate-400 transition group-hover:bg-violet-50 group-hover:text-violet-600">
          ↗
        </div>

      </div>

      <div className="mt-5 text-xs font-bold text-slate-400">
        {title}
      </div>

      <div className="mt-1 text-3xl font-black tracking-tight text-slate-900">
        {loading ? "—" : value}
      </div>

      <div className="mt-1 text-[11px] text-slate-400">
        {description}
      </div>

    </Link>
  );
}


/* =========================
   OVERVIEW ITEM
========================= */

function OverviewItem({
  href,
  icon,
  title,
  value,
  text,
  loading,
}: {
  href: string;
  icon: string;
  title: string;
  value: number;
  text: string;
  loading: boolean;
}) {
  return (
    <Link
      href={href}
      className="group border-b border-slate-100 p-6 transition hover:bg-violet-50/40 sm:border-r lg:border-b-0"
    >

      <div className="flex items-center justify-between">

        <div className="text-xl">
          {icon}
        </div>

        <div className="text-slate-300 transition group-hover:text-violet-500">
          ↗
        </div>

      </div>

      <div className="mt-5 text-sm font-black text-slate-800 group-hover:text-violet-700">
        {title}
      </div>

      <div className="mt-1 text-2xl font-black tracking-tight">
        {loading ? "—" : value}
      </div>

      <div className="mt-1 text-[11px] text-slate-400">
        {text}
      </div>

    </Link>
  );
}