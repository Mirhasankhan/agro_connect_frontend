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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
        <div className="space-y-1">
          <span className="text-xs uppercase tracking-widest text-emerald-600 font-bold">
            Agro-Logistics Operations
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
            Driver Delivery Control Center
          </h1>
          <p className="text-xs text-slate-600 max-w-xl">
            Transport fresh farm harvests from regional hubs to urban tables. Confirm pickups,
            send OTP verification codes, and secure instant earnings.
          </p>
        </div>

        <Link
          href="/driver/deliveries"
          className="btn-primary text-xs py-3 px-5 flex items-center justify-center gap-2 whitespace-nowrap shadow-sm"
        >
          <Truck className="w-4 h-4" />
          View All Deliveries
        </Link>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Earned */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Total Earnings</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="font-mono text-2xl font-bold text-slate-900">
            {isLoadingPayments ? "..." : formatCurrency(totalEarnings)}
          </p>
          <p className="text-[11px] text-slate-500">Fixed delivery charge rewards</p>
        </div>

        {/* Completed Deliveries */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Completed Trips</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="font-mono text-2xl font-bold text-slate-900">
            {isLoadingPayments ? "..." : completedDeliveriesCount}
          </p>
          <p className="text-[11px] text-slate-500">Verified with 6-digit OTP check</p>
        </div>

        {/* In-Transit Deliveries */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Security Mechanism</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-base font-bold text-slate-900">6-Digit OTP Escrow</p>
          <p className="text-[11px] text-slate-500">Zero cash risk or fraud</p>
        </div>

        {/* Fleet Readiness */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Fleet Status</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-base font-bold text-emerald-700">On Duty & Active</p>
          <p className="text-[11px] text-slate-500">Côte d&apos;Ivoire Agro-Grid</p>
        </div>
      </div>

      {/* Operational Instructions Banner */}
      <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs space-y-2 shadow-sm">
        <h3 className="font-serif font-bold text-sm text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          Standard Agro-Logistics Delivery Protocol
        </h3>
        <ol className="list-decimal list-inside space-y-1 text-slate-600 text-[11px] leading-relaxed">
          <li>
            <strong>Hub Pickup:</strong> Inspect crop crates and produce packaging, then mark status as{" "}
            <span className="text-emerald-700 font-semibold">Picked Up</span>.
          </li>
          <li>
            <strong>Buyer Arrival:</strong> Upon reaching customer destination, click{" "}
            <span className="text-emerald-700 font-semibold">Send OTP</span> to generate their
            verification code.
          </li>
          <li>
            <strong>Handover & Payment:</strong> Input the buyer&apos;s 6-digit code in the{" "}
            <span className="text-emerald-700 font-semibold">Verify OTP</span> modal to immediately
            complete delivery and claim your fee.
          </li>
        </ol>
      </div>

      {/* Recent Trips Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="font-serif text-lg font-bold text-slate-900">Recent Delivery Trips</h2>
            <p className="text-xs text-slate-500">
              Completed and settled logistics journeys with trip fees.
            </p>
          </div>
          <Link
            href="/driver/earnings"
            className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1"
          >
            View Earning Records
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoadingPayments ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-slate-100 rounded-xl" />
            ))}
          </div>
        ) : payments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Order Ref</th>
                  <th className="py-3 px-4">Delivery Fee</th>
                  <th className="py-3 px-4">Transfer Status</th>
                  <th className="py-3 px-4 text-right">Completion Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      #{p.order?.orderId || p.id.slice(-6).toUpperCase()}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                      {formatCurrency(p.amount)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          p.isTransferred
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {p.isTransferred ? "Settled & Paid" : "Escrow Pending"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-400 font-mono">
                      {p.createdAt ? formatDate(p.createdAt) : "Recent"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-xs text-slate-500">
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
