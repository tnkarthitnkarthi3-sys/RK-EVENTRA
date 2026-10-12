"use client";

import React from "react";
import Link from "next/link";
import { Star, MapPin, CheckCircle, X, ArrowRight } from "lucide-react";
import { VendorCardData } from "./RKVendorCard";

interface RKComparisonModalProps {
  vendors: VendorCardData[];
  onClose: () => void;
  onRemove: (vendorId: string) => void;
}

export default function RKComparisonModal({
  vendors,
  onClose,
  onRemove,
}: RKComparisonModalProps) {
  if (!vendors || vendors.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-amber-500/40 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 px-6 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="text-amber-400">RK AI</span> Vendor Comparison
            </h3>
            <p className="text-xs text-slate-400">
              Comparing {vendors.length} selected event professionals side-by-side
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Table / Grid */}
        <div className="p-6 overflow-y-auto">
          <div className={`grid grid-cols-${vendors.length} gap-4`}>
            {vendors.map((vendor) => {
              const mainService = vendor.services[0];
              const mainPackage = mainService?.packages?.[0];

              return (
                <div
                  key={vendor.id}
                  className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex flex-col justify-between relative"
                >
                  <button
                    onClick={() => onRemove(vendor.id)}
                    className="absolute top-2 right-2 p-1 text-slate-400 hover:text-rose-400"
                    title="Remove from comparison"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div>
                    <img
                      src={vendor.profileImage || "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80"}
                      alt={vendor.businessName}
                      className="w-full h-28 object-cover rounded-lg mb-3"
                    />

                    <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded">
                      {mainService?.category || "Service"}
                    </span>

                    <h4 className="font-bold text-white text-base mt-2 line-clamp-1">
                      {vendor.businessName}
                    </h4>

                    <div className="flex items-center gap-1 text-slate-400 text-xs mt-1">
                      <MapPin className="w-3.5 h-3.5 text-amber-400" />
                      <span>{vendor.location || "Tamil Nadu"}</span>
                    </div>

                    <div className="flex items-center gap-1 mt-2 text-xs text-amber-400 font-semibold">
                      <Star className="w-4 h-4 fill-amber-400" />
                      <span>{vendor.rating > 0 ? vendor.rating.toFixed(1) : "4.9"}</span>
                      <span className="text-slate-400">({vendor.reviewCount || 10} reviews)</span>
                    </div>

                    <div className="mt-4 p-3 bg-slate-900 rounded-lg">
                      <div className="text-[11px] text-slate-400">Starting Price</div>
                      <div className="text-lg font-extrabold text-amber-400">
                        ₹{vendor.minPrice > 0 ? vendor.minPrice.toLocaleString() : "12,000"}
                      </div>
                    </div>

                    {/* Features checklist */}
                    <div className="mt-4 space-y-1.5 text-xs text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Admin Verified Vendor</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Genuine Pricing</span>
                      </div>
                      {mainPackage?.features && (
                        <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                          <span className="font-semibold text-slate-300">Key Inclusions:</span>
                          <p className="mt-1 text-slate-300">{mainPackage.features}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-800">
                    <Link
                      href={mainService ? `/checkout/${mainService.id}` : `/vendors/${vendor.id}`}
                      className="w-full flex items-center justify-center gap-1 text-xs py-2 px-3 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold transition-all shadow"
                    >
                      <span>Proceed to Book</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
