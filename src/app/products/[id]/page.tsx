"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ShoppingCart,
  Heart,
  Star,
  MapPin,
  ShieldCheck,
  Truck,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Share2,
  MessageSquare,
} from "lucide-react";
import { toast } from "react-toastify";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import TierPricingCalculator from "@/components/product/TierPricingCalculator";
import { useGetProductDetailsQuery } from "@/redux/features/product/productApi";
import {
  useAddToCartMutation,
  useAddToWishlistMutation,
} from "@/redux/features/shopping/shoppingApi";
import { useAppSelector } from "@/redux/hooks";
import { formatUnit, formatDate } from "@/utils/formatters";

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id as string;

  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const { data, isLoading, error } = useGetProductDetailsQuery(productId, {
    skip: !productId,
  });

  const [addToCartMutation, { isLoading: isAddingToCart }] = useAddToCartMutation();
  const [addToWishlistMutation, { isLoading: isAddingWishlist }] = useAddToWishlistMutation();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedQuantity, setSelectedQuantity] = useState(1);

  const product = data?.data?.product;

  const fallbackImage =
    "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80";
  const images = product?.imageUrls && product.imageUrls.length > 0 ? product.imageUrls : [fallbackImage];

  const farmName =
    product?.producer?.producerProfile?.farmName ||
    product?.producer?.producerProfile?.companyName ||
    product?.producer?.fullName ||
    "Local Producer";

  const city = product?.producer?.address || "Côte d'Ivoire";

  const handleAddToCart = async (goToCart = false) => {
    if (!isAuthenticated) {
      toast.info("Please log in to add items to your cart");
      router.push("/login");
      return;
    }

    if (!product) return;

    try {
      await addToCartMutation({
        productId: product.id,
        quantity: selectedQuantity,
      }).unwrap();

      toast.success(
        `Added ${selectedQuantity} ${formatUnit(product.sellingUnit)} of ${product.name} to cart!`
      );

      if (goToCart) {
        router.push("/cart");
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to add product to cart");
    }
  };

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
      toast.info("Please log in to manage your wishlist");
      router.push("/login");
      return;
    }

    if (!product) return;

    try {
      await addToWishlistMutation(product.id).unwrap();
      toast.success("Wishlist updated!");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update wishlist");
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#04160a] text-white flex flex-col">
        <Navbar />
        <div className="flex-1 max-w-7xl mx-auto px-4 py-16 w-full animate-pulse space-y-8">
          <div className="h-6 w-48 bg-forest-900 rounded" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="aspect-square bg-forest-900 rounded-3xl" />
            <div className="space-y-6">
              <div className="h-10 w-3/4 bg-forest-900 rounded" />
              <div className="h-6 w-1/2 bg-forest-900 rounded" />
              <div className="h-32 bg-forest-900 rounded-2xl" />
              <div className="h-12 bg-forest-900 rounded-xl" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#04160a] text-white flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center py-20 px-4 text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
          <h2 className="font-serif text-3xl font-bold">Product Not Found</h2>
          <p className="text-white/60 text-sm max-w-md mt-2 mb-6">
            The agricultural harvest you are looking for may have been removed or is temporarily
            unavailable.
          </p>
          <Link href="/products" className="btn-primary text-xs py-2.5 px-6">
            Back to Marketplace
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#04160a] text-white flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center justify-between mb-6 text-xs text-white/60">
          <Link
            href="/products"
            className="flex items-center gap-1.5 hover:text-emerald-400 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to All Harvests
          </Link>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              Share
            </button>
          </div>
        </div>

        {/* Product Details Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Image Gallery (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-forest-950 border border-forest-700/80 shadow-2xl">
              <Image
                src={images[selectedImageIndex] || fallbackImage}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover transition-all duration-300"
              />

              {product.category?.name && (
                <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-forest-950/80 backdrop-blur-md text-emerald-300 text-xs font-semibold border border-forest-700/60">
                  {product.category.name}
                </span>
              )}
            </div>

            {/* Thumbnail switcher */}
            {images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                      selectedImageIndex === idx
                        ? "border-emerald-500 scale-105"
                        : "border-forest-800 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <Image src={img} alt={`Thumbnail ${idx}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Certified Producer Card */}
            <div className="bg-[#071f12] border border-forest-700/70 rounded-2xl p-5 space-y-3 mt-6">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-wider text-white/50 font-semibold">
                  Farm Source
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Certified Producer
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-700/40 border border-emerald-500/50 flex items-center justify-center text-lg font-serif font-bold text-emerald-300 shrink-0">
                  {farmName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-serif font-bold text-white text-base leading-snug">
                    {farmName}
                  </h4>
                  <p className="text-xs text-white/60 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    {city}
                  </p>
                </div>
              </div>

              {product.producer?.id && (
                <Link
                  href={`/messages?userId=${product.producer.id}&userName=${encodeURIComponent(farmName)}&userRole=PRODUCER`}
                  className="mt-3 w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-forest-850 hover:bg-forest-800 text-xs font-semibold text-emerald-300 border border-emerald-500/30 transition-colors shadow-sm"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Chat with Farmer / Inquire
                </Link>
              )}
            </div>
          </div>

          {/* Right Column: Information, Bulk Calculator & Actions (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {product.availableQuantity > 0 ? (
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-semibold">
                    In Stock ({product.availableQuantity} {formatUnit(product.sellingUnit)} left)
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 text-xs font-semibold">
                    Out of Stock
                  </span>
                )}
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                {product.name}
              </h1>

              {/* Rating review stats */}
              <div className="flex items-center gap-3 mt-3 text-sm">
                <div className="flex items-center gap-1 text-amber-400 font-bold">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span>{product.avgRating ? Number(product.avgRating).toFixed(1) : "5.0"}</span>
                </div>
                <span className="text-white/40">•</span>
                <span className="text-white/70">
                  {product.totalReviews || 0} Customer Reviews
                </span>
                <span className="text-white/40">•</span>
                <span className="text-emerald-400 font-medium text-xs">
                  {product._count?.orderItems || 0} Orders Fulfilled
                </span>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-white/75 leading-relaxed bg-[#061e11] p-4 rounded-2xl border border-forest-800">
              {product.description ||
                "Fresh agricultural harvest direct from certified Ivorian farmland, harvested under strict freshness standards and packaged for secure agro-logistics delivery."}
            </p>

            {/* INTERACTIVE BULK PRICING CALCULATOR */}
            <TierPricingCalculator
              basePrice={product.pricePerUnit}
              sellingUnit={product.sellingUnit}
              pricingTiers={product.pricingTiers}
              quantity={selectedQuantity}
              availableQuantity={product.availableQuantity}
              onQuantityChange={setSelectedQuantity}
            />

            {/* ACTION BUTTONS */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleAddToCart(false)}
                disabled={isAddingToCart || product.availableQuantity <= 0}
                className="btn-primary w-full sm:flex-1 py-3.5 text-sm flex items-center justify-center gap-2"
              >
                {isAddingToCart ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Adding to Cart...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    Add to Cart ({selectedQuantity} {formatUnit(product.sellingUnit)})
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleAddToCart(true)}
                disabled={isAddingToCart || product.availableQuantity <= 0}
                className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-500 font-bold text-sm text-white transition-all shadow-md whitespace-nowrap"
              >
                Buy Now
              </button>

              <button
                type="button"
                onClick={handleToggleWishlist}
                disabled={isAddingWishlist}
                className="p-3.5 rounded-full bg-forest-900 border border-forest-700 hover:border-emerald-500 text-white/80 hover:text-white transition-all"
                title="Wishlist"
              >
                <Heart className="w-5 h-5" />
              </button>
            </div>

            {/* Logistics & Delivery Highlights */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-forest-800">
              <div className="flex items-center gap-2 text-xs text-white/70">
                <Truck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Flat Delivery: 50 FCFA</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-white/70">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>6-Digit OTP Delivery Check</span>
              </div>
            </div>
          </div>
        </div>

        {/* REVIEWS & RATINGS SECTION */}
        <section className="mt-16 pt-12 border-t border-forest-800/80">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                Customer Reviews & Ratings
              </h2>
              <p className="text-xs text-white/60 mt-1">
                Verified feedback from verified buyers who received this produce.
              </p>
            </div>

            <div className="flex items-center gap-3 bg-[#082013] px-4 py-2 rounded-2xl border border-forest-700">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
              <div>
                <span className="font-serif text-lg font-bold text-white">
                  {product.avgRating ? Number(product.avgRating).toFixed(1) : "5.0"}
                </span>
                <span className="text-xs text-white/50 ml-1">/ 5.0</span>
              </div>
              <span className="text-xs text-emerald-400 font-semibold ml-2">
                ({product.totalReviews || 0} reviews)
              </span>
            </div>
          </div>

          {/* Review List */}
          {product.reviews && product.reviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {product.reviews.map((rev, idx) => (
                <div
                  key={rev.id || idx}
                  className="bg-[#071f12] border border-forest-700/60 rounded-2xl p-5 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center font-bold text-emerald-300 text-xs">
                        {rev.buyer?.fullName?.charAt(0).toUpperCase() || "B"}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">
                          {rev.buyer?.fullName || "Verified Buyer"}
                        </p>
                        <p className="text-[10px] text-white/40">
                          {rev.createdAt ? formatDate(rev.createdAt) : "Recently"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-0.5 text-amber-400">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < rev.rating
                              ? "fill-amber-400 text-amber-400"
                              : "text-forest-700"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-white/80 leading-relaxed italic">
                    &ldquo;{rev.comment}&rdquo;
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-[#071f12] border border-forest-800 rounded-2xl">
              <Star className="w-8 h-8 text-amber-400/40 mx-auto mb-2" />
              <p className="text-xs text-white/60">
                No reviews yet for this harvest. Be the first to order and share your feedback!
              </p>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
