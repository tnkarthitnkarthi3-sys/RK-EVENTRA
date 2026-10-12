"use client";

import React, { useEffect, useMemo, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/src/components/layout/Navbar";
import Footer from "@/src/components/layout/Footer";
import RKVendorCard, { VendorCardData } from "@/src/components/ai/RKVendorCard";
import RKComparisonModal from "@/src/components/ai/RKComparisonModal";
import {
  Search,
  Filter,
  SlidersHorizontal,
  MapPin,
  IndianRupee,
  Star,
  CheckCircle,
  ArrowUpDown,
  Sparkles,
  Bot,
  Scale,
} from "lucide-react";

const allCategories = [
  "All",
  "DJ and Entertainment",
  "Audio and Sound Systems",
  "Lighting Systems",
  "Wedding Decoration",
  "Stage Decoration",
  "Photography",
  "Videography",
  "Catering",
  "Makeup and Styling",
  "Flower Decoration",
  "Generator Services",
  "Event Planning",
  "Furniture and Seating",
  "Other Event Services",
];

const locationsList = ["All", "Chengalpattu", "Chennai", "Tambaram", "Kanchipuram", "Coimbatore", "Madurai"];

function VendorsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const queryParam = searchParams.get("q") || "";
  const catParam = searchParams.get("category") || "All";

  const [vendors, setVendors] = useState<VendorCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(queryParam);
  const [category, setCategory] = useState(catParam);
  const [location, setLocation] = useState("All");
  const [maxBudget, setMaxBudget] = useState(100000);
  const [sortBy, setSortBy] = useState<"rating" | "price-asc" | "price-desc">("rating");
  const [comparedVendors, setComparedVendors] = useState<VendorCardData[]>([]);
  const [showComparisonModal, setShowComparisonModal] = useState(false);

  useEffect(() => {
    if (queryParam) {
      setSearch(queryParam);
      // Auto-extract category or location if query matches
      const lower = queryParam.toLowerCase();
      if (lower.includes("dj")) setCategory("DJ and Entertainment");
      if (lower.includes("chengalpattu")) setLocation("Chengalpattu");
      if (lower.includes("15000")) setMaxBudget(15000);
    }
    if (catParam && catParam !== "All") {
      setCategory(catParam);
    }
  }, [queryParam, catParam]);

  useEffect(() => {
    async function loadVendors() {
      try {
        const response = await fetch("/api/vendors", { cache: "no-store" });
        const data = await response.json();
        if (data.success && Array.isArray(data.vendors)) {
          // Transform to card data with computed minPrice
          const mapped = data.vendors.map((v: any) => {
            const prices = v.services?.map((s: any) => s.price) || [0];
            const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
            return {
              ...v,
              minPrice,
              reviewCount: 12,
            };
          });
          setVendors(mapped);
        }
      } catch (error) {
        console.error("Vendor loading error:", error);
      } finally {
        setLoading(false);
      }
    }
    loadVendors();
  }, []);

  const handleCompareToggle = (vendor: VendorCardData) => {
    if (comparedVendors.some((v) => v.id === vendor.id)) {
      setComparedVendors((prev) => prev.filter((v) => v.id !== vendor.id));
    } else {
      if (comparedVendors.length >= 3) {
        alert("You can compare up to 3 vendors simultaneously.");
        return;
      }
      setComparedVendors((prev) => [...prev, vendor]);
      setShowComparisonModal(true);
    }
  };

  const filteredVendors = useMemo(() => {
    return vendors
      .filter((vendor) => {
        // Search text check
        const text = `
          ${vendor.businessName}
          ${vendor.description || ""}
          ${vendor.location || ""}
          ${vendor.services.map((s) => `${s.name} ${s.category}`).join(" ")}
        `.toLowerCase();

        const matchesSearch = !search || text.includes(search.toLowerCase());

        // Category check
        const matchesCategory =
          category === "All" ||
          vendor.services.some(
            (s) =>
              s.category.toLowerCase().includes(category.toLowerCase()) ||
              category.toLowerCase().includes(s.category.toLowerCase())
          );

        // Location check
        const matchesLocation =
          location === "All" ||
          (vendor.location && vendor.location.toLowerCase().includes(location.toLowerCase()));

        // Budget check
        const matchesBudget = vendor.minPrice <= maxBudget;

        return matchesSearch && matchesCategory && matchesLocation && matchesBudget;
      })
      .sort((a, b) => {
        if (sortBy === "rating") return b.rating - a.rating;
        if (sortBy === "price-asc") return a.minPrice - b.minPrice;
        if (sortBy === "price-desc") return b.minPrice - a.minPrice;
        return 0;
      });
  }, [vendors, search, category, location, maxBudget, sortBy]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs text-amber-400 font-bold bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full mb-2">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Admin Verified Database</span>
            </div>
            <h1 className="text-3xl font-black text-white">Find Event Vendors</h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Showing {filteredVendors.length} active event professionals with real packages & ratings.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {comparedVendors.length > 0 && (
              <button
                onClick={() => setShowComparisonModal(true)}
                className="flex items-center gap-1.5 text-xs bg-amber-500 text-slate-950 px-3.5 py-2 rounded-xl font-bold transition-all shadow"
              >
                <Scale className="w-4 h-4" />
                <span>Compare Selected ({comparedVendors.length})</span>
              </button>
            )}
            <Link
              href="/ai-assistant"
              className="flex items-center gap-1.5 text-xs bg-slate-900 border border-amber-500/40 text-amber-300 hover:text-white px-3.5 py-2 rounded-xl font-semibold transition-colors"
            >
              <Bot className="w-4 h-4 text-amber-400" />
              <span>Ask RK AI</span>
            </Link>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 mb-8 shadow-xl space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Search Input */}
            <div className="relative md:col-span-2">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search vendor name, service, or keywords..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 text-xs text-slate-100 placeholder-slate-500 rounded-xl pl-9 pr-3 py-2.5 outline-none"
              />
            </div>

            {/* Location Selector */}
            <div className="relative">
              <MapPin className="w-4 h-4 text-amber-400 absolute left-3 top-3" />
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 text-xs text-slate-100 rounded-xl pl-9 pr-3 py-2.5 outline-none cursor-pointer"
              >
                {locationsList.map((loc) => (
                  <option key={loc} value={loc} className="bg-slate-900">
                    {loc === "All" ? "All Locations" : loc}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <ArrowUpDown className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 text-xs text-slate-100 rounded-xl pl-9 pr-3 py-2.5 outline-none cursor-pointer"
              >
                <option value="rating" className="bg-slate-900">Highest Rated</option>
                <option value="price-asc" className="bg-slate-900">Price: Low to High</option>
                <option value="price-desc" className="bg-slate-900">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Budget Slider & Categories Scroll */}
          <div className="pt-3 border-t border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Category Pills */}
            <div className="flex-1 overflow-x-auto whitespace-nowrap flex gap-1.5 scrollbar-thin">
              {allCategories.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={`text-xs px-3 py-1.5 rounded-full font-semibold shrink-0 transition-colors ${
                    category === c
                      ? "bg-amber-500 text-slate-950 font-bold"
                      : "bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* Budget Slider */}
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-xs text-slate-400 font-semibold whitespace-nowrap">
                Max Budget: <span className="text-amber-400 font-bold">₹{maxBudget.toLocaleString()}</span>
              </span>
              <input
                type="range"
                min="5000"
                max="100000"
                step="5000"
                value={maxBudget}
                onChange={(e) => setMaxBudget(Number(e.target.value))}
                className="w-28 sm:w-36 accent-amber-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Vendors Grid */}
        {loading ? (
          <div className="p-16 text-center text-slate-400">Loading verified vendors from database...</div>
        ) : filteredVendors.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center max-w-xl mx-auto my-8">
            <Bot className="w-10 h-10 text-amber-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white">No matching vendors found</h3>
            <p className="text-xs text-slate-400 mt-2">
              No active approved vendors matched your specific filters. Try expanding your location or adjusting your budget.
            </p>
            <div className="mt-5 flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  setCategory("All");
                  setLocation("All");
                  setMaxBudget(100000);
                  setSearch("");
                }}
                className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl"
              >
                Reset Filters
              </button>
              <Link
                href="/ai-assistant"
                className="text-xs bg-amber-500 text-slate-950 font-bold px-4 py-2 rounded-xl"
              >
                Ask RK AI for Recommendations
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVendors.map((vendor) => (
              <RKVendorCard
                key={vendor.id}
                vendor={vendor}
                onCompare={handleCompareToggle}
                isCompared={comparedVendors.some((cv) => cv.id === vendor.id)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Comparison Modal */}
      {showComparisonModal && (
        <RKComparisonModal
          vendors={comparedVendors}
          onClose={() => setShowComparisonModal(false)}
          onRemove={(id) => setComparedVendors((prev) => prev.filter((v) => v.id !== id))}
        />
      )}

      <Footer />
    </div>
  );
}

export default function VendorsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 p-12 text-center text-slate-400">Loading Vendors...</div>}>
      <VendorsContent />
    </Suspense>
  );
}
