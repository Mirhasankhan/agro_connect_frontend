"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Layers,
  Sprout,
  Apple,
  Wheat,
  Fish,
  Egg,
  Package,
  Carrot,
  Leaf,
  Coffee,
  Sparkles,
} from "lucide-react";
import { TCategory } from "@/types";

interface CategoriesSectionProps {
  categories?: TCategory[];
  isLoading?: boolean;
}

// Fallback icons mapped by slug or name keyword for resilient display
const getCategoryFallbackIcon = (name: string, slug?: string) => {
  const key = `${name} ${slug || ""}`.toLowerCase();
  if (key.includes("veg") || key.includes("legume") || key.includes("maraich")) return Carrot;
  if (key.includes("fruit") || key.includes("banan") || key.includes("mang")) return Apple;
  if (key.includes("grain") || key.includes("cereal") || key.includes("riz") || key.includes("mais")) return Wheat;
  if (key.includes("fish") || key.includes("seafood") || key.includes("poisson")) return Fish;
  if (key.includes("egg") || key.includes("dairy") || key.includes("lait") || key.includes("oeuf")) return Egg;
  if (key.includes("spice") || key.includes("herb") || key.includes("epice")) return Leaf;
  if (key.includes("bever") || key.includes("cafe") || key.includes("the") || key.includes("coffee")) return Coffee;
  if (key.includes("tuber") || key.includes("root") || key.includes("igname") || key.includes("manioc")) return Sprout;
  return Package;
};

// Curated default categories if backend is still initializing
const DEFAULT_CATEGORIES = [
  {
    id: "cat-veg",
    name: "Vegetables",
    slug: "vegetables",
    description: "Fresh farm greens, tomatoes, onions & peppers",
    imageUrl: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=120&q=80",
  },
  {
    id: "cat-fruits",
    name: "Fruits",
    slug: "fruits",
    description: "Bananas, mangoes, pineapples & citrus",
    imageUrl: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=120&q=80",
  },
  {
    id: "cat-grains",
    name: "Grains & Cereals",
    slug: "grains-cereals",
    description: "Local rice, maize, sorghum & millet",
    imageUrl: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=120&q=80",
  },
  {
    id: "cat-tubers",
    name: "Tubers & Roots",
    slug: "tubers-roots",
    description: "Yams, cassava, sweet potatoes & taro",
    imageUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=120&q=80",
  },
  {
    id: "cat-spices",
    name: "Spices & Herbs",
    slug: "spices-herbs",
    description: "Ginger, chili pepper, garlic & fresh herbs",
    imageUrl: "https://images.unsplash.com/photo-1596040033282-be0b21901df6?auto=format&fit=crop&w=120&q=80",
  },
  {
    id: "cat-nuts",
    name: "Nuts & Seeds",
    slug: "nuts-seeds",
    description: "Cashews, peanuts, sesame & palm seeds",
    imageUrl: "https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=120&q=80",
  },
  {
    id: "cat-poultry",
    name: "Poultry & Meat",
    slug: "poultry-meat",
    description: "Free-range chicken, eggs & livestock",
    imageUrl: "https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=120&q=80",
  },
  {
    id: "cat-seafood",
    name: "Seafood & Fish",
    slug: "seafood-fish",
    description: "Fresh tilapia, smoked carp & coastal catches",
    imageUrl: "https://images.unsplash.com/photo-1534940562612-4217734125b2?auto=format&fit=crop&w=120&q=80",
  },
  {
    id: "cat-dairy",
    name: "Dairy & Eggs",
    slug: "dairy-eggs",
    description: "Fresh pastoral milk, local cheeses & eggs",
    imageUrl: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=120&q=80",
  },
  {
    id: "cat-processed",
    name: "Processed Foods",
    slug: "processed-foods",
    description: "Attiéké, palm oil, refined flours & honey",
    imageUrl: "https://images.unsplash.com/photo-1471193945509-9ad0617afabf?auto=format&fit=crop&w=120&q=80",
  },
];

export default function CategoriesSection({
  categories = [],
  isLoading = false,
}: CategoriesSectionProps) {
  const router = useRouter();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  // Use provided categories or resilient defaults
  const displayCategories =
    categories && categories.length > 0 ? categories : DEFAULT_CATEGORIES;

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -320 : 320;
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const handleImageError = (id: string) => {
    setImageErrors((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <section className="py-14 bg-gradient-to-b from-white via-emerald-50/20 to-white border-b border-slate-200/80 relative overflow-hidden">
      {/* Subtle background ambient glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-400/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/80 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
              <Layers className="w-3.5 h-3.5 text-emerald-600" />
              <span>Direct Farm Marketplace</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
              Explore by Category
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl">
              Fresh harvests, staples, and livestock straight from certified regional cooperatives.
            </p>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-full border border-slate-200">
              <button
                type="button"
                onClick={() => scroll("left")}
                aria-label="Previous categories"
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-600 hover:text-emerald-700 hover:bg-white transition-all shadow-none hover:shadow-sm"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => scroll("right")}
                aria-label="Next categories"
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-600 hover:text-emerald-700 hover:bg-white transition-all shadow-none hover:shadow-sm"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100/70 px-4 py-2 rounded-full border border-emerald-200/60 transition-colors"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Categories Rail / Grid */}
        {isLoading ? (
          <div className="flex gap-4 overflow-x-hidden py-2">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="flex-shrink-0 w-28 sm:w-32 flex flex-col items-center gap-2.5 p-3 rounded-2xl border border-slate-200/60 bg-slate-50/50 animate-pulse"
              >
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-200" />
                <div className="h-3 w-16 bg-slate-200 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div
            ref={scrollContainerRef}
            className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 pt-1 scrollbar-none snap-x snap-mandatory focus:outline-none scroll-smooth"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {displayCategories.map((category, index) => {
              const FallbackIcon = getCategoryFallbackIcon(
                category.name,
                category.slug
              );
              const hasValidImage =
                category.imageUrl && !imageErrors[category.id];

              return (
                <motion.button
                  key={category.id || index}
                  type="button"
                  onClick={() =>
                    router.push(`/products?categoryId=${category.id}`)
                  }
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-20px" }}
                  transition={{
                    duration: 0.35,
                    delay: Math.min(index * 0.04, 0.4),
                    ease: "easeOut",
                  }}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.96 }}
                  className="group flex-shrink-0 w-[105px] sm:w-[120px] md:w-[128px] snap-start flex flex-col items-center text-center p-3 sm:p-3.5 rounded-2xl bg-white hover:bg-emerald-50/40 border border-slate-200/80 hover:border-emerald-400/80 shadow-sm hover:shadow-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  {/* Small Icon Badge Container */}
                  <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-b from-slate-50 to-emerald-50/60 border border-slate-200/90 group-hover:border-emerald-300 flex items-center justify-center p-2 mb-2 transition-all duration-300 group-hover:scale-105 group-hover:shadow-inner">
                    {hasValidImage ? (
                      <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl overflow-hidden bg-white/90 shadow-xs flex items-center justify-center">
                        <Image
                          src={category.imageUrl!}
                          alt={category.name}
                          width={44}
                          height={44}
                          unoptimized
                          onError={() => handleImageError(category.id)}
                          className="w-full h-full object-cover object-center transform transition-transform duration-300 group-hover:scale-115"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                        <FallbackIcon className="w-5 h-5 text-emerald-700" />
                      </div>
                    )}

                    {/* Subtle dot indicator */}
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  </div>

                  {/* Category Name */}
                  <span className="text-xs sm:text-xs font-semibold text-slate-800 group-hover:text-emerald-700 transition-colors line-clamp-1 max-w-full leading-tight">
                    {category.name}
                  </span>

                  {/* Micro subtext */}
                  <span className="text-[10px] text-slate-600 group-hover:text-emerald-600/90 mt-0.5 transition-colors font-medium">
                    Explore &rarr;
                  </span>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
