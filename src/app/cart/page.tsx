"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ShoppingBag,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Truck,
  Plus,
  Minus,
  ArrowLeft,
} from "lucide-react";
import { toast } from "react-toastify";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  useGetCartQuery,
  useUpdateCartQuantityMutation,
  useRemoveFromCartMutation,
} from "@/redux/features/shopping/shoppingApi";
import { useAppSelector } from "@/redux/hooks";
import { formatCurrency, formatUnit, getApplicableTierPrice } from "@/utils/formatters";

const DELIVERY_CHARGE = 50; // Fixed delivery charge in BDT

export default function CartPage() {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const { data, isLoading } = useGetCartQuery(undefined, {
    skip: !isAuthenticated,
  });

  const [updateQuantity, { isLoading: isUpdatingQty }] = useUpdateCartQuantityMutation();
  const [removeFromCart, { isLoading: isRemoving }] = useRemoveFromCartMutation();

  const cartItems = data?.data || [];

  const handleUpdateQty = async (cartId: string, increment: boolean) => {
    try {
      await updateQuantity({ cartId, increment }).unwrap();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update quantity");
    }
  };

  const handleRemove = async (cartId: string, productName: string) => {
    try {
      await removeFromCart(cartId).unwrap();
      toast.success(`${productName} removed from cart`);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to remove item");
    }
  };

  // Subtotal calculation based on pricing tiers
  const subtotal = cartItems.reduce((acc, item) => {
    const basePrice = item.product?.pricePerUnit || 0;
    const { unitPrice } = getApplicableTierPrice(
      basePrice,
      item.quantity,
      item.product?.pricingTiers
    );
    return acc + unitPrice * item.quantity;
  }, 0);

  const total = cartItems.length > 0 ? subtotal + DELIVERY_CHARGE : 0;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center py-24 px-4 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-4">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="font-serif text-3xl font-bold text-slate-900">Your Cart Awaits</h2>
          <p className="text-slate-500 text-sm max-w-sm mt-2 mb-6">
            Please log in to your Agro Connect account to view your shopping cart and complete your
            order.
          </p>
          <div className="flex gap-4">
            <Link href="/login" className="btn-primary text-xs py-2.5 px-6">
              Sign In
            </Link>
            <Link href="/products" className="btn-secondary text-xs py-2.5 px-6">
              Browse Harvests
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

      {/* Header */}
      <div className="bg-white border-b border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-serif text-3xl font-bold text-slate-900">Your Shopping Cart</h1>
          <p className="text-xs text-slate-500 mt-1">
            Review your selected harvests and bulk quantities before checkout.
          </p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        {isLoading ? (
          <div className="space-y-4 max-w-4xl mx-auto animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-white rounded-2xl border border-slate-200" />
            ))}
          </div>
        ) : cartItems.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Cart Items List (8 cols) */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-200">
                <span>{cartItems.length} Harvest items in cart</span>
                <Link
                  href="/products"
                  className="flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-medium"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Add more items
                </Link>
              </div>

              {cartItems.map((item) => {
                const img =
                  item.product?.imageUrls?.[0] ||
                  "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=300&q=80";

                const basePrice = item.product?.pricePerUnit || 0;
                const { unitPrice: effectiveUnitPrice, appliedTier } = getApplicableTierPrice(
                  basePrice,
                  item.quantity,
                  item.product?.pricingTiers
                );
                const lineTotal = effectiveUnitPrice * item.quantity;

                return (
                  <div
                    key={item.id}
                    className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4"
                  >
                    {/* Item info */}
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                        <Image
                          src={img}
                          alt={item.product?.name || "Harvest"}
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div className="space-y-1">
                        <Link
                          href={`/products/${item.product?.id}`}
                          className="font-serif font-bold text-base text-slate-900 hover:text-emerald-700 transition-colors"
                        >
                          {item.product?.name}
                        </Link>
                        <div className="text-xs text-slate-500 flex flex-wrap items-center gap-1.5">
                          <span>Unit Price:</span>
                          {appliedTier ? (
                            <>
                              <span className="line-through text-slate-400 font-mono">
                                {formatCurrency(basePrice)}
                              </span>
                              <span className="font-mono text-emerald-700 font-bold">
                                {formatCurrency(effectiveUnitPrice)}
                              </span>
                              {item.product?.sellingUnit && (
                                <span>/ {formatUnit(item.product.sellingUnit)}</span>
                              )}
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold">
                                Tier (≥ {appliedTier.quantity} {formatUnit(item.product?.sellingUnit)})
                              </span>
                            </>
                          ) : (
                            <>
                              <span className="font-mono text-emerald-600 font-semibold">
                                {formatCurrency(basePrice)}
                              </span>
                              {item.product?.sellingUnit && (
                                <span>/ {formatUnit(item.product.sellingUnit)}</span>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quantity & Actions */}
                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                        <button
                          type="button"
                          onClick={() => handleUpdateQty(item.id, false)}
                          disabled={isUpdatingQty || item.quantity <= 1}
                          className="p-2 text-slate-600 hover:bg-slate-50 disabled:opacity-30 transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-10 text-center font-mono font-bold text-slate-900 text-xs">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateQty(item.id, true)}
                          disabled={isUpdatingQty}
                          className="p-2 text-slate-600 hover:bg-slate-50 disabled:opacity-30 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Line Subtotal */}
                      <div className="text-right min-w-[90px]">
                        <span className="font-mono font-bold text-emerald-600 text-base block">
                          {formatCurrency(lineTotal)}
                        </span>
                        {appliedTier && (
                          <span className="text-[10px] text-slate-400 line-through block font-mono">
                            {formatCurrency(basePrice * item.quantity)}
                          </span>
                        )}
                      </div>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => handleRemove(item.id, item.product?.name || "Product")}
                        disabled={isRemoving}
                        className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary Sidebar (4 cols) */}
            <div className="lg:col-span-4">
              <div className="bg-white border border-slate-200/90 rounded-2xl p-6 space-y-6 sticky top-24 shadow-sm">
                <h3 className="font-serif font-bold text-lg text-slate-900">Order Summary</h3>

                <div className="space-y-3 text-xs border-b border-slate-100 pb-4">
                  <div className="flex justify-between text-slate-600">
                    <span>Items Subtotal</span>
                    <span className="font-mono font-semibold text-slate-900">
                      {formatCurrency(subtotal)}
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-600">
                    <span>Delivery Fee (Fixed)</span>
                    <span className="font-mono font-semibold text-slate-900">
                      {formatCurrency(DELIVERY_CHARGE)}
                    </span>
                  </div>
                </div>

                {/* Total */}
                <div className="flex justify-between items-baseline">
                  <div>
                    <span className="text-xs text-slate-600 block">Estimated Total</span>
                    <span className="text-[10px] text-slate-400">Includes local transport</span>
                  </div>
                  <span className="font-serif font-bold text-2xl text-emerald-600 font-mono">
                    {formatCurrency(total)}
                  </span>
                </div>

                {/* Checkout CTA */}
                <Link
                  href="/checkout"
                  className="btn-primary w-full py-3.5 text-xs text-center flex items-center justify-center gap-2 shadow-sm"
                >
                  Proceed to Checkout
                  <ArrowRight className="w-4 h-4" />
                </Link>

                {/* Guarantees */}
                <div className="space-y-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Secure payment via Stripe</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Tracked driver delivery with OTP release</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 px-4 bg-white border border-slate-200 rounded-3xl max-w-xl mx-auto shadow-sm">
            <ShoppingBag className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h2 className="font-serif text-2xl font-bold text-slate-900">Your Cart is Empty</h2>
            <p className="text-xs text-slate-500 mt-2 mb-6">
              You haven&apos;t added any harvests or farm goods yet. Explore our marketplace to find
              fresh produce with volume discounts!
            </p>
            <Link href="/products" className="btn-primary text-xs py-2.5 px-6 inline-flex">
              Explore Fresh Harvests
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
