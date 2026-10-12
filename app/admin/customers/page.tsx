"use client";

import { useEffect, useMemo, useState } from "react";

type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  createdAt: string;
};

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [selectedCustomer, setSelectedCustomer] =
    useState<Customer | null>(null);

  const [blockedCustomers, setBlockedCustomers] = useState<string[]>([]);
  const [deleteCustomer, setDeleteCustomer] =
    useState<Customer | null>(null);

  async function loadCustomers(showRefresh = false) {
    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const response = await fetch("/api/auth/customers", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || !data?.success) {
        throw new Error(
          data?.message || "Failed to load customers"
        );
      }

      setCustomers(Array.isArray(data.customers) ? data.customers : []);
    } catch (err) {
      console.error("Admin customers error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load customers"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadCustomers();
  }, []);

  const filteredCustomers = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return customers;
    }

    return customers.filter((customer) => {
      return (
        customer.name.toLowerCase().includes(value) ||
        customer.email.toLowerCase().includes(value) ||
        (customer.phone || "").toLowerCase().includes(value) ||
        customer.id.toLowerCase().includes(value)
      );
    });
  }, [customers, search]);

  function toggleBlock(customerId: string) {
    setBlockedCustomers((current) => {
      if (current.includes(customerId)) {
        return current.filter((id) => id !== customerId);
      }

      return [...current, customerId];
    });
  }

  function confirmDelete() {
    if (!deleteCustomer) return;

    setCustomers((current) =>
      current.filter((customer) => customer.id !== deleteCustomer.id)
    );

    setDeleteCustomer(null);

    if (selectedCustomer?.id === deleteCustomer.id) {
      setSelectedCustomer(null);
    }
  }

  function getInitial(name: string) {
    return name?.trim()?.charAt(0)?.toUpperCase() || "U";
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <main className="min-h-screen bg-slate-100">
      {/* HEADER */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-violet-600">
              Admin Panel
            </p>

            <h1 className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl">
              Customer Management
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage registered RK EVENTRA customers.
            </p>
          </div>

          <a
            href="/admin/dashboard"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            ← Dashboard
          </a>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-7 sm:px-8 sm:py-9">
        {/* HERO */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-700 via-purple-700 to-fuchsia-600 p-7 text-white shadow-xl sm:p-9">
          <div className="relative z-10">
            <p className="text-sm font-bold uppercase tracking-widest text-violet-200">
              👥 Customer Management
            </p>

            <h2 className="mt-2 text-3xl font-black sm:text-4xl">
              Manage Your Customers
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-violet-100 sm:text-base">
              View registered customers, search accounts and monitor
              your RK EVENTRA customer community.
            </p>
          </div>

          <div className="absolute -right-12 -top-20 h-56 w-56 rounded-full bg-white/10" />
          <div className="absolute -bottom-24 right-28 h-64 w-64 rounded-full bg-white/10" />
        </section>

        {/* STATS */}
        <section className="mt-7 grid gap-5 md:grid-cols-3">
          <StatCard
            title="Total Customers"
            value={loading ? "..." : customers.length}
            description="Registered customers"
            icon="👥"
          />

          <StatCard
            title="Search Results"
            value={loading ? "..." : filteredCustomers.length}
            description="Customers matching search"
            icon="🔍"
          />

          <StatCard
            title="Marketplace"
            value="Active"
            description="RK EVENTRA marketplace"
            icon="●"
          />
        </section>

        {/* CUSTOMER DIRECTORY */}
        <section className="mt-9">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-violet-600">
                Registered Users
              </p>

              <h2 className="mt-1 text-2xl font-black text-slate-900">
                Customer Directory
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Search and manage all registered customers.
              </p>
            </div>

            <button
              onClick={() => loadCustomers(true)}
              disabled={refreshing}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
            >
              {refreshing ? "Refreshing..." : "↻ Refresh"}
            </button>
          </div>

          {/* SEARCH */}
          <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">
                🔍
              </span>

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name, email, phone or customer ID..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-100"
              />
            </div>
          </div>

          {/* LOADING */}
          {loading && (
            <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-violet-100 text-2xl">
                ⏳
              </div>

              <h3 className="mt-4 text-lg font-black text-slate-900">
                Loading customers...
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Please wait while we load the customer directory.
              </p>
            </div>
          )}

          {/* ERROR */}
          {!loading && error && (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-7">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 text-xl">
                  ⚠️
                </div>

                <div>
                  <h3 className="font-black text-red-800">
                    Unable to load customers
                  </h3>

                  <p className="mt-1 text-sm text-red-600">
                    {error}
                  </p>

                  <button
                    onClick={() => loadCustomers()}
                    className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-700"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* EMPTY */}
          {!loading &&
            !error &&
            filteredCustomers.length === 0 && (
              <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-3xl">
                  👥
                </div>

                <h3 className="mt-5 text-xl font-black text-slate-900">
                  {search
                    ? "No customers found"
                    : "No customers yet"}
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  {search
                    ? "Try another name, email, phone or ID."
                    : "Registered customers will appear here."}
                </p>
              </div>
            )}

          {/* CUSTOMER CARDS */}
          {!loading &&
            !error &&
            filteredCustomers.length > 0 && (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {filteredCustomers.map((customer) => {
                  const isBlocked = blockedCustomers.includes(
                    customer.id
                  );

                  return (
                    <div
                      key={customer.id}
                      className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                    >
                      {/* CARD TOP */}
                      <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 text-white">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-xl font-black shadow-lg">
                              {getInitial(customer.name)}
                            </div>

                            <div>
                              <h3 className="text-lg font-black">
                                {customer.name}
                              </h3>

                              <p className="mt-1 text-xs text-slate-400">
                                Customer
                              </p>
                            </div>
                          </div>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${
                              isBlocked
                                ? "bg-red-500/20 text-red-300"
                                : "bg-emerald-500/20 text-emerald-300"
                            }`}
                          >
                            ●{" "}
                            {isBlocked
                              ? "Blocked"
                              : "Active"}
                          </span>
                        </div>
                      </div>

                      {/* CARD BODY */}
                      <div className="p-6">
                        <div className="space-y-4">
                          <InfoRow
                            icon="📧"
                            label="Email"
                            value={customer.email}
                          />

                          <InfoRow
                            icon="📞"
                            label="Phone"
                            value={
                              customer.phone ||
                              "Not provided"
                            }
                          />

                          <InfoRow
                            icon="📅"
                            label="Joined"
                            value={formatDate(
                              customer.createdAt
                            )}
                          />
                        </div>

                        <div className="mt-5 rounded-2xl bg-slate-50 p-3">
                          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            Customer ID
                          </p>

                          <p className="mt-1 break-all font-mono text-xs text-slate-600">
                            {customer.id}
                          </p>
                        </div>

                        {/* ACTIONS */}
                        <div className="mt-5 grid grid-cols-2 gap-3">
                          <button
                            onClick={() =>
                              setSelectedCustomer(customer)
                            }
                            className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-violet-700"
                          >
                            👁️ View Details
                          </button>

                          <button
                            onClick={() =>
                              toggleBlock(customer.id)
                            }
                            className={`rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                              isBlocked
                                ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                : "bg-orange-50 text-orange-700 hover:bg-orange-100"
                            }`}
                          >
                            {isBlocked
                              ? "✓ Unblock"
                              : "🚫 Block"}
                          </button>
                        </div>

                        <button
                          onClick={() =>
                            setDeleteCustomer(customer)
                          }
                          className="mt-3 w-full rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-100"
                        >
                          🗑️ Remove Customer
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
        </section>

        {/* FOOTER */}
        <footer className="mt-12 border-t border-slate-200 pt-6 text-center">
          <p className="font-bold text-slate-700">
            RK EVENTRA
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Admin Management System • © 2026 RK EVENTRA
          </p>
        </footer>
      </div>

      {/* VIEW DETAILS MODAL */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="bg-gradient-to-r from-violet-700 to-fuchsia-600 p-7 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 text-xl font-black">
                    {getInitial(selectedCustomer.name)}
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-violet-200">
                      Customer Profile
                    </p>

                    <h2 className="mt-1 text-2xl font-black">
                      {selectedCustomer.name}
                    </h2>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-xl transition hover:bg-white/20"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="space-y-4 p-7">
              <DetailRow
                label="Customer Name"
                value={selectedCustomer.name}
              />

              <DetailRow
                label="Email Address"
                value={selectedCustomer.email}
              />

              <DetailRow
                label="Phone Number"
                value={
                  selectedCustomer.phone ||
                  "Not provided"
                }
              />

              <DetailRow
                label="Joined Date"
                value={formatDate(
                  selectedCustomer.createdAt
                )}
              />

              <DetailRow
                label="Customer ID"
                value={selectedCustomer.id}
              />

              <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    Account Status
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Current marketplace access
                  </p>
                </div>

                <span
                  className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                    blockedCustomers.includes(
                      selectedCustomer.id
                    )
                      ? "bg-red-100 text-red-700"
                      : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  ●{" "}
                  {blockedCustomers.includes(
                    selectedCustomer.id
                  )
                    ? "Blocked"
                    : "Active"}
                </span>
              </div>

              <button
                onClick={() => setSelectedCustomer(null)}
                className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-2xl">
              🗑️
            </div>

            <h2 className="mt-5 text-2xl font-black text-slate-900">
              Remove Customer?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Are you sure you want to remove{" "}
              <strong className="text-slate-900">
                {deleteCustomer.name}
              </strong>{" "}
              from this customer list?
            </p>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setDeleteCustomer(null)}
                className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                onClick={confirmDelete}
                className="flex-1 rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white hover:bg-red-700"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function StatCard({
  title,
  value,
  description,
  icon,
}: {
  title: string;
  value: number | string;
  description: string;
  icon: string;
}) {
  return (
    <div className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-4xl font-black text-slate-900">
            {value}
          </p>

          <p className="mt-2 text-xs text-slate-400">
            {description}
          </p>
        </div>

        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-100 to-fuchsia-100 text-2xl transition group-hover:scale-110">
          {icon}
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          {label}
        </p>

        <p className="mt-1 break-all text-sm font-semibold text-slate-700">
          {value}
        </p>
      </div>
    </div>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1 break-all text-sm font-semibold text-slate-800">
        {value}
      </p>
    </div>
  );
}