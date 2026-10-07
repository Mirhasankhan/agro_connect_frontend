"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sprout,
  ArrowRight,
  Search,
  ShieldCheck,
  TrendingDown,
  Truck,
  Leaf,
  Users,
  CheckCircle2,
  ChevronRight,
  Package,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/product/ProductCard";
import { useGetAllProductsQuery } from "@/redux/features/product/productApi";

const POPULAR_CATEGORIES = [
  { name: "All Harvests", slug: "" },
  { name: "Vegetables", slug: "vegetables" },
  { name: "Cassava & Tubers", slug: "tubers" },
  { name: "Tropical Fruits", slug: "fruits" },
  { name: "Rice & Cereals", slug: "grains" },
  { name: "Cocoa & Coffee", slug: "cash-crops" },
];

export default function HomePage() {
  const router = useRouter();
  const [heroSearch, setHeroSearch] = useState("");

  const { data: productsData, isLoading: isLoadingProducts } = useGetAllProductsQuery({
    limit: 8,
    sort: "createdAt",
    order: "desc",
  });

  const products = productsData?.data?.products || [];

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroSearch.trim()) {
      router.push(`/products?search=${encodeURIComponent(heroSearch.trim())}`);
    } else {
      router.push("/products");
    }
  };

  return (
    <div className="min-h-screen bg-[#04160a] text-white flex flex-col selection:bg-emerald-500 selection:text-white">
      <Navbar />

      {/* HERO SECTION - Faithfully styled after the banner screenshot */}
      <section className="relative overflow-hidden pt-12 pb-24 md:pt-20 md:pb-32 bg-gradient-to-b from-[#062312] via-[#04160a] to-[#031108]">
        {/* Ambient background glow & radial highlights */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-gold-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl space-y-6">
            {/* Pill badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-forest-900/80 border border-forest-700/80 backdrop-blur-md shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-medium text-emerald-200 tracking-wide">
                Agricultural platform number 1 in Ivory Coast
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.08] text-white">
              From fields <br />
              to <span className="text-gradient-gold italic">tables</span>
            </h1>

            {/* Subheading */}
            <p className="text-lg sm:text-xl text-white/80 leading-relaxed font-sans max-w-2xl font-normal">
              Connect directly with{" "}
              <strong className="text-white font-semibold">certified local producers</strong>, place
              your orders and receive your deliveries quickly anywhere in Ivory Coast.
            </p>

            {/* Call to Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/register"
                className="px-6 py-3.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm flex items-center gap-2 shadow-lg shadow-emerald-950/60 transition-all hover:scale-105 active:scale-95"
              >
                Start for free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/login"
                className="px-6 py-3.5 rounded-full bg-forest-900/60 hover:bg-forest-800/80 text-white font-semibold text-sm border border-forest-700/80 backdrop-blur-md transition-all hover:border-emerald-500"
              >
                Log in
              </Link>
              <Link
                href="/products"
                className="px-5 py-3.5 rounded-full text-white/70 hover:text-emerald-300 font-medium text-sm flex items-center gap-1.5 transition-colors"
              >
                Explore marketplace
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Hero Quick Search Bar */}
            <form
              onSubmit={handleHeroSearch}
              className="mt-8 pt-4 flex flex-col sm:flex-row items-center gap-3 max-w-xl"
            >
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="What harvest are you looking for? (e.g. Igname, Banane, Riz)"
                  value={heroSearch}
                  onChange={(e) => setHeroSearch(e.target.value)}
                  className="w-full bg-[#082013]/90 border border-forest-700/90 rounded-2xl py-3.5 pl-11 pr-4 text-sm text-white placeholder-white/40 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 backdrop-blur-md transition-all"
                />
                <Search className="w-5 h-5 text-emerald-400 absolute left-3.5 top-3.5" />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm whitespace-nowrap shadow-md transition-all"
              >
                Search
              </button>
            </form>

            {/* Quick Category Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="text-xs text-white/50 mr-1">Trending:</span>
              {POPULAR_CATEGORIES.slice(1, 5).map((cat) => (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => router.push(`/products?category=${cat.slug}`)}
                  className="px-3 py-1 rounded-full bg-forest-950/60 hover:bg-forest-800 border border-forest-700/50 text-xs text-white/80 hover:text-emerald-300 transition-colors"
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* METRICS & TRUST TICKER */}
      <section className="border-y border-forest-800/80 bg-[#031109] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-1">
              <p className="font-serif text-3xl sm:text-4xl font-bold text-emerald-400">500+</p>
              <p className="text-xs sm:text-sm text-white/70">Certified Local Producers</p>
            </div>
            <div className="space-y-1">
              <p className="font-serif text-3xl sm:text-4xl font-bold text-emerald-400">12,500+</p>
              <p className="text-xs sm:text-sm text-white/70">Tons Delivered Safely</p>
            </div>
            <div className="space-y-1">
              <p className="font-serif text-3xl sm:text-4xl font-bold text-emerald-400">0%</p>
              <p className="text-xs sm:text-sm text-white/70">Middlemen Exploitation</p>
            </div>
            <div className="space-y-1">
              <p className="font-serif text-3xl sm:text-4xl font-bold text-emerald-400">24/48h</p>
              <p className="text-xs sm:text-sm text-white/70">Express Agro-Logistics</p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED HARVESTS / MARKETPLACE PREVIEW */}
      <section className="py-20 bg-[#04160a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-emerald-400 font-bold mb-2">
                <Leaf className="w-3.5 h-3.5" />
                Fresh From The Soil
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white">
                Featured Harvests Today
              </h2>
              <p className="text-sm text-white/70 mt-1 max-w-xl">
                Directly harvested crops with transparent wholesale tiered pricing. Buy by the bag,
                crate, or ton.
              </p>
            </div>

            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              Browse All Products
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Product Grid */}
          {isLoadingProducts ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div
                  key={i}
                  className="h-80 bg-forest-900/40 rounded-2xl border border-forest-800 animate-pulse"
                />
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 px-4 bg-[#082013] border border-forest-800 rounded-3xl">
              <Package className="w-12 h-12 text-emerald-400 mx-auto mb-3 opacity-80" />
              <h3 className="font-serif text-xl font-bold text-white">
                Fresh Harvests Arriving Soon
              </h3>
              <p className="text-sm text-white/60 max-w-md mx-auto mt-2">
                Producers are currently harvesting crops in Bouaké, Korhogo, and Yamoussoukro.
                Check back shortly or register your farm today!
              </p>
              <div className="mt-6 flex justify-center gap-4">
                <Link href="/products" className="btn-primary text-xs py-2.5 px-6">
                  Visit Marketplace
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* PLATFORM BENEFITS - WHY AGRO CONNECT */}
      <section id="benefits" className="py-20 bg-[#031109] border-t border-forest-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs uppercase tracking-widest text-emerald-400 font-bold">
              The Agricultural Revolution
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white mt-2">
              Why Choose Agro Connect?
            </h2>
            <p className="text-sm text-white/70 mt-3">
              We bridge the gap between rural Ivorian farmers, professional transport fleets, and
              buyers with cutting-edge technology and verified fair trade.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Benefit 1 */}
            <div className="p-8 rounded-3xl bg-[#082013] border border-forest-700/60 hover:border-emerald-500/80 transition-all duration-300 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="font-serif text-xl font-bold text-white">
                100% Certified Direct Sourcing
              </h3>
              <p className="text-sm text-white/70 leading-relaxed">
                Every producer undergoes rigorous validation of their identity, land certificates,
                and farm photos. You buy genuine, traceable Ivorian produce straight from the source.
              </p>
            </div>

            {/* Benefit 2 */}
            <div className="p-8 rounded-3xl bg-[#082013] border border-forest-700/60 hover:border-emerald-500/80 transition-all duration-300 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <TrendingDown className="w-7 h-7" />
              </div>
              <h3 className="font-serif text-xl font-bold text-white">
                Dynamic Bulk Tier Pricing
              </h3>
              <p className="text-sm text-white/70 leading-relaxed">
                Whether you need 5 kg for your home or 50 tons for a hotel chain, our automatic
                tiered pricing rewards volume with substantial, instant discounts.
              </p>
            </div>

            {/* Benefit 3 */}
            <div className="p-8 rounded-3xl bg-[#082013] border border-forest-700/60 hover:border-emerald-500/80 transition-all duration-300 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Truck className="w-7 h-7" />
              </div>
              <h3 className="font-serif text-xl font-bold text-white">
                OTP-Protected Agro Logistics
              </h3>
              <p className="text-sm text-white/70 leading-relaxed">
                Dedicated registered drivers pick up products directly from farm hubs. Orders are
                confirmed upon arrival using an encrypted 6-digit OTP code before funds are released.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOR WHOM SECTION */}
      <section id="for-whom" className="py-20 bg-[#04160a] border-t border-forest-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs uppercase tracking-widest text-emerald-400 font-bold">
              Tailored Ecosystem
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white mt-2">
              Built For Everyone in the Supply Chain
            </h2>
            <p className="text-sm text-white/70 mt-3">
              Discover how Agro Connect empowers producers, transporters, and buyers across Côte
              d&apos;Ivoire.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Buyer Card */}
            <div className="p-7 rounded-3xl bg-[#071f12] border border-forest-700/60 space-y-4 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-forest-900 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-4">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-xl font-bold text-white">For Buyers & Businesses</h3>
                <p className="text-xs text-white/70 mt-2 leading-relaxed">
                  Access freshest produce at unbeatable farm prices. Pay securely via Stripe with
                  guaranteed doorstep delivery in Abidjan and major cities.
                </p>
                <ul className="mt-4 space-y-2 text-xs text-white/80">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Verified farm freshness guarantee
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Volume discounts on bulk purchase
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Real-time delivery status & receipts
                  </li>
                </ul>
              </div>

              <Link
                href="/products"
                className="btn-primary w-full text-xs py-2.5 text-center mt-6"
              >
                Start Buying Now
              </Link>
            </div>

            {/* Producer Card */}
            <div className="p-7 rounded-3xl bg-[#071f12] border border-emerald-500/50 shadow-xl shadow-emerald-950/40 space-y-4 flex flex-col justify-between relative">
              <span className="absolute -top-3 right-6 px-3 py-1 rounded-full bg-emerald-500 text-[#05170d] text-[10px] font-extrabold uppercase tracking-wider">
                High Demand
              </span>
              <div>
                <div className="w-12 h-12 rounded-xl bg-forest-900 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-4">
                  <Sprout className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-xl font-bold text-white">
                  For Farmers & Producers
                </h3>
                <p className="text-xs text-white/70 mt-2 leading-relaxed">
                  Sell directly to thousands of buyers without intermediaries taking your profit.
                  Configure bulk discount tiers and track earnings seamlessly.
                </p>
                <ul className="mt-4 space-y-2 text-xs text-white/80">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Set your own unit & bulk tier prices
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Automatic escrow payout release
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Dedicated farmer dashboard
                  </li>
                </ul>
              </div>

              <Link
                href="/register"
                className="btn-primary w-full text-xs py-2.5 text-center mt-6 bg-emerald-500 hover:bg-emerald-600"
              >
                Join as a Producer
              </Link>
            </div>

            {/* Driver Card */}
            <div className="p-7 rounded-3xl bg-[#071f12] border border-forest-700/60 space-y-4 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-forest-900 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-4">
                  <Truck className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-xl font-bold text-white">
                  For Drivers & Transporters
                </h3>
                <p className="text-xs text-white/70 mt-2 leading-relaxed">
                  Earn competitive income moving fresh crops from regional hubs to urban tables.
                  Bikes, vans, pickups, and trucks are all welcome.
                </p>
                <ul className="mt-4 space-y-2 text-xs text-white/80">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Flexible delivery scheduling
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Instant OTP completion verification
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Transparent per-delivery earnings
                  </li>
                </ul>
              </div>

              <Link
                href="/register"
                className="btn-secondary w-full text-xs py-2.5 text-center mt-6"
              >
                Register as a Driver
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CALL TO ACTION BANNER */}
      <section className="py-20 bg-gradient-to-tr from-[#062011] via-[#082b17] to-[#04160a] border-t border-forest-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="font-serif text-4xl sm:text-5xl font-extrabold text-white">
            Ready to experience fresh harvests direct from the source?
          </h2>
          <p className="text-base text-white/80 max-w-2xl mx-auto leading-relaxed">
            Join thousands of satisfied buyers, cooperative producers, and logistics drivers
            transforming agriculture in Ivory Coast today.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Link
              href="/register"
              className="px-8 py-3.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-xl shadow-emerald-950/60 transition-all hover:scale-105 active:scale-95"
            >
              Get Started for Free
            </Link>
            <Link
              href="/products"
              className="px-8 py-3.5 rounded-full bg-forest-900/80 hover:bg-forest-800 text-white font-semibold text-sm border border-forest-700/80 transition-all"
            >
              Browse Marketplace
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
