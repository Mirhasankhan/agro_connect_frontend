"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ShoppingCart,
  Heart,
  Star,
  MapPin,
  CheckCircle2,
  TrendingDown,
  Loader2,
} from "lucide-react";
import { toast } from "react-toastify";
import { TProduct } from "@/types";
import { formatCurrency, formatUnit } from "@/utils/formatters";
import {
  useAddToCartMutation,
  useAddToWishlistMutation,
} from "@/redux/features/shopping/shoppingApi";
import { useAppSelector } from "@/redux/hooks";

interface ProductCardProps {
  product: TProduct;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [addToCartMutation, { isLoading: isAddingToCart }] = useAddToCartMutation();
  const [addToWishlistMutation, { isLoading: isAddingWishlist }] = useAddToWishlistMutation();
  const [isWishlisted, setIsWishlisted] = useState(
    Array.isArray(product.wishlists) && product.wishlists.length > 0
  );

  const fallbackImage =
    "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80";
  const displayImage = product.imageUrls?.[0] || fallbackImage;

  const farmName =
    product.producer?.producerProfile?.farmName ||
    product.producer?.producerProfile?.companyName ||
    product.producer?.fullName ||
    "Local Producer";

  const city = product.producer?.producerProfile?.city || "Ivory Coast";

  const hasTiers =
    (product.pricingTiers && product.pricingTiers.length > 0) ||
    Boolean(product._count?.pricingTiers && product._count.pricingTiers > 0);

  // Compute best bulk discount percentage if tiers are loaded
  let maxDiscountPercent = 0;
  if (product.pricingTiers && product.pricingTiers.length > 0) {
    const minTierPrice = Math.min(
      ...product.pricingTiers.map((t) => Number(t.pricePerUnit))
    );
    if (minTierPrice < product.pricePerUnit) {
      maxDiscountPercent = Math.round(
        ((product.pricePerUnit - minTierPrice) / product.pricePerUnit) * 100
      );
    }
  }

  const handleQuickAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.info("Please log in to add items to your cart");
      return;
    }

    try {
      await addToCartMutation({
        productId: product.id,
        quantity: 1,
      }).unwrap();
      toast.success(`${product.name} added to cart!`);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to add item to cart");
    }
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.info("Please log in to add items to your wishlist");
      return;
    }

    try {
      await addToWishlistMutation(product.id).unwrap();
      setIsWishlisted(!isWishlisted);
      toast.success(
        isWishlisted ? "Removed from wishlist" : "Added to wishlist!"
      );
    } catch (err: any) {
      toast.error(err?.data?.message || "Wishlist update failed");
    }
  };

  return (
    <div className="group relative bg-white border border-slate-200/90 hover:border-emerald-500/60 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg flex flex-col">
      {/* Product Image & Badges */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
        <Link href={`/products/${product.id}`} className="block w-full h-full">
          <Image
            src={displayImage}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        </Link>

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10 pointer-events-none">
          {product.category?.name && (
            <span className="px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-emerald-800 text-[11px] font-semibold tracking-wide border border-emerald-200 shadow-sm">
              {product.category.name}
            </span>
          )}

          {hasTiers && (
            <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold flex items-center gap-1 shadow-sm">
              <TrendingDown className="w-3 h-3 text-amber-600" />
              {maxDiscountPercent > 0
                ? `Bulk: Up to -${maxDiscountPercent}%`
                : "Tier Discounts"}
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={handleToggleWishlist}
          disabled={isAddingWishlist}
          className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-md border transition-all z-10 ${
            isWishlisted
              ? "bg-rose-50 border-rose-200 text-rose-600 shadow-sm"
              : "bg-white/80 border-slate-200/80 text-slate-500 hover:text-slate-800 hover:bg-white shadow-sm"
          }`}
          title="Wishlist"
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? "fill-rose-500 text-rose-500" : ""}`} />
        </button>
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Producer & Location */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1.5">
            <span className="flex items-center gap-1 text-emerald-700 font-medium truncate max-w-[140px]">
              <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
              {farmName}
            </span>
            <span className="flex items-center gap-0.5 shrink-0 text-slate-400">
              <MapPin className="w-3 h-3" />
              {city}
            </span>
          </div>

          {/* Product Title */}
          <Link href={`/products/${product.id}`} className="block group-hover:text-emerald-700">
            <h3 className="font-serif font-bold text-slate-900 text-base leading-snug line-clamp-1 group-hover:text-emerald-700 transition-colors">
              {product.name}
            </h3>
          </Link>

          {/* Rating & Stock */}
          <div className="flex items-center gap-3 mt-1.5 text-xs">
            <div className="flex items-center gap-1 text-amber-600 font-semibold">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{product.avgRating ? Number(product.avgRating).toFixed(1) : "5.0"}</span>
              <span className="text-slate-400 text-[10px]">
                ({product.totalReviews || 0})
              </span>
            </div>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500 text-[11px]">
              Stock: {product.availableQuantity} {formatUnit(product.sellingUnit)}
            </span>
          </div>
        </div>

        {/* Price & Quick Add */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <span className="text-[10px] text-slate-400 block font-medium">Price per unit</span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-emerald-600 font-mono">
                {formatCurrency(product.pricePerUnit)}
              </span>
              <span className="text-[11px] text-slate-500 font-sans">
                / {formatUnit(product.sellingUnit)}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleQuickAddToCart}
            disabled={isAddingToCart || product.availableQuantity <= 0}
            className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white shadow-sm transition-transform active:scale-95 flex items-center justify-center"
            title="Add to Cart"
          >
            {isAddingToCart ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ShoppingCart className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
