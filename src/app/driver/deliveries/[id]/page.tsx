"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Truck,
  MapPin,
  CheckCircle2,
  Clock,
  Send,
  KeyRound,
  ShieldCheck,
  Package,
  Loader2,
  AlertCircle,
  User,
  Info,
  Navigation,
  Square,
  Radio,
  Compass,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  useGetDriverDeliveryDetailsQuery,
  useMarkDeliveryStatusMutation,
  useSendDeliveryCompletionOtpMutation,
} from "@/redux/features/order/orderApi";
import DeliveryOtpModal from "@/components/driver/DeliveryOtpModal";
import { formatCurrency, formatUnit } from "@/utils/formatters";
import { useDriverGeoTracker } from "@/hooks/useDriverGeoTracker";
import LiveDeliveryMap from "@/components/tracking/LiveDeliveryMap";

export default function DriverDeliveryDetailsPage() {
  const params = useParams();
  const deliveryId = params?.id as string;

  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);

  const { data, isLoading, isError, refetch } = useGetDriverDeliveryDetailsQuery(
    deliveryId,
    { skip: !deliveryId }
  );

  const [markDeliveryStatus, { isLoading: isUpdatingStatus }] =
    useMarkDeliveryStatusMutation();
  const [sendOtpMutation, { isLoading: isSendingOtp }] =
    useSendDeliveryCompletionOtpMutation();

  const delivery = data?.data;
  const order = delivery?.order;

  // Real-time GPS navigation tracker
  const {
    isNavigating,
    trackingStatus,
    coords: currentCoords,
    startNavigation,
    stopNavigation,
  } = useDriverGeoTracker({
    deliveryId,
    initialLatitude: delivery?.latitude,
    initialLongitude: delivery?.longitude,
    initialIsTracking: delivery?.isTracking,
    deliveryStatus: delivery?.status,
  });

  const handlePickUp = async () => {
    try {
      await markDeliveryStatus({
        deliveryId,
        status: "PickedUp",
      }).unwrap();
      toast.success("Delivery marked as Picked Up! You are now in transit.");
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to mark as picked up");
    }
  };

  const handleSendOtp = async () => {
    try {
      await sendOtpMutation(deliveryId).unwrap();
      toast.success("4-Digit completion OTP sent to customer!");
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to send completion OTP");
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[500px] flex-col items-center justify-center gap-3">      
        <p className="text-xs text-slate-500">Loading delivery details...</p>
      </div>
    );
  }

  if (isError || !delivery || !order) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-8 text-center space-y-4">
        <AlertCircle className="mx-auto h-10 w-10 text-rose-500" />
        <div>
          <h2 className="text-lg font-bold text-rose-950">Delivery Not Found</h2>
          <p className="mt-1 text-xs text-rose-700">
            This delivery route could not be found or you do not have permission to view it.
          </p>
        </div>
        <Link
          href="/driver/deliveries"
          className="btn-secondary inline-flex items-center gap-2 text-xs"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Deliveries
        </Link>
      </div>
    );
  }

  const shipping = order.shippingAddress;
  const customer = order.customer;
  const items = order.items || [];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Navigation & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          <Link
            href="/driver/deliveries"
            className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            title="Back to Deliveries"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-serif text-2xl font-bold text-slate-900">
                Delivery #{order.orderId}
              </h1>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold border flex items-center gap-1 ${delivery.status === "Delivered"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : delivery.status === "PickedUp"
                      ? "bg-blue-50 text-blue-700 border-blue-200"
                      : "bg-amber-50 text-amber-700 border-amber-200"
                  }`}
              >
                {delivery.status === "Delivered" && <CheckCircle2 className="h-3 w-3" />}
                {delivery.status === "PickedUp" && <Truck className="h-3 w-3" />}
                {delivery.status === "Assigned" && <Clock className="h-3 w-3" />}
                {delivery.status === "PickedUp" ? "In Transit" : delivery.status}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Destination: <strong className="text-slate-700">{shipping?.city || "Local Delivery"}</strong> &bull; Total Value:{" "}
              <strong className="text-emerald-700 font-mono">{formatCurrency(order.totalAmount)}</strong>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Navigation Start/Stop Toggle */}
          {delivery.status !== "Delivered" && (
            <>
              {!isNavigating ? (
                <button
                  type="button"
                  onClick={startNavigation}
                  className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5 shadow-md shadow-emerald-700/20 bg-emerald-600 hover:bg-emerald-700"
                >
                  <Navigation className="h-3.5 w-3.5" />
                  Start Navigation
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopNavigation}
                  className="btn-secondary text-xs py-2 px-4 flex items-center gap-1.5 border-rose-300 text-rose-700 hover:bg-rose-50 shadow-sm"
                >
                  <Square className="h-3.5 w-3.5 fill-rose-600" />
                  Stop Navigation
                </button>
              )}

              {/* Live Tracking Status Badge */}
              <div
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold ${
                  isNavigating
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : trackingStatus === "Connecting"
                    ? "bg-sky-50 text-sky-800 border-sky-200"
                    : trackingStatus === "Connection Lost"
                    ? "bg-amber-50 text-amber-800 border-amber-200"
                    : "bg-slate-50 text-slate-600 border-slate-200"
                }`}
              >
                {isNavigating ? (
                  <>
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                    <span>GPS Live</span>
                  </>
                ) : trackingStatus === "Connecting" ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin text-sky-600" />
                    <span>Acquiring GPS...</span>
                  </>
                ) : trackingStatus === "Connection Lost" ? (
                  <>
                    <Radio className="h-3 w-3 text-amber-600 animate-pulse" />
                    <span>GPS Reconnecting</span>
                  </>
                ) : (
                  <>
                    <Compass className="h-3 w-3 text-slate-400" />
                    <span>Navigation Ready</span>
                  </>
                )}
              </div>
            </>
          )}

          {delivery.status === "Assigned" && (
            <button
              type="button"
              onClick={handlePickUp}
              disabled={isUpdatingStatus}
              className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5 shadow-sm"
            >
              {isUpdatingStatus ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Truck className="h-3.5 w-3.5" />
              )}
              Confirm Picked Up from Hub
            </button>
          )}

          {delivery.status === "PickedUp" && (
            <>
              {!delivery.otpHash ? (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={isSendingOtp}
                  className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5 shadow-sm"
                >
                  {isSendingOtp ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Send className="h-3.5 w-3.5" />
                  )}
                  Send Buyer OTP
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setIsOtpModalOpen(true)}
                    className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5 shadow-sm"
                  >
                    <KeyRound className="h-3.5 w-3.5" />
                    Verify OTP & Complete
                  </button>

                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={isSendingOtp}
                    className="btn-secondary text-xs py-2 px-3.5 flex items-center gap-1.5 text-slate-600 hover:text-emerald-700"
                    title="Resend OTP code to customer"
                  >
                    {isSendingOtp ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Send className="h-3.5 w-3.5" />
                    )}
                    Resend OTP
                  </button>
                </>
              )}
            </>
          )}

          {delivery.status === "Delivered" && (
            <span className="text-xs text-emerald-700 font-bold flex items-center gap-1.5 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200">
              <CheckCircle2 className="h-4 w-4" />
              Handover Verified & Completed
            </span>
          )}
        </div>
      </div>

      {/* Progress Journey Tracker */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h2 className="text-xs font-semibold  tracking-wider text-slate-500 mb-4">
          Transit Progress
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
          {/* Step 1 */}
          <div
            className={`p-4 rounded-xl border transition-all ${delivery.status === "Assigned" || delivery.status === "PickedUp" || delivery.status === "Delivered"
                ? "border-emerald-200 bg-emerald-50/50"
                : "border-slate-200 bg-slate-50"
              }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">
                1
              </div>
              <span className="font-semibold text-xs text-slate-900">Route Assigned</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Assigned to vehicle from regional logistics hub.
            </p>
          </div>

          {/* Step 2 */}
          <div
            className={`p-4 rounded-xl border transition-all ${delivery.status === "PickedUp" || delivery.status === "Delivered"
                ? "border-emerald-200 bg-emerald-50/50"
                : "border-slate-200 bg-slate-50/50"
              }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <div
                className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${delivery.status === "PickedUp" || delivery.status === "Delivered"
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-200 text-slate-600"
                  }`}
              >
                2
              </div>
              <span className="font-semibold text-xs text-slate-900">In Transit</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Produce crates picked up and en route to destination.
            </p>
          </div>

          {/* Step 3 */}
          <div
            className={`p-4 rounded-xl border transition-all ${delivery.status === "Delivered"
                ? "border-emerald-200 bg-emerald-50/50"
                : "border-slate-200 bg-slate-50/50"
              }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <div
                className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${delivery.status === "Delivered"
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-200 text-slate-600"
                  }`}
              >
                3
              </div>
              <span className="font-semibold text-xs text-slate-900">Handover Complete</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Buyer confirmed arrival with 4-digit security code.
            </p>
          </div>
        </div>
      </div>

      {/* Real-Time Live Navigation Map Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <Navigation className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif text-base font-bold text-slate-900">
                Live Route & Driver Navigation
              </h2>
              <p className="text-xs text-slate-500">
                Continuous real-time GPS telemetry from vehicle to customer delivery point.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isNavigating && currentCoords?.speed !== null && currentCoords?.speed !== undefined && (
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-slate-900 text-emerald-400">
                {(currentCoords.speed * 3.6).toFixed(0)} km/h
              </span>
            )}
            {currentCoords?.accuracy && (
              <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                ±{Math.round(currentCoords.accuracy)}m accuracy
              </span>
            )}
          </div>
        </div>

        <LiveDeliveryMap
          deliveryId={deliveryId}
          driver={{
            fullName: "You (Assigned Driver)",
            vehicleType: "Assigned Transport",
          }}
          shippingAddress={shipping}
          currentLatitude={currentCoords?.latitude ?? delivery.latitude}
          currentLongitude={currentCoords?.longitude ?? delivery.longitude}
          currentHeading={currentCoords?.heading ?? delivery.heading}
          currentSpeed={currentCoords?.speed ?? delivery.speed}
          isTracking={isNavigating || Boolean(delivery.isTracking)}
          status={delivery.status}
          height="400px"
          onRefresh={refetch}
        />
      </div>

      {/* 2 Column Details Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Customer & Delivery Address Card (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Recipient Information */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="font-serif text-base font-bold text-slate-900 flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-600" />
              Recipient Information
            </h2>

            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="relative w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm shrink-0 overflow-hidden border border-emerald-200">
                {customer?.profileImage ? (
                  <Image
                    src={customer.profileImage}
                    alt={customer.fullName || "Recipient"}
                    fill
                    className="object-cover"
                  />
                ) : (
                  customer?.fullName?.charAt(0).toUpperCase() || "B"
                )}
              </div>
              <div>
                <p className="font-bold text-slate-900 text-sm">
                  {customer?.fullName || "Buyer Customer"}
                </p>
                <span className="text-[11px] text-slate-500 block">Verified Buyer Account</span>
              </div>
            </div>

            {/* Destination Address */}
            <div className="space-y-3 pt-1">
              <div className="flex items-start gap-2.5 text-xs text-slate-700">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-900 block">Delivery Address</span>
                  <p className="text-slate-600 mt-0.5 leading-relaxed">
                    {shipping?.addressLine || "Address on file"}
                  </p>
                  <p className="text-slate-500 font-medium">
                    {shipping?.city} {shipping?.postCode ? `(${shipping.postCode})` : ""}
                  </p>
                </div>
              </div>

              {shipping?.instruction && (
                <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 space-y-1">
                  <span className="font-semibold flex items-center gap-1.5 text-amber-800">
                    <Info className="w-3.5 h-3.5" />
                    Special Driver Instructions:
                  </span>
                  <p className="italic text-[11px] pl-5">{shipping.instruction}</p>
                </div>
              )}
            </div>
          </div>

          {/* Security & Handover Note */}
          <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs space-y-2 shadow-sm">
            <h3 className="font-serif font-bold text-sm text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              OTP Handover Protocol
            </h3>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Upon arriving at the destination, tap <strong>Send Buyer OTP</strong>. The customer will
              receive a secure 4-digit code. Enter their code to finalize delivery and automatically
              release your driver trip payout.
            </p>
          </div>
        </div>

        {/* Right Column: Cargo Manifest & Produce Items (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="font-serif text-base font-bold text-slate-900 flex items-center gap-2">
                  <Package className="w-4 h-4 text-emerald-600" />
                  Cargo Produce Manifest
                </h2>
                <p className="text-xs text-slate-500">
                  Detailed inspection list of crops and crates in this shipment.
                </p>
              </div>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700 border border-slate-200">
                {items.length} item(s)
              </span>
            </div>

            {items.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500  tracking-wider text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Crop Produce</th>
                      <th className="py-2.5 px-3">Quantity</th>
                      <th className="py-2.5 px-3">Unit Price</th>
                      <th className="py-2.5 px-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {items.map((it, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80">
                        <td className="py-3 px-3 font-semibold text-slate-900">
                          {it.productName}
                        </td>
                        <td className="py-3 px-3 font-mono font-medium text-slate-700">
                          {it.quantity} {formatUnit(it.sellingUnit)}
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-600">
                          {formatCurrency(it.unitPrice)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-emerald-700">
                          {formatCurrency(it.subtotal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="border-t border-slate-200 font-bold bg-slate-50/50">
                    <tr>
                      <td colSpan={3} className="py-3 px-3 text-slate-700 text-xs text-right">
                        Total Order Cargo Value:
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-emerald-700 text-sm">
                        {formatCurrency(order.totalAmount)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-400">
                No individual produce item records attached to this shipment.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* OTP Modal */}
      {isOtpModalOpen && (
        <DeliveryOtpModal
          isOpen={isOtpModalOpen}
          onClose={() => {
            setIsOtpModalOpen(false);
            refetch();
          }}
          deliveryId={deliveryId}
          orderReference={order.orderId}
          customerName={customer?.fullName || "Buyer"}
        />
      )}
    </div>
  );
}
