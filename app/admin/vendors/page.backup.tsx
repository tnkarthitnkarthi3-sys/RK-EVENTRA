"use client";

import { useEffect, useMemo, useState } from "react";

type VendorStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED";

type Vendor = {
  id: string;
  businessName: string;
  description: string | null;
  location: string | null;
  rating: number;
  status: VendorStatus;
  approvedAt: string | null;
  joinedAt: string;

  user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    createdAt: string;
  };

  services: {
    id: string;
    name: string;
    category: string;
    price: number;
  }[];
};

type Summary = {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  services: number;
};

export default function AdminVendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [summary, setSummary] = useState<Summary>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    services: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<"ALL" | VendorStatus>("ALL");

  const [selectedVendor, setSelectedVendor] =
    useState<Vendor | null>(null);

  async function loadVendors() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/admin/vendors",
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data?.message || "Failed to load vendors."
        );
      }

      setVendors(data.vendors || []);
      setSummary(
        data.summary || {
          total: 0,
          pending: 0,
          approved: 0,
          rejected: 0,
          services: 0,
        }
      );
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load vendors."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadVendors();
  }, []);

  const filteredVendors = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    return vendors.filter((vendor) => {
      const matchesSearch =
        !query ||
        vendor.businessName
          .toLowerCase()
          .includes(query) ||
        vendor.user.name
          .toLowerCase()
          .includes(query) ||
        vendor.user.email
          .toLowerCase()
          .includes(query) ||
        (vendor.location || "")
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "ALL" ||
        vendor.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [vendors, search, statusFilter]);

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  }

  function statusStyle(status: VendorStatus) {
    if (status === "APPROVED") {
      return "border-emerald-400/20 bg-emerald-500/10 text-emerald-300";
    }

    if (status === "REJECTED") {
      return "border-red-400/20 bg-red-500/10 text-red-300";
    }

    return "border-amber-400/20 bg-amber-500/10 text-amber-300";
  }

  return (
    <main className="min-h-screen bg-[#070611] text-white">

      {/* BACKGROUND */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-violet-600/10 blur-3xl" />

        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-fuchsia-600/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-8">

        {/* HEADER */}

        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

          <div>

            <div className="mb-3 flex items-center gap-2 text-sm text-slate-500">
              <a
                href="/admin/dashboard"
                className="transition hover:text-white"
              >
                Admin Control Center
              </a>

              <span>→</span>

              <span className="text-slate-300">
                Vendors
              </span>
            </div>

            <div className="flex items-center gap-4">

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 text-2xl shadow-xl shadow-fuchsia-500/20">
                🏪
              </div>

              <div>
                <h1 className="text-3xl font-black tracking-tight">
                  Vendor Management
                </h1>

                <p className="mt-1 text-sm text-slate-400">
                  Review, approve and manage your event professionals.
                </p>
              </div>

            </div>

          </div>

          <button
            onClick={loadVendors}
            disabled={loading}
            className="rounded-xl border border-white/10 bg-white/[0.05] px-5 py-3 text-sm font-bold transition hover:bg-white/10 disabled:opacity-50"
          >
            {loading ? "Refreshing..." : "↻ Refresh"}
          </button>

        </div>

        {/* STAT CARDS */}

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">

          <StatCard
            icon="🏪"
            title="Total Vendors"
            value={summary.total}
          />

          <StatCard
            icon="⏳"
            title="Pending"
            value={summary.pending}
          />

          <StatCard
            icon="✓"
            title="Approved"
            value={summary.approved}
          />

          <StatCard
            icon="✕"
            title="Rejected"
            value={summary.rejected}
          />

          <StatCard
            icon="🛠️"
            title="Services"
            value={summary.services}
          />

        </section>

        {/* MAIN PANEL */}

        <section className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] shadow-2xl shadow-black/20">

          {/* TOOLBAR */}

          <div className="border-b border-white/10 p-5">

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

              {/* SEARCH */}

              <div className="relative w-full lg:max-w-md">

                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
                  🔎
                </span>

                <input
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Search vendor, owner or email..."
                  className="w-full rounded-2xl border border-white/10 bg-black/20 py-3.5 pl-11 pr-4 text-sm outline-none placeholder:text-slate-600 focus:border-fuchsia-400/40 focus:ring-4 focus:ring-fuchsia-500/10"
                />

              </div>

              {/* FILTERS */}

              <div className="flex flex-wrap gap-2">

                {(
                  [
                    ["ALL", "All"],
                    ["PENDING", "Pending"],
                    ["APPROVED", "Approved"],
                    ["REJECTED", "Rejected"],
                  ] as const
                ).map(([value, label]) => (

                  <button
                    key={value}
                    onClick={() =>
                      setStatusFilter(value)
                    }
                    className={`rounded-xl px-4 py-2.5 text-xs font-bold transition ${
                      statusFilter === value
                        ? "bg-fuchsia-600 text-white shadow-lg shadow-fuchsia-600/20"
                        : "border border-white/10 bg-white/[0.04] text-slate-400 hover:bg-white/[0.08] hover:text-white"
                    }`}
                  >
                    {label}
                  </button>

                ))}

              </div>

            </div>

          </div>

          {/* ERROR */}

          {error && (

            <div className="m-5 rounded-2xl border border-red-400/20 bg-red-500/10 p-5">

              <div className="flex items-start gap-3">

                <span className="text-xl">
                  ⚠️
                </span>

                <div className="flex-1">

                  <h3 className="font-bold text-red-200">
                    Failed to load vendors
                  </h3>

                  <p className="mt-1 text-sm text-red-300/70">
                    {error}
                  </p>

                </div>

                <button
                  onClick={loadVendors}
                  className="rounded-xl bg-red-500/10 px-4 py-2 text-xs font-bold text-red-200 hover:bg-red-500/20"
                >
                  Try Again
                </button>

              </div>

            </div>

          )}

          {/* LOADING */}

          {loading && (

            <div className="space-y-3 p-5">

              {[1, 2, 3].map((item) => (

                <div
                  key={item}
                  className="h-24 animate-pulse rounded-2xl bg-white/[0.04]"
                />

              ))}

            </div>

          )}

          {/* EMPTY */}

          {!loading &&
            !error &&
            filteredVendors.length === 0 && (

              <div className="px-6 py-20 text-center">

                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-white/[0.05] text-4xl">
                  🏪
                </div>

                <h2 className="mt-5 text-xl font-black">
                  No vendors found
                </h2>

                <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                  {search || statusFilter !== "ALL"
                    ? "Try changing your search or filter."
                    : "Vendor registrations will appear here."}
                </p>

              </div>
            )}

          {/* DESKTOP TABLE */}

          {!loading &&
            !error &&
            filteredVendors.length > 0 && (

              <div className="hidden overflow-x-auto lg:block">

                <table className="w-full">

                  <thead>
                    <tr className="border-b border-white/10 text-left text-[11px] uppercase tracking-wider text-slate-500">

                      <th className="px-6 py-4">
                        Vendor
                      </th>

                      <th className="px-6 py-4">
                        Contact
                      </th>

                      <th className="px-6 py-4">
                        Services
                      </th>

                      <th className="px-6 py-4">
                        Status
                      </th>

                      <th className="px-6 py-4">
                        Joined
                      </th>

                      <th className="px-6 py-4 text-right">
                        Action
                      </th>

                    </tr>
                  </thead>

                  <tbody>

                    {filteredVendors.map(
                      (vendor) => (

                        <tr
                          key={vendor.id}
                          className="border-b border-white/[0.06] transition hover:bg-white/[0.025]"
                        >

                          {/* VENDOR */}

                          <td className="px-6 py-5">

                            <div className="flex items-center gap-3">

                              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 text-lg ring-1 ring-white/10">
                                🏪
                              </div>

                              <div>

                                <p className="font-bold">
                                  {vendor.businessName}
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                  {vendor.user.name}
                                </p>

                              </div>

                            </div>

                          </td>

                          {/* CONTACT */}

                          <td className="px-6 py-5">

                            <p className="text-sm text-slate-300">
                              {vendor.user.email}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {vendor.user.phone || "No phone"}
                            </p>

                          </td>

                          {/* SERVICES */}

                          <td className="px-6 py-5">

                            <span className="rounded-lg bg-white/[0.06] px-3 py-1.5 text-xs font-bold text-slate-300">
                              {vendor.services.length} services
                            </span>

                          </td>

                          {/* STATUS */}

                          <td className="px-6 py-5">

                            <span
                              className={`inline-flex rounded-full border px-3 py-1.5 text-[11px] font-black ${statusStyle(
                                vendor.status
                              )}`}
                            >
                              {vendor.status}
                            </span>

                          </td>

                          {/* DATE */}

                          <td className="px-6 py-5 text-sm text-slate-500">
                            {formatDate(
                              vendor.joinedAt
                            )}
                          </td>

                          {/* ACTION */}

                          <td className="px-6 py-5 text-right">

                            <button
                              onClick={() =>
                                setSelectedVendor(
                                  vendor
                                )
                              }
                              className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-bold transition hover:border-fuchsia-400/30 hover:bg-fuchsia-500/10 hover:text-fuchsia-200"
                            >
                              View Details →
                            </button>

                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>
            )}

          {/* MOBILE CARDS */}

          {!loading &&
            !error &&
            filteredVendors.length > 0 && (

              <div className="space-y-3 p-4 lg:hidden">

                {filteredVendors.map(
                  (vendor) => (

                    <div
                      key={vendor.id}
                      className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                    >

                      <div className="flex items-start justify-between gap-3">

                        <div className="flex gap-3">

                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-fuchsia-500/10">
                            🏪
                          </div>

                          <div>

                            <h3 className="font-bold">
                              {vendor.businessName}
                            </h3>

                            <p className="mt-1 text-xs text-slate-500">
                              {vendor.user.name}
                            </p>

                          </div>

                        </div>

                        <span
                          className={`rounded-full border px-2.5 py-1 text-[10px] font-black ${statusStyle(
                            vendor.status
                          )}`}
                        >
                          {vendor.status}
                        </span>

                      </div>

                      <div className="mt-4 space-y-2 text-xs text-slate-500">

                        <p>
                          ✉️ {vendor.user.email}
                        </p>

                        <p>
                          📍 {vendor.location || "Location not provided"}
                        </p>

                        <p>
                          🛠️ {vendor.services.length} services
                        </p>

                      </div>

                      <button
                        onClick={() =>
                          setSelectedVendor(
                            vendor
                          )
                        }
                        className="mt-4 w-full rounded-xl bg-white/[0.06] py-2.5 text-xs font-bold hover:bg-white/10"
                      >
                        View Vendor →
                      </button>

                    </div>

                  )
                )}

              </div>
            )}

        </section>

        {/* FOOTER INFO */}

        <div className="mt-5 flex flex-col gap-2 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between">

          <p>
            Showing {filteredVendors.length} of{" "}
            {vendors.length} vendors
          </p>

          <p>
            RK EVENTRA • Marketplace Operations
          </p>

        </div>

      </div>

      {/* DETAIL MODAL */}

      {selectedVendor && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-5 backdrop-blur-sm">

          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/10 bg-[#0d0b18] shadow-2xl">

            {/* MODAL HEADER */}

            <div className="flex items-start justify-between border-b border-white/10 p-6">

              <div className="flex items-center gap-4">

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 text-2xl">
                  🏪
                </div>

                <div>

                  <h2 className="text-xl font-black">
                    {selectedVendor.businessName}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {selectedVendor.user.name}
                  </p>

                </div>

              </div>

              <button
                onClick={() =>
                  setSelectedVendor(null)
                }
                className="rounded-xl bg-white/[0.05] px-3 py-2 text-slate-400 hover:bg-white/10 hover:text-white"
              >
                ✕
              </button>

            </div>

            {/* DETAILS */}

            <div className="space-y-6 p-6">

              <div className="grid gap-3 sm:grid-cols-2">

                <InfoBox
                  label="Email"
                  value={selectedVendor.user.email}
                />

                <InfoBox
                  label="Phone"
                  value={
                    selectedVendor.user.phone ||
                    "Not provided"
                  }
                />

                <InfoBox
                  label="Location"
                  value={
                    selectedVendor.location ||
                    "Not provided"
                  }
                />

                <InfoBox
                  label="Rating"
                  value={`⭐ ${selectedVendor.rating}`}
                />

                <InfoBox
                  label="Status"
                  value={selectedVendor.status}
                />

                <InfoBox
                  label="Joined"
                  value={formatDate(
                    selectedVendor.joinedAt
                  )}
                />

              </div>

              {/* DESCRIPTION */}

              <div>

                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  About Business
                </p>

                <p className="mt-2 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-6 text-slate-300">
                  {selectedVendor.description ||
                    "No business description provided."}
                </p>

              </div>

              {/* SERVICES */}

              <div>

                <div className="flex items-center justify-between">

                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Services
                  </p>

                  <span className="text-xs text-slate-600">
                    {selectedVendor.services.length} total
                  </span>

                </div>

                {selectedVendor.services.length === 0 ? (

                  <div className="mt-3 rounded-2xl border border-dashed border-white/10 p-5 text-center text-sm text-slate-600">
                    No services added yet.
                  </div>

                ) : (

                  <div className="mt-3 space-y-2">

                    {selectedVendor.services.map(
                      (service) => (

                        <div
                          key={service.id}
                          className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                        >

                          <div>

                            <p className="text-sm font-bold">
                              {service.name}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {service.category}
                            </p>

                          </div>

                          <p className="font-black text-fuchsia-300">
                            ₹
                            {service.price.toLocaleString(
                              "en-IN"
                            )}
                          </p>

                        </div>

                      )
                    )}

                  </div>

                )}

              </div>

            </div>

            {/* MODAL FOOTER */}

            <div className="border-t border-white/10 p-6">

              <button
                onClick={() =>
                  setSelectedVendor(null)
                }
                className="w-full rounded-2xl bg-white/[0.06] py-3 font-bold transition hover:bg-white/10"
              >
                Close
              </button>

            </div>

          </div>

        </div>
      )}

    </main>
  );
}

function StatCard({
  icon,
  title,
  value,
}: {
  icon: string;
  title: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 transition hover:-translate-y-0.5 hover:bg-white/[0.05]">

      <div className="flex items-center justify-between">

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.06] text-lg">
          {icon}
        </div>

        <span className="text-2xl font-black">
          {value}
        </span>

      </div>

      <p className="mt-4 text-xs font-bold uppercase tracking-wider text-slate-500">
        {title}
      </p>

    </div>
  );
}

function InfoBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">

      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
        {label}
      </p>

      <p className="mt-2 break-words text-sm font-semibold text-slate-300">
        {value}
      </p>

    </div>
  );
}