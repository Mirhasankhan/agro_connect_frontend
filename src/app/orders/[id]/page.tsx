"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  Star,
  AlertCircle,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ReviewModal from "@/components/order/ReviewModal";
import { useGetOrderDetailsQuery } from "@/redux/features/order/orderApi";
import { useAppSelector } from "@/redux/hooks";
import {
  formatCurrency,
  formatDate,
  formatUnit,
  getOrderStatusColor,
} from "@/utils/formatters";

export default function OrderDetailsPage() {
  const params = useParams();
  const orderId = params?.id as string;

  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const { data, isLoading, error } = useGetOrderDetailsQuery(orderId, {
    skip: !orderId || !isAuthenticated,
  });

  const order = data?.data;

  // Review modal state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedReviewItem, setSelectedReviewItem] = useState<{
    orderItemId: string;
    productName: string;
  } | null>(null);

  const handleOpenReview = (orderItemId: string, productName: string) => {
    setSelectedReviewItem({ orderItemId, productName });
    setReviewModalOpen(true);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center py-20 px-4 text-center">
          <AlertCircle className="w-16 h-16 text-emerald-600 mb-4" />
          <h2 className="font-serif text-3xl font-bold text-slate-900">Please Sign In</h2>
          <p className="text-slate-500 text-sm max-w-sm mt-2 mb-6">
            Sign in to your account to view this order.
          </p>
          <Link href="/login" className="btn-primary text-xs py-2.5 px-6">
            Sign In
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 py-16 w-full space-y-6 animate-pulse">
          <div className="h-6 w-32 bg-slate-200 rounded" />
          <div className="h-40 bg-white rounded-3xl border border-slate-200" />
          <div className="h-64 bg-white rounded-3xl border border-slate-200" />
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center py-20 px-4 text-center">
          <AlertCircle className="w-16 h-16 text-rose-500 mb-4" />
          <h2 className="font-serif text-3xl font-bold text-slate-900">Order Not Found</h2>
          <p className="text-slate-500 text-sm max-w-sm mt-2 mb-6">
            We couldn&apos;t find this order record or you don&apos;t have permission to view it.
          </p>
          <Link href="/orders" className="btn-primary text-xs py-2.5 px-6">
            Back to My Orders
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const statusColors = getOrderStatusColor(order.status);
  const isDelivered = order.status === "Delivered";

  // Determine timeline progress steps
  const steps = [
    {
      title: "Order Placed",
      desc: "Order registered and paid",
      completed: true,
    },
    {
      title: "Sent to Hub",
      desc: "Farmer harvested produce",
      completed: ["Active", "Shipped", "Delivered"].includes(order.status),
    },
    {
      title: "In Transit",
      desc: "Driver is delivering",
      completed: ["Shipped", "Delivered"].includes(order.status),
    },
    {
      title: "Delivered",
      desc: "Confirmed via OTP",
      completed: order.status === "Delivered",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-8">
        {/* Top Back Link */}
        <Link
          href="/orders"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-emerald-700 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to All Orders
        </Link>

        {/* Order Header Card */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div>
              <span className="text-xs uppercase tracking-widest text-emerald-700 font-bold">
                Order Tracking
              </span>
              <h1 className="font-mono text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
                #{order.orderId || order.id.slice(-8).toUpperCase()}
              </h1>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Placed on {order.createdAt ? formatDate(order.createdAt) : "Recently"}
              </p>
            </div>

            <div className="flex sm:flex-col sm:items-end justify-between items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold border ${statusColors.badge}`}
              >
                {order.status}
              </span>
              <span className="text-xs text-slate-500">
                Payment:{" "}
                <span className="text-emerald-600 font-semibold">{order.paymentStatus}</span>
              </span>
            </div>
          </div>

          {/* Timeline Progress */}
          <div className="py-2">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-6">
              Delivery Progression
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 relative">
              {steps.map((step, idx) => (
                <div key={idx} className="flex flex-col items-center text-center space-y-2">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                      step.completed
                        ? "bg-emerald-600 border-emerald-600 text-white"
                        : "bg-slate-100 border-slate-300 text-slate-400"
                    }`}
                  >
                    {step.completed ? <CheckCircle2 className="w-5 h-5 stroke-[2.5]" /> : idx + 1}
                  </div>
                  <div>
                    <p
                      className={`text-xs font-bold ${
                        step.completed ? "text-slate-900" : "text-slate-400"
                      }`}
                    >
                      {step.title}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Ordered Items Table */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
          <h2 className="font-serif text-xl font-bold text-slate-900">Harvest Items</h2>

          <div className="divide-y divide-slate-100">
            {order.items?.map((item) => (
              <div
                key={item.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <h4 className="font-serif font-bold text-base text-slate-900">
                    {item.productName || "Product"}
                  </h4>
                  <p className="text-xs text-slate-500">
                    Quantity: {item.quantity}{" "}
                    {item.sellingUnit && <span>{formatUnit(item.sellingUnit)}</span>} ×{" "}
                    <span className="font-mono text-emerald-600 font-semibold">
                      {formatCurrency(item.unitPrice)}
                    </span>
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6">
                  <span className="font-mono font-bold text-emerald-600 text-base">
                    {formatCurrency(item.subtotal)}
                  </span>

                  {/* If order is delivered, allow reviewing item! */}
                  {isDelivered && (
                    <button
                      type="button"
                      onClick={() => handleOpenReview(item.id, item.productName || "Product")}
                      className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 text-amber-600 hover:text-amber-700"
                    >
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      Write Review
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pricing Breakdown */}
          <div className="pt-4 border-t border-slate-100 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Items Subtotal</span>
              <span className="font-mono font-semibold text-slate-900">
                {formatCurrency(order.totalAmount - (order.deliveryCharge || 50))}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Delivery Charge</span>
              <span className="font-mono font-semibold text-slate-900">
                {formatCurrency(order.deliveryCharge || 50)}
              </span>
            </div>
            <div className="flex justify-between text-base font-bold pt-2 border-t border-slate-100">
              <span className="text-slate-900">Total Amount</span>
              <span className="font-mono text-emerald-600 font-bold text-xl">
                {formatCurrency(order.totalAmount)}
              </span>
            </div>
          </div>
        </div>

        {/* Shipping Destination & OTP Alert */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Shipping Address */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 space-y-3 shadow-sm">
            <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-wider">
              <MapPin className="w-4 h-4 text-emerald-600" />
              Delivery Destination
            </div>
            {order.shippingAddress ? (
              <div className="text-xs space-y-1 text-slate-700">
                <p className="font-bold text-slate-900 text-sm">
                  {order.shippingAddress.addressLine}
                </p>
                <p>
                  {order.shippingAddress.city}, Côte d&apos;Ivoire (
                  {order.shippingAddress.postCode})
                </p>
                {order.shippingAddress.instruction && (
                  <p className="text-emerald-700 italic pt-1">
                    Note: {order.shippingAddress.instruction}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-400">Address information attached to delivery.</p>
            )}
          </div>

          {/* Security Notice */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 space-y-3 shadow-sm">
            <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Delivery Handover Verification
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              When the assigned transporter arrives at your location with the harvest, they will
              request your secure 6-digit OTP delivery confirmation code before completing the
              handover.
            </p>
          </div>
        </div>
      </main>

      {/* Review Modal */}
      {selectedReviewItem && (
        <ReviewModal
          isOpen={reviewModalOpen}
          onClose={() => {
            setReviewModalOpen(false);
            setSelectedReviewItem(null);
          }}
          orderItemId={selectedReviewItem.orderItemId}
          productName={selectedReviewItem.productName}
        />
      )}

      <Footer />
    </div>
  );
}
