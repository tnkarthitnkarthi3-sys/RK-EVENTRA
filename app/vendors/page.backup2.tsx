"use client";

import { useEffect, useMemo, useState } from "react";

type Service = {
  id: string;
  name: string;
  description?: string | null;
  category: string;
  price: number;
};

type Portfolio = {
  id: string;
  imageUrl: string;
  title?: string | null;
};

type Vendor = {
  id: string;
  businessName: string;
  description?: string | null;
  location?: string | null;
  rating: number;
  status: string;
  services: Service[];
  portfolios: Portfolio[];
  serviceCount: number;
  portfolioCount: number;
};

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");

  async function loadVendors() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/vendors", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || !data?.success) {
        throw new Error(
          data?.message || "Failed to load vendors"
        );
      }

      setVendors(
        Array.isArray(data.vendors)
          ? data.vendors
          : []
      );
    } catch (err) {
      console.error("VENDORS PAGE ERROR:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load vendors"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadVendors();
  }, []);

  const categories = useMemo(() => {
    const values = vendors.flatMap((vendor) =>
      vendor.services.map(
        (service) => service.category
      )
    );

    return ["ALL", ...Array.from(new Set(values))];
  }, [vendors]);

  const filteredVendors = useMemo(() => {
    const query = search.trim().toLowerCase();

    return vendors.filter((vendor) => {
      const matchesCategory =
        category === "ALL" ||
        vendor.services.some(
          (service) =>
            service.category === category
        );

      const searchableText = [
        vendor.businessName,
        vendor.description,
        vendor.location,
        ...vendor.services.flatMap((service) => [
          service.name,
          service.category,
          service.description,
        ]),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !query ||
        searchableText.includes(query);

      return (
        matchesCategory &&
        matchesSearch
      );
    });
  }, [vendors, search, category]);

  return (
    <main className="min-h-screen bg-slate-50">
      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <a
            href="/"
            className="text-xl font-black tracking-tight text-slate-900"
          >
            RK <span className="text-violet-600">EVENTRA</span>
          </a>

          <a
            href="/"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
          >
            ← Home
          </a>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        {/* HERO */}
        <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-violet-700 via-purple-700 to-fuchsia-600 px-7 py-10 text-white shadow-xl sm:px-10 sm:py-14">
          <div className="relative z-10 max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-violet-200">
              RK EVENTRA Marketplace
            </p>

            <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
              Find the perfect
              <br />
              event professionals
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-violet-100 sm:text-base">
              Discover trusted event vendors for
              weddings, birthdays, receptions,
              corporate events and more.
            </p>
          </div>

          <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-white/10" />
          <div className="absolute -bottom-32 right-20 h-80 w-80 rounded-full bg-white/10" />

          <div className="absolute right-8 top-8 hidden text-7xl opacity-20 lg:block">
            🎉
          </div>
        </section>

        {/* SEARCH */}
        <section className="relative z-20 -mt-7 px-4 sm:px-10">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xl">
                🔎
              </span>

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search vendors, services, categories..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 text-sm font-medium outline-none transition focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-100"
              />
            </div>

            {/* CATEGORY FILTER */}
            <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
              {categories.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() =>
                    setCategory(item)
                  }
                  className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                    category === item
                      ? "bg-violet-600 text-white shadow-md"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {item === "ALL"
                    ? "All Services"
                    : item}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* TITLE */}
        <section className="mt-10">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-wider text-violet-600">
                Trusted Professionals
              </p>

              <h2 className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl">
                Explore Event Vendors
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {loading
                  ? "Finding vendors..."
                  : `${filteredVendors.length} approved vendor${
                      filteredVendors.length === 1
                        ? ""
                        : "s"
                    } available`}
              </p>
            </div>
          </div>
        </section>

        {/* LOADING */}
        {loading && (
          <div className="mt-7 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="animate-pulse overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="h-48 bg-slate-200" />

                <div className="space-y-4 p-6">
                  <div className="h-5 w-2/3 rounded bg-slate-200" />
                  <div className="h-4 w-full rounded bg-slate-200" />
                  <div className="h-4 w-1/2 rounded bg-slate-200" />
                  <div className="h-11 w-full rounded-xl bg-slate-200" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div className="mt-7 rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
            <div className="text-5xl">⚠️</div>

            <h3 className="mt-4 text-xl font-black text-red-700">
              Unable to load vendors
            </h3>

            <p className="mt-2 text-sm text-red-600">
              {error}
            </p>

            <button
              type="button"
              onClick={loadVendors}
              className="mt-5 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* EMPTY */}
        {!loading &&
          !error &&
          filteredVendors.length === 0 && (
            <div className="mt-7 rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
              <div className="text-6xl">🔍</div>

              <h3 className="mt-4 text-xl font-black text-slate-900">
                No vendors found
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Try another vendor name,
                service or category.
              </p>

              {(search || category !== "ALL") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setCategory("ALL");
                  }}
                  className="mt-5 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-violet-700"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}

        {/* VENDOR GRID */}
        {!loading &&
          !error &&
          filteredVendors.length > 0 && (
            <div className="mt-7 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredVendors.map((vendor) => {
                const firstService =
                  vendor.services[0];

                return (
                  <article
                    key={vendor.id}
                    className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-2xl"
                  >
                    {/* IMAGE AREA */}
                    <div className="relative h-52 overflow-hidden bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-500">
                      {vendor.portfolios[0]
                        ?.imageUrl ? (
                        <img
                          src={
                            vendor.portfolios[0]
                              .imageUrl
                          }
                          alt={
                            vendor.portfolios[0]
                              .title ||
                            vendor.businessName
                          }
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <span className="text-7xl opacity-90">
                            🏪
                          </span>
                        </div>
                      )}

                      {/* APPROVED */}
                      <div className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-xs font-black text-emerald-700 shadow-lg">
                        ✓ Verified Vendor
                      </div>

                      {/* RATING */}
                      <div className="absolute right-4 top-4 rounded-full bg-slate-950/70 px-3 py-1.5 text-xs font-black text-white backdrop-blur">
                        ⭐{" "}
                        {Number(
                          vendor.rating || 0
                        ).toFixed(1)}
                      </div>

                      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent" />
                    </div>

                    {/* CONTENT */}
                    <div className="p-6">
                      <h3 className="text-xl font-black text-slate-900">
                        {vendor.businessName}
                      </h3>

                      <p className="mt-1 text-sm font-medium text-slate-500">
                        👤{" "}
                        {firstService?.category ||
                          "Event Services"}
                      </p>

                      <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-600">
                        {vendor.description ||
                          "Professional event services for your special occasions."}
                      </p>

                      {/* LOCATION */}
                      <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
                        <span>📍</span>

                        <span>
                          {vendor.location ||
                            "Location not provided"}
                        </span>
                      </div>

                      {/* SERVICE */}
                      {firstService && (
                        <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-xs font-black uppercase tracking-wide text-violet-600">
                                Featured Service
                              </p>

                              <p className="mt-1 truncate font-bold text-slate-900">
                                {firstService.name}
                              </p>

                              <p className="mt-1 text-xs text-slate-500">
                                {firstService.category}
                              </p>
                            </div>

                            <div className="shrink-0 text-right">
                              <p className="text-xs text-slate-400">
                                Starting
                              </p>

                              <p className="font-black text-slate-900">
                                ₹
                                {Number(
                                  firstService.price
                                ).toLocaleString(
                                  "en-IN"
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* SERVICE COUNT */}
                      <div className="mt-4 flex items-center justify-between text-sm">
                        <span className="font-semibold text-slate-500">
                          🛠️{" "}
                          {vendor.serviceCount}{" "}
                          service
                          {vendor.serviceCount ===
                          1
                            ? ""
                            : "s"}
                        </span>

                        {vendor.portfolioCount >
                          0 && (
                          <span className="font-semibold text-slate-500">
                            📸{" "}
                            {
                              vendor.portfolioCount
                            }{" "}
                            portfolio
                            {vendor.portfolioCount ===
                            1
                              ? ""
                              : "s"}
                          </span>
                        )}
                      </div>

                      {/* ACTION */}
                      <a
                        href={`/vendors/${vendor.id}`}
                        className="mt-5 flex w-full items-center justify-center rounded-xl bg-violet-600 px-5 py-3 text-sm font-black text-white shadow-md transition hover:bg-violet-700 hover:shadow-lg"
                      >
                        View Vendor
                        <span className="ml-2 transition group-hover:translate-x-1">
                          →
                        </span>
                      </a>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

        {/* FOOTER */}
        <footer className="mt-12 border-t border-slate-200 py-8 text-center">
          <p className="font-black text-slate-800">
            RK EVENTRA
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Discover • Compare • Book
          </p>
        </footer>
      </div>
    </main>
  );
}