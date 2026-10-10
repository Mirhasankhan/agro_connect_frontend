"use client";

import React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  CheckCircle2,
  Clock,
  Truck,
  PackageCheck,
  Star,
  MessageSquare,
  AlertCircle,
  User,
  Car,
  ShieldCheck,
  ShoppingBag,
  Boxes,
  FileText,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  useGetOrderItemDetailsForProducerQuery,
  useMarkOrderItemSentToHubMutation,
} from "@/redux/features/order/orderApi";
import { formatCurrency, formatDate, formatUnit } from "@/utils/formatters";

export default function ProducerOrderItemDetailsPage() {
  const params = useParams();
  const orderItemId = params?.id as string;

  const { data, isLoading, error } = useGetOrderItemDetailsForProducerQuery(orderItemId, {
    skip: !orderItemId,
  });

  const [markSentToHub, { isLoading: isMarkingHub }] = useMarkOrderItemSentToHubMutation();

  const item = data?.data;

  const handleMarkSentToHub = async () => {
    if (!item?.id) return;
    try {
      await markSentToHub(item.id).unwrap();
      toast.success(`${item.productName || "Product"} marked as Sent to Hub! Logistics notified.`);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to mark item as sent to hub");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-6 w-36 bg-slate-200 rounded-lg" />
        <div className="h-28 bg-white border border-slate-200 rounded-2xl p-6" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-white border border-slate-200 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-64 bg-white border border-slate-200 rounded-2xl" />
            <div className="h-48 bg-white border border-slate-200 rounded-2xl" />
          </div>
          <div className="space-y-6">
            <div className="h-48 bg-white border border-slate-200 rounded-2xl" />
            <div className="h-40 bg-white border border-slate-200 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="text-center py-16 px-4 bg-white border border-slate-200 rounded-2xl">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="font-serif text-xl font-bold text-slate-900">Order Item Not Found</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-6">
          The requested harvest order item could not be retrieved, or you do not have permission to view it.
        </p>
        <Link
          href="/producer/orders"
          className="btn-primary text-xs py-2 px-5 inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Orders
        </Link>
      </div>
    );
  }

  const latestDelivery =
    item.order?.deliveries && item.order.deliveries.length > 0
      ? item.order.deliveries[item.order.deliveries.length - 1]
      : null;
  const driver = latestDelivery?.driver;
  const driverProfile = driver?.driverProfile;

  const imageUrl =
    item.product?.imageUrls?.[0] ||
    "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80";

  // Timeline stage calculation
  const isPending = item.status === "Pending";
  const isSentToHub = item.status === "SentToHub" || item.status === "Delivered";
  const isDriverAssigned = Boolean(driver?.fullName);
  const isDelivered = item.status === "Delivered";

  return (
    <div className="space-y-6">
      {/* Back Navigation Bar */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/producer/orders"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-emerald-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Order Fulfillment</span>
        </Link>
        <div className="text-[11px] font-mono text-slate-400">
          Order Item ID: <span className="text-slate-700 font-semibold">{item.id}</span>
        </div>
      </div>

      {/* Hero Header Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-2.5 mb-2">
            <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
              Order #{item.order?.orderId || item.id.slice(-6).toUpperCase()}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 ${
                item.status === "Pending"
                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                  : item.status === "SentToHub"
                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                  : item.status === "Delivered"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-rose-50 text-rose-700 border border-rose-200"
              }`}
            >
              {item.status === "Pending" && <Clock className="w-3.5 h-3.5" />}
              {item.status === "SentToHub" && <Truck className="w-3.5 h-3.5" />}
              {item.status === "Delivered" && <CheckCircle2 className="w-3.5 h-3.5" />}
              {item.status}
            </span>
          </div>
          <h1 className="font-serif text-2xl font-bold text-slate-900">
            {item.productName || "Harvest Produce"}
          </h1>
          <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            Placed on {item.createdAt ? formatDate(item.createdAt) : "Recent"}
          </p>
        </div>

        {/* Action Button */}
        {item.status === "Pending" && (
          <button
            type="button"
            onClick={handleMarkSentToHub}
            disabled={isMarkingHub}
            className="btn-primary text-xs py-2.5 px-5 inline-flex items-center gap-2 shadow-sm whitespace-nowrap self-stretch md:self-auto justify-center"
          >
            <PackageCheck className="w-4 h-4" />
            <span>Mark Sent to Hub</span>
          </button>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Quantity */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
            <Boxes className="w-3.5 h-3.5 text-emerald-600" />
            <span>Order Quantity</span>
          </div>
          <p className="font-mono text-lg font-bold text-slate-900">
            {item.quantity} {item.sellingUnit && formatUnit(item.sellingUnit)}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Produce Units</p>
        </div>

        {/* Unit Price */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
            <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" />
            <span>Unit Price</span>
          </div>
          <p className="font-mono text-lg font-bold text-slate-900">
            {formatCurrency(item.unitPrice)}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Per {item.sellingUnit ? formatUnit(item.sellingUnit) : "unit"}
          </p>
        </div>

        {/* Total Earning */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Producer Net Amount</span>
          </div>
          <p className="font-mono text-lg font-bold text-emerald-700">
            {formatCurrency(item.subtotal)}
          </p>
          <p className="text-[11px] text-emerald-600 font-medium mt-0.5">Protected by Escrow</p>
        </div>

        {/* Logistics Stage */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
            <Truck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Fulfillment Stage</span>
          </div>
          <p className="text-sm font-bold text-slate-900 truncate">
            {item.status === "Delivered"
              ? "Completed"
              : item.status === "SentToHub"
              ? "In Logistics Hub"
              : "Dispatch Pending"}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {driver?.fullName ? `Driver: ${driver.fullName}` : "Awaiting Driver Pickup"}
          </p>
        </div>
      </div>

      {/* Main Grid: Left Detailed Cards + Right Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Produce & Harvest Details Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
            <h2 className="font-serif text-lg font-bold text-slate-900 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-600" />
              <span>Harvest Produce Information</span>
            </h2>

            <div className="flex flex-col sm:flex-row items-start gap-5">
              <div className="relative w-full sm:w-36 h-36 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                <Image
                  src={imageUrl}
                  alt={item.productName || "Produce"}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="flex-1 space-y-3">
                <div>
                  <h3 className="font-serif text-xl font-bold text-slate-900">
                    {item.productName}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Selling Unit:{" "}
                    <span className="font-semibold text-slate-700">
                      {item.sellingUnit ? formatUnit(item.sellingUnit) : "Standard"}
                    </span>
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 grid grid-cols-3 gap-2 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">
                      Quantity
                    </span>
                    <span className="font-mono font-bold text-slate-800 text-sm">
                      {item.quantity} {item.sellingUnit && formatUnit(item.sellingUnit)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">
                      Unit Rate
                    </span>
                    <span className="font-mono font-bold text-slate-800 text-sm">
                      {formatCurrency(item.unitPrice)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">
                      Gross Total
                    </span>
                    <span className="font-mono font-bold text-emerald-700 text-sm">
                      {formatCurrency(item.subtotal)}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 italic">
                  * Pricing calculation based on verified harvest weights and selected pricing tiers.
                </p>
              </div>
            </div>
          </div>

          {/* Fulfillment & Delivery Logistics Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
            <h2 className="font-serif text-lg font-bold text-slate-900 flex items-center gap-2">
              <Truck className="w-5 h-5 text-emerald-600" />
              <span>Fulfillment & Logistics Tracking</span>
            </h2>

            {/* Stepper Progress */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Step 1 */}
              <div className="p-3 rounded-xl border bg-emerald-50 border-emerald-200 text-emerald-800">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold">1. Order Placed</span>
                </div>
                <p className="text-[10px] text-emerald-700">Buyer confirmed</p>
              </div>

              {/* Step 2 */}
              <div
                className={`p-3 rounded-xl border ${
                  isSentToHub
                    ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                    : isPending
                    ? "bg-amber-50 border-amber-200 text-amber-800"
                    : "bg-slate-50 border-slate-200 text-slate-400"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {isSentToHub ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Clock className="w-4 h-4 text-amber-600" />
                  )}
                  <span className="text-xs font-bold">2. Sent to Hub</span>
                </div>
                <p className="text-[10px]">
                  {isSentToHub ? "Handed over to hub" : "Awaiting dispatch"}
                </p>
              </div>

              {/* Step 3 */}
              <div
                className={`p-3 rounded-xl border ${
                  isDelivered || latestDelivery?.status === "PickedUp"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                    : isDriverAssigned
                    ? "bg-blue-50 border-blue-200 text-blue-800"
                    : "bg-slate-50 border-slate-200 text-slate-400"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {isDelivered || latestDelivery?.status === "PickedUp" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : isDriverAssigned ? (
                    <Truck className="w-4 h-4 text-blue-600" />
                  ) : (
                    <Clock className="w-4 h-4 text-slate-400" />
                  )}
                  <span className="text-xs font-bold">3. Driver Assigned</span>
                </div>
                <p className="text-[10px]">
                  {isDriverAssigned ? "Driver en route" : "Hub dispatching"}
                </p>
              </div>

              {/* Step 4 */}
              <div
                className={`p-3 rounded-xl border ${
                  isDelivered
                    ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                    : "bg-slate-50 border-slate-200 text-slate-400"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {isDelivered ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Clock className="w-4 h-4 text-slate-400" />
                  )}
                  <span className="text-xs font-bold">4. Delivered</span>
                </div>
                <p className="text-[10px]">
                  {isDelivered ? "Buyer received" : "Pending completion"}
                </p>
              </div>
            </div>

            {/* Driver Details Card (if driver assigned) */}
            {driver ? (
              <div className="border border-slate-200 bg-slate-50/60 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Assigned Delivery Logistics Driver
                  </span>
                  {latestDelivery?.status && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                      {latestDelivery.status}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative w-11 h-11 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm shrink-0 overflow-hidden border border-emerald-200">
                    {driver.profileImage ? (
                      <Image
                        src={driver.profileImage}
                        alt={driver.fullName || "Driver"}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      driver.fullName?.charAt(0).toUpperCase() || "D"
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{driver.fullName}</h4>
                    {driver.address && (
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {driver.address}
                      </p>
                    )}
                  </div>
                </div>

                {driverProfile && (
                  <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center gap-3 text-xs text-slate-600">
                    <span className="inline-flex items-center gap-1.5 bg-white border border-slate-200 px-2.5 py-1 rounded-lg">
                      <Car className="w-3.5 h-3.5 text-slate-500" />
                      Vehicle: <strong className="text-slate-800">{driverProfile.vehicleType}</strong>
                    </span>
                    {driverProfile.registrationNumber && (
                      <span className="inline-flex items-center gap-1.5 bg-white border border-slate-200 px-2.5 py-1 rounded-lg font-mono">
                        Reg: <strong className="text-slate-800">{driverProfile.registrationNumber}</strong>
                      </span>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="border border-slate-200 border-dashed rounded-xl p-4 text-xs text-slate-500 bg-slate-50 flex items-center gap-3">
                <Truck className="w-5 h-5 text-slate-400 shrink-0" />
                <div>
                  <p className="font-semibold text-slate-700">Awaiting Logistics Hub Driver Assignment</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Once you mark this harvest order as &ldquo;Sent to Hub&rdquo;, our hub dispatch team assigns the nearest verified driver for final delivery.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Customer Feedback & Review Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="font-serif text-lg font-bold text-slate-900 flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500" />
              <span>Buyer Review & Feedback</span>
            </h2>

            {item.review ? (
              <div className="bg-amber-50/40 border border-amber-200 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= (item.review?.rating || 0)
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-300"
                        }`}
                      />
                    ))}
                    <span className="text-xs font-bold text-amber-800 ml-1.5">
                      {item.review.rating} / 5
                    </span>
                  </div>
                  {item.review.createdAt && (
                    <span className="text-[10px] text-slate-400">
                      {formatDate(item.review.createdAt)}
                    </span>
                  )}
                </div>
                {item.review.comment ? (
                  <p className="text-xs text-slate-700 italic mt-2">
                    &ldquo;{item.review.comment}&rdquo;
                  </p>
                ) : (
                  <p className="text-xs text-slate-400 italic">No written comment provided.</p>
                )}
              </div>
            ) : (
              <div className="p-4 border border-slate-200 border-dashed rounded-xl text-center text-xs text-slate-400">
                <Star className="w-6 h-6 text-slate-300 mx-auto mb-1.5" />
                <p className="font-semibold text-slate-600">No Review Submitted Yet</p>
                <p className="text-[11px] mt-0.5">
                  The buyer has not reviewed this order item yet. Reviews are unlocked once harvest crates are delivered.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar (1 Col) */}
        <div className="space-y-6">
          {/* Customer Information Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="font-serif text-base font-bold text-slate-900 flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-600" />
              <span>Buyer Information</span>
            </h2>

            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-base shrink-0 overflow-hidden border border-emerald-200">
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
              <div className="min-w-0">
                <h3 className="font-bold text-slate-900 text-sm truncate">
                  {item.order?.customer?.fullName || "Buyer Customer"}
                </h3>
                <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md inline-block mt-0.5">
                  Verified Buyer
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
              {(item.order?.customer?.city || item.order?.customer?.address) && (
                <div className="flex items-start gap-2 text-slate-600">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-800 block">Delivery Location</span>
                    <span className="text-slate-500">
                      {[item.order.customer.city, item.order.customer.address]
                        .filter(Boolean)
                        .join(", ")}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/producer/messages"
              className="w-full mt-2 btn-secondary text-xs py-2 px-3 inline-flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Contact Buyer via Chat</span>
            </Link>
          </div>

          {/* Order Details & Summary Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="font-serif text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>Order Summary</span>
            </h2>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>Order Reference:</span>
                <span className="font-mono font-bold text-slate-900">
                  #{item.order?.orderId || item.id.slice(-6).toUpperCase()}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Order Item ID:</span>
                <span className="font-mono text-[11px] text-slate-500 truncate max-w-[130px]" title={item.id}>
                  {item.id}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Placed Date:</span>
                <span className="font-medium text-slate-800">
                  {item.createdAt ? formatDate(item.createdAt) : "Recent"}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Fulfillment Status:</span>
                <span className="font-semibold text-slate-800">{item.status}</span>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">Producer Subtotal:</span>
                <span className="font-mono font-bold text-emerald-700 text-base">
                  {formatCurrency(item.subtotal)}
                </span>
              </div>
            </div>

            <div className="p-3 bg-emerald-50/70 border border-emerald-200/60 rounded-xl flex items-start gap-2.5 text-[11px] text-emerald-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Guaranteed Payout</p>
                <p className="text-emerald-700/80 mt-0.5">
                  Funds for this order are held in escrow and released directly to your Producer Payout Balance once delivered.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
