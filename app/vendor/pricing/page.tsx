"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DollarSign,
  Building,
  Save,
  ArrowLeft,
  RefreshCw,
  Plus,
  Edit,
  Tag,
  Package,
} from "lucide-react";

type Service = {
  id: string;
  name: string;
  category: string;
  price: number;
  packages: {
    id: string;
    name: string;
    description: string | null;
    price: number;
    basePrice: number;
    discountAmount: number;
    travelCharge: number;
    active: boolean;
  }[];
};

export default function VendorPricingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [services, setServices] = useState<Service[]>([]);

  // Edit package state
  const [editingPkg, setEditingPkg] = useState<any | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    basePrice: 0,
    discountAmount: 0,
    travelCharge: 0,
    active: true,
  });

  async function loadData() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/vendor/pricing", { credentials: "include" });
      if (res.status === 401 || res.status === 403) {
        router.replace("/login");
        return;
      }
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to load pricing");
      }
      setServices(data.services || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading services");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function handleOpenEdit(pkg: any) {
    setEditingPkg(pkg);
    setForm({
      name: pkg.name,
      description: pkg.description || "",
      basePrice: pkg.basePrice || pkg.price,
      discountAmount: pkg.discountAmount || 0,
      travelCharge: pkg.travelCharge || 0,
      active: pkg.active,
    });
  }

  async function handleSavePackage(e: React.FormEvent) {
    e.preventDefault();
    if (!editingPkg) return;
    try {
      setSaving(true);
      setError(null);
      const res = await fetch("/api/vendor/pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          action: "UPDATE_PACKAGE",
          packageId: editingPkg.id,
          data: form,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update package");
      }
      setSuccessMsg(`Package "${editingPkg.name}" updated successfully!`);
      setEditingPkg(null);
      loadData();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error saving package");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col lg:flex-row">
      <aside className="w-full lg:w-64 bg-slate-900 border-b lg:border-b-0 lg:border-r border-slate-800 p-6 flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          <Link href="/vendor-dashboard" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-black text-lg">
              RK
            </div>
            <div>
              <div className="text-lg font-black text-white">RK EVENTRA</div>
              <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Vendor Partner</div>
            </div>
          </Link>

          <nav className="space-y-1.5 text-xs font-semibold">
            <Link
              href="/vendor-dashboard"
              className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-slate-400" />
              <span>Back to Overview</span>
            </Link>
            <Link
              href="/vendor/profile"
              className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
            >
              <Building className="w-4 h-4 text-slate-400" />
              <span>Edit Business Profile</span>
            </Link>
            <Link
              href="/vendor/pricing"
              className="flex items-center gap-2.5 p-2.5 rounded-xl bg-amber-500/10 text-amber-400 font-bold border border-amber-500/30"
            >
              <DollarSign className="w-4 h-4" />
              <span>Services & Pricing</span>
            </Link>
          </nav>
        </div>
      </aside>

      <main className="flex-1 p-6 lg:p-8 space-y-8 overflow-y-auto max-w-5xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-amber-400" />
              Vendor Packages & Pricing
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Configure your service prices, tiered packages, travel charges, and promotional offers.
            </p>
          </div>

          <button
            onClick={loadData}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Reload</span>
          </button>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm font-semibold">
            {successMsg}
          </div>
        )}

        <div className="space-y-6">
          {services.map((svc) => (
            <div key={svc.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                    {svc.category}
                  </span>
                  <h3 className="text-lg font-black text-white mt-1">{svc.name}</h3>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400">Current Display Price:</span>
                  <p className="text-base font-black text-amber-400">₹{svc.price.toLocaleString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                {svc.packages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-bold text-sm text-white">{pkg.name}</h4>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                            pkg.active ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-800 text-slate-400"
                          }`}
                        >
                          {pkg.active ? "Active" : "Hidden"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">{pkg.description || "—"}</p>
                      <div className="mt-4 pt-3 border-t border-slate-800/60 space-y-1 text-xs">
                        <div className="flex justify-between text-slate-400">
                          <span>Base:</span>
                          <span>₹{(pkg.basePrice || pkg.price).toLocaleString()}</span>
                        </div>
                        {pkg.discountAmount > 0 && (
                          <div className="flex justify-between text-emerald-400">
                            <span>Discount:</span>
                            <span>-₹{pkg.discountAmount.toLocaleString()}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-black text-amber-400 pt-1">
                          <span>Total:</span>
                          <span>₹{pkg.price.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenEdit(pkg)}
                      className="mt-4 w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs flex items-center justify-center gap-1.5"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit Price</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* EDIT MODAL */}
      {editingPkg && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-black text-white">Edit Package: {editingPkg.name}</h3>
              <button onClick={() => setEditingPkg(null)} className="text-slate-400 hover:text-white font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePackage} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300">Package Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="mt-1 w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Base Price (₹)</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={form.basePrice}
                    onChange={(e) => setForm({ ...form, basePrice: Number(e.target.value) })}
                    className="mt-1 w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300">Discount (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={form.discountAmount}
                    onChange={(e) => setForm({ ...form, discountAmount: Number(e.target.value) })}
                    className="mt-1 w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Travel Charge (₹)</label>
                <input
                  type="number"
                  min={0}
                  value={form.travelCharge}
                  onChange={(e) => setForm({ ...form, travelCharge: Number(e.target.value) })}
                  className="mt-1 w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Description</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="mt-1 w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingPkg(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-bold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs"
                >
                  {saving ? "Saving..." : "Save Price"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
