"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  ShieldCheck,
  Sprout,
  MessageSquare,
  Phone,
  Share2,
  Star,
  Package,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Building2,
  ShoppingBag,
  ExternalLink,
} from "lucide-react";
import { toast } from "react-toastify";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useGetFarmInfoQuery } from "@/redux/features/product/productApi";
import { formatCurrency, formatUnit } from "@/utils/formatters";
import { TFarmReview } from "@/types";

export default function FarmProfilePage() {
  const params = useParams();
  const router = useRouter();
  const farmId = (params?.id as string) || "";

  const [activeTab, setActiveTab] = useState<"harvests" | "about" | "reviews">("harvests");
  const [harvestSearch, setHarvestSearch] = useState("");

  const {
    data: farmResponse,
    isLoading,
    isError,
  } = useGetFarmInfoQuery(farmId, {
    skip: !farmId,
  });

  const producer = farmResponse?.data?.producer;

  const farmName =
    producer?.producerProfile?.farmName ||
    producer?.producerProfile?.companyName ||
    producer?.fullName ||
    "Local Producer Farm";

  const fallbackCover =
    "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1600&q=80";
  const coverImage = producer?.producerProfile?.farmPhotoUrl || fallbackCover;

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Farm profile link copied to clipboard!");
    }
  };

  // Extract all reviews across this producer's products
  const allReviews: { review: TFarmReview; productName: string; productId: string }[] = [];
  if (producer?.products && Array.isArray(producer.products)) {
    producer.products.forEach((prod) => {
      if (prod.reviews && Array.isArray(prod.reviews)) {
        prod.reviews.forEach((r) => {
          allReviews.push({
            review: r,
            productName: prod.name,
            productId: prod.id,
          });
        });
      }
    });
  }

  // Calculate overall rating
  let totalRatingSum = 0;
  let totalReviewCount = 0;
  if (producer?.products) {
    producer.products.forEach((p) => {
      if (p.avgRating && p.avgRating > 0) {
        totalRatingSum += Number(p.avgRating) * (p.totalReviews || 1);
        totalReviewCount += p.totalReviews || 1;
      }
    });
  }
  const averageFarmRating =
    totalReviewCount > 0 ? (totalRatingSum / totalReviewCount).toFixed(1) : "5.0";

  // Filtered products list
  const filteredProducts = (producer?.products || []).filter((p) =>
    p.name.toLowerCase().includes(harvestSearch.toLowerCase().trim())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1 w-full flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin mb-4" />
          <p className="text-sm font-medium text-slate-600">Loading farm profile and harvest records...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (isError || !producer) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex-1 w-full text-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-slate-900">Farm Not Found</h1>
          <p className="text-slate-500 text-sm max-w-md mx-auto mt-2 mb-6">
            The agricultural farm or producer profile you are searching for may not exist or has been deactivated.
          </p>
          <Link href="/products" className="btn-primary text-xs py-2.5 px-6">
            Back to Marketplace
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const locationText = [
    producer.producerProfile?.farmLocation,
    producer.city,
    producer.region,
  ]
    .filter(Boolean)
    .join(", ") || "Côte d'Ivoire";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-emerald-500 selection:text-white">
      <Navbar />

      <main className="flex-1 w-full pb-20">
        {/* HERO / COVER BANNER */}
        <div className="relative w-full h-64 sm:h-80 md:h-96 bg-slate-900 overflow-hidden">
          <Image
            src={coverImage}
            alt={farmName}
            fill
            priority
            unoptimized
            className="object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

          {/* Top Breadcrumb */}
          <div className="absolute top-6 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-white/90 text-xs">
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 hover:bg-black/60 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back
            </button>
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 hover:bg-black/60 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              Share Farm
            </button>
          </div>
        </div>

        {/* FARM HEADER & IDENTITY CARD */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 sm:-mt-24 relative z-10">
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl p-6 sm:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                {/* Farmer / Farm Avatar */}
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-emerald-100 border-4 border-white shadow-md overflow-hidden shrink-0 flex items-center justify-center">
                  {producer.profileImage ? (
                    <Image
                      src={producer.profileImage}
                      alt={farmName}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <span className="font-serif text-3xl sm:text-4xl font-bold text-emerald-800">
                      {farmName.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Certified Local Producer
                    </span>
                    {producer.producerProfile?.producerType && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold">
                        <Building2 className="w-3.5 h-3.5" />
                        {producer.producerProfile.producerType === "Company"
                          ? "Commercial Enterprise"
                          : "Smallholder Farmer"}
                      </span>
                    )}
                  </div>

                  <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
                    {farmName}
                  </h1>

                  <p className="text-xs sm:text-sm text-slate-500 font-medium">
                    Managed by <strong className="text-slate-800">{producer.fullName}</strong>
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
                    <span className="flex items-center gap-1 text-emerald-700 font-medium">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      {locationText}
                    </span>
                    {producer.producerProfile?.farmSize && (
                      <span className="flex items-center gap-1 text-slate-500">
                        <Sprout className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                        {producer.producerProfile.farmSize} Hectares Cultivated
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-amber-700 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      {averageFarmRating} ({allReviews.length} reviews)
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
                <Link
                  id="farm-message-btn"
                  href={`/messages?userId=${producer.id}&userName=${encodeURIComponent(
                    farmName
                  )}&userRole=PRODUCER`}
                  className="btn-primary py-2.5 px-6 text-xs font-semibold flex items-center gap-2 shadow-sm"
                >
                  <MessageSquare className="w-4 h-4" />
                  Chat with Producer
                </Link>
                {producer.phoneNumber && (
                  <a
                    href={`tel:${producer.phoneNumber}`}
                    className="btn-secondary py-2.5 px-4 text-xs font-semibold flex items-center gap-1.5"
                    title="Call Producer"
                  >
                    <Phone className="w-4 h-4 text-emerald-600" />
                    <span>Call</span>
                  </a>
                )}
              </div>
            </div>

            {/* Quick Farm Stats Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-slate-100">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <p className="text-[11px] font-semibold text-slate-500  tracking-wider">
                  Active Harvests
                </p>
                <p className="font-serif text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
                  {producer.products?.length || 0} Crops
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <p className="text-[11px] font-semibold text-slate-500  tracking-wider">
                  Farm Status
                </p>
                <p className="font-serif text-xl sm:text-2xl font-bold text-emerald-700 mt-0.5 flex items-center gap-1.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  Verified
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <p className="text-[11px] font-semibold text-slate-500  tracking-wider">
                  Satisfaction
                </p>
                <p className="font-serif text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
                  {averageFarmRating} / 5.0
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <p className="text-[11px] font-semibold text-slate-500  tracking-wider">
                  Escrow Protection
                </p>
                <p className="font-serif text-xl sm:text-2xl font-bold text-emerald-700 mt-0.5">
                  100% Guaranteed
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* TABS NAVIGATION */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab("harvests")}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 ${activeTab === "harvests"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
            >
              Harvests & Produce ({producer.products?.length || 0})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("about")}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 ${activeTab === "about"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
            >
              Farm Details & Practices
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("reviews")}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 ${activeTab === "reviews"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
            >
              Customer Reviews ({allReviews.length})
            </button>
          </div>
        </div>

        {/* TAB CONTENTS */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          {/* TAB 1: HARVESTS & PRODUCE */}
          {activeTab === "harvests" && (
            <div className="space-y-6">
              {/* Search Within Farm */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs text-slate-500 font-medium">
                  Showing available harvests directly sourced from {farmName}
                </p>
                <div className="w-full sm:w-72">
                  <input
                    type="text"
                    placeholder="Search this farm's crops..."
                    value={harvestSearch}
                    onChange={(e) => setHarvestSearch(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-200/90 p-12 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                    <Package className="w-7 h-7" />
                  </div>
                  <h3 className="font-serif text-lg font-bold text-slate-900">
                    No matching produce found
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    {harvestSearch
                      ? "Try searching for a different crop name."
                      : "This farm currently has no published harvest listings available."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredProducts.map((crop) => {
                    const cropImage =
                      crop.imageUrls?.[0] ||
                      "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80";

                    return (
                      <div
                        key={crop.id}
                        className="group bg-white border border-slate-200/90 hover:border-emerald-500/60 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg flex flex-col justify-between"
                      >
                        <div>
                          {/* Image */}
                          <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
                            <Link href={`/products/${crop.id}`} className="block w-full h-full">
                              <Image
                                src={cropImage}
                                alt={crop.name}
                                fill
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            </Link>
                            <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-white/95 backdrop-blur-md text-emerald-800 text-[10px] font-bold border border-emerald-200">
                              Fresh Harvest
                            </span>
                          </div>

                          {/* Info */}
                          <div className="p-4 space-y-2">
                            <div className="flex items-center justify-between text-xs text-slate-500">
                              <span className="flex items-center gap-1 font-semibold text-amber-700">
                                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                {crop.avgRating ? Number(crop.avgRating).toFixed(1) : "5.0"}
                              </span>
                              <span className="text-[11px] text-slate-400">
                                {crop._count?.orderItems || 0} orders fulfilled
                              </span>
                            </div>

                            <Link href={`/products/${crop.id}`}>
                              <h3 className="font-serif font-bold text-slate-900 text-base leading-snug line-clamp-1 group-hover:text-emerald-700 transition-colors">
                                {crop.name}
                              </h3>
                            </Link>

                            <div className="pt-2 flex items-baseline gap-1">
                              <span className="font-serif text-lg font-bold text-slate-900">
                                {formatCurrency(crop.pricePerUnit)}
                              </span>
                              <span className="text-xs text-slate-500 font-medium">
                                / {formatUnit(crop.sellingUnit)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Card Footer Button */}
                        <div className="p-4 pt-0">
                          <Link
                            href={`/products/${crop.id}`}
                            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white text-xs font-semibold border border-emerald-200 hover:border-emerald-600 transition-all shadow-sm"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                            View & Purchase
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ABOUT THE FARM & PRACTICES */}
          {activeTab === "about" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-3xl border border-slate-200/90 p-7 space-y-4 shadow-sm">
                  <h3 className="font-serif text-xl font-bold text-slate-900">
                    About {farmName}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {farmName} operates as a verified agricultural producer partner on Agro Connect.
                    All harvest batches are cut fresh upon order confirmation and collected directly
                    via our temperature-controlled driver fleet.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                      <p className="text-[11px]  tracking-wider text-slate-400 font-semibold">
                        Location & Terroir
                      </p>
                      <p className="text-xs font-bold text-slate-800">{locationText}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                      <p className="text-[11px]  tracking-wider text-slate-400 font-semibold">
                        Farm Scale
                      </p>
                      <p className="text-xs font-bold text-slate-800">
                        {producer.producerProfile?.farmSize
                          ? `${producer.producerProfile.farmSize} Hectares`
                          : "Commercial Farm Area"}
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                      <p className="text-[11px]  tracking-wider text-slate-400 font-semibold">
                        Producer Classification
                      </p>
                      <p className="text-xs font-bold text-slate-800">
                        {producer.producerProfile?.producerType || "Certified Smallholder"}
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                      <p className="text-[11px]  tracking-wider text-slate-400 font-semibold">
                        Delivery Logistics
                      </p>
                      <p className="text-xs font-bold text-slate-800">
                        OTP Handover Guaranteed
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-3xl border border-slate-200/90 p-7 space-y-4 shadow-sm">
                  <h3 className="font-serif text-xl font-bold text-slate-900">
                    Direct Sourcing Guarantees
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">
                          100% Traceable Harvest
                        </h4>
                        <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                          Every crop is harvested directly from {farmName}&apos;s verified land
                          without third-party broker blending.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">
                          Fair Farm-Gate Pricing
                        </h4>
                        <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                          Your purchase pays {producer.fullName} directly via our escrow payment
                          system, empowering sustainable agricultural livelihoods.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">
                          Inspected Upon Arrival
                        </h4>
                        <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                          Inspect crop freshness and weight when the delivery vehicle arrives. Share
                          the 6-digit OTP code only once fully satisfied.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar Contact & Inquiries */}
              <div className="space-y-6">
                <div className="bg-white rounded-3xl border border-slate-200/90 p-6 space-y-4 shadow-sm">
                  <h4 className="font-serif font-bold text-slate-900 text-base">
                    Contact Farm Office
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Have questions about crop availability, bulk volume shipments, or harvesting
                    schedules? Reach out directly.
                  </p>
                  <div className="space-y-2 pt-2">
                    <Link
                      href={`/messages?userId=${producer.id}&userName=${encodeURIComponent(
                        farmName
                      )}&userRole=PRODUCER`}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold text-white transition-colors shadow-sm"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Send Direct Message
                    </Link>
                    {producer.phoneNumber && (
                      <a
                        href={`tel:${producer.phoneNumber}`}
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 border border-slate-200 transition-colors"
                      >
                        <Phone className="w-4 h-4 text-emerald-600" />
                        Call {producer.phoneNumber}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CUSTOMER REVIEWS */}
          {activeTab === "reviews" && (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-7 space-y-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div>
                  <h3 className="font-serif text-xl font-bold text-slate-900">
                    Buyer Reviews & Ratings
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Verified feedback from customers who purchased harvests from this farm.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-serif text-2xl font-bold text-slate-900">
                      {averageFarmRating} / 5.0
                    </p>
                    <p className="text-[11px] text-slate-400">{allReviews.length} total reviews</p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-500">
                    <Star className="w-6 h-6 fill-amber-400" />
                  </div>
                </div>
              </div>

              {allReviews.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto mb-2">
                    <Star className="w-6 h-6" />
                  </div>
                  <p className="font-serif font-bold text-slate-800 text-base">No reviews yet</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Be among the first buyers to order fresh produce from {farmName} and leave a review!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {allReviews.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl bg-slate-50/70 border border-slate-100 space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
                            {item.review.buyer?.fullName?.charAt(0).toUpperCase() || "B"}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900">
                              {item.review.buyer?.fullName || "Verified Buyer"}
                            </p>
                            <Link
                              href={`/products/${item.productId}`}
                              className="text-[11px] text-emerald-700 hover:underline flex items-center gap-1"
                            >
                              Reviewed: {item.productName}
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-3.5 h-3.5 ${star <= item.review.rating
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-slate-200"
                                }`}
                            />
                          ))}
                        </div>
                      </div>

                      {item.review.comment && (
                        <p className="text-xs text-slate-600 leading-relaxed pt-1">
                          &ldquo;{item.review.comment}&rdquo;
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
