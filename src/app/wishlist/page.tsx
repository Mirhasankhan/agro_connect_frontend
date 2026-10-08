"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Heart,
  ShoppingCart,
  Trash2,
  ArrowRight,
  ShieldCheck,  
  ArrowLeft,
  Sparkles,
  Loader2,
  ExternalLink,  
} from "lucide-react";
import { toast } from "react-toastify";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  useGetWishlistQuery,
  useToggleWishlistMutation,
  useAddToCartMutation,
} from "@/redux/features/shopping/shoppingApi";
import { useAppSelector } from "@/redux/hooks";
import { formatCurrency, formatUnit } from "@/utils/formatters";

export default function WishlistPage() {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const { data, isLoading } = useGetWishlistQuery(undefined, {
    skip: !isAuthenticated,
  });

  const [toggleWishlist] = useToggleWishlistMutation();
  const [addToCart] = useAddToCartMutation();

  // Track loading per specific product for smooth UI
  const [processingProductId, setProcessingProductId] = useState<string | null>(null);
  const [addingProductId, setAddingProductId] = useState<string | null>(null);
  const [isAddingAll, setIsAddingAll] = useState(false);

  const wishlistItems = data?.data || [];

  const handleRemoveFromWishlist = async (productId: string, productName: string) => {
    try {
      setProcessingProductId(productId);
      const res = await toggleWishlist(productId).unwrap();
      toast.success(res?.message || `${productName} removed from wishlist`);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to remove item from wishlist");
    } finally {
      setProcessingProductId(null);
    }
  };

  const handleAddToCart = async (productId: string, productName: string, sellingUnit?: string) => {
    try {
      setAddingProductId(productId);
      await addToCart({
        productId,
        quantity: 1,
      }).unwrap();
      toast.success(
        sellingUnit
          ? `1 ${formatUnit(sellingUnit as any)} of ${productName} added to cart!`
          : `${productName} added to cart!`
      );
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to add item to cart");
    } finally {
      setAddingProductId(null);
    }
  };

  const handleAddAllToCart = async () => {
    const availableItems = wishlistItems.filter(
      (item) => item.product && (item.product.availableQuantity ?? 1) > 0
    );

    if (availableItems.length === 0) {
      toast.info("No items in your wishlist are currently in stock");
      return;
    }

    try {
      setIsAddingAll(true);
      let successCount = 0;
      for (const item of availableItems) {
        try {
          await addToCart({
            productId: item.product.id,
            quantity: 1,
          }).unwrap();
          successCount++;
        } catch {
          // Continue with next item if one fails
        }
      }
      if (successCount > 0) {
        toast.success(`Added ${successCount} harvest items to your cart!`);
      } else {
        toast.error("Could not add items to cart. Please try again.");
      }
    } catch (err: any) {
      toast.error("Failed to add items to cart");
    } finally {
      setIsAddingAll(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center py-24 px-4 text-center">
          <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-500 mb-4 shadow-sm">
            <Heart className="w-8 h-8 fill-rose-500" />
          </div>
          <h2 className="font-serif text-3xl font-bold text-slate-900">Your Saved Wishlist Awaits</h2>
          <p className="text-slate-500 text-sm max-w-md mt-2 mb-6">
            Sign in to your Agro Connect account to view, save, and purchase your favorite local produce and farm harvests.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/login?redirect=/wishlist"
              className="px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs transition-colors shadow-sm"
            >
              Sign In to View Wishlist
            </Link>
            <Link
              href="/products"
              className="px-6 py-2.5 rounded-full bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-medium text-xs transition-colors shadow-sm"
            >
              Explore Fresh Marketplace
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Navbar />

      {/* Header Banner */}
      <div className="bg-white border-b border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-500 shrink-0">
                  <Heart className="w-5 h-5 fill-rose-500" />
                </div>
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
                  My Saved Wishlist
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                  {wishlistItems.length} {wishlistItems.length === 1 ? "Item" : "Items"}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1.5 max-w-xl">
                Keep track of seasonal harvests, price updates, and farm goods you want to purchase.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/products"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Browse More Products
              </Link>
              {wishlistItems.length > 0 && (
                <button
                  type="button"
                  onClick={handleAddAllToCart}
                  disabled={isAddingAll}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold transition-colors shadow-sm"
                >
                  {isAddingAll ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Adding to Cart...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-3.5 h-3.5" />
                      Add All Available to Cart
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col"
              >
                <div className="aspect-[4/3] bg-slate-200" />
                <div className="p-4 space-y-3">
                  <div className="h-5 bg-slate-200 rounded w-3/4" />
                  <div className="h-4 bg-slate-200 rounded w-1/2" />
                  <div className="h-8 bg-slate-200 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : wishlistItems.length > 0 ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-200">
              <span>Showing {wishlistItems.length} saved products</span>
              <span className="flex items-center gap-1 text-emerald-700 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                Direct farm-to-table pricing
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {wishlistItems.map((item) => {
                const product = item.product;
                if (!product) return null;

                const fallbackImage =
                  "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80";
                const displayImage = product.imageUrls?.[0] || fallbackImage;

                const farmName =
                  product.producer?.producerProfile?.farmName ||
                  product.producer?.producerProfile?.companyName ||
                  product.producer?.fullName ||
                  "Local Producer";

                const isAvailable = (product.availableQuantity ?? 1) > 0;
                const isItemProcessing = processingProductId === product.id;
                const isItemAdding = addingProductId === product.id;

                return (
                  <div
                    key={item.id}
                    className="group bg-white rounded-2xl border border-slate-200/90 hover:border-emerald-500/60 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden"
                  >
                    {/* Image Container with Badges */}
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

                      {/* Remove from Wishlist Button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveFromWishlist(product.id, product.name)}
                        disabled={isItemProcessing}
                        title="Remove from Wishlist"
                        className="absolute top-3 right-3 p-2 rounded-full bg-white/95 backdrop-blur-sm border border-slate-200 shadow-sm text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors disabled:opacity-50"
                      >
                        {isItemProcessing ? (
                          <Loader2 className="w-4 h-4 animate-spin text-rose-500" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>

                      {/* Stock Status Badge */}
                      <div className="absolute bottom-3 left-3">
                        {isAvailable ? (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-500/90 backdrop-blur-sm text-white text-[10px] font-semibold flex items-center gap-1 shadow-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                            In Stock {product.availableQuantity ? `(${product.availableQuantity})` : ""}
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-rose-500/90 backdrop-blur-sm text-white text-[10px] font-semibold flex items-center gap-1 shadow-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-white" />
                            Out of Stock
                          </span>
                        )}
                      </div>

                      {/* Category Badge if available */}
                      {product.category?.name && (
                        <div className="absolute top-3 left-3">
                          <span className="px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-medium tracking-wide">
                            {product.category.name}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content Section */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        {/* Producer farm */}
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium truncate mb-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="truncate">{farmName}</span>
                        </div>

                        {/* Title */}
                        <Link
                          href={`/products/${product.id}`}
                          className="font-serif font-bold text-base text-slate-900 hover:text-emerald-700 transition-colors line-clamp-1"
                        >
                          {product.name}
                        </Link>

                        {/* Price per Unit */}
                        <div className="mt-2 flex items-baseline gap-1">
                          <span className="font-mono text-lg font-bold text-emerald-600">
                            {formatCurrency(product.pricePerUnit)}
                          </span>
                          {product.sellingUnit && (
                            <span className="text-xs text-slate-500">
                              / {formatUnit(product.sellingUnit)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleAddToCart(product.id, product.name, product.sellingUnit)}
                          disabled={isItemAdding || !isAvailable}
                          className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                        >
                          {isItemAdding ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              Adding...
                            </>
                          ) : isAvailable ? (
                            <>
                              <ShoppingCart className="w-3.5 h-3.5" />
                              Add to Cart
                            </>
                          ) : (
                            "Unavailable"
                          )}
                        </button>

                        <Link
                          href={`/products/${product.id}`}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
                          title="View product details"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Empty Wishlist State */
          <div className="text-center py-20 px-4 bg-white border border-slate-200 rounded-3xl max-w-xl mx-auto shadow-sm">
            <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-400 mx-auto mb-4">
              <Heart className="w-8 h-8" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-slate-900">Your Wishlist is Empty</h2>
            <p className="text-xs text-slate-500 mt-2 mb-6 max-w-sm mx-auto">
              You haven&apos;t saved any harvests yet. Explore the Agro Connect marketplace to bookmark fresh farm goods and seasonal commodities.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/products"
                className="px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-sm inline-flex items-center gap-2"
              >
                Browse Harvests
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/cart"
                className="px-6 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
              >
                View Shopping Cart
              </Link>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
