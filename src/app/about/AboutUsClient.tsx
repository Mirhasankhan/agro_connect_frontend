"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Sprout,
  ShieldCheck,
  Truck,
  Users,
  CheckCircle2,
  ArrowRight,
  Clock,
  MapPin,
  HeartHandshake,
  Leaf,
  Target,
  Eye,
  Shield,
  Sparkles,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FaqSection from "@/components/common/FaqSection";

// Metric statistics for social proof & impact
const IMPACT_METRICS = [
  {
    value: "1,500+",
    label: "Certified Producers",
    detail: "Directly validated smallholder farms across Bangladesh",
  },
  {
    value: "98.4%",
    label: "Delivery OTP Success",
    detail: "Harvests inspected & confirmed at buyer destination",
  },
  {
    value: "4 Major Hubs",
    label: "Regional Infrastructure",
    detail: "Abidjan, Bouaké, Korhogo & Yamoussoukro networks",
  },
  {
    value: "< 24 Hours",
    label: "Farm-to-Door Window",
    detail: "From morning harvest to urban commercial kitchen",
  },
];

// Core company values
const CORE_VALUES = [
  {
    icon: ShieldCheck,
    title: "Radical Transparency",
    description:
      "Every product listing displays certified producer origins, actual harvest dates, and verifiable pricing tiers without hidden broker markups.",
  },
  {
    icon: HeartHandshake,
    title: "Farmer-First Economics",
    description:
      "Producers retain fair market returns for their labor. Guaranteed escrow funds are credited within 24 hours of successful delivery inspection.",
  },
  {
    icon: Truck,
    title: "Reliable Cold Logistics",
    description:
      "Dedicated transport network using temperature-controlled protocols to cut post-harvest spoilage and maintain premium nutritional value.",
  },
  {
    icon: Shield,
    title: "Escrow & OTP Security",
    description:
      "Buyers never risk paying for sub-standard harvests. Funds are released strictly after the buyer verifies the 6-digit OTP code upon delivery.",
  },
];

// Timeline milestones
const TIMELINE_STEPS = [
  {
    year: "2023",
    tag: "The Foundation",
    title: "Solving the Post-Harvest Dilemma",
    description:
      "Confronted by over 35% crop spoilage in the Yam and Plantain corridors, our team launched Agro Connect in Abidjan to eliminate abusive broker markups and introduce digital logistics.",
  },
  {
    year: "2024",
    tag: "Regional Expansion",
    title: "Connecting Bangladesh's Breadbaskets",
    description:
      "Expanded dedicated farm collection hubs into Bouaké and Korhogo. Built automated identity and land registration validation for hundreds of rural cooperatives.",
  },
  {
    year: "2025",
    tag: "Fintech & Logistics Innovation",
    title: "Escrow & OTP Delivery Protocol",
    description:
      "Rolled out smart escrow payments with instant Mobile Money payouts and 6-digit OTP delivery handovers, ensuring 100% dispute protection for buyers and transporters.",
  },
  {
    year: "2026",
    tag: "Pan-African Vision",
    title: "The Standard for Direct Agricultural Commerce",
    description:
      "Empowering thousands of commercial kitchens, wholesale distributors, and individual households with direct farm procurement and dynamic bulk tier savings.",
  },
];

// Regional Agricultural Hubs
const REGIONAL_HUBS = [
  {
    city: "Dhaka Hub",
    zone: "Central Distribution Corridor",
    crops: "Fresh Vegetables, Rice, Mustard, Dairy",
    description:
      "Our central distribution node coordinating fresh farm produce from rural growers directly to urban retail networks and mega-city markets.",
  },
  {
    city: "Chittagong Hub",
    zone: "South-Eastern Coastal Gateway",
    crops: "Tea, Seasonal Fruits, Spices, Winter Crops",
    description:
      "Connecting hill tract harvests, coastal agricultural belts, and seaport logistics for streamlined commercial and retail distribution.",
  },
  {
    city: "Barishal Hub",
    zone: "Southern Riverine Belt",
    crops: "Paddy Rice, Guava, Betel Leaf, River Produce",
    description:
      "Located in Bangladesh's fertile riverine granary, optimizing direct water-to-land transport and cold handling for fresh harvests.",
  },
  {
    city: "Khulna Hub",
    zone: "South-Western Delta Zone",
    crops: "Jute, Coconut, Fresh Produce, Agro-Aquaculture",
    description:
      "Strategically positioned in the south-western delta region to aggregate organic farming clusters, coconut groves, and regional harvests.",
  },
];

export default function AboutUsClient() {
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col selection:bg-emerald-500 selection:text-white">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section
          id="about-hero"
          className="relative overflow-hidden pt-20 pb-28 md:pt-28 md:pb-36 bg-[#041d0f] border-b border-emerald-950/80 text-white"
        >
          {/* Photographic background with dark emerald gradient & radial glow overlays */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            <Image
              src="https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=2000&q=80"
              alt="Lush green agricultural farm landscape"
              fill
              priority
              unoptimized
              className="object-cover object-center opacity-25 mix-blend-luminosity scale-105"
            />
            {/* Deep dark green gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#03190d]/95 via-[#07361b]/85 to-[#021308]/95" />
            {/* Radial spotlight */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_45%_40%,rgba(20,130,65,0.45)_0%,rgba(6,36,19,0.9)_60%,rgba(2,18,9,0.98)_100%)]" />
            {/* Ambient glow orbs */}
            <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-emerald-500/15 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-[420px] h-[420px] bg-emerald-400/10 rounded-full blur-3xl" />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-3xl space-y-6">
              {/* Pill badge */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0a3a20]/80 border border-emerald-400/30 backdrop-blur-md shadow-sm"
              >
                <Sprout className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-semibold text-emerald-100 tracking-wide">
                  About Agro Connect Bangladesh
                </span>
              </motion.div>

              {/* Main H1 Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.1 }}
                className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.12]"
              >
                Connecting Every Field Directly to Every Table.
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.2 }}
                className="text-base sm:text-lg text-emerald-100/90 leading-relaxed max-w-2xl font-normal"
              >
                We are building West Africa&apos;s most reliable agricultural infrastructure. By
                bridging certified rural smallholders, temperature-managed transport fleets, and
                commercial buyers, Agro Connect replaces exploitative middleman chains with
                verifiable trust, fair profits, and peak harvest freshness.
              </motion.p>

              {/* CTA Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.3 }}
                className="flex flex-wrap items-center gap-4 pt-2"
              >
                <Link
                  id="about-hero-marketplace-btn"
                  href="/products"
                  className="btn-primary py-3 px-7 text-sm font-semibold shadow-lg shadow-emerald-950/40"
                >
                  Explore Marketplace
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
                <Link
                  id="about-hero-partner-btn"
                  href="/register"
                  className="btn-hero-glass py-3 px-6 text-sm"
                >
                  Join as Producer / Driver
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        {/* METRICS & IMPACT BAR */}
        <section className="relative z-20 -mt-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 md:p-6 rounded-3xl bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-xl">
            {IMPACT_METRICS.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all duration-300"
              >
                <p className="font-serif text-2xl lg:text-3xl font-extrabold text-emerald-700 tracking-tight">
                  {item.value}
                </p>
                <p className="text-xs font-bold  tracking-wider text-slate-800 mt-1">
                  {item.label}
                </p>
                <p className="text-[12px] text-slate-500 mt-1 leading-snug">{item.detail}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* MISSION & VISION SECTION */}
        <section id="our-mission" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Left Column: Image with layered badges */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border border-slate-200">
                  <Image
                    src="https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=1200&q=80"
                    alt="African agricultural harvest in Bangladesh"
                    fill
                    unoptimized
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
                </div>

                {/* Floating Glassmorphic Badge */}
                <div className="absolute -bottom-6 -right-4 sm:-bottom-8 sm:right-6 bg-white/95 backdrop-blur-md border border-slate-200 p-5 rounded-2xl shadow-xl max-w-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Direct From Farm Gates</p>
                      <p className="text-[11px] text-slate-500">
                        Zero speculative broker commissions
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Right Column: Mission & Vision Content */}
              <div className="space-y-8">
                <div>
                  <span className="text-xs  tracking-widest text-emerald-700 font-bold">
                    Who We Are & Why It Matters
                  </span>
                  <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 mt-2 leading-tight">
                    Transforming Agriculture Into a High-Efficiency Highway
                  </h2>
                  <p className="text-sm text-slate-600 mt-4 leading-relaxed">
                    Agriculture accounts for over 20% of Bangladesh&apos;s GDP and employs
                    nearly half the working population. Yet for generations, systemic bottlenecks
                    have kept rural growers impoverished while urban households pay inflated prices
                    for deteriorating produce.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Mission Card */}
                  <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-emerald-300 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                        <Target className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-serif text-lg font-bold text-slate-900">
                          Our Mission
                        </h3>
                        <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                          To democratize food distribution across Bangladesh by eliminating
                          middleman exploitation, providing guaranteed escrow transactions, and
                          delivering certified farm-fresh harvests within 24 hours of cutting.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Vision Card */}
                  <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-emerald-300 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                        <Eye className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-serif text-lg font-bold text-slate-900">
                          Our Vision
                        </h3>
                        <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                          A food-sovereign West Africa where every smallholder farmer thrives with
                          equitable returns, and every commercial buyer can source certified
                          produce transparently at predictable, tiered wholesale prices.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CORE VALUES GRID */}
        <section id="our-values" className="py-20 bg-slate-50 border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs  tracking-widest text-emerald-700 font-bold">
                Our Operating Principles
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 mt-2">
                The Values That Guide Every Transaction
              </h2>
              <p className="text-sm text-slate-600 mt-3">
                Built on ethical commerce, verifiable freshness, and technological accountability.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {CORE_VALUES.map((val, idx) => {
                const IconComponent = val.icon;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.35, delay: idx * 0.08 }}
                    whileHover={{ y: -4 }}
                    className="p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-5">
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <h3 className="font-serif text-lg font-bold text-slate-900">
                        {val.title}
                      </h3>
                      <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                        {val.description}
                      </p>
                    </div>
                    <div className="pt-4 mt-4 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Strict Platform Standard
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* THE ECOSYSTEM: 3 PILLARS */}
        <section id="our-ecosystem" className="py-24 bg-white border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs  tracking-widest text-emerald-700 font-bold">
                Synergy Across The Chain
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 mt-2">
                How Agro Connect Brings Everyone Together
              </h2>
              <p className="text-sm text-slate-600 mt-3">
                A triangular ecosystem designed so that every participant benefits fairly.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Pillar 1: Producers */}
              <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/90 flex flex-col justify-between hover:border-emerald-400 transition-colors">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-emerald-600 mb-5 shadow-sm">
                    <Sprout className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif text-xl font-bold text-slate-900">For Producers</h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    Smallholders and cooperatives list crops with real-time stock levels. No more
                    waiting at road junctions for opportunistic middlemen.
                  </p>
                  <ul className="mt-5 space-y-2.5 text-xs text-slate-700">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      Free registration & farm profile
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      Instant escrow settlement in 24 hours
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      Transparent market volume pricing
                    </li>
                  </ul>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-200/80">
                  <Link
                    href="/register"
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                  >
                    Register as Producer <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Pillar 2: Transporters */}
              <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/90 flex flex-col justify-between hover:border-emerald-400 transition-colors">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-emerald-600 mb-5 shadow-sm">
                    <Truck className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif text-xl font-bold text-slate-900">For Transporters</h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    Certified vehicle operators claim dispatched delivery batches between regional
                    hubs and customer doorsteps with full route clarity.
                  </p>
                  <ul className="mt-5 space-y-2.5 text-xs text-slate-700">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      Regular, organized cargo dispatches
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      OTP proof of delivery protection
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      Fast driver payouts upon verification
                    </li>
                  </ul>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-200/80">
                  <Link
                    href="/register"
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                  >
                    Register as Transporter <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Pillar 3: Buyers */}
              <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/90 flex flex-col justify-between hover:border-emerald-400 transition-colors">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-emerald-600 mb-5 shadow-sm">
                    <Users className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif text-xl font-bold text-slate-900">For Buyers</h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    Wholesale businesses, restaurants, and private homes access farm-fresh staples
                    at direct wholesale discounts with verified provenance.
                  </p>
                  <ul className="mt-5 space-y-2.5 text-xs text-slate-700">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      Up to 30% savings on bulk quantities
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      Zero prepayment risk via escrow
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      Inspection upon delivery with 6-digit OTP
                    </li>
                  </ul>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-200/80">
                  <Link
                    href="/products"
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                  >
                    Start Shopping Fresh <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TIMELINE / STORY SECTION */}
        <section id="our-story" className="py-24 bg-slate-900 text-white relative overflow-hidden">
          <div className="absolute inset-0 z-0 pointer-events-none opacity-10">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500 rounded-full blur-[140px]" />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-2xl mx-auto mb-20">
              <span className="text-xs  tracking-widest text-emerald-400 font-bold">
                The Journey So Far
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white mt-2">
                How We Built Agro Connect
              </h2>
              <p className="text-sm text-slate-400 mt-3">
                From rural farm visits in Bouaké to an encrypted digital marketplace powering tons
                of daily agricultural trade.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {TIMELINE_STEPS.map((step, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  className="relative p-6 rounded-3xl bg-slate-800/80 border border-slate-700/80 backdrop-blur-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-serif text-3xl font-extrabold text-emerald-400">
                        {step.year}
                      </span>
                      <span className="px-2.5 py-1 rounded-full text-[10px]  font-bold tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {step.tag}
                      </span>
                    </div>
                    <h3 className="font-serif text-lg font-bold text-white mb-2">{step.title}</h3>
                    <p className="text-xs text-slate-300 leading-relaxed">{step.description}</p>
                  </div>
                  <div className="pt-4 mt-6 border-t border-slate-700/60 flex items-center gap-1.5 text-[11px] text-emerald-400">
                    <Clock className="w-3.5 h-3.5" />
                    Milestone Completed
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* REGIONAL HUBS GRID */}
        <section id="our-hubs" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs  tracking-widest text-emerald-700 font-bold">
                Supply Backbone
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 mt-2">
                Our Strategic Agricultural Hubs
              </h2>
              <p className="text-sm text-slate-600 mt-3">
                Positioned directly within Bangladesh&apos;s prime crop regions to minimize
                travel times and preserve organic harvest quality.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {REGIONAL_HUBS.map((hub, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-3xl bg-slate-50 border border-slate-200/90 hover:border-emerald-300 transition-all hover:shadow-sm"
                >
                  <div className="flex items-center gap-2 text-emerald-700 mb-3">
                    <MapPin className="w-5 h-5 shrink-0" />
                    <span className="text-xs font-bold  tracking-wider">{hub.zone}</span>
                  </div>
                  <h3 className="font-serif text-xl font-bold text-slate-900">{hub.city}</h3>
                  <div className="mt-2 mb-3 px-2.5 py-1 rounded-lg bg-emerald-100/60 text-emerald-800 text-[11px] font-semibold inline-block">
                    {hub.crops}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{hub.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <FaqSection id="about-faq" />

        {/* CALL TO ACTION BANNER */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#032011] via-[#083e20] to-[#041c0f] p-8 md:p-14 text-white shadow-2xl border border-emerald-900/60">
              <div className="max-w-2xl relative z-10 space-y-5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
                  <Leaf className="w-3.5 h-3.5" />
                  Join the Agricultural Evolution
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold leading-tight text-white">
                  Ready to Source Fresh or Sell Directly?
                </h2>
                <p className="text-sm text-emerald-100/80 leading-relaxed font-normal max-w-xl">
                  Whether you manage a restaurant, run a supermarket, transport freight, or harvest
                  rich Ivorian land, Agro Connect is built for your success.
                </p>
                <div className="flex flex-wrap items-center gap-4 pt-3">
                  <Link
                    id="about-cta-marketplace-btn"
                    href="/products"
                    className="btn-primary py-3 px-8 text-sm font-semibold shadow-lg shadow-emerald-950/40"
                  >
                    Browse Fresh Harvests
                  </Link>
                  <Link
                    id="about-cta-register-btn"
                    href="/register"
                    className="btn-hero-glass py-3 px-7 text-sm"
                  >
                    Create Account
                  </Link>
                </div>
              </div>

              {/* Decorative radial blur in background */}
              <div className="absolute right-0 bottom-0 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
