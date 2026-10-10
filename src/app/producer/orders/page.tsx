"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShoppingBag,
  Calendar,
  CheckCircle2,
  Clock,
  Truck,
  PackageCheck,
  Search,
  MapPin,
  Eye,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  useGetProducerWiseOrdersQuery,
  useMarkOrderItemSentToHubMutation,
} from "@/redux/features/order/orderApi";
import { formatCurrency, formatUnit, formatDate } from "@/utils/formatters";
import { ItemStatus } from "@/types";
import Pagination from "@/utils/pagination";

const STATUS_TABS: { label: string; value: ItemStatus | "ALL" }[] = [
  { label: "All Orders", value: "ALL" },
  { label: "Pending Dispatch", value: "Pending" },
  { label: "Sent to Hub", value: "SentToHub" },
  { label: "Delivered", value: "Delivered" },
];

export default function ProducerOrdersPage() {
  const [selectedStatus, setSelectedStatus] = useState<ItemStatus | "ALL">("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);

  const queryParams: any = {
    page,
    limit: 10,
  };
  if (searchTerm.trim()) queryParams.search = searchTerm.trim();

  const { data, isLoading } = useGetProducerWiseOrdersQuery(queryParams);
  const [markSentToHub, { isLoading: isMarkingHub }] = useMarkOrderItemSentToHubMutation();

  const allOrderItems = data?.data?.orderItems || [];
  const totalPages = data?.data?.meta?.totalPage || 1;

  const filteredItems = allOrderItems.filter((item) => {
    if (selectedStatus === "ALL") return true;
    return item.status === selectedStatus;
  });

  const handleMarkSentToHub = async (itemId: string, productName: string) => {
    try {
      await markSentToHub(itemId).unwrap();
      toast.success(`${productName} marked as Sent to Hub! Driver notified for pickup.`);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to mark as sent to hub");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <h1 className="font-serif text-2xl font-bold text-slate-900">Order Fulfillment & Dispatch</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Fulfill incoming harvest orders from buyers across Ivory Coast and hand over crates to
          logistics hubs.
        </p>
      </div>

      {/* Controls Bar: Status Filter Tabs + Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => {
                setSelectedStatus(tab.value);
                setPage(1);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedStatus === tab.value
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <input
            type="text"
            placeholder="Search crop or buyer..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="w-full bg-white border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
          />
          <Search className="w-4 h-4 text-emerald-600 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-8 space-y-4 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-slate-100 rounded-xl" />
            ))}
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Order Ref</th>
                  <th className="py-3.5 px-4">Harvest Produce</th>
                  <th className="py-3.5 px-4">Buyer Customer</th>
                  <th className="py-3.5 px-4">Quantity</th>
                  <th className="py-3.5 px-4">Total Amount</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.map((item) => {
                  const img =
                    item.product?.imageUrls?.[0] ||
                    "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=150&q=80";

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Order ref + Date */}
                      <td className="py-3.5 px-4">
                        <Link
                          href={`/producer/orders/${item.id}`}
                          className="font-mono font-bold text-slate-900 hover:text-emerald-700 hover:underline text-xs block transition-colors"
                        >
                          #{item.order?.orderId || item.id.slice(-6).toUpperCase()}
                        </Link>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3" />
                          {item.createdAt ? formatDate(item.createdAt) : "Recent"}
                        </span>
                      </td>

                      {/* Harvest image + name */}
                      <td className="py-3.5 px-4">
                        <Link
                          href={`/producer/orders/${item.id}`}
                          className="flex items-center gap-3 group"
                        >
                          <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200 group-hover:border-emerald-500 transition-colors">
                            <Image
                              src={img}
                              alt={item.productName || "Produce"}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <span className="font-serif font-bold text-slate-900 text-sm group-hover:text-emerald-700 transition-colors">
                            {item.productName || "Harvest Produce"}
                          </span>
                        </Link>
                      </td>

                      {/* Customer */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="relative w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs shrink-0 overflow-hidden border border-emerald-200">
                            {item.order?.customer?.profileImage ? (
                              <Image
                                src={item.order.customer.profileImage}
                                alt={item.order.customer.fullName || "Buyer"}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              item.order?.customer?.fullName?.charAt(0).toUpperCase() || "B"
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 leading-tight">
                              {item.order?.customer?.fullName || "Buyer"}
                            </p>
                            {(item.order?.customer?.city || item.order?.customer?.address) && (
                              <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                                <MapPin className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                                <span className="truncate max-w-[150px]">
                                  {[item.order?.customer?.city, item.order?.customer?.address]
                                    .filter(Boolean)
                                    .join(", ")}
                                </span>
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Quantity */}
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-800">
                        {item.quantity} {item.sellingUnit && formatUnit(item.sellingUnit)}
                      </td>

                      {/* Total */}
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">
                        {formatCurrency(item.subtotal)}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                            item.status === "Pending"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : item.status === "SentToHub"
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          }`}
                        >
                          {item.status === "Pending" && <Clock className="w-3 h-3" />}
                          {item.status === "SentToHub" && <Truck className="w-3 h-3" />}
                          {item.status === "Delivered" && <CheckCircle2 className="w-3 h-3" />}
                          {item.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/producer/orders/${item.id}`}
                            className="text-xs py-1.5 px-3 rounded-xl border border-slate-200 text-slate-700 hover:text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all font-semibold inline-flex items-center gap-1.5 shrink-0"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Details</span>
                          </Link>
                          {item.status === "Pending" && (
                            <button
                              type="button"
                              onClick={() => handleMarkSentToHub(item.id, item.productName || "Product")}
                              disabled={isMarkingHub}
                              className="btn-primary text-xs py-1.5 px-3.5 inline-flex items-center gap-1.5 shadow-sm shrink-0"
                            >
                              <PackageCheck className="w-3.5 h-3.5" />
                              <span>Mark Sent to Hub</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
            <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-serif text-lg font-bold text-slate-900">No Orders Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              There are currently no orders under the &ldquo;{selectedStatus}&rdquo; status.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
