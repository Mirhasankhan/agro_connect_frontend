"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ShieldCheck,
  TrendingDown,
  Truck,
  Leaf,
  Users,
  Sprout,
  CheckCircle2,
  Search,
  Package,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/product/ProductCard";
import CategoriesSection from "@/components/home/CategoriesSection";
import HowItWorksSection from "@/components/home/HowItWorksSection";
import BulkPricingBanner from "@/components/home/BulkPricingBanner";
import TrustGuaranteesSection from "@/components/home/TrustGuaranteesSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import FaqSection from "@/components/common/FaqSection";
import HarvestNewsletterSection from "@/components/home/HarvestNewsletterSection";
import TopRatedProducersSection from "@/components/home/TopRatedProducersSection";
import { useGetAllProductsQuery } from "@/redux/features/product/productApi";
import { useGetAllCategoriesQuery } from "@/redux/features/category/categoryApi";

export default function HomePage() {
  const router = useRouter();
  const [heroSearch, setHeroSearch] = useState("");

  const { data: productsData, isLoading: isLoadingProducts } =
    useGetAllProductsQuery({
      limit: 8,
      sort: "createdAt",
      order: "desc",
      isFeatured: "true",
    });

  const { data: categoriesData, isLoading: isLoadingCategories } =
    useGetAllCategoriesQuery();
  const categories =
    categoriesData?.data?.categories?.filter((c) => c.isActive !== false) || [];

  const products = (productsData?.data?.products || []).filter(
    (p) => p.isFeatured === true
  );

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroSearch.trim()) {
      router.push(`/products?search=${encodeURIComponent(heroSearch.trim())}`);
    } else {
      router.push("/products");
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col selection:bg-emerald-500 selection:text-white">
      <Navbar />

      {/* HERO SECTION - Lush dark forest emerald gradient with harvest produce background */}
      <section className="relative overflow-hidden pt-16 pb-24 md:pt-24 md:pb-32 bg-[#041d0f] border-b border-emerald-950/80">
        {/* Photographic background with dark emerald gradient & radial glow overlays */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <Image
            src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=2000&q=80"
            alt="Agricultural produce background"
            fill
            priority
            unoptimized
            className="object-cover object-center opacity-25 mix-blend-luminosity scale-105"
          />
          {/* Deep dark green gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#03190d]/95 via-[#07361b]/80 to-[#021308]/95" />
          {/* Center-left emerald radial spotlight */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_42%_42%,rgba(20,130,65,0.45)_0%,rgba(6,36,19,0.88)_58%,rgba(2,18,9,0.98)_100%)]" />
          {/* Subtle ambient glow orbs */}
          <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-emerald-500/15 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-[420px] h-[420px] bg-emerald-400/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl space-y-6">
            {/* Pill badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0a3a20]/75 border border-emerald-400/30 backdrop-blur-md shadow-sm"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-medium text-emerald-100 tracking-wide">
                Agricultural platform number 1 in Bangladesh
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.05 }}
              className="font-serif text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.08] text-white"
            >
              From fields <br />
              to{" "}
              <span className="bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-200 bg-clip-text text-transparent italic">
                tables
              </span>
            </motion.h1>

            {/* Subheading */}
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.1 }}
              className="text-base sm:text-lg text-white/80 leading-relaxed font-sans max-w-2xl font-normal"
            >
              Connect directly with{" "}
              <strong className="text-white font-bold">
                certified local producers
              </strong>
              , place your orders and receive your deliveries quickly anywhere
              in Bangladesh.
            </motion.p>

            {/* Hero Quick Search Bar */}
            <motion.form
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.2 }}
              onSubmit={handleHeroSearch}
              className="mt-8 pt-4 flex flex-col sm:flex-row items-center gap-3 max-w-xl"
            >
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="What harvest are you looking for? (e.g. Igname, Banane, Riz)"
                  value={heroSearch}
                  onChange={(e) => setHeroSearch(e.target.value)}
                  className="w-full bg-white/95 border border-emerald-400/30 rounded-2xl py-3.5 pl-11 pr-4 text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25 shadow-lg shadow-black/20 transition-all"
                />
                <Search className="w-5 h-5 text-slate-500 absolute left-3.5 top-3.5" />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-semibold text-sm whitespace-nowrap shadow-md transition-all"
              >
                Search
              </button>
            </motion.form>

            {/* Quick Category Pills */}
            {categories.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <span className="text-xs text-emerald-200/70 mr-1 font-medium">
                  Quick Jump:
                </span>
                {categories.slice(0, 6).map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() =>
                      router.push(`/products?categoryId=${cat.id}`)
                    }
                    className="px-3 py-1 rounded-full bg-white/10 hover:bg-emerald-500/25 border border-white/15 text-xs text-white/90 hover:text-white transition-colors backdrop-blur-sm"
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* METRICS & TRUST TICKER */}
      <section className="border-b border-slate-200 bg-slate-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35 }}
              className="space-y-1"
            >
              <p className="font-serif text-3xl sm:text-4xl font-bold text-emerald-600">
                500+
              </p>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">
                Certified Local Producers
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: 0.08 }}
              className="space-y-1"
            >
              <p className="font-serif text-3xl sm:text-4xl font-bold text-emerald-600">
                12,500+
              </p>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">
                Tons Delivered Safely
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: 0.16 }}
              className="space-y-1"
            >
              <p className="font-serif text-3xl sm:text-4xl font-bold text-emerald-600">
                0%
              </p>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">
                Middlemen Exploitation
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: 0.24 }}
              className="space-y-1"
            >
              <p className="font-serif text-3xl sm:text-4xl font-bold text-emerald-600">
                24/48h
              </p>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">
                Express Agro-Logistics
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SECTION 1: CATEGORIES SECTION (Icon-size category images with minimal animations) */}
      <CategoriesSection
        categories={categories}
        isLoading={isLoadingCategories}
      />

      {/* SECTION 2: FEATURED HARVESTS / MARKETPLACE PREVIEW */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs  tracking-widest text-emerald-700 font-bold mb-2">
                <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                Fresh From The Soil
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900">
                Featured Harvests Today
              </h2>
              <p className="text-sm text-slate-600 mt-1 max-w-xl">
                Directly harvested crops with transparent wholesale tiered
                pricing. Buy by the bag, crate, or ton.
              </p>
            </div>

            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
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
                  className="h-80 bg-slate-100 rounded-2xl border border-slate-200 animate-pulse"
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
            <div className="text-center py-16 px-4 bg-slate-50 border border-slate-200 rounded-3xl">
              <Package className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <h3 className="font-serif text-xl font-bold text-slate-900">
                Fresh Harvests Arriving Soon
              </h3>
              <p className="text-sm text-slate-600 max-w-md mx-auto mt-2">
                Producers are currently harvesting crops in Bouaké, Korhogo, and
                Yamoussoukro. Check back shortly or register your farm today!
              </p>
              <div className="mt-6 flex justify-center gap-4">
                <Link
                  href="/products"
                  className="btn-primary text-xs py-2.5 px-6"
                >
                  Visit Marketplace
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>    
     
      <BulkPricingBanner />  
      <HowItWorksSection />    
      <section
        id="benefits"
        className="py-20 bg-slate-50 border-t border-slate-200"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs  tracking-widest text-emerald-700 font-bold">
              The Agricultural Revolution
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 mt-2">
              Why Choose Agro Connect?
            </h2>
            <p className="text-sm text-slate-600 mt-3">
              We bridge the gap between rural Ivorian farmers, professional
              transport fleets, and buyers with cutting-edge technology and
              verified fair trade.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Benefit 1 */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35 }}
              whileHover={{ y: -4 }}
              className="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-300 space-y-4"
            >
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="font-serif text-xl font-bold text-slate-900">
                100% Certified Direct Sourcing
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Every producer undergoes rigorous validation of their identity,
                land certificates, and farm photos. You buy genuine, traceable
                Ivorian produce straight from the source.
              </p>
            </motion.div>

            {/* Benefit 2 */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: 0.08 }}
              whileHover={{ y: -4 }}
              className="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-300 space-y-4"
            >
              <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                <TrendingDown className="w-7 h-7" />
              </div>
              <h3 className="font-serif text-xl font-bold text-slate-900">
                Dynamic Bulk Tier Pricing
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Whether you need 5 kg for your home or 50 tons for a hotel
                chain, our automatic tiered pricing rewards volume with
                substantial, instant discounts.
              </p>
            </motion.div>

            {/* Benefit 3 */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: 0.16 }}
              whileHover={{ y: -4 }}
              className="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-300 space-y-4"
            >
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                <Truck className="w-7 h-7" />
              </div>
              <h3 className="font-serif text-xl font-bold text-slate-900">
                OTP-Protected Agro Logistics
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Dedicated registered drivers pick up products directly from farm
                hubs. Orders are confirmed upon arrival using an encrypted
                6-digit OTP code before funds are released.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SECTION 7: TRUST GUARANTEES PILLARS */}
      <TrustGuaranteesSection />
       <TopRatedProducersSection />   

      {/* SECTION 8: FOR WHOM SECTION */}
      <section
        id="for-whom"
        className="py-20 bg-white border-t border-slate-200"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs  tracking-widest text-emerald-700 font-bold">
              Tailored Ecosystem
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 mt-2">
              Built For Everyone in the Supply Chain
            </h2>
            <p className="text-sm text-slate-600 mt-3">
              Discover how Agro Connect empowers producers, transporters, and
              buyers across Bangladesh.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Buyer Card */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35 }}
              whileHover={{ y: -4 }}
              className="p-7 rounded-3xl bg-slate-50 border border-slate-200/90 space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-emerald-600 mb-4 shadow-sm">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-xl font-bold text-slate-900">
                  For Buyers & Businesses
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Access freshest produce at unbeatable farm prices. Pay
                  securely via Stripe with guaranteed doorstep delivery in
                  Abidjan and major cities.
                </p>
                <ul className="mt-4 space-y-2 text-xs text-slate-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Verified farm freshness guarantee
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Volume discounts on bulk purchase
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
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
            </motion.div>

            {/* Producer Card */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: 0.08 }}
              whileHover={{ y: -4 }}
              className="p-7 rounded-3xl bg-white border-2 border-emerald-600 shadow-md space-y-4 flex flex-col justify-between relative"
            >
              <span className="absolute -top-3 right-6 px-3 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-extrabold  tracking-wider shadow-sm">
                High Demand
              </span>
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-4">
                  <Sprout className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-xl font-bold text-slate-900">
                  For Farmers & Producers
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Sell directly to thousands of buyers without intermediaries
                  taking your profit. Configure bulk discount tiers and track
                  earnings seamlessly.
                </p>
                <ul className="mt-4 space-y-2 text-xs text-slate-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Set your own unit & bulk tier prices
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Automatic escrow payout release
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Dedicated farmer dashboard
                  </li>
                </ul>
              </div>

              <Link
                href="/register"
                className="btn-primary w-full text-xs py-2.5 text-center mt-6"
              >
                Join as a Producer
              </Link>
            </motion.div>

            {/* Driver Card */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: 0.16 }}
              whileHover={{ y: -4 }}
              className="p-7 rounded-3xl bg-slate-50 border border-slate-200/90 space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-emerald-600 mb-4 shadow-sm">
                  <Truck className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-xl font-bold text-slate-900">
                  For Drivers & Transporters
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Earn competitive income moving fresh crops from regional hubs
                  to urban tables. Bikes, vans, pickups, and trucks are all
                  welcome.
                </p>
                <ul className="mt-4 space-y-2 text-xs text-slate-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Flexible delivery scheduling
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Instant OTP completion verification
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
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
            </motion.div>
          </div>
        </div>
      </section>

      {/* SECTION 9: VERIFIED TESTIMONIALS */}
      <TestimonialsSection />

      {/* SECTION 10: FREQUENTLY ASKED QUESTIONS */}
      <FaqSection />

      {/* SECTION 11: WEEKLY HARVEST NEWSLETTER & COMMODITY ALERTS */}
      <HarvestNewsletterSection />

      {/* CALL TO ACTION BANNER */}
      <section className="py-20 bg-slate-900 text-white border-t border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="font-serif text-4xl sm:text-5xl font-extrabold text-white">
            Ready to experience fresh harvests direct from the source?
          </h2>
          <p className="text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Join thousands of satisfied buyers, cooperative producers, and
            logistics drivers transforming agriculture in Bangladesh today.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Link
              href="/register"
              className="px-8 py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition-all hover:scale-105 active:scale-95"
            >
              Get Started for Free
            </Link>
            <Link
              href="/products"
              className="px-8 py-3.5 rounded-full bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm border border-slate-700 transition-all"
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
