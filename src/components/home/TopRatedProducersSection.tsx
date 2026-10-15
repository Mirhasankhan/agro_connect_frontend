"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Star,
  MapPin,
  Award,
  ShieldCheck,
  ArrowRight,
  ShoppingBag,
  Sprout,
} from "lucide-react";
import { useGetTopRatedProducersQuery } from "@/redux/features/shopping/shoppingApi";
import { TTopRatedProducer } from "@/types";

// Curated atmospheric farm covers for producers without an uploaded farm cover photo
const FALLBACK_FARM_COVERS = [
  "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1592982537447-6f2a6a0c5c1b?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=800&q=80",
];

const FALLBACK_AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80",
];

interface TopRatedProducersSectionProps {
  producers?: TTopRatedProducer[];
  isLoading?: boolean;
}

export default function TopRatedProducersSection({
  producers: propProducers,
  isLoading: propLoading,
}: TopRatedProducersSectionProps) {
  const { data: apiResponse, isLoading: apiLoading } = useGetTopRatedProducersQuery();

  const isLoading = propLoading !== undefined ? propLoading : apiLoading;
  const rawProducers = propProducers || apiResponse?.data || [];
  const producers = Array.isArray(rawProducers) ? rawProducers : [];

  const getRankBadge = (index: number) => {
    switch (index) {
      case 0:
        return {
          label: "#1 Top Producer",
          bg: "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-amber-500/20",
          icon: Award,
        };
      case 1:
        return {
          label: "#2 Top Producer",
          bg: "bg-gradient-to-r from-slate-700 to-slate-800 text-white shadow-slate-700/20",
          icon: Award,
        };
      case 2:
        return {
          label: "#3 Top Producer",
          bg: "bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-emerald-600/20",
          icon: Award,
        };
      default:
        return {
          label: `#${index + 1} Rated Producer`,
          bg: "bg-slate-800 text-white shadow-slate-900/10",
          icon: Award,
        };
    }
  };

  return (
    <section
      id="top-rated-producers"
      className="py-20 md:py-24 bg-gradient-to-b from-white via-[#f7faf8] to-white border-t border-b border-emerald-950/5 relative overflow-hidden"
    >
      {/* Decorative ambient background accents */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none -z-0" />
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-amber-100/30 rounded-full blur-3xl pointer-events-none -z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">

            {/* Main Title */}
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: 0.05 }}
              className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight"
            >
              Our Top Rated Producer<span className="text-emerald-600">s</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: 0.1 }}
              className="text-sm sm:text-base text-slate-600 mt-3 leading-relaxed"
            >
              Meet the highest-rated farming leaders of Bangladesh. Recognized for peak harvest freshness,
              verified land stewardship, and exceptional customer ratings.
            </motion.p>
          </div>
        </div>

        {/* Loading Skeletons */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs animate-pulse"
              >
                <div className="h-28 bg-slate-200" />
                <div className="p-6 pt-0 space-y-4">
                  <div className="-mt-10 flex justify-between items-end">
                    <div className="w-20 h-20 rounded-2xl bg-slate-300 border-4 border-white" />
                    <div className="w-16 h-6 rounded-full bg-slate-200" />
                  </div>
                  <div className="space-y-2 pt-2">
                    <div className="h-5 bg-slate-200 rounded-md w-3/4" />
                    <div className="h-4 bg-slate-100 rounded-md w-1/2" />
                  </div>
                  <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-100">
                    <div className="h-8 bg-slate-100 rounded-lg" />
                    <div className="h-8 bg-slate-100 rounded-lg" />
                    <div className="h-8 bg-slate-100 rounded-lg" />
                  </div>
                  <div className="h-10 bg-slate-200 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error / Empty Fallback */}
        {!isLoading && producers.length === 0 && (
          <div className="p-10 rounded-3xl bg-white border border-slate-200/90 shadow-sm text-center max-w-2xl mx-auto space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
              <Sprout className="w-8 h-8" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-slate-900">
              Top Producers Are Currently in Harvest
            </h3>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              Our regional verification inspectors are tallying the latest customer reviews and fresh crop batches.
              Check back shortly for the latest top-rated producers.
            </p>
          </div>
        )}

        {/* Producers Grid */}
        {!isLoading && producers.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {producers.map((producer, index) => {
              const rank = getRankBadge(index);
              const RankIcon = rank.icon;
              const farmCover =
                producer.farmPhotoUrl ||
                FALLBACK_FARM_COVERS[index % FALLBACK_FARM_COVERS.length];
              const profileImg =
                producer.profileImage ||
                FALLBACK_AVATARS[index % FALLBACK_AVATARS.length];
              const farmName = producer.farmName || `${producer.fullName}'s Farm`;
              const location = producer.farmLocation || "Bangladesh";
              const ratingScore = Number(producer.avgRating || 5).toFixed(1);

              return (
                <motion.div
                  key={producer.producerId}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
                  whileHover={{ y: -6 }}
                  className="group bg-white rounded-3xl border border-slate-200/90 hover:border-emerald-500/40 shadow-xs hover:shadow-xl hover:shadow-emerald-900/5 transition-all duration-300 overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    {/* Card Cover with Rank & Rating Badges */}
                    <div className="relative h-28 w-full overflow-hidden bg-emerald-950">
                      <Image
                        src={farmCover}
                        alt={`${farmName} harvest`}
                        fill
                        unoptimized
                        className="object-cover object-center group-hover:scale-105 transition-transform duration-500 opacity-75"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                      {/* Rank Pill Badge */}
                      <div className="absolute top-3 left-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide shadow-md ${rank.bg}`}
                        >
                          <RankIcon className="w-3 h-3" />
                          {rank.label}
                        </span>
                      </div>

                      {/* Rating Pill Badge */}
                      <div className="absolute top-3 right-3">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md text-slate-900 text-xs font-extrabold shadow-md border border-slate-200/60">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                          <span>{ratingScore}</span>
                        </span>
                      </div>
                    </div>

                    {/* Card Content & Profile Header */}
                    <div className="p-5 pt-0">
                      {/* Avatar & Verification Indicator */}
                      <div className="-mt-10 mb-3 flex items-end justify-between">
                        <div className="relative">
                          <div className="w-20 h-20 rounded-2xl overflow-hidden border-4 border-white shadow-md relative bg-emerald-50">
                            <Image
                              src={profileImg}
                              alt={producer.fullName}
                              fill
                              unoptimized
                              className="object-cover object-center"
                            />
                          </div>
                          <span
                            className="absolute -bottom-1 -right-1 bg-emerald-600 text-white rounded-full p-1 border-2 border-white shadow-xs"
                            title="Certified Verified Producer"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                          </span>
                        </div>

                        {/* Order Count Highlight */}
                        <div className="text-right">
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/70">
                            <ShoppingBag className="w-3 h-3 text-emerald-600" />
                            <span>
                              {producer.totalOrders > 0
                                ? `${producer.totalOrders} ${producer.totalOrders === 1 ? "order" : "orders"
                                }`
                                : "Fresh Harvest"}
                            </span>
                          </span>
                        </div>
                      </div>

                      {/* Producer Info */}
                      <div>
                        <Link
                          href={`/farms/${producer.producerId}`}
                          className="block group/link"
                        >
                          <h3 className="font-serif text-lg font-bold text-slate-900 group-hover/link:text-emerald-700 transition-colors line-clamp-1">
                            {farmName}
                          </h3>
                        </Link>
                        <p className="text-xs text-slate-500 font-medium mt-0.5 flex items-center gap-1.5">
                          <span>{producer.fullName}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300" />
                          <span className="text-emerald-700 font-semibold">Master Producer</span>
                        </p>
                      </div>

                      {/* Location */}
                      <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-2.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate font-medium">{location}</span>
                      </div>

                      {/* Statistics Matrix */}
                      <div className="grid grid-cols-3 gap-2 py-3 mt-4 border-t border-b border-slate-100 bg-slate-50/70 rounded-2xl px-2 text-center">
                        <div className="space-y-0.5">
                          <p className="text-[10px] text-slate-500 font-medium">Rating</p>
                          <p className="text-sm font-bold text-slate-900 flex items-center justify-center gap-0.5">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-500 inline" />
                            {ratingScore}
                          </p>
                        </div>
                        <div className="space-y-0.5 border-x border-slate-200/70">
                          <p className="text-[10px] text-slate-500 font-medium">Deliveries</p>
                          <p className="text-sm font-bold text-slate-900">
                            {producer.totalOrders}
                          </p>
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-[10px] text-slate-500 font-medium">Harvests</p>
                          <p className="text-sm font-bold text-slate-900">
                            {producer.totalProductCount}
                          </p>
                        </div>
                      </div>

                      {/* Trust guarantee badge */}
                      <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-500">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">Identity & Land Verified by Agro Connect</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Action Link */}
                  <div className="p-5 pt-0">
                    <Link
                      href={`/farms/${producer.producerId}`}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white font-semibold text-xs transition-all duration-200 border border-emerald-200/80 hover:border-emerald-600 group/btn shadow-2xs"
                    >
                      <span>Visit Farm Profile</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-1" />
                    </Link>
                  </div>
                </motion.div>
              );
            })}

          </div>
        )}
      </div>
    </section>
  );
}
