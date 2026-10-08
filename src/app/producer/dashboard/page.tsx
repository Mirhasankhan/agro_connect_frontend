"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Package,
  ShoppingBag,
  DollarSign,
  Plus,
  ArrowRight,
  Truck,
  Sprout,
} from "lucide-react";
import { toast } from "react-toastify";
import { useGetProducerProductsQuery } from "@/redux/features/product/productApi";
import {
  useGetProducerWiseOrdersQuery,
  useMarkOrderItemSentToHubMutation,
} from "@/redux/features/order/orderApi";
import { useGetProducerWisePaymentsQuery } from "@/redux/features/payment/paymentApi";
import { useGetProfileQuery } from "@/redux/features/auth/authApi";
import { useAppSelector } from "@/redux/hooks";
import ProducerProfileSetupModal from "@/components/producer/ProducerProfileSetupModal";
import { formatCurrency, formatUnit } from "@/utils/formatters";

export default function ProducerDashboardPage() {
  const searchParams = useSearchParams();
  const isSetupCompleted = useAppSelector((state) => state.auth.isSetupCompleted);
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);

  const { data: profileData } = useGetProfileQuery();
  const verificationStatus = profileData?.data?.producerProfile?.verificationStatus;
  const isAccepted = verificationStatus === "Accepted";
  const isRejected = verificationStatus === "Rejected";

  useEffect(() => {
    if (searchParams.get("setup") === "true" || !isSetupCompleted) {
      setIsSetupModalOpen(true);
    }
  }, [searchParams, isSetupCompleted]);

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
      {/* Profile Setup Pending Notice */}
      {!isSetupCompleted && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-amber-200 bg-amber-50/80 p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <Sprout className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-amber-950">
                Producer Profile Setup Required
              </h3>
              <p className="mt-0.5 text-xs text-amber-800">
                Complete your farm details and upload your verification documents to start listing produce and receiving payouts.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsSetupModalOpen(true)}
            className="btn-primary shrink-0 self-start sm:self-auto bg-amber-600 hover:bg-amber-700 text-white border-0 text-xs py-2 px-4 shadow-sm"
          >
            Complete Profile Setup
          </button>
        </div>
      )}

      {/* Setup Profile Modal */}
      <ProducerProfileSetupModal
        isOpen={isSetupModalOpen}
        onClose={() => setIsSetupModalOpen(false)}
      />

      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
        <div className="space-y-1">
          <span className="text-xs uppercase tracking-widest text-emerald-600 font-bold">
            Farm Management Console
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
            Welcome to Your Farm Dashboard
          </h1>
          <p className="text-xs text-slate-600 max-w-xl">
            Monitor incoming wholesale & retail harvest orders, dispatch crates to regional hubs,
            and manage tiered volume discounts.
          </p>
        </div>

        {isAccepted ? (
          <Link
            href="/producer/products/create"
            className="btn-primary text-xs py-3 px-5 flex items-center justify-center gap-2 whitespace-nowrap shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Create New Harvest
          </Link>
        ) : (
          <button
            type="button"
            disabled
            title={
              isRejected
                ? "Account verification was rejected. Please contact support."
                : "Account verification is pending. You can add products once your producer profile is Accepted."
            }
            className="btn-primary opacity-50 cursor-not-allowed text-xs py-3 px-5 flex items-center justify-center gap-2 whitespace-nowrap shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Create New Harvest (Pending Approval)
          </button>
        )}
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Revenue */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Total Earnings</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="font-mono text-2xl font-bold text-slate-900">
            {isLoadingPayments ? "..." : formatCurrency(totalRevenue)}
          </p>
          <p className="text-[11px] text-slate-500">Cumulative sales across all crops</p>
        </div>

        {/* Metric 2: Active Products */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Listed Harvests</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="font-mono text-2xl font-bold text-slate-900">
            {isLoadingProducts ? "..." : totalProductsCount}
          </p>
          <p className="text-[11px] text-slate-500">Active on Côte d&apos;Ivoire marketplace</p>
        </div>

        {/* Metric 3: Orders to Dispatch */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Pending Dispatch</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="font-mono text-2xl font-bold text-amber-600">
            {isLoadingOrders ? "..." : pendingFulfillmentOrders.length}
          </p>
          <p className="text-[11px] text-slate-500">Orders awaiting transfer to driver hub</p>
        </div>

        {/* Metric 4: Logistics Status */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Transport Network</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-base font-bold text-emerald-700 font-sans">Active & Ready</p>
          <p className="text-[11px] text-slate-500">Drivers available for scheduled pickup</p>
        </div>
      </div>

      {/* Orders to Fulfill Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="font-serif text-lg font-bold text-slate-900">Recent Orders to Dispatch</h2>
            <p className="text-xs text-slate-500">
              Harvest and package items, then click &ldquo;Mark Sent to Hub&rdquo; once ready.
            </p>
          </div>
          <Link
            href="/producer/orders"
            className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1"
          >
            View All ({orderItems.length})
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoadingOrders ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-slate-100 rounded-xl" />
            ))}
          </div>
        ) : orderItems.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Harvest</th>
                  <th className="py-3 px-4">Buyer</th>
                  <th className="py-3 px-4">Quantity</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Fulfillment Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orderItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {item.productName || "Product"}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {item.order?.customer?.fullName || "Buyer"}
                    </td>
                    <td className="py-3 px-4 font-mono">
                      {item.quantity} {item.sellingUnit && formatUnit(item.sellingUnit)}
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-emerald-600">
                      {formatCurrency(item.subtotal)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.status === "Pending"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : item.status === "SentToHub"
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : "bg-emerald-50 text-emerald-700 border border-emerald-200"
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
                        <span className="text-[11px] text-slate-400 italic">Hub Dispatched</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-xs text-slate-500">
            No orders pending fulfillment. When buyers purchase your harvests, they will appear
            here.
          </div>
        )}
      </div>

      {/* Listed Products Summary */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="font-serif text-lg font-bold text-slate-900">My Active Harvests</h2>
            <p className="text-xs text-slate-500">
              Manage stock, update pricing, or view tiered discounts.
            </p>
          </div>
          <Link
            href="/producer/products"
            className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1"
          >
            Manage All Harvests
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoadingProducts ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-slate-100 rounded-xl" />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((prod) => (
              <div
                key={prod.id}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-serif font-bold text-slate-900 text-sm">{prod.name}</h4>
                    <span className="text-[11px] text-emerald-700 font-medium">
                      {prod.category?.name || "Crops"}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-emerald-700 text-sm">
                    {formatCurrency(prod.pricePerUnit)} / {formatUnit(prod.sellingUnit)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200">
                  <span>Stock: {prod.availableQuantity} units</span>
                  <span>Sold: {prod.sold || 0}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-xs text-slate-500">
            No harvests listed yet. Click &ldquo;Create New Harvest&rdquo; to publish your first
            crop.
          </div>
        )}
      </div>
    </div>
  );
}
