"use client";

import React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { XCircle, RefreshCw, ShoppingCart } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function PaymentFailedPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  return (
    <div className="min-h-screen bg-[#04160a] text-white flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-20 px-4">
        <div className="max-w-md w-full bg-[#071f12] border border-forest-700/80 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
          <div className="w-20 h-20 rounded-full bg-red-500/20 border border-red-500/50 flex items-center justify-center text-red-400 mx-auto">
            <XCircle className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-xs uppercase tracking-widest text-red-400 font-bold">
              Payment Incomplete
            </span>
            <h1 className="font-serif text-3xl font-bold text-white">Payment Unsuccessful</h1>
            <p className="text-xs text-white/70 leading-relaxed">
              We could not process your transaction. Your card has not been charged, or the checkout
              session was cancelled.
            </p>
          </div>

          {orderId && (
            <div className="p-3 bg-forest-950/80 border border-forest-800 rounded-xl text-xs font-mono text-white/60">
              Reference: <span>{orderId}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              href="/checkout"
              className="btn-primary w-full text-xs py-3 text-center flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </Link>
            <Link
              href="/cart"
              className="btn-secondary w-full text-xs py-3 text-center flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              Return to Cart
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
