"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Package,
  Calendar,
  ChevronRight,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useGetUserOrdersQuery, OrderQueryParams } from "@/redux/features/order/orderApi";
import { useAppSelector } from "@/redux/hooks";
import { formatCurrency, formatDate, getOrderStatusColor } from "@/utils/formatters";
import { OrderStatus } from "@/types";
import Pagination from "@/utils/pagination";

const STATUS_TABS: { label: string; value: OrderStatus | "ALL" }[] = [
  { label: "All Orders", value: "ALL" },
  { label: "Pending", value: "Pending" },
  { label: "Processing", value: "Active" },
  { label: "In Transit", value: "Shipped" },
  { label: "Delivered", value: "Delivered" },
  { label: "Cancelled", value: "Cancelled" },
];

export default function BuyerOrdersPage() {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | "ALL">("ALL");
  const [page, setPage] = useState(1);

  const queryParams: OrderQueryParams = {
    page,
    limit: 10,
  };

  if (selectedStatus !== "ALL") {
    queryParams.status = selectedStatus;
  }

  const { data, isLoading } = useGetUserOrdersQuery(queryParams, {
    skip: !isAuthenticated,
  });

  const orders = data?.data?.orders || [];
  const totalPages = data?.data?.meta?.totalPage || 1;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center py-20 px-4 text-center">
          <Package className="w-16 h-16 text-emerald-600 mb-4 opacity-80" />
          <h2 className="font-serif text-3xl font-bold text-slate-900">Sign In Required</h2>
          <p className="text-slate-500 text-sm max-w-sm mt-2 mb-6">
            Please log in to your account to view your purchase order history and track deliveries.
          </p>
          <Link href="/login?redirect=/orders" className="btn-primary text-xs py-2.5 px-6">
            Sign In
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Navbar />

      {/* Header */}
      <div className="bg-white border-b border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-xs uppercase tracking-widest text-emerald-700 font-bold">
            Account Management
          </span>
          <h1 className="font-serif text-3xl font-bold text-slate-900 mt-1">My Orders & Deliveries</h1>
          <p className="text-xs text-slate-500 mt-1">
            Track farm harvests from dispatch to your doorstep.
          </p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 border-b border-slate-200">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => {
                setSelectedStatus(tab.value);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedStatus === tab.value
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Orders List */}
        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-white rounded-2xl border border-slate-200" />
            ))}
          </div>
        ) : orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => {
              const statusColors = getOrderStatusColor(order.status);
              const itemCount = order.items?.length || 0;

              return (
                <div
                  key={order.id}
                  className="bg-white border border-slate-200/90 hover:border-emerald-500/70 rounded-2xl p-5 transition-all shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5"
                >
                  {/* Order meta info */}
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-mono font-bold text-slate-900 text-base">
                        #{order.orderId || order.id.slice(-8).toUpperCase()}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusColors.badge}`}
                      >
                        {order.status}
                      </span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {order.createdAt ? formatDate(order.createdAt) : "Recent"}
                      </span>
                    </div>

                    {/* Items preview snippet */}
                    <div className="text-xs text-slate-600 line-clamp-1">
                      {order.items && order.items.length > 0
                        ? order.items
                            .map((it) => `${it.productName || "Product"} (${it.quantity})`)
                            .join(", ")
                        : `${itemCount} items`}
                    </div>
                  </div>

                  {/* Pricing and Action */}
                  <div className="flex items-center justify-between md:justify-end gap-6 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <div className="text-left md:text-right">
                      <span className="text-[10px] text-slate-400 block font-medium">Total Amount</span>
                      <span className="font-mono font-bold text-lg text-emerald-600">
                        {formatCurrency(order.totalAmount)}
                      </span>
                    </div>

                    <Link
                      href={`/orders/${order.id}`}
                      className="btn-secondary text-xs py-2 px-4 flex items-center gap-1.5 hover:border-emerald-500"
                    >
                      View Details
                      <ChevronRight className="w-3.5 h-3.5 text-emerald-600" />
                    </Link>
                  </div>
                </div>
              );
            })}
            {totalPages > 1 && (
              <div className="pt-4">
                <Pagination
                  page={page}
                  setPage={setPage}
                  totalPage={totalPages}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-20 px-4 bg-white border border-slate-200 rounded-3xl max-w-lg mx-auto shadow-sm">
            <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h2 className="font-serif text-2xl font-bold text-slate-900">No Orders Found</h2>
            <p className="text-xs text-slate-500 mt-2 mb-6">
              You haven&apos;t placed any orders matching this filter yet. Check back once you have
              completed a purchase.
            </p>
            <Link href="/products" className="btn-primary text-xs py-2.5 px-6 inline-flex">
              Start Shopping
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
