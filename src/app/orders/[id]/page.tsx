"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  Star,
  AlertCircle,
  Truck,
  MessageSquare,
  Phone,
  Clock,
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

  const { data, isLoading, error, refetch } = useGetOrderDetailsQuery(orderId, {
    skip: !orderId || !isAuthenticated,
  });

  const order = data?.data;

  // Review modal state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedReviewItem, setSelectedReviewItem] = useState<{
    orderItemId: string;
    productName: string;
  } | null>(null);

  const handleOpenReview = (orderItemId: string, productName: string, isReviewed?: boolean) => {
    if (isReviewed) return;
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

  const activeDelivery =
    order.deliveries && order.deliveries.length > 0
      ? order.deliveries[order.deliveries.length - 1]
      : null;
  const driver = activeDelivery?.driver;
  const isDriverAssigned = Boolean(driver?.id);

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
      completed:
        ["Active", "Shipped", "Delivered"].includes(order.status) ||
        Boolean(activeDelivery),
    },
    {
      title: "In Transit",
      desc: "Driver is delivering",
      completed:
        ["Shipped", "Delivered"].includes(order.status) ||
        activeDelivery?.status === "PickedUp" ||
        activeDelivery?.status === "Delivered",
    },
    {
      title: "Delivered",
      desc: "Confirmed via OTP",
      completed:
        order.status === "Delivered" || activeDelivery?.status === "Delivered",
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

        {/* Logistics & Assigned Driver Information */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-slate-900">
                  Logistics & Transport
                </h3>
                <p className="text-xs text-slate-500">
                  {isDriverAssigned
                    ? "Your harvest order is assigned to a certified transport driver"
                    : "Produce delivery coordination and driver assignment"}
                </p>
              </div>
            </div>

            {isDriverAssigned ? (
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border self-start sm:self-auto ${
                  activeDelivery?.status === "Delivered"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : activeDelivery?.status === "PickedUp"
                    ? "bg-blue-50 text-blue-700 border-blue-200"
                    : "bg-amber-50 text-amber-700 border-amber-200"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    activeDelivery?.status === "Delivered"
                      ? "bg-emerald-500"
                      : activeDelivery?.status === "PickedUp"
                      ? "bg-blue-500 animate-pulse"
                      : "bg-amber-500"
                  }`}
                />
                Status: {activeDelivery?.status === "PickedUp" ? "In Transit" : activeDelivery?.status || "Assigned"}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200 self-start sm:self-auto">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                Awaiting Driver Assignment
              </span>
            )}
          </div>

          {isDriverAssigned && driver ? (
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-50/70 border border-slate-200/80 rounded-2xl p-5">
              {/* Driver Identity & Vehicle Info */}
              <div className="flex items-center gap-4">
                <div className="relative w-14 h-14 rounded-full bg-emerald-100 border-2 border-emerald-300 overflow-hidden shrink-0 flex items-center justify-center font-bold text-base text-emerald-800 shadow-xs">
                  {driver.profileImage ? (
                    <Image
                      src={driver.profileImage}
                      alt={driver.fullName || "Driver"}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  ) : (
                    <span>{driver.fullName?.charAt(0).toUpperCase() || "D"}</span>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-base text-slate-900 leading-tight">
                      {driver.fullName}
                    </h4>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Driver
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
                    {driver.driverProfile?.vehicleType && (
                      <span className="inline-flex items-center gap-1 font-medium">
                        <Truck className="w-3.5 h-3.5 text-slate-400" />
                        {driver.driverProfile.vehicleType}
                      </span>
                    )}
                    {driver.driverProfile?.registrationNumber && (
                      <span className="font-mono text-[11px] font-semibold bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700">
                        {driver.driverProfile.registrationNumber}
                      </span>
                    )}
                  </div>

                  {driver.phoneNumber && (
                    <p className="text-xs text-slate-500 flex items-center gap-1.5 pt-0.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{driver.phoneNumber}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Actions: Chat & Call */}
              <div className="flex flex-wrap items-center gap-3 self-stretch sm:self-auto justify-end">
                {driver.phoneNumber && (
                  <a
                    href={`tel:${driver.phoneNumber}`}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors shadow-xs"
                  >
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    <span>Call Driver</span>
                  </a>
                )}

                <Link
                  href={`/messages?userId=${driver.id}&userName=${encodeURIComponent(
                    driver.fullName
                  )}&userRole=DRIVER`}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Chat with Driver</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-semibold text-slate-800">
                    No driver assigned to this order yet
                  </p>
                  <p className="text-slate-500">
                    Once the producer dispatches crates to the hub, a certified logistics driver will be assigned. Direct messaging will unlock automatically.
                  </p>
                </div>
              </div>

              <button
                type="button"
                disabled
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-200 text-slate-400 text-xs font-semibold cursor-not-allowed flex items-center justify-center gap-2 shrink-0"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Chat with Driver</span>
              </button>
            </div>
          )}
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

                  {/* If order is delivered, allow reviewing item or show Reviewed status */}
                  {isDelivered && (
                    <>
                      {item.isReviewed ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-xl shadow-xs">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Reviewed
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            handleOpenReview(item.id, item.productName || "Product", item.isReviewed)
                          }
                          className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 text-amber-600 hover:text-amber-700 hover:border-amber-300"
                        >
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          Write Review
                        </button>
                      )}
                    </>
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
          onSuccess={() => {
            refetch();
          }}
          orderItemId={selectedReviewItem.orderItemId}
          productName={selectedReviewItem.productName}
        />
      )}

      <Footer />
    </div>
  );
}
