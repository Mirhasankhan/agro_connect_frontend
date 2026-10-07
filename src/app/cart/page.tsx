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
import { formatCurrency, formatUnit } from "@/utils/formatters";

const DELIVERY_CHARGE = 50; // Fixed delivery charge in XOF / FCFA

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

  // Subtotal calculation
  const subtotal = cartItems.reduce((acc, item) => {
    const unitPrice = item.product?.pricePerUnit || 0;
    return acc + unitPrice * item.quantity;
  }, 0);

  const total = cartItems.length > 0 ? subtotal + DELIVERY_CHARGE : 0;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#04160a] text-white flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center py-24 px-4 text-center">
          <ShoppingBag className="w-16 h-16 text-emerald-400 mb-4 opacity-80" />
          <h2 className="font-serif text-3xl font-bold">Your Cart Awaits</h2>
          <p className="text-white/60 text-sm max-w-sm mt-2 mb-6">
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
    <div className="min-h-screen bg-[#04160a] text-white flex flex-col">
      <Navbar />

      {/* Header */}
      <div className="bg-gradient-to-b from-[#082314] to-[#04160a] border-b border-forest-800/80 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-serif text-3xl font-bold text-white">Your Shopping Cart</h1>
          <p className="text-xs text-white/60 mt-1">
            Review your selected harvests and bulk quantities before checkout.
          </p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        {isLoading ? (
          <div className="space-y-4 max-w-4xl mx-auto animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-forest-900/40 rounded-2xl border border-forest-800" />
            ))}
          </div>
        ) : cartItems.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Cart Items List (8 cols) */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center justify-between text-xs text-white/60 pb-2 border-b border-forest-800">
                <span>{cartItems.length} Harvest items in cart</span>
                <Link
                  href="/products"
                  className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-medium"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Add more items
                </Link>
              </div>

              {cartItems.map((item) => {
                const img =
                  item.product?.imageUrls?.[0] ||
                  "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=300&q=80";
                const lineTotal = (item.product?.pricePerUnit || 0) * item.quantity;

                return (
                  <div
                    key={item.id}
                    className="p-4 sm:p-5 rounded-2xl bg-[#071f12] border border-forest-700/60 hover:border-forest-600 transition-all flex flex-col sm:flex-row items-center justify-between gap-4"
                  >
                    {/* Item info */}
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-forest-950 shrink-0 border border-forest-800">
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
                          className="font-serif font-bold text-base text-white hover:text-emerald-300 transition-colors"
                        >
                          {item.product?.name}
                        </Link>
                        <div className="text-xs text-white/60">
                          Unit Price:{" "}
                          <span className="font-mono text-emerald-400 font-semibold">
                            {formatCurrency(item.product?.pricePerUnit || 0)}
                          </span>
                          {item.product?.sellingUnit && (
                            <span> / {formatUnit(item.product.sellingUnit)}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quantity & Actions */}
                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-forest-700 rounded-xl overflow-hidden bg-forest-950">
                        <button
                          type="button"
                          onClick={() => handleUpdateQty(item.id, false)}
                          disabled={isUpdatingQty || item.quantity <= 1}
                          className="p-2 text-white/80 hover:bg-forest-800 disabled:opacity-30 transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-10 text-center font-mono font-bold text-white text-xs">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateQty(item.id, true)}
                          disabled={isUpdatingQty}
                          className="p-2 text-white/80 hover:bg-forest-800 disabled:opacity-30 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Line Subtotal */}
                      <div className="text-right min-w-[90px]">
                        <span className="font-mono font-bold text-emerald-400 text-base">
                          {formatCurrency(lineTotal)}
                        </span>
                      </div>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => handleRemove(item.id, item.product?.name || "Product")}
                        disabled={isRemoving}
                        className="p-2 text-white/40 hover:text-red-400 transition-colors"
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
              <div className="bg-[#071f12] border border-forest-700/70 rounded-2xl p-6 space-y-6 sticky top-24 shadow-xl">
                <h3 className="font-serif font-bold text-lg text-white">Order Summary</h3>

                <div className="space-y-3 text-xs border-b border-forest-800 pb-4">
                  <div className="flex justify-between text-white/70">
                    <span>Items Subtotal</span>
                    <span className="font-mono font-semibold text-white">
                      {formatCurrency(subtotal)}
                    </span>
                  </div>

                  <div className="flex justify-between text-white/70">
                    <span>Delivery Fee (Fixed)</span>
                    <span className="font-mono font-semibold text-white">
                      {formatCurrency(DELIVERY_CHARGE)}
                    </span>
                  </div>
                </div>

                {/* Total */}
                <div className="flex justify-between items-baseline">
                  <div>
                    <span className="text-xs text-white/70 block">Estimated Total</span>
                    <span className="text-[10px] text-white/40">Includes local transport</span>
                  </div>
                  <span className="font-serif font-bold text-2xl text-emerald-400 font-mono">
                    {formatCurrency(total)}
                  </span>
                </div>

                {/* Checkout CTA */}
                <Link
                  href="/checkout"
                  className="btn-primary w-full py-3.5 text-xs text-center flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/60"
                >
                  Proceed to Checkout
                  <ArrowRight className="w-4 h-4" />
                </Link>

                {/* Guarantees */}
                <div className="space-y-2 pt-2 border-t border-forest-800 text-[11px] text-white/60">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Secure payment via Stripe</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Tracked driver delivery with OTP release</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 px-4 bg-[#071f12] border border-forest-800 rounded-3xl max-w-xl mx-auto">
            <ShoppingBag className="w-16 h-16 text-emerald-400 mx-auto mb-4 opacity-70" />
            <h2 className="font-serif text-2xl font-bold text-white">Your Cart is Empty</h2>
            <p className="text-xs text-white/60 mt-2 mb-6">
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
