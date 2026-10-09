"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Pencil,
  Plus,
  Package,
  DollarSign,
  TrendingUp,
  Star,
  CheckCircle2,  
  Sparkles,
  MapPin,  
  ShoppingBag,
  Loader2,
  AlertCircle,
  Tag,
} from "lucide-react";
import { useGetProductDetailsQuery } from "@/redux/features/product/productApi";
import AddPricingTierModal from "@/components/producer/AddPricingTierModal";
import { formatCurrency, formatUnit, formatDate } from "@/utils/formatters";

export default function ProducerProductDetailsPage() {
  const params = useParams();
  const productId = params?.id as string;

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isTierModalOpen, setIsTierModalOpen] = useState(false);

  const { data, isLoading, isError } = useGetProductDetailsQuery(productId, {
    skip: !productId,
  });

  const product = data?.data?.product;
  const revenue = data?.data?.revenue ?? 0;

  if (isLoading) {
    return (
      <div className="flex min-h-[500px] flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        <p className="text-xs text-slate-500">Loading harvest details...</p>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-8 text-center space-y-4">
        <AlertCircle className="mx-auto h-10 w-10 text-rose-500" />
        <div>
          <h2 className="text-lg font-bold text-rose-950">Harvest Not Found</h2>
          <p className="mt-1 text-xs text-rose-700">
            This crop product could not be found or you do not have permission to view it.
          </p>
        </div>
        <Link
          href="/producer/products"
          className="btn-secondary inline-flex items-center gap-2 text-xs"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Inventory
        </Link>
      </div>
    );
  }

  const images =
    product.imageUrls?.length > 0
      ? product.imageUrls
      : ["https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80"];

  const activeImage = images[activeImageIndex] || images[0];

  return (
    <div className="space-y-6">
      {/* Top Navigation & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          <Link
            href="/producer/products"
            className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            title="Back to Harvest Inventory"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-serif text-2xl font-bold text-slate-900">
                {product.name}
              </h1>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${
                  product.isActive
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-slate-100 text-slate-600 border-slate-200"
                }`}
              >
                {product.isActive ? "Active on Marketplace" : "Hidden from Buyers"}
              </span>
              {product.isFeatured && (
                <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700 border border-amber-200 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> Featured
                </span>
              )}
              {product.isCertified && (
                <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700 border border-blue-200 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Certified Quality
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Category:{" "}
              <span className="font-medium text-emerald-700">
                {product.category?.name || "General Produce"}
              </span>{" "}
              &bull; Added on {formatDate(product.createdAt || "")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">       
          <Link
            href={`/producer/products/${productId}/edit`}
            className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5 shadow-sm"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit Harvest
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Delivered Revenue</span>
            <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <p className="font-mono text-2xl font-bold text-slate-900">
            {formatCurrency(revenue)}
          </p>
          <p className="text-[11px] text-slate-500">From completed buyer orders</p>
        </div>

        {/* Units Sold */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Units Sold</span>
            <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <p className="font-mono text-2xl font-bold text-slate-900">
            {product.sold || 0}{" "}
            <span className="text-sm font-normal text-slate-500">
              {formatUnit(product.sellingUnit)}
            </span>
          </p>
          <p className="text-[11px] text-slate-500">Total volume ordered</p>
        </div>

        {/* Available Stock */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Available Stock</span>
            <div className="rounded-xl bg-amber-50 p-2 text-amber-600">
              <Package className="h-4 w-4" />
            </div>
          </div>
          <p className="font-mono text-2xl font-bold text-slate-900">
            {product.availableQuantity}{" "}
            <span className="text-sm font-normal text-slate-500">
              {formatUnit(product.sellingUnit)}
            </span>
          </p>
          <p className="text-[11px] text-slate-500">In farm storage ready for hub</p>
        </div>

        {/* Customer Rating */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Customer Rating</span>
            <div className="rounded-xl bg-purple-50 p-2 text-purple-600">
              <Star className="h-4 w-4 fill-purple-600" />
            </div>
          </div>
          <p className="font-mono text-2xl font-bold text-slate-900 flex items-center gap-1.5">
            {product.avgRating ? product.avgRating.toFixed(1) : "—"}
            <span className="text-xs font-normal text-slate-500">
              ({product.totalReviews || 0} reviews)
            </span>
          </p>
          <p className="text-[11px] text-slate-500">Buyer satisfaction feedback</p>
        </div>
      </div>

      {/* Main Content Layout: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Crop Photos, Description & Bulk Pricing (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Photos Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="font-serif text-base font-bold text-slate-900">
              Harvest Photos
            </h2>

            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
              <Image
                src={activeImage}
                alt={product.name}
                fill
                unoptimized
                className="object-cover"
              />
            </div>

            {images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-1">
                {images.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative h-16 w-20 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                      activeImageIndex === idx
                        ? "border-emerald-600 ring-2 ring-emerald-600/20"
                        : "border-slate-200 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={imgUrl}
                      alt={`Photo ${idx + 1}`}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Description & Base Price Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="font-serif text-base font-bold text-slate-900">
              Crop Details & Standard Rate
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl bg-slate-50 p-4 border border-slate-200">
              <div>
                <span className="text-xs text-slate-500 block">Standard Rate</span>
                <span className="font-mono text-xl font-bold text-emerald-700">
                  {formatCurrency(product.pricePerUnit)}
                </span>
                <span className="text-xs text-slate-600">
                  {" "}
                  / {formatUnit(product.sellingUnit)}
                </span>
              </div>

              <div>
                <span className="text-xs text-slate-500 block">Harvest Unit</span>
                <span className="text-sm font-semibold text-slate-900">
                  {formatUnit(product.sellingUnit)}
                </span>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Harvest Description
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50/50 p-4 rounded-xl border border-slate-200/80">
                {product.description}
              </p>
            </div>
          </div>

          {/* Bulk Wholesale Pricing Tiers Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-base font-bold text-slate-900">
                  Volume Pricing Tiers
                </h2>
                <p className="text-xs text-slate-500">
                  Discounts automatically offered to buyers ordering in bulk quantities.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsTierModalOpen(true)}
                className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Tier
              </button>
            </div>

            {product.pricingTiers && product.pricingTiers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Order Quantity Threshold</th>
                      <th className="py-2.5 px-3">Discounted Unit Price</th>
                      <th className="py-2.5 px-3 text-right">Per-Unit Savings</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {product.pricingTiers.map((tier, i) => {
                      const savings = Math.max(0, product.pricePerUnit - tier.pricePerUnit);
                      return (
                        <tr key={i} className="hover:bg-slate-50/80">
                          <td className="py-2.5 px-3 font-semibold text-slate-900">
                            {tier.quantity}+ {formatUnit(product.sellingUnit)}
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold text-emerald-700">
                            {formatCurrency(tier.pricePerUnit)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-emerald-600">
                            {savings > 0 ? `-${formatCurrency(savings)}` : "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-xs text-slate-500">
                <Tag className="mx-auto h-8 w-8 text-slate-300 mb-1.5" />
                <p>No volume discount tiers established for this crop.</p>
                <button
                  type="button"
                  onClick={() => setIsTierModalOpen(true)}
                  className="mt-2 text-emerald-700 font-semibold hover:underline"
                >
                  Create first wholesale discount tier
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Customer Orders & Reviews (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Order Fulfillment History Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="font-serif text-base font-bold text-slate-900">
                  Recent Orders
                </h2>
                <p className="text-[11px] text-slate-500">
                  Customer purchases for this harvest crop
                </p>
              </div>
              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                {product.orderItems?.length || 0} orders
              </span>
            </div>

            {product.orderItems && product.orderItems.length > 0 ? (
              <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                {product.orderItems.map((item, idx) => {
                  const customer = item.order?.customer;
                  const shipping = customer?.shippingAddresses?.[0];

                  return (
                    <div
                      key={idx}
                      className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-[10px]">
                            {customer?.fullName?.charAt(0).toUpperCase() || "B"}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900 block leading-tight">
                              {customer?.fullName || "Verified Buyer"}
                            </span>
                            {shipping?.city && (
                              <span className="text-[10px] text-slate-500 flex items-center gap-1">
                                <MapPin className="h-2.5 w-2.5" />
                                {shipping.city}
                              </span>
                            )}
                          </div>
                        </div>

                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold border ${
                            item.status === "Delivered"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : item.status === "SentToHub"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>

                      <div className="flex items-center justify-between border-t border-slate-200/80 pt-2 text-[11px]">
                        <span className="text-slate-600">
                          Qty: <strong>{item.quantity} {formatUnit(product.sellingUnit)}</strong>
                        </span>
                        <span className="font-mono font-bold text-slate-900">
                          {formatCurrency(item.subtotal)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-xs text-slate-500">
                <ShoppingBag className="mx-auto h-8 w-8 text-slate-300 mb-1.5" />
                <p>No customer orders placed for this harvest yet.</p>
              </div>
            )}
          </div>

          {/* Customer Reviews & Feedback */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="font-serif text-base font-bold text-slate-900">
                  Customer Reviews
                </h2>
                <p className="text-[11px] text-slate-500">
                  Verified buyer ratings and quality comments
                </p>
              </div>
              <span className="rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-semibold text-purple-700 border border-purple-200">
                {product.reviews?.length || 0} reviews
              </span>
            </div>

            {product.reviews && product.reviews.length > 0 ? (
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                {product.reviews.map((rev, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900">
                        {rev.buyer?.fullName || "Verified Buyer"}
                      </span>
                      <div className="flex items-center text-amber-500">
                        {Array.from({ length: 5 }).map((_, starIdx) => (
                          <Star
                            key={starIdx}
                            className={`h-3 w-3 ${
                              starIdx < rev.rating
                                ? "fill-amber-400 text-amber-400"
                                : "text-slate-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    {rev.comment && (
                      <p className="text-slate-700 text-xs italic">
                        &ldquo;{rev.comment}&rdquo;
                      </p>
                    )}
                    {rev.createdAt && (
                      <span className="text-[10px] text-slate-400 block pt-0.5">
                        {formatDate(rev.createdAt)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-xs text-slate-500">
                <Star className="mx-auto h-8 w-8 text-slate-300 mb-1.5" />
                <p>No customer feedback reviews submitted yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Simplified Add Pricing Tier Modal */}
      <AddPricingTierModal
        isOpen={isTierModalOpen}
        onClose={() => setIsTierModalOpen(false)}
        productId={product.id}
        productName={product.name}
        basePrice={product.pricePerUnit}
        sellingUnit={product.sellingUnit}
      />
    </div>
  );
}
