"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Truck,
  DollarSign,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { useGetDriverWisePaymentsQuery } from "@/redux/features/payment/paymentApi";
import DeliveryOtpModal from "@/components/driver/DeliveryOtpModal";
import { formatCurrency, formatDate } from "@/utils/formatters";

export default function DriverDashboardPage() {
  const { data: paymentsData, isLoading: isLoadingPayments } = useGetDriverWisePaymentsQuery();

  const [otpModalData, setOtpModalData] = useState<{
    deliveryId: string;
    orderReference?: string;
    customerName?: string;
  } | null>(null);

  const payments = paymentsData?.data?.payments || [];
  const totalEarnings =
    paymentsData?.data?.earningSummary?.amount ||
    payments.reduce((acc, p) => acc + (p.amount || 0), 0);
  const completedDeliveriesCount = payments.filter((p) => p.isTransferred).length;

  return (
    <div className="space-y-8">
      {/* Welcome Hero */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#062413] to-[#04190c] border border-forest-700/80 p-6 rounded-3xl shadow-xl">
        <div className="space-y-1">
          <span className="text-xs uppercase tracking-widest text-emerald-400 font-bold">
            Agro-Logistics Operations
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white">
            Driver Delivery Control Center
          </h1>
          <p className="text-xs text-white/70 max-w-xl">
            Transport fresh farm harvests from regional hubs to urban tables. Confirm pickups,
            send OTP verification codes, and secure instant earnings.
          </p>
        </div>

        <Link
          href="/driver/deliveries"
          className="btn-primary text-xs py-3 px-5 flex items-center justify-center gap-2 whitespace-nowrap shadow-lg shadow-emerald-950/60"
        >
          <Truck className="w-4 h-4" />
          View All Deliveries
        </Link>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Earned */}
        <div className="p-5 rounded-2xl bg-[#071f11] border border-forest-700/60 space-y-2">
          <div className="flex items-center justify-between text-white/60 text-xs">
            <span>Total Earnings</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="font-mono text-2xl font-bold text-emerald-400">
            {isLoadingPayments ? "..." : formatCurrency(totalEarnings)}
          </p>
          <p className="text-[11px] text-white/50">Fixed delivery charge rewards</p>
        </div>

        {/* Completed Deliveries */}
        <div className="p-5 rounded-2xl bg-[#071f11] border border-forest-700/60 space-y-2">
          <div className="flex items-center justify-between text-white/60 text-xs">
            <span>Completed Trips</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="font-mono text-2xl font-bold text-white">
            {isLoadingPayments ? "..." : completedDeliveriesCount}
          </p>
          <p className="text-[11px] text-white/50">Verified with 6-digit OTP check</p>
        </div>

        {/* In-Transit Deliveries */}
        <div className="p-5 rounded-2xl bg-[#071f11] border border-forest-700/60 space-y-2">
          <div className="flex items-center justify-between text-white/60 text-xs">
            <span>Security Mechanism</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-base font-bold text-white">6-Digit OTP Escrow</p>
          <p className="text-[11px] text-white/50">Zero cash risk or fraud</p>
        </div>

        {/* Fleet Readiness */}
        <div className="p-5 rounded-2xl bg-[#071f11] border border-forest-700/60 space-y-2">
          <div className="flex items-center justify-between text-white/60 text-xs">
            <span>Fleet Status</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-base font-bold text-emerald-400">On Duty & Active</p>
          <p className="text-[11px] text-white/50">Côte d&apos;Ivoire Agro-Grid</p>
        </div>
      </div>

      {/* Operational Instructions Banner */}
      <div className="p-5 rounded-3xl bg-[#072113] border border-emerald-500/40 text-xs space-y-2 shadow-lg">
        <h3 className="font-serif font-bold text-sm text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Standard Agro-Logistics Delivery Protocol
        </h3>
        <ol className="list-decimal list-inside space-y-1 text-white/70 text-[11px] leading-relaxed">
          <li>
            <strong>Hub Pickup:</strong> Inspect crop crates and produce packaging, then mark status as{" "}
            <span className="text-emerald-300 font-semibold">Picked Up</span>.
          </li>
          <li>
            <strong>Buyer Arrival:</strong> Upon reaching customer destination, click{" "}
            <span className="text-emerald-300 font-semibold">Send OTP</span> to generate their
            verification code.
          </li>
          <li>
            <strong>Handover & Payment:</strong> Input the buyer&apos;s 6-digit code in the{" "}
            <span className="text-emerald-300 font-semibold">Verify OTP</span> modal to immediately
            complete delivery and claim your fee.
          </li>
        </ol>
      </div>

      {/* Recent Trips Table */}
      <div className="bg-[#071f11] border border-forest-700/60 rounded-3xl p-6 space-y-4 shadow-lg">
        <div className="flex items-center justify-between border-b border-forest-800 pb-3">
          <div>
            <h2 className="font-serif text-lg font-bold text-white">Recent Delivery Trips</h2>
            <p className="text-xs text-white/60">
              Completed and settled logistics journeys with trip fees.
            </p>
          </div>
          <Link
            href="/driver/earnings"
            className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
          >
            View Earning Records
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoadingPayments ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-forest-900/40 rounded-xl" />
            ))}
          </div>
        ) : payments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-white/80">
              <thead className="bg-forest-950/70 text-white/50 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Order Ref</th>
                  <th className="py-3 px-4">Delivery Fee</th>
                  <th className="py-3 px-4">Transfer Status</th>
                  <th className="py-3 px-4 text-right">Completion Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-forest-800/60">
                {payments.map((p) => (
                  <tr key={p.id} className="table-row-hover">
                    <td className="py-3 px-4 font-mono font-bold text-white">
                      #{p.order?.orderId || p.id.slice(-6).toUpperCase()}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                      {formatCurrency(p.amount)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          p.isTransferred
                            ? "bg-blue-500/20 text-blue-300 border border-blue-500/40"
                            : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                        }`}
                      >
                        {p.isTransferred ? "Settled & Paid" : "Escrow Pending"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-white/50 font-mono">
                      {p.createdAt ? formatDate(p.createdAt) : "Recent"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-xs text-white/50">
            No completed delivery trips yet. Check &ldquo;My Deliveries&rdquo; to start your first
            route.
          </div>
        )}
      </div>

      {/* OTP Verification Modal */}
      {otpModalData && (
        <DeliveryOtpModal
          isOpen={Boolean(otpModalData)}
          onClose={() => setOtpModalData(null)}
          deliveryId={otpModalData.deliveryId}
          orderReference={otpModalData.orderReference}
          customerName={otpModalData.customerName}
        />
      )}
    </div>
  );
}
