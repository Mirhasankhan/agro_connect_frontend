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
    <div className="group relative bg-[#0b2416] border border-forest-700/60 hover:border-emerald-500/80 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-950/60 flex flex-col">
      {/* Product Image & Badges */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-forest-950">
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
            <span className="px-2.5 py-1 rounded-full bg-forest-950/80 backdrop-blur-md text-emerald-300 text-[11px] font-semibold tracking-wide border border-forest-700/60">
              {product.category.name}
            </span>
          )}

          {hasTiers && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500/90 text-[#091b10] text-[10px] font-bold flex items-center gap-1 shadow-sm">
              <TrendingDown className="w-3 h-3" />
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
              ? "bg-red-500/20 border-red-500/60 text-red-400"
              : "bg-forest-950/70 border-forest-700/60 text-white/70 hover:text-white hover:bg-forest-900"
          }`}
          title="Wishlist"
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? "fill-red-500" : ""}`} />
        </button>
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Producer & Location */}
          <div className="flex items-center justify-between text-[11px] text-white/60 mb-1.5">
            <span className="flex items-center gap-1 text-emerald-400 font-medium truncate max-w-[140px]">
              <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
              {farmName}
            </span>
            <span className="flex items-center gap-0.5 shrink-0 text-white/50">
              <MapPin className="w-3 h-3" />
              {city}
            </span>
          </div>

          {/* Product Title */}
          <Link href={`/products/${product.id}`} className="block group-hover:text-emerald-300">
            <h3 className="font-serif font-bold text-white text-base leading-snug line-clamp-1 group-hover:text-emerald-300 transition-colors">
              {product.name}
            </h3>
          </Link>

          {/* Rating & Stock */}
          <div className="flex items-center gap-3 mt-1.5 text-xs">
            <div className="flex items-center gap-1 text-amber-400 font-semibold">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span>{product.avgRating ? Number(product.avgRating).toFixed(1) : "5.0"}</span>
              <span className="text-white/40 text-[10px]">
                ({product.totalReviews || 0})
              </span>
            </div>
            <span className="text-white/30">•</span>
            <span className="text-white/60 text-[11px]">
              Stock: {product.availableQuantity} {formatUnit(product.sellingUnit)}
            </span>
          </div>
        </div>

        {/* Price & Quick Add */}
        <div className="mt-4 pt-3 border-t border-forest-800/80 flex items-center justify-between gap-2">
          <div>
            <span className="text-[10px] text-white/50 block">Price per unit</span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-emerald-400 font-mono">
                {formatCurrency(product.pricePerUnit)}
              </span>
              <span className="text-[11px] text-white/60 font-sans">
                / {formatUnit(product.sellingUnit)}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleQuickAddToCart}
            disabled={isAddingToCart || product.availableQuantity <= 0}
            className="p-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:bg-forest-800 disabled:opacity-50 text-white shadow-md shadow-emerald-950/40 transition-transform active:scale-95 flex items-center justify-center"
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
