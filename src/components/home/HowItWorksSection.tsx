"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ShoppingBag,
  TrendingDown,
  Truck,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sprout,
  KeyRound,
  Sparkles,
} from "lucide-react";

export default function HowItWorksSection() {
  const [activeTab, setActiveTab] = useState<"buyers" | "producers">("buyers");

  const buyerSteps = [
    {
      number: "01",
      title: "Discover Local Harvests",
      description:
        "Browse verified crops from Bouaké, Korhogo, and Yamoussoukro with genuine photos and transparent farm origins.",
      icon: ShoppingBag,
      highlight: "Direct From Farm",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    {
      number: "02",
      title: "Unlock Tiered Bulk Discounts",
      description:
        "Order by the crate, bag, or metric ton. Our automatic volume calculator applies tiered savings instantly.",
      icon: TrendingDown,
      highlight: "Save Up To 30%",
      badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
    },
    {
      number: "03",
      title: "Monitored Agro Transit",
      description:
        "Dedicated vetted drivers collect fresh crops directly from rural aggregation hubs and head straight to your door.",
      icon: Truck,
      highlight: "Express Routing",
      badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    },
    {
      number: "04",
      title: "OTP Delivery & Escrow Release",
      description:
        "Inspect your produce upon arrival. Confirm delivery using a secure 6-digit OTP code before funds are released to the seller.",
      icon: KeyRound,
      highlight: "100% Guaranteed",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
  ];

  const producerSteps = [
    {
      number: "01",
      title: "List Harvest in 2 Minutes",
      description:
        "Set your base unit price, available harvest volume, harvest date, and custom wholesale tiered discounts.",
      icon: Sprout,
      highlight: "Free Listing",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    {
      number: "02",
      title: "Receive Guaranteed Orders",
      description:
        "Get instant notifications when buyers purchase. Buyer funds are immediately secured in platform escrow.",
      icon: ShieldCheck,
      highlight: "Secured Escrow",
      badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
    },
    {
      number: "03",
      title: "Farm Hub Transporter Pickup",
      description:
        "A verified driver arrives at your specified farm location to load and safely transport your agricultural batch.",
      icon: Truck,
      highlight: "Zero Transport Hassle",
      badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    },
    {
      number: "04",
      title: "Instant Payout on OTP Scan",
      description:
        "As soon as the buyer provides the 6-digit OTP at reception, escrow funds are instantly transferred to your account.",
      icon: CheckCircle2,
      highlight: "Fast Payout",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
  ];

  const currentSteps = activeTab === "buyers" ? buyerSteps : producerSteps;

  return (
    <section className="py-20 bg-slate-50 border-b border-slate-200/90 relative overflow-hidden">
      {/* Decorative background grid pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.03] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Simple, Fair & Protected</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            How Agro Connect Works
          </h2>
          <p className="text-sm text-slate-600 mt-3 leading-relaxed">
            Eliminating unnecessary middlemen while providing end-to-end security with OTP escrow verification.
          </p>

          {/* Persona Toggle */}
          <div className="inline-flex items-center p-1 mt-6 rounded-full bg-slate-200/70 border border-slate-300/80">
            <button
              type="button"
              onClick={() => setActiveTab("buyers")}
              className={`px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                activeTab === "buyers"
                  ? "bg-white text-emerald-800 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              For Buyers & Businesses
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("producers")}
              className={`px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                activeTab === "producers"
                  ? "bg-white text-emerald-800 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              For Farmers & Producers
            </button>
          </div>
        </div>

        {/* 4 Step Cards with Minimal Animations */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {currentSteps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={`${activeTab}-${step.number}`}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{
                  duration: 0.4,
                  delay: idx * 0.1,
                  ease: "easeOut",
                }}
                whileHover={{ y: -4 }}
                className="relative bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
              >
                {/* Step Top Badge */}
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <span className="font-serif text-3xl font-extrabold text-slate-200 group-hover:text-emerald-500/40 transition-colors">
                      {step.number}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${step.badgeColor}`}
                    >
                      {step.highlight}
                    </span>
                  </div>

                  {/* Icon */}
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-700 mb-4 group-hover:scale-105 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>

                  <h3 className="font-serif text-lg font-bold text-slate-900 mb-2 leading-snug">
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
                  <span>Step {idx + 1} of 4</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <Link
            href={activeTab === "buyers" ? "/products" : "/register"}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all hover:scale-105 active:scale-95"
          >
            {activeTab === "buyers" ? "Browse Fresh Produce" : "Start Selling Free"}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
