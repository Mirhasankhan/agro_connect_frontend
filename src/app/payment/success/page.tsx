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
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-20 px-4">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 text-center space-y-6 shadow-sm">
          <div className="w-20 h-20 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mx-auto animate-bounce">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-xs  tracking-widest text-emerald-600 font-bold">
              Payment Confirmed
            </span>
            <h1 className="font-serif text-3xl font-bold text-slate-900">Order Successful!</h1>
            <p className="text-xs text-slate-600 leading-relaxed">
              Thank you for supporting certified local Ivorian agriculture. Your payment has been
              verified and the producer has been notified.
            </p>
          </div>

          {orderId && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-emerald-700">
              Reference: <span className="font-bold">{orderId}</span>
            </div>
          )}

          <div className="space-y-2 pt-2 text-left bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>A verified transporter will be assigned for pickup.</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
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
