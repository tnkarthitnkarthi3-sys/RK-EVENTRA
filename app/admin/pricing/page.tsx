"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DollarSign,
  Layers,
  Sparkles,
  Edit,
  Eye,
  Check,
  Archive,
  RefreshCw,
  Search,
  Plus,
  ArrowLeft,
  Calendar,
  Building,
  ShieldCheck,
  Tag,
  Percent,
} from "lucide-react";

type ServiceCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  defaultBasePrice: number;
  minPrice: number;
  maxPrice: number;
  active: boolean;
  isArchived: boolean;
  displayOrder: number;
};

type ServicePackage = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  basePrice: number;
  discountAmount: number;
  discountPercent: number;
  travelCharge: number;
  serviceFee: number;
  estimatedTotal: number;
  isPopular: boolean;
  isFeaturedOnHome: boolean;
  active: boolean;
  isArchived: boolean;
  lastModifiedRole: string;
  updatedAt: string;
  service: {
    id: string;
    name: string;
    category: string;
    price: number;
    vendor: {
      id: string;
      businessName: string;
      location: string | null;
    };
  };
};

export default function AdminPricingPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [packages, setPackages] = useState<ServicePackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  // Edit modal / drawer state
  const [editingPackage, setEditingPackage] = useState<ServicePackage | null>(null);
  const [previewPackage, setPreviewPackage] = useState<ServicePackage | null>(null);
  const [editingCategory, setEditingCategory] = useState<ServiceCategory | null>(null);
  const [saving, setSaving] = useState(false);

  // Form fields for package edit
  const [pkgForm, setPkgForm] = useState({
    name: "",
    description: "",
    basePrice: 0,
    discountAmount: 0,
    discountPercent: 0,
    travelCharge: 0,
    isPopular: false,
    isFeaturedOnHome: false,
    active: true,
  });

  // Form fields for category edit
  const [catForm, setCatForm] = useState({
    name: "",
    defaultBasePrice: 10000,
    minPrice: 5000,
    maxPrice: 150000,
    active: true,
  });

  async function loadPricingData() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/pricing");
      if (res.status === 401 || res.status === 403) {
        router.replace("/admin/login");
        return;
      }
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to load pricing data");
      }
      setCategories(data.categories || []);
      setPackages(data.packages || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error fetching pricing");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPricingData();
  }, []);

  function handleOpenPackageEdit(pkg: ServicePackage) {
    setEditingPackage(pkg);
    setPkgForm({
      name: pkg.name,
      description: pkg.description || "",
      basePrice: pkg.basePrice || pkg.price,
      discountAmount: pkg.discountAmount || 0,
      discountPercent: pkg.discountPercent || 0,
      travelCharge: pkg.travelCharge || 0,
      isPopular: pkg.isPopular,
      isFeaturedOnHome: pkg.isFeaturedOnHome,
      active: pkg.active,
    });
  }

  function handleOpenCategoryEdit(cat: ServiceCategory) {
    setEditingCategory(cat);
    setCatForm({
      name: cat.name,
      defaultBasePrice: cat.defaultBasePrice,
      minPrice: cat.minPrice,
      maxPrice: cat.maxPrice,
      active: cat.active,
    });
  }

  async function handleSavePackage(e: React.FormEvent) {
    e.preventDefault();
    if (!editingPackage) return;
    try {
      setSaving(true);
      setError(null);
      const res = await fetch("/api/admin/pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_PACKAGE",
          packageId: editingPackage.id,
          data: pkgForm,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to save package");
      }
      setSuccessMsg(`Package "${editingPackage.name}" pricing updated in database!`);
      setEditingPackage(null);
      loadPricingData();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error saving package");
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!editingCategory) return;
    try {
      setSaving(true);
      setError(null);
      const res = await fetch("/api/admin/pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_CATEGORY",
          categoryId: editingCategory.id,
          data: catForm,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to save category pricing");
      }
      setSuccessMsg(`Category "${editingCategory.name}" default pricing updated!`);
      setEditingCategory(null);
      loadPricingData();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error saving category");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleArchive(pkg: ServicePackage) {
    try {
      const confirmAction = confirm(`Are you sure you want to ${pkg.isArchived ? "restore" : "archive"} "${pkg.name}"?`);
      if (!confirmAction) return;
      const res = await fetch("/api/admin/pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_PACKAGE",
          packageId: pkg.id,
          data: {
            ...pkg,
            isArchived: !pkg.isArchived,
            active: pkg.isArchived ? true : false,
          },
        }),
      });
      if (res.ok) {
        loadPricingData();
      }
    } catch (err) {
      console.error(err);
    }
  }

  const filteredPackages = packages.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.service.vendor.businessName.toLowerCase().includes(search.toLowerCase()) ||
      p.service.category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      selectedCategory === "ALL" || p.service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col lg:flex-row">
      {/* SIDEBAR */}
      <aside className="w-full lg:w-64 bg-slate-900 border-b lg:border-b-0 lg:border-r border-slate-800 p-6 flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-black text-lg">
              RK
            </div>
            <div>
              <div className="text-lg font-black text-white">RK EVENTRA</div>
              <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Admin Control</div>
            </div>
          </Link>

          <nav className="space-y-1.5 text-xs font-semibold">
            <Link
              href="/admin/dashboard"
              className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-slate-400" />
              <span>Back to Dashboard</span>
            </Link>
            <Link
              href="/admin/pricing"
              className="flex items-center gap-2.5 p-2.5 rounded-xl bg-amber-500/10 text-amber-400 font-bold border border-amber-500/30"
            >
              <DollarSign className="w-4 h-4" />
              <span>Pricing & Packages</span>
            </Link>
            <Link
              href="/admin/settings"
              className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-slate-400" />
              <span>Business Settings</span>
            </Link>
            <Link
              href="/admin/vendors"
              className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
            >
              <Building className="w-4 h-4 text-slate-400" />
              <span>Vendor Approvals</span>
            </Link>
            <Link
              href="/admin/services"
              className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
            >
              <Layers className="w-4 h-4 text-slate-400" />
              <span>Catalog Services</span>
            </Link>
          </nav>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-6 lg:p-8 space-y-8 overflow-y-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-amber-400" />
              Pricing & Packages Management
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Control customer-facing rates, categories, promotional discounts, add-ons, and pricing rules.
            </p>
          </div>

          <button
            onClick={loadPricingData}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh Prices</span>
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

        {/* SECTION 1: SERVICE CATEGORY PRICING CONTROLS */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-400" />
              Service Categories & Base Price Thresholds
            </h2>
            <span className="text-xs text-slate-400">{categories.length} Event Categories</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/30 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-sm text-white">{cat.name}</h3>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        cat.active ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {cat.active ? "Active" : "Disabled"}
                    </span>
                  </div>
                  <div className="mt-3 space-y-1 text-xs text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Default Base:</span>
                      <span className="font-bold text-amber-400">₹{cat.defaultBasePrice?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Range:</span>
                      <span>₹{cat.minPrice?.toLocaleString()} – ₹{cat.maxPrice?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
                  <button
                    onClick={() => handleOpenCategoryEdit(cat)}
                    className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit Base Rates</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 2: SERVICE PACKAGES PRICING TABLE */}
        <section className="space-y-4 pt-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Tag className="w-5 h-5 text-amber-400" />
                Live Service Packages & Pricing Overrides
              </h2>
              <p className="text-xs text-slate-400">
                Directly configure base prices, discounts, travel add-ons, and featured packages.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search package, vendor..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="py-1.5 px-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="ALL">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/60 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">Package & Service</th>
                    <th className="p-3.5">Vendor</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Base Price</th>
                    <th className="p-3.5">Discount</th>
                    <th className="p-3.5">Travel Add-on</th>
                    <th className="p-3.5">Final Display Price</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {filteredPackages.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-6 text-center text-slate-500">
                        No service packages found.
                      </td>
                    </tr>
                  ) : (
                    filteredPackages.map((pkg) => (
                      <tr key={pkg.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="p-3.5">
                          <div className="font-bold text-white flex items-center gap-2">
                            <span>{pkg.name}</span>
                            {pkg.isFeaturedOnHome && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                Featured
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400">{pkg.service.name}</div>
                        </td>
                        <td className="p-3.5 font-medium text-slate-200">
                          {pkg.service.vendor.businessName}
                        </td>
                        <td className="p-3.5 text-slate-400">{pkg.service.category}</td>
                        <td className="p-3.5 font-bold text-slate-200">
                          ₹{(pkg.basePrice || pkg.price).toLocaleString()}
                        </td>
                        <td className="p-3.5 text-emerald-400 font-medium">
                          {pkg.discountAmount > 0
                            ? `-₹${pkg.discountAmount.toLocaleString()}`
                            : pkg.discountPercent > 0
                            ? `-${pkg.discountPercent}%`
                            : "—"}
                        </td>
                        <td className="p-3.5 text-slate-400">
                          {pkg.travelCharge > 0 ? `+₹${pkg.travelCharge.toLocaleString()}` : "—"}
                        </td>
                        <td className="p-3.5 font-black text-amber-400 text-sm">
                          ₹{pkg.price.toLocaleString()}
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                              pkg.isArchived
                                ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                : pkg.active
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : "bg-slate-800 text-slate-400"
                            }`}
                          >
                            {pkg.isArchived ? "Archived" : pkg.active ? "Published" : "Inactive"}
                          </span>
                        </td>
                        <td className="p-3.5 text-right space-x-2">
                          <button
                            onClick={() => setPreviewPackage(pkg)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                            title="Preview Customer View"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenPackageEdit(pkg)}
                            className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400"
                            title="Edit Pricing"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleToggleArchive(pkg)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400"
                            title={pkg.isArchived ? "Restore Package" : "Archive Package"}
                          >
                            <Archive className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>

      {/* EDIT PACKAGE MODAL */}
      {editingPackage && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-black text-white">Edit Package Pricing</h3>
                <p className="text-xs text-slate-400">
                  {editingPackage.service.vendor.businessName} • {editingPackage.service.category}
                </p>
              </div>
              <button
                onClick={() => setEditingPackage(null)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePackage} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300">Package Name</label>
                <input
                  type="text"
                  required
                  value={pkgForm.name}
                  onChange={(e) => setPkgForm({ ...pkgForm, name: e.target.value })}
                  className="mt-1 w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Base Price (₹)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={pkgForm.basePrice}
                    onChange={(e) => setPkgForm({ ...pkgForm, basePrice: Number(e.target.value) })}
                    className="mt-1 w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300">Discount Amount (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={pkgForm.discountAmount}
                    onChange={(e) => setPkgForm({ ...pkgForm, discountAmount: Number(e.target.value) })}
                    className="mt-1 w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Travel Charge (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={pkgForm.travelCharge}
                    onChange={(e) => setPkgForm({ ...pkgForm, travelCharge: Number(e.target.value) })}
                    className="mt-1 w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300">Calculated Final Price</label>
                  <div className="mt-1 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-black text-amber-400">
                    ₹{Math.max(0, pkgForm.basePrice - pkgForm.discountAmount + pkgForm.travelCharge).toLocaleString()}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Package Description</label>
                <textarea
                  rows={2}
                  value={pkgForm.description}
                  onChange={(e) => setPkgForm({ ...pkgForm, description: e.target.value })}
                  className="mt-1 w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <label className="flex items-center gap-2 text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={pkgForm.isFeaturedOnHome}
                    onChange={(e) => setPkgForm({ ...pkgForm, isFeaturedOnHome: e.target.checked })}
                    className="rounded bg-slate-950 border-slate-800 text-amber-500"
                  />
                  <span>Feature on Homepage</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={pkgForm.active}
                    onChange={(e) => setPkgForm({ ...pkgForm, active: e.target.checked })}
                    className="rounded bg-slate-950 border-slate-800 text-amber-500"
                  />
                  <span>Published to Customers</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingPackage(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs"
                >
                  {saving ? "Saving Price..." : "Publish Price Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT CATEGORY MODAL */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-black text-white">Edit Category Base Rates</h3>
                <p className="text-xs text-slate-400">{editingCategory.name}</p>
              </div>
              <button
                onClick={() => setEditingCategory(null)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300">Default Starting Base Price (₹)</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={catForm.defaultBasePrice}
                  onChange={(e) => setCatForm({ ...catForm, defaultBasePrice: Number(e.target.value) })}
                  className="mt-1 w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Min Price (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={catForm.minPrice}
                    onChange={(e) => setCatForm({ ...catForm, minPrice: Number(e.target.value) })}
                    className="mt-1 w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300">Max Price (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={catForm.maxPrice}
                    onChange={(e) => setCatForm({ ...catForm, maxPrice: Number(e.target.value) })}
                    className="mt-1 w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={catForm.active}
                    onChange={(e) => setCatForm({ ...catForm, active: e.target.checked })}
                    className="rounded bg-slate-950 border-slate-800 text-amber-500"
                  />
                  <span>Active in Customer Catalog</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs"
                >
                  {saving ? "Saving..." : "Save Category Rates"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CUSTOMER PREVIEW MODAL */}
      {previewPackage && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                Customer View Preview
              </span>
              <button
                onClick={() => setPreviewPackage(null)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                  {previewPackage.service.category}
                </span>
                <h4 className="mt-2 text-lg font-black text-white">{previewPackage.name}</h4>
                <p className="text-xs text-slate-400">{previewPackage.service.vendor.businessName}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Base Package:</span>
                  <span>₹{(previewPackage.basePrice || previewPackage.price).toLocaleString()}</span>
                </div>
                {previewPackage.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount:</span>
                    <span>-₹{previewPackage.discountAmount.toLocaleString()}</span>
                  </div>
                )}
                {previewPackage.travelCharge > 0 && (
                  <div className="flex justify-between text-slate-400">
                    <span>Travel Charges:</span>
                    <span>+₹{previewPackage.travelCharge.toLocaleString()}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-800 flex justify-between font-black text-sm text-white">
                  <span>Estimated Total:</span>
                  <span className="text-amber-400">₹{previewPackage.price.toLocaleString()}</span>
                </div>
              </div>

              <p className="text-xs text-slate-300 italic">
                {previewPackage.description || "Includes full setup, professional equipment, and onsite execution."}
              </p>

              <button
                onClick={() => setPreviewPackage(null)}
                className="w-full py-2.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs"
              >
                Looks Good — Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
