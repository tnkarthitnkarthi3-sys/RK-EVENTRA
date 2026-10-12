"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/src/components/layout/Navbar";
import Footer from "@/src/components/layout/Footer";
import {
  Disc3,
  Volume2,
  Zap,
  Sparkles,
  Layers,
  Camera,
  Video,
  Utensils,
  Heart,
  Flower2,
  Power,
  Calendar,
  Armchair,
  Star,
  ArrowRight,
  ShieldCheck,
  Search,
} from "lucide-react";

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
}

export default function ServicesPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const iconMap: Record<string, any> = {
    Disc3,
    Volume2,
    Zap,
    Sparkles,
    Layers,
    Camera,
    Video,
    Utensils,
    Heart,
    Flower2,
    Power,
    Calendar,
    Armchair,
    Star,
  };

  useEffect(() => {
    fetch("/api/admin/services")
      .then((res) => res.json())
      .then((data) => {
        if (data.categories && Array.isArray(data.categories)) {
          setCategories(data.categories);
        }
      })
      .catch((err) => console.error("Error loading categories:", err))
      .finally(() => setLoading(false));
  }, []);

  const fallbackCategories: CategoryItem[] = [
    { id: "1", name: "DJ and Entertainment", slug: "dj-and-entertainment", description: "Professional DJs, sound setups, and dance floor entertainment for weddings and parties.", icon: "Disc3" },
    { id: "2", name: "Audio and Sound Systems", slug: "audio-and-sound-systems", description: "Line array speakers, digital mixers, and stage audio engineering.", icon: "Volume2" },
    { id: "3", name: "Lighting Systems", slug: "lighting-systems", description: "Ambient stage lighting, moving head beams, lasers, and par can arrangements.", icon: "Zap" },
    { id: "4", name: "Wedding Decoration", slug: "wedding-decoration", description: "Traditional mandap decor, floral backdrops, and bespoke wedding themes.", icon: "Sparkles" },
    { id: "5", name: "Stage Decoration", slug: "stage-decoration", description: "LED video walls, royal arches, fiber pillars, and red carpet entrance setups.", icon: "Layers" },
    { id: "6", name: "Photography", slug: "photography", description: "Candid wedding, pre-wedding, and celebration photography with velvet albums.", icon: "Camera" },
    { id: "7", name: "Videography", slug: "videography", description: "4K cinematic cinema films, wedding teasers, live YouTube webcasting, and drone shots.", icon: "Video" },
    { id: "8", name: "Catering", slug: "catering", description: "Traditional South Indian banana leaf wedding feast and multi-cuisine banquets.", icon: "Utensils" },
    { id: "9", name: "Makeup and Styling", slug: "makeup-and-styling", description: "Bridal makeover, saree draping, hairstyling, and party cosmetics.", icon: "Heart" },
    { id: "10", name: "Flower Decoration", slug: "flower-decoration", description: "Fresh natural jasmine, rose, and exotic imported orchid floral designs.", icon: "Flower2" },
    { id: "11", name: "Generator Services", slug: "generator-services", description: "Silent diesel generators (15kVA - 82.5kVA) with onsite fuel and technicians.", icon: "Power" },
    { id: "12", name: "Event Planning", slug: "event-planning", description: "Complete celebration timeline planning, guest coordination, and vendor execution.", icon: "Calendar" },
    { id: "13", name: "Furniture and Seating", slug: "furniture-and-seating", description: "VIP banquet chairs, round tables, shamiana tents, and royal bride/groom thrones.", icon: "Armchair" },
    { id: "14", name: "Other Event Services", slug: "other-event-services", description: "Cold fire pyro, confetti cannons, welcome hostesses, and valet staff.", icon: "Star" },
  ];

  const displayList = categories.length > 0 ? categories : fallbackCategories;
  const filtered = displayList.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-wider font-bold text-amber-400">
            Marketplace Categories
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white mt-2">
            Explore All Event Services
          </h1>
          <p className="text-sm text-slate-300 mt-3 leading-relaxed">
            Every vendor is admin-reviewed and verified. Filter by category to discover verified professionals with transparent packages and genuine pricing.
          </p>

          {/* Search bar */}
          <div className="mt-8 max-w-md mx-auto relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search category (e.g. DJ, Catering, Photography)..."
              className="w-full bg-slate-900 border border-slate-800 focus:border-amber-400 text-xs text-slate-200 placeholder-slate-500 rounded-xl pl-10 pr-4 py-3 outline-none"
            />
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((cat) => {
            const Icon = iconMap[cat.icon] || Sparkles;
            return (
              <div
                key={cat.id || cat.slug}
                className="bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-6 flex flex-col justify-between transition-all group hover:-translate-y-1 shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] bg-slate-800 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1 font-semibold">
                      <ShieldCheck className="w-3 h-3" />
                      Verified
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                    {cat.name}
                  </h3>

                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    {cat.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">Fixed & Custom Packages</span>
                  <Link
                    href={`/vendors?category=${encodeURIComponent(cat.name)}`}
                    className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                  >
                    <span>Browse Vendors</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Footer />
    </div>
  );
}
