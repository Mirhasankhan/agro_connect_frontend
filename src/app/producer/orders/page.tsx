"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  ShoppingBag,
  Calendar,
  CheckCircle2,
  Clock,
  Truck,
  PackageCheck,
  Search,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  useGetProducerWiseOrdersQuery,
  useMarkOrderItemSentToHubMutation,
} from "@/redux/features/order/orderApi";
import { formatCurrency, formatUnit, formatDate } from "@/utils/formatters";
import { ItemStatus } from "@/types";

const STATUS_TABS: { label: string; value: ItemStatus | "ALL" }[] = [
  { label: "All Orders", value: "ALL" },
  { label: "Pending Dispatch", value: "Pending" },
  { label: "Sent to Hub", value: "SentToHub" },
  { label: "Delivered", value: "Delivered" },
];

export default function ProducerOrdersPage() {
  const [selectedStatus, setSelectedStatus] = useState<ItemStatus | "ALL">("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  const queryParams: any = {
    limit: 50,
  };
  if (searchTerm.trim()) queryParams.search = searchTerm.trim();

  const { data, isLoading } = useGetProducerWiseOrdersQuery(queryParams);
  const [markSentToHub, { isLoading: isMarkingHub }] = useMarkOrderItemSentToHubMutation();

  const allOrderItems = data?.data?.orderItems || [];

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
      <div className="border-b border-forest-800 pb-5">
        <h1 className="font-serif text-2xl font-bold text-white">Order Fulfillment & Dispatch</h1>
        <p className="text-xs text-white/60 mt-0.5">
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
              onClick={() => setSelectedStatus(tab.value)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedStatus === tab.value
                  ? "bg-emerald-500 text-white shadow-md shadow-emerald-950/60"
                  : "bg-forest-900/60 text-white/70 hover:text-white hover:bg-forest-800"
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
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-forest-950 border border-forest-700 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-white/40 focus:outline-none focus:border-emerald-500"
          />
          <Search className="w-4 h-4 text-emerald-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-[#071f11] border border-forest-700/60 rounded-3xl overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="p-8 space-y-4 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-forest-900/40 rounded-xl" />
            ))}
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-white/80">
              <thead className="bg-forest-950/70 text-white/50 uppercase tracking-wider text-[10px] border-b border-forest-800">
                <tr>
                  <th className="py-3.5 px-4">Order Ref</th>
                  <th className="py-3.5 px-4">Harvest Produce</th>
                  <th className="py-3.5 px-4">Buyer Customer</th>
                  <th className="py-3.5 px-4">Quantity</th>
                  <th className="py-3.5 px-4">Total Amount</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Dispatch Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-forest-800/60">
                {filteredItems.map((item) => {
                  const img =
                    item.product?.imageUrls?.[0] ||
                    "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=150&q=80";

                  return (
                    <tr key={item.id} className="table-row-hover">
                      {/* Order ref + Date */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-white text-xs block">
                          #{item.order?.orderId || item.id.slice(-6).toUpperCase()}
                        </span>
                        <span className="text-[10px] text-white/40 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3" />
                          {item.createdAt ? formatDate(item.createdAt) : "Recent"}
                        </span>
                      </td>

                      {/* Harvest image + name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-forest-950 shrink-0 border border-forest-800">
                            <Image
                              src={img}
                              alt={item.productName || "Produce"}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <span className="font-serif font-bold text-white text-sm">
                            {item.productName || "Harvest Produce"}
                          </span>
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-white">
                          {item.order?.customer?.fullName || "Buyer"}
                        </p>
                        {item.order?.customer?.buyerProfile?.institution && (
                          <span className="text-[10px] text-emerald-400">
                            {item.order.customer.buyerProfile.institution}
                          </span>
                        )}
                      </td>

                      {/* Quantity */}
                      <td className="py-3.5 px-4 font-mono font-semibold">
                        {item.quantity} {item.sellingUnit && formatUnit(item.sellingUnit)}
                      </td>

                      {/* Total */}
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                        {formatCurrency(item.subtotal)}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                            item.status === "Pending"
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                              : item.status === "SentToHub"
                              ? "bg-blue-500/20 text-blue-300 border border-blue-500/40"
                              : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                          }`}
                        >
                          {item.status === "Pending" && <Clock className="w-3 h-3" />}
                          {item.status === "SentToHub" && <Truck className="w-3 h-3" />}
                          {item.status === "Delivered" && <CheckCircle2 className="w-3 h-3" />}
                          {item.status}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        {item.status === "Pending" ? (
                          <button
                            type="button"
                            onClick={() => handleMarkSentToHub(item.id, item.productName || "Product")}
                            disabled={isMarkingHub}
                            className="btn-primary text-xs py-1.5 px-3.5 inline-flex items-center gap-1.5 shadow-md shadow-emerald-950/60"
                          >
                            <PackageCheck className="w-3.5 h-3.5" />
                            Mark Sent to Hub
                          </button>
                        ) : (
                          <span className="text-[11px] text-white/40 italic">
                            {item.status === "SentToHub"
                              ? "Awaiting driver pickup"
                              : "Delivered to buyer"}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 px-4">
            <ShoppingBag className="w-12 h-12 text-emerald-400/60 mx-auto mb-3" />
            <h3 className="font-serif text-lg font-bold text-white">No Orders Found</h3>
            <p className="text-xs text-white/60 max-w-sm mx-auto mt-1">
              There are currently no orders under the &ldquo;{selectedStatus}&rdquo; status.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
