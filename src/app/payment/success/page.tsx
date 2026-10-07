"use client";

import React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Package, ShieldCheck, Truck } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  return (
    <div className="min-h-screen bg-[#04160a] text-white flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-20 px-4">
        <div className="max-w-md w-full bg-[#071f12] border border-forest-700/80 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 mx-auto animate-bounce">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-xs uppercase tracking-widest text-emerald-400 font-bold">
              Payment Confirmed
            </span>
            <h1 className="font-serif text-3xl font-bold text-white">Order Successful!</h1>
            <p className="text-xs text-white/70 leading-relaxed">
              Thank you for supporting certified local Ivorian agriculture. Your payment has been
              verified and the producer has been notified.
            </p>
          </div>

          {orderId && (
            <div className="p-3 bg-forest-950/80 border border-forest-800 rounded-xl text-xs font-mono text-emerald-300">
              Reference: <span className="font-bold">{orderId}</span>
            </div>
          )}

          <div className="space-y-2 pt-2 text-left bg-[#05170d] p-4 rounded-xl border border-forest-800 text-[11px] text-white/70">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>A verified transporter will be assigned for pickup.</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>You will receive an OTP code to confirm delivery arrival.</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              href="/orders"
              className="btn-primary w-full text-xs py-3 text-center flex items-center justify-center gap-2"
            >
              <Package className="w-4 h-4" />
              View My Orders
            </Link>
            <Link
              href="/products"
              className="btn-secondary w-full text-xs py-3 text-center"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
