"use client";

import React from "react";
import Link from "next/link";
import {
  Package,
  ShoppingBag,
  DollarSign,
  Plus,
  ArrowRight,
  Truck,
} from "lucide-react";
import { toast } from "react-toastify";
import { useGetProducerProductsQuery } from "@/redux/features/product/productApi";
import {
  useGetProducerWiseOrdersQuery,
  useMarkOrderItemSentToHubMutation,
} from "@/redux/features/order/orderApi";
import { useGetProducerWisePaymentsQuery } from "@/redux/features/payment/paymentApi";
import { formatCurrency, formatUnit } from "@/utils/formatters";

export default function ProducerDashboardPage() {
  const { data: productsData, isLoading: isLoadingProducts } = useGetProducerProductsQuery({
    limit: 5,
  });
  const { data: ordersData, isLoading: isLoadingOrders } = useGetProducerWiseOrdersQuery({
    limit: 5,
  });
  const { data: paymentsData, isLoading: isLoadingPayments } = useGetProducerWisePaymentsQuery({
    limit: 5,
  });

  const [markSentToHub, { isLoading: isMarkingHub }] = useMarkOrderItemSentToHubMutation();

  const products = productsData?.data?.products || [];
  const orderItems = ordersData?.data?.orderItems || [];
  const totalProductsCount = productsData?.data?.meta?.total || products.length;

  // Compute metrics
  const pendingFulfillmentOrders = orderItems.filter((item) => item.status === "Pending");
  const totalRevenue =
    paymentsData?.data?.earningSummary?.amount ||
    paymentsData?.data?.payments?.reduce((acc, p) => acc + (p.amount || 0), 0) ||
    0;

  const handleMarkSentToHub = async (itemId: string, productName: string) => {
    try {
      await markSentToHub(itemId).unwrap();
      toast.success(`${productName} marked as Sent to Hub!`);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to mark as sent to hub");
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#062413] to-[#04190c] border border-forest-700/80 p-6 rounded-3xl shadow-xl">
        <div className="space-y-1">
          <span className="text-xs uppercase tracking-widest text-emerald-400 font-bold">
            Farm Management Console
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white">
            Welcome to Your Farm Dashboard
          </h1>
          <p className="text-xs text-white/70 max-w-xl">
            Monitor incoming wholesale & retail harvest orders, dispatch crates to regional hubs,
            and manage tiered volume discounts.
          </p>
        </div>

        <Link
          href="/producer/products/create"
          className="btn-primary text-xs py-3 px-5 flex items-center justify-center gap-2 whitespace-nowrap shadow-lg shadow-emerald-950/60"
        >
          <Plus className="w-4 h-4" />
          Create New Harvest
        </Link>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Revenue */}
        <div className="p-5 rounded-2xl bg-[#071f11] border border-forest-700/60 space-y-2">
          <div className="flex items-center justify-between text-white/60 text-xs">
            <span>Total Earnings</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="font-mono text-2xl font-bold text-emerald-400">
            {isLoadingPayments ? "..." : formatCurrency(totalRevenue)}
          </p>
          <p className="text-[11px] text-white/50">Cumulative sales across all crops</p>
        </div>

        {/* Metric 2: Active Products */}
        <div className="p-5 rounded-2xl bg-[#071f11] border border-forest-700/60 space-y-2">
          <div className="flex items-center justify-between text-white/60 text-xs">
            <span>Listed Harvests</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="font-mono text-2xl font-bold text-white">
            {isLoadingProducts ? "..." : totalProductsCount}
          </p>
          <p className="text-[11px] text-white/50">Active on Côte d&apos;Ivoire marketplace</p>
        </div>

        {/* Metric 3: Orders to Dispatch */}
        <div className="p-5 rounded-2xl bg-[#071f11] border border-forest-700/60 space-y-2">
          <div className="flex items-center justify-between text-white/60 text-xs">
            <span>Pending Dispatch</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="font-mono text-2xl font-bold text-amber-400">
            {isLoadingOrders ? "..." : pendingFulfillmentOrders.length}
          </p>
          <p className="text-[11px] text-white/50">Orders awaiting transfer to driver hub</p>
        </div>

        {/* Metric 4: Logistics Status */}
        <div className="p-5 rounded-2xl bg-[#071f11] border border-forest-700/60 space-y-2">
          <div className="flex items-center justify-between text-white/60 text-xs">
            <span>Transport Network</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-base font-bold text-emerald-300 font-sans">Active & Ready</p>
          <p className="text-[11px] text-white/50">Drivers available for scheduled pickup</p>
        </div>
      </div>

      {/* Orders to Fulfill Section */}
      <div className="bg-[#071f11] border border-forest-700/60 rounded-3xl p-6 space-y-4 shadow-lg">
        <div className="flex items-center justify-between border-b border-forest-800 pb-3">
          <div>
            <h2 className="font-serif text-lg font-bold text-white">Recent Orders to Dispatch</h2>
            <p className="text-xs text-white/60">
              Harvest and package items, then click &ldquo;Mark Sent to Hub&rdquo; once ready.
            </p>
          </div>
          <Link
            href="/producer/orders"
            className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
          >
            View All ({orderItems.length})
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoadingOrders ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-forest-900/40 rounded-xl" />
            ))}
          </div>
        ) : orderItems.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-white/80">
              <thead className="bg-forest-950/60 text-white/50 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Harvest</th>
                  <th className="py-3 px-4">Buyer</th>
                  <th className="py-3 px-4">Quantity</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Fulfillment Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-forest-800/60">
                {orderItems.map((item) => (
                  <tr key={item.id} className="table-row-hover">
                    <td className="py-3 px-4 font-bold text-white">
                      {item.productName || "Product"}
                    </td>
                    <td className="py-3 px-4 text-white/70">
                      {item.order?.customer?.fullName || "Buyer"}
                    </td>
                    <td className="py-3 px-4 font-mono">
                      {item.quantity} {item.sellingUnit && formatUnit(item.sellingUnit)}
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-emerald-400">
                      {formatCurrency(item.subtotal)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.status === "Pending"
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                            : item.status === "SentToHub"
                            ? "bg-blue-500/20 text-blue-300 border border-blue-500/40"
                            : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {item.status === "Pending" ? (
                        <button
                          type="button"
                          onClick={() => handleMarkSentToHub(item.id, item.productName || "Product")}
                          disabled={isMarkingHub}
                          className="btn-primary text-[11px] py-1 px-3"
                        >
                          Mark Sent to Hub
                        </button>
                      ) : (
                        <span className="text-[11px] text-white/40 italic">Hub Dispatched</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-xs text-white/50">
            No orders pending fulfillment. When buyers purchase your harvests, they will appear
            here.
          </div>
        )}
      </div>

      {/* Listed Products Summary */}
      <div className="bg-[#071f11] border border-forest-700/60 rounded-3xl p-6 space-y-4 shadow-lg">
        <div className="flex items-center justify-between border-b border-forest-800 pb-3">
          <div>
            <h2 className="font-serif text-lg font-bold text-white">My Active Harvests</h2>
            <p className="text-xs text-white/60">
              Manage stock, update pricing, or view tiered discounts.
            </p>
          </div>
          <Link
            href="/producer/products"
            className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
          >
            Manage All Harvests
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoadingProducts ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-forest-900/40 rounded-xl" />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((prod) => (
              <div
                key={prod.id}
                className="p-4 rounded-2xl bg-forest-950/60 border border-forest-800 space-y-2"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-serif font-bold text-white text-sm">{prod.name}</h4>
                    <span className="text-[11px] text-emerald-400">
                      {prod.category?.name || "Crops"}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-emerald-400 text-sm">
                    {formatCurrency(prod.pricePerUnit)} / {formatUnit(prod.sellingUnit)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-white/60 pt-2 border-t border-forest-800/80">
                  <span>Stock: {prod.availableQuantity} units</span>
                  <span>Sold: {prod.sold || 0}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-xs text-white/50">
            No harvests listed yet. Click &ldquo;Create New Harvest&rdquo; to publish your first
            crop.
          </div>
        )}
      </div>
    </div>
  );
}
