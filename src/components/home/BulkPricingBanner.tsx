"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  TrendingDown,
  Percent,
  CheckCircle2,
  ArrowRight,  
  Building2,
  UtensilsCrossed,
} from "lucide-react";
import { formatCurrency } from "@/utils/formatters";

export default function BulkPricingBanner() {
  // Interactive mini simulation state (e.g. wholesale plantain / rice bags)
  const [volumeLevel, setVolumeLevel] = useState<number>(2); // 0: Retail, 1: Medium, 2: Wholesale, 3: Container

  const tiers = [
    {
      label: "Sample / Retail",
      quantity: "1 - 10 kg",
      unitPrice: 1200,
      discount: 0,
      description: "Ideal for individual households & tasting samples",
    },
    {
      label: "Commercial Tier 1",
      quantity: "50 - 150 kg",
      unitPrice: 1050,
      discount: 12.5,
      description: "Perfect for local maquis, bakeries & caterers",
    },
    {
      label: "Wholesale Tier 2",
      quantity: "200 - 500 kg",
      unitPrice: 920,
      discount: 23.3,
      description: "Best for hotels, supermarkets & school canteens",
    },
    {
      label: "Industrial / Cooperative",
      quantity: "1,000+ kg (Tons)",
      unitPrice: 800,
      discount: 33.3,
      description: "For food processing plants & export aggregators",
    },
  ];

  const currentTier = tiers[volumeLevel];
  const standardCost = 1200;
  const savingsPercent = Math.round(currentTier.discount);

  return (
    <section className="py-20 bg-gradient-to-br from-[#041d0f] via-[#062c16] to-[#02180c] text-white relative overflow-hidden">
      {/* Background glow & accents */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Context & Value Proposition */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-900/60 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
              <TrendingDown className="w-4 h-4 text-emerald-400" />
              <span>Transparent Bulk Tiering</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Buy in Bulk, <br />
              <span className="bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent italic">
                Save Up To 35% Direct
              </span>
            </h2>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
              Middlemen inflate produce prices up to 60%. With Agro Connect&apos;s dynamic tiered pricing, farmers set transparent wholesale discounts that trigger automatically as your order volume increases.
            </p>

            {/* Who benefits list */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <UtensilsCrossed className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-white">Restaurants & Hotels</h4>
                  <p className="text-[11px] text-slate-300 mt-0.5">Fresh supply with scheduled weekly bulk deliveries</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <Building2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-white">Wholesalers & Grocers</h4>
                  <p className="text-[11px] text-slate-300 mt-0.5">Direct farm container loads with certified origins</p>
                </div>
              </div>
            </div>

            <div className="pt-3">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-950/60 transition-all hover:scale-105 active:scale-95"
              >
                Explore Wholesale Produce
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Right Column: Interactive Tier Simulator Card */}
          <div className="lg:col-span-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="p-6 sm:p-8 rounded-3xl bg-[#092917]/80 border border-emerald-500/30 backdrop-blur-xl shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between border-b border-emerald-800/60 pb-4">
                <div>
                  <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">
                    Interactive Simulation
                  </span>
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-white mt-0.5">
                    Live Tier Discount Preview
                  </h3>
                </div>
                <div className="px-3 py-1 rounded-full bg-amber-400/20 border border-amber-300/40 text-amber-300 text-xs font-bold flex items-center gap-1">
                  <Percent className="w-3.5 h-3.5" />
                  <span>{savingsPercent}% Off</span>
                </div>
              </div>

              {/* Tier Selection Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {tiers.map((tier, idx) => (
                  <button
                    key={tier.label}
                    type="button"
                    onClick={() => setVolumeLevel(idx)}
                    className={`p-2.5 rounded-2xl text-left transition-all border ${
                      volumeLevel === idx
                        ? "bg-emerald-500/20 border-emerald-400 text-white ring-1 ring-emerald-400/40 shadow-sm"
                        : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <span className="block text-[10px] font-medium text-slate-400">
                      Tier {idx + 1}
                    </span>
                    <span className="block text-xs font-bold mt-0.5 leading-snug">
                      {tier.quantity}
                    </span>
                  </button>
                ))}
              </div>

              {/* Price Breakdown Display */}
              <div className="p-5 rounded-2xl bg-[#041a0e]/90 border border-emerald-500/20 space-y-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-slate-300">Target Volume Range</span>
                  <span className="text-sm font-bold text-emerald-300">{currentTier.quantity}</span>
                </div>

                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-slate-300">Unit Price Per Kilogram</span>
                  <div className="text-right">
                    <span className="text-xl sm:text-2xl font-extrabold text-amber-300">
                      {formatCurrency(currentTier.unitPrice)}
                    </span>
                    {volumeLevel > 0 && (
                       <span className="text-xs text-slate-400 line-through ml-2">
                        {formatCurrency(standardCost)}
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-300 pt-1 border-t border-emerald-800/40">
                  {currentTier.description}
                </p>
              </div>

              {/* Highlights */}
              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Transparent producer-configured bulk discount steps</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Funds protected in escrow until OTP delivery confirmation</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
