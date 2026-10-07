"use client";

import React, { useState } from "react";
import {
  DollarSign,
  CheckCircle2,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { useGetProducerWisePaymentsQuery } from "@/redux/features/payment/paymentApi";
import { formatCurrency, formatUnit, formatDate } from "@/utils/formatters";

export default function ProducerEarningsPage() {
  const [filterTransferred, setFilterTransferred] = useState<string>("ALL");

  const queryParams: any = {
    limit: 50,
  };
  if (filterTransferred === "PAID") queryParams.isTransferred = true;
  if (filterTransferred === "PENDING") queryParams.isTransferred = false;

  const { data, isLoading } = useGetProducerWisePaymentsQuery(queryParams);

  const payments = data?.data?.payments || [];
  const totalAmount =
    data?.data?.earningSummary?.amount ||
    payments.reduce((acc, p) => acc + (p.amount || 0), 0);

  const transferredAmount = payments
    .filter((p) => p.isTransferred)
    .reduce((acc, p) => acc + (p.amount || 0), 0);

  const pendingEscrowAmount = payments
    .filter((p) => !p.isTransferred)
    .reduce((acc, p) => acc + (p.amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-forest-800 pb-5">
        <h1 className="font-serif text-2xl font-bold text-white">Earnings & Payouts</h1>
        <p className="text-xs text-white/60 mt-0.5">
          Track sales revenue, completed bank/mobile money transfers, and escrow balances.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Earned */}
        <div className="p-5 rounded-2xl bg-[#071f11] border border-forest-700/60 space-y-2">
          <div className="flex items-center justify-between text-xs text-white/60">
            <span>Total Sales Revenue</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="font-mono text-3xl font-bold text-emerald-400">
            {isLoading ? "..." : formatCurrency(totalAmount)}
          </p>
          <p className="text-[11px] text-white/50">Gross earnings from fulfilled orders</p>
        </div>

        {/* Transferred to Producer */}
        <div className="p-5 rounded-2xl bg-[#071f11] border border-forest-700/60 space-y-2">
          <div className="flex items-center justify-between text-xs text-white/60">
            <span>Completed Transfers</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="font-mono text-3xl font-bold text-blue-400">
            {isLoading ? "..." : formatCurrency(transferredAmount)}
          </p>
          <p className="text-[11px] text-white/50">Deposited to bank or mobile wallet</p>
        </div>

        {/* Escrow Pending */}
        <div className="p-5 rounded-2xl bg-[#071f11] border border-forest-700/60 space-y-2">
          <div className="flex items-center justify-between text-xs text-white/60">
            <span>Pending in Escrow</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="font-mono text-3xl font-bold text-amber-400">
            {isLoading ? "..." : formatCurrency(pendingEscrowAmount)}
          </p>
          <p className="text-[11px] text-white/50">Released upon buyer delivery OTP check</p>
        </div>
      </div>

      {/* Escrow Security Callout */}
      <div className="p-4 rounded-2xl bg-[#082414] border border-emerald-500/40 text-xs text-white/80 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-bold text-white text-sm">Escrow Protection & Payout Guarantee</h4>
          <p className="text-white/70 leading-relaxed text-xs">
            Agro Connect holds buyer payments securely in escrow when orders are placed. As soon as
            the transport driver hands over your harvest and verifies the 6-digit OTP with the
            buyer, funds are automatically unlocked and queued for direct transfer.
          </p>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-[#071f11] border border-forest-700/60 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-forest-800 flex items-center justify-between gap-4">
          <h3 className="font-serif font-bold text-white text-base">Earning Records</h3>

          <div className="flex items-center gap-2">
            <span className="text-xs text-white/50">Status:</span>
            <select
              value={filterTransferred}
              onChange={(e) => setFilterTransferred(e.target.value)}
              className="bg-forest-950 border border-forest-700 rounded-xl py-1.5 px-3 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Records</option>
              <option value="PAID">Transferred</option>
              <option value="PENDING">Pending Escrow</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 space-y-4 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-forest-900/40 rounded-xl" />
            ))}
          </div>
        ) : payments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-white/80">
              <thead className="bg-forest-950/70 text-white/50 uppercase tracking-wider text-[10px] border-b border-forest-800">
                <tr>
                  <th className="py-3.5 px-4">Harvest Item</th>
                  <th className="py-3.5 px-4">Quantity</th>
                  <th className="py-3.5 px-4">Amount Credited</th>
                  <th className="py-3.5 px-4">Payout Status</th>
                  <th className="py-3.5 px-4 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-forest-800/60">
                {payments.map((p) => (
                  <tr key={p.id} className="table-row-hover">
                    <td className="py-3.5 px-4 font-serif font-bold text-white text-sm">
                      {p.orderItem?.productName || "Agricultural Item"}
                    </td>

                    <td className="py-3.5 px-4 font-mono">
                      {p.orderItem?.quantity || 1}{" "}
                      {p.orderItem?.sellingUnit && formatUnit(p.orderItem.sellingUnit)}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-400 text-sm">
                      {formatCurrency(p.amount)}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                          p.isTransferred
                            ? "bg-blue-500/20 text-blue-300 border border-blue-500/40"
                            : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                        }`}
                      >
                        {p.isTransferred ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" />
                            Transferred
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3" />
                            Pending Escrow
                          </>
                        )}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right text-white/50 font-mono">
                      {p.createdAt ? formatDate(p.createdAt) : "Recent"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 px-4">
            <DollarSign className="w-12 h-12 text-emerald-400/60 mx-auto mb-3" />
            <h3 className="font-serif text-lg font-bold text-white">No Earnings Yet</h3>
            <p className="text-xs text-white/60 max-w-sm mx-auto mt-1">
              Sales transactions will appear here once buyers place orders and complete payment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
