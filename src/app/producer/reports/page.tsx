"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  Search,
  CheckCircle2,
  Clock,
  ExternalLink,
} from "lucide-react";
import { useGetProducerReportsQuery } from "@/redux/features/order/orderApi";
import { ReportStatus } from "@/types";
import { formatDate } from "@/utils/formatters";
import Pagination from "@/utils/pagination";

export default function ProducerReportsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [page, setPage] = useState(1);

  const queryParams: any = {
    page,
    limit: 10,
  };
  if (search.trim()) queryParams.search = search.trim();
  if (statusFilter !== "ALL") queryParams.status = statusFilter as ReportStatus;

  const { data, isLoading } = useGetProducerReportsQuery(queryParams);

  const reports = data?.data?.reports || [];
  const totalPages = data?.data?.meta?.totalPage || 1;
  const pendingCount = reports.filter((r) => r.status === "Pending").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="font-serif text-2xl font-bold text-slate-900">
            Quality Reports & Disputes
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Buyer feedback, damaged goods claims, and administrative resolutions on your produce.
          </p>
        </div>

        {pendingCount > 0 && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold self-start sm:self-auto">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>{pendingCount} Dispute(s) Pending Review</span>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full max-w-sm">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by produce or reason..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:border-emerald-600"
          >
            <option value="ALL">All Statuses</option>
            <option value="Pending">Pending Review</option>
            <option value="Resolved">Resolved / Refunded</option>
            <option value="Rejected">Dismissed</option>
          </select>
        </div>
      </div>

      {/* Reports Table */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-3 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-slate-100 rounded-xl" />
            ))}
          </div>
        ) : reports.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Produce Item</th>
                  <th className="py-3.5 px-4">Order Ref</th>
                  <th className="py-3.5 px-4">Buyer Customer</th>
                  <th className="py-3.5 px-4">Reported Issue</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {report.orderItem?.productName || "Agricultural Item"}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      #{report.orderItem?.order?.orderId || "ORD"}
                    </td>

                    <td className="py-3.5 px-4 text-slate-800">
                      {report.buyer?.fullName || "Buyer"}
                    </td>

                    <td className="py-3.5 px-4 max-w-xs text-slate-600">
                      <p className="truncate" title={report.reason}>
                        {report.reason}
                      </p>
                      {report.adminComment && (
                        <p className="text-[11px] text-emerald-700 truncate mt-0.5">
                          Admin note: {report.adminComment}
                        </p>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                          report.status === "Pending"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : report.status === "Resolved"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-rose-50 text-rose-700 border-rose-200"
                        }`}
                      >
                        {report.status === "Pending" && <Clock className="w-3 h-3" />}
                        {report.status === "Resolved" && <CheckCircle2 className="w-3 h-3" />}
                        {report.status === "Rejected" && <AlertCircle className="w-3 h-3" />}
                        <span>{report.status}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-400">
                      {formatDate(report.createdAt)}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {report.orderItem?.id && (
                        <Link
                          href={`/producer/orders/${report.orderItem.id}`}
                          className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-800 font-semibold"
                        >
                          <span>View Item</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-xs text-slate-400 space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <p className="font-bold text-slate-700 text-sm">No Quality Disputes Found</p>
            <p className="text-slate-400 max-w-sm mx-auto">
              Your harvest orders are fulfilled with great customer satisfaction. Any future customer reports will appear here.
            </p>
          </div>
        )}

        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex justify-end">
            <Pagination
              page={page}
              setPage={setPage}
              totalPage={totalPages}
            />
          </div>
        )}
      </div>
    </div>
  );
}
