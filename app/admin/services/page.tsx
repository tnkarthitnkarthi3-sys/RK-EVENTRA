"use client";

import { useEffect, useState } from "react";

type Service = {
  id: string;
  name: string;
  description: string | null;
  category: string;
  price: number;
  vendor: {
    id: string;
    businessName: string;
    user: {
      name: string;
      email: string;
    };
  };
};

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState("");

  async function loadServices() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/services", {
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data?.message || "Failed to load services");
      }

      setServices(data.services || []);
    } catch (err) {
      console.error("Admin services error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load services"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadServices();
  }, []);

  async function deleteService(
    serviceId: string,
    serviceName: string
  ) {
    const confirmed = window.confirm(
      `Delete "${serviceName}"?\n\nThis service will be permanently removed.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(serviceId);

      const response = await fetch("/api/services", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          serviceId,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data?.message || "Failed to delete service"
        );
      }

      setServices((current) =>
        current.filter((service) => service.id !== serviceId)
      );

      alert("Service deleted successfully.");
    } catch (err) {
      console.error("Delete service error:", err);

      alert(
        err instanceof Error
          ? err.message
          : "Failed to delete service"
      );
    } finally {
      setDeletingId("");
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-2xl font-extrabold tracking-wide text-white">
              RK EVENTRA
            </h1>

            <p className="mt-1 text-sm text-purple-200">
              Admin • Manage Services
            </p>
          </div>

          <a
            href="/admin/dashboard"
            className="rounded-xl border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
          >
            ← Dashboard
          </a>
        </div>
      </header>

      {/* Main */}
      <section className="mx-auto max-w-7xl px-6 py-10">
        {/* Title */}
        <div className="mb-10">
          <div className="mb-3 inline-flex rounded-full border border-purple-300/20 bg-purple-400/10 px-4 py-2 text-sm font-semibold text-purple-200">
            🛠️ Service Management
          </div>

          <h2 className="text-4xl font-extrabold tracking-tight text-white">
            Manage Services
          </h2>

          <p className="mt-3 max-w-2xl text-gray-300">
            View all services added by vendors and manage
            the services available on RK EVENTRA.
          </p>
        </div>

        {/* Stats */}
        {!loading && !error && (
          <div className="mb-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/10 p-6 shadow-xl backdrop-blur-xl">
              <p className="text-sm font-medium text-gray-300">
                Total Services
              </p>

              <p className="mt-2 text-4xl font-extrabold text-white">
                {services.length}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/10 p-6 shadow-xl backdrop-blur-xl">
              <p className="text-sm font-medium text-gray-300">
                Categories
              </p>

              <p className="mt-2 text-4xl font-extrabold text-white">
                {
                  new Set(
                    services.map(
                      (service) => service.category
                    )
                  ).size
                }
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/10 p-6 shadow-xl backdrop-blur-xl">
              <p className="text-sm font-medium text-gray-300">
                Active Listings
              </p>

              <p className="mt-2 text-4xl font-extrabold text-green-400">
                {services.length}
              </p>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="rounded-3xl border border-white/10 bg-white/10 p-12 text-center shadow-xl backdrop-blur-xl">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-purple-400" />

            <p className="font-medium text-gray-300">
              Loading services...
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-3xl border border-red-400/20 bg-red-500/10 p-8 backdrop-blur-xl">
            <h3 className="text-xl font-bold text-red-300">
              Unable to load services
            </h3>

            <p className="mt-2 text-red-200">
              {error}
            </p>

            <button
              onClick={loadServices}
              className="mt-5 rounded-xl bg-white px-5 py-2.5 font-semibold text-gray-900 transition hover:bg-gray-200"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading &&
          !error &&
          services.length === 0 && (
            <div className="rounded-3xl border border-white/10 bg-white/10 p-14 text-center shadow-xl backdrop-blur-xl">
              <div className="text-6xl">🛠️</div>

              <h3 className="mt-5 text-2xl font-bold text-white">
                No services yet
              </h3>

              <p className="mx-auto mt-2 max-w-md text-gray-300">
                Vendors have not added any services yet.
                Once they add services, they will appear here.
              </p>
            </div>
          )}

        {/* Services */}
        {!loading &&
          !error &&
          services.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="group overflow-hidden rounded-3xl border border-white/10 bg-white/10 shadow-xl backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:bg-white/[0.14]"
                >
                  {/* Top */}
                  <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/10 p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="inline-flex rounded-full border border-purple-300/20 bg-purple-400/10 px-3 py-1 text-xs font-semibold text-purple-200">
                          {service.category}
                        </span>

                        <h3 className="mt-4 text-xl font-bold text-white">
                          {service.name}
                        </h3>
                      </div>

                      <div className="text-2xl">
                        🛠️
                      </div>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-6">
                    <p className="min-h-[60px] text-sm leading-6 text-gray-300">
                      {service.description ||
                        "Professional event service provided by this vendor."}
                    </p>

                    {/* Vendor */}
                    <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                        Vendor
                      </p>

                      <p className="mt-1 font-bold text-white">
                        {service.vendor.businessName}
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        {service.vendor.user.name}
                      </p>

                      <p className="mt-1 break-all text-xs text-gray-500">
                        {service.vendor.user.email}
                      </p>
                    </div>

                    {/* Price */}
                    <div className="mt-5 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-400">
                          Starting Price
                        </p>

                        <p className="mt-1 text-2xl font-extrabold text-green-400">
                          ₹
                          {service.price.toLocaleString(
                            "en-IN"
                          )}
                        </p>
                      </div>

                      <div className="rounded-xl bg-green-400/10 px-3 py-2 text-xs font-bold text-green-300">
                        ACTIVE
                      </div>
                    </div>

                    {/* Buttons */}
                    <div className="mt-6 flex gap-3">
                      <a
                        href={`/vendors/${service.vendor.id}`}
                        className="flex-1 rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-center text-sm font-bold text-white transition hover:bg-white/20"
                      >
                        View Vendor
                      </a>

                      <button
                        onClick={() =>
                          deleteService(
                            service.id,
                            service.name
                          )
                        }
                        disabled={
                          deletingId === service.id
                        }
                        className="rounded-xl bg-red-500/90 px-4 py-3 text-sm font-bold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {deletingId === service.id
                          ? "Deleting..."
                          : "🗑️ Delete"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/20 px-6 py-8 text-center">
        <p className="font-bold text-white">
          RK EVENTRA
        </p>

        <p className="mt-1 text-sm text-gray-400">
          Admin Service Management
        </p>

        <p className="mt-3 text-xs text-gray-500">
          © 2026 RK EVENTRA. All rights reserved.
        </p>
      </footer>
    </main>
  );
}