"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Star, MapPin, CheckCircle, Heart, ArrowRight, Calendar, Sparkles } from "lucide-react";

export interface VendorCardData {
  id: string;
  businessName: string;
  description: string | null;
  location: string | null;
  rating: number;
  profileImage: string | null;
  minPrice: number;
  reviewCount: number;
  services: {
    id: string;
    name: string;
    category: string;
    price: number;
    description: string | null;
    packages: {
      id: string;
      name: string;
      price: number;
      description: string | null;
      features: string | null;
    }[];
  }[];
}

interface RKVendorCardProps {
  vendor: VendorCardData;
  onCompare?: (vendor: VendorCardData) => void;
  isCompared?: boolean;
}

export default function RKVendorCard({ vendor, onCompare, isCompared }: RKVendorCardProps) {
  const [favorited, setFavorited] = useState(false);
  const [showAvailability, setShowAvailability] = useState(false);

  const primaryService = vendor.services[0];
  const primaryPackage = primaryService?.packages?.[0];

  return (
    <div className="bg-slate-900/80 border border-amber-500/20 hover:border-amber-400/50 rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-amber-500/10 flex flex-col text-white backdrop-blur-xl group">
      {/* Top Banner / Image */}
      <div className="relative h-48 w-full bg-slate-950 overflow-hidden">
        <img
          src={vendor.profileImage || "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80"}
          alt={vendor.businessName}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

        {/* Verified Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-slate-950/80 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold px-3 py-1 rounded-full backdrop-blur-md shadow-md">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
          <span>Verified Partner</span>
        </div>

        <button
          onClick={() => setFavorited(!favorited)}
          aria-label="Save to favorites"
          className="absolute top-3 right-3 p-2 rounded-full bg-slate-950/80 hover:bg-slate-900 border border-white/10 text-white transition-all shadow-md cursor-pointer"
        >
          <Heart className={`w-4 h-4 ${favorited ? "fill-rose-500 text-rose-500" : "text-slate-300"}`} />
        </button>

        {/* Rating & Category on image */}
        <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs">
          <span className="bg-amber-500 text-slate-950 font-black px-2.5 py-1 rounded-lg shadow-md text-[11px] uppercase tracking-wider">
            {primaryService?.category || "Event Services"}
          </span>
          <div className="flex items-center gap-1.5 bg-slate-950/90 border border-slate-800 px-2.5 py-1 rounded-lg text-amber-300 font-bold backdrop-blur-sm shadow-md">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{vendor.rating > 0 ? vendor.rating.toFixed(1) : "4.9"}</span>
            <span className="text-slate-400 text-[11px] font-normal">({vendor.reviewCount || 12})</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h4 className="font-black text-lg text-white group-hover:text-amber-300 transition-colors line-clamp-1">
            {vendor.businessName}
          </h4>

          <div className="flex items-center gap-1.5 text-slate-400 text-xs mt-1.5 font-medium">
            <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate">{vendor.location || "Tamil Nadu"}</span>
          </div>

          <p className="text-xs text-slate-300 mt-2.5 line-clamp-2 leading-relaxed">
            {vendor.description || primaryService?.description || "Professional verified event service provider."}
          </p>

          {/* Service Feature Tags */}
          {primaryPackage?.features && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {primaryPackage.features
                .split(",")
                .slice(0, 3)
                .map((f, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-semibold bg-slate-950 border border-slate-800 text-amber-300/90 px-2.5 py-0.5 rounded-md"
                  >
                    ✓ {f.trim()}
                  </span>
                ))}
            </div>
          )}

          {/* Availability drawer */}
          {showAvailability && (
            <div className="mt-3 p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-medium">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                Available this month & advance booking
              </span>
              <button
                onClick={() => setShowAvailability(false)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* Pricing & Actions */}
        <div className="pt-4 border-t border-slate-800/80">
          <div className="flex items-baseline justify-between mb-3">
            <div>
              <span className="text-[11px] text-slate-400 font-semibold block">Starting from</span>
              <div className="text-lg font-black text-amber-400">
                ₹{vendor.minPrice > 0 ? vendor.minPrice.toLocaleString() : "12,000"}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowAvailability(!showAvailability)}
                className="text-[11px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1.5 rounded-lg border border-slate-700 transition-colors cursor-pointer"
                title="Check Availability"
              >
                Calendar
              </button>
              {onCompare && (
                <button
                  onClick={() => onCompare(vendor)}
                  className={`text-[11px] font-bold px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                    isCompared
                      ? "bg-amber-500 text-slate-950"
                      : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                  }`}
                >
                  {isCompared ? "Compared" : "Compare"}
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <Link
              href={`/vendors/${vendor.id}`}
              className="text-center text-xs py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-bold border border-slate-700 transition-colors"
            >
              View Profile
            </Link>
            <Link
              href={primaryService ? `/checkout/${primaryService.id}` : `/vendors/${vendor.id}`}
              className="flex items-center justify-center gap-1.5 text-xs py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black transition-all shadow-md shadow-amber-500/20"
            >
              <span>Book Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
