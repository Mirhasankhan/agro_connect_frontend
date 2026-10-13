"use client";

import React, { useState } from "react";
import {
  DollarSign,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { useGetDriverWisePaymentsQuery } from "@/redux/features/payment/paymentApi";
import { formatCurrency, formatDate } from "@/utils/formatters";
import Pagination from "@/utils/pagination";
import StripeConnectCard from "@/components/payment/StripeConnectCard";

export default function DriverEarningsPage() {
  const [filterTransferred, setFilterTransferred] = useState<string>("ALL");
  const [page, setPage] = useState(1);

  const queryParams: any = {
    page,
    limit: 10,
  };
  if (filterTransferred === "PAID") queryParams.isTransferred = true;
  if (filterTransferred === "PENDING") queryParams.isTransferred = false;

  const { data, isLoading } = useGetDriverWisePaymentsQuery(queryParams);

  const payments = data?.data?.payments || [];
  const totalPages = data?.data?.pagination?.totalPage || 1;
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
      <div className="border-b border-slate-200 pb-5">
        <h1 className="font-serif text-2xl font-bold text-slate-900">Driver Earnings & Payouts</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          View earned delivery fees, completed bank settlements, and pending
          balances.
        </p>
      </div>

      {/* Stripe Connect Account Status */}
      <StripeConnectCard userRole="DRIVER" />

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Earned */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Total Delivery Revenue</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="font-mono text-3xl font-bold text-slate-900">
            {isLoading ? "..." : formatCurrency(totalAmount)}
          </p>
          <p className="text-[11px] text-slate-500">Cumulative fees from verified trips</p>
        </div>

        {/* Transferred to Driver */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Transferred Payouts</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="font-mono text-3xl font-bold text-blue-600">
            {isLoading ? "..." : formatCurrency(transferredAmount)}
          </p>
          <p className="text-[11px] text-slate-500">Settled to your mobile wallet or bank</p>
        </div>

        {/* Escrow Pending */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Pending Delivery Release</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="font-mono text-3xl font-bold text-amber-600">
            {isLoading ? "..." : formatCurrency(pendingEscrowAmount)}
          </p>
          <p className="text-[11px] text-slate-500">Released automatically upon buyer OTP</p>
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4">
          <h3 className="font-serif font-bold text-slate-900 text-base">Trip Compensation Records</h3>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Status:</span>
            <select
              value={filterTransferred}
              onChange={(e) => {
                setFilterTransferred(e.target.value);
                setPage(1);
              }}
              className="bg-slate-50 border border-slate-200 rounded-xl py-1.5 px-3 text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Trips</option>
              <option value="PAID">Transferred</option>
              <option value="PENDING">Pending Escrow</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 space-y-4 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-slate-100 rounded-xl" />
            ))}
          </div>
        ) : payments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500  tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Order Ref</th>
                  <th className="py-3.5 px-4">Trip Fee Credited</th>
                  <th className="py-3.5 px-4">Payout Status</th>
                  <th className="py-3.5 px-4 text-right">Settlement Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 text-sm">
                      #{p.order?.orderId || p.id.slice(-6).toUpperCase()}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-700 text-sm">
                      {formatCurrency(p.amount)}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${p.isTransferred
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                      >
                        {p.isTransferred ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" />
                            Transferred & Paid
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3" />
                            Pending Delivery Release
                          </>
                        )}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right text-slate-400 font-mono">
                      {p.createdAt ? formatDate(p.createdAt) : "Recent"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {totalPages > 1 && (
              <div className="p-4 border-t border-slate-200 bg-white">
                <Pagination
                  page={page}
                  setPage={setPage}
                  totalPage={totalPages}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-16 px-4">
            <DollarSign className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-serif text-lg font-bold text-slate-900">No Trip Earnings Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Once you complete delivery assignments with OTP verification, trip compensation
              records will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
