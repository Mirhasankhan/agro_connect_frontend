"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Truck,
  MapPin,
  CheckCircle2,
  Clock,
  Send,
  KeyRound,
  ShieldCheck,
  Search,
  Package,
  Loader2,
  Eye,
  User,
  ArrowRight,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  useGetDriverWiseDeliveriesQuery,
  useMarkDeliveryStatusMutation,
  useSendDeliveryCompletionOtpMutation,
} from "@/redux/features/order/orderApi";
import { useGetProfileQuery } from "@/redux/features/auth/authApi";
import DeliveryOtpModal from "@/components/driver/DeliveryOtpModal";
import { formatCurrency } from "@/utils/formatters";
import { DeliveryStatus } from "@/types";

const FILTER_TABS: { label: string; value: string }[] = [
  { label: "All Deliveries", value: "ALL" },
  { label: "In Transit", value: "PickedUp" },
  { label: "Assigned", value: "Assigned" },
  { label: "Delivered", value: "Delivered" },
];

export default function DriverDeliveriesPage() {
  const [selectedFilter, setSelectedFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: profileData } = useGetProfileQuery();
  const verificationStatus = profileData?.data?.driverProfile?.verificationStatus;
  const isAccepted = verificationStatus === "Accepted";
  const isRejected = verificationStatus === "Rejected";

  const {
    data: deliveriesData,
    isLoading,
    refetch,
  } = useGetDriverWiseDeliveriesQuery();
  const [markDeliveryStatus, { isLoading: isUpdatingStatus }] =
    useMarkDeliveryStatusMutation();
  const [sendOtpMutation, { isLoading: isSendingOtp }] =
    useSendDeliveryCompletionOtpMutation();

  const [otpModalData, setOtpModalData] = useState<{
    deliveryId: string;
    orderReference?: string;
    customerName?: string;
  } | null>(null);

  const deliveries = deliveriesData?.data || [];

  const filteredDeliveries = deliveries.filter((item) => {
    if (selectedFilter !== "ALL" && item.status !== selectedFilter) return false;
    if (!searchTerm.trim()) return true;

    const term = searchTerm.toLowerCase();
    const orderId = item.order?.orderId?.toLowerCase() || "";
    const customer = item.order?.customer?.fullName?.toLowerCase() || "";
    const city = item.order?.shippingAddress?.city?.toLowerCase() || "";

    return orderId.includes(term) || customer.includes(term) || city.includes(term);
  });

  const handlePickUp = async (deliveryId: string) => {
    try {
      await markDeliveryStatus({
        deliveryId,
        status: "PickedUp",
      }).unwrap();
      toast.success("Delivery marked as Picked Up! Safe journey to the destination.");
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update delivery status");
    }
  };

  const handleSendOtp = async (deliveryId: string) => {
    try {
      await sendOtpMutation(deliveryId).unwrap();
      toast.success("4-Digit OTP sent to customer via email!");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to send OTP code");
    }
  };

  return (
    <div className="space-y-6">
      {/* Verification Status Warning for Pending / Rejected */}
      {!isAccepted && (
        <div
          className={`flex items-start gap-3 rounded-2xl border p-4 text-xs ${
            isRejected
              ? "border-rose-200 bg-rose-50 text-rose-800"
              : "border-amber-200 bg-amber-50 text-amber-800"
          }`}
        >
          {isRejected ? (
            <Clock className="h-5 w-5 shrink-0 text-rose-600" />
          ) : (
            <Clock className="h-5 w-5 shrink-0 text-amber-600" />
          )}
          <div className="space-y-0.5">
            <p className="font-semibold text-sm">
              {isRejected
                ? "Driver Verification Rejected"
                : "Driver License & Vehicle Verification Pending"}
            </p>
            <p>
              {isRejected
                ? "Your driver verification was not approved. You cannot fulfill deliveries until approved."
                : "Your driver documents are being reviewed by dispatchers. Active deliveries are paused until your account is Accepted."}
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <h1 className="font-serif text-2xl font-bold text-slate-900">
          Assigned Deliveries
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage your active transit routes, confirm hub departures, and complete handovers via
          buyer OTP.
        </p>
      </div>

      {/* Controls Bar: Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setSelectedFilter(tab.value)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedFilter === tab.value
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:max-w-xs">
          <input
            type="text"
            placeholder="Search by order or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
          />
          <Search className="w-4 h-4 text-emerald-600 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Deliveries List */}
      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-slate-100 rounded-2xl border border-slate-200" />
          ))}
        </div>
      ) : filteredDeliveries.length > 0 ? (
        <div className="space-y-4">
          {filteredDeliveries.map((item) => {
            const deliveryId = item.id;
            const orderId = item.order?.orderId || item.id.slice(-6).toUpperCase();
            const status = item.status;
            const city = item.order?.shippingAddress?.city || "Local Delivery";
            const customerName = item.order?.customer?.fullName || "Buyer Customer";
            const itemsCount = item.order?._count?.items ?? 0;

            return (
              <div
                key={item.id}
                className="bg-white border border-slate-200 hover:border-emerald-500/70 rounded-2xl p-6 transition-all shadow-sm space-y-4"
              >
                {/* Header row: Order # & Status Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <Link
                        href={`/driver/deliveries/${deliveryId}`}
                        className="font-mono font-bold text-slate-900 text-base hover:text-emerald-700 transition-colors"
                      >
                        #{orderId}
                      </Link>
                      <span className="text-[11px] text-slate-400 block">
                        Assigned Cargo Delivery
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-wrap">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 border ${
                        status === "Delivered"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : status === "PickedUp"
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}
                    >
                      {status === "Delivered" && <CheckCircle2 className="w-3.5 h-3.5" />}
                      {status === "PickedUp" && <Truck className="w-3.5 h-3.5" />}
                      {status === "Assigned" && <Clock className="w-3.5 h-3.5" />}
                      {status === "PickedUp" ? "In Transit" : status}
                    </span>

                    <span className="font-mono font-bold text-emerald-700 text-sm bg-slate-50 px-3 py-1 rounded-xl border border-slate-200">
                      Order: {formatCurrency(item.order.totalAmount)}
                    </span>
                  </div>
                </div>

                {/* Cargo Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  {/* Destination */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-emerald-700 font-bold uppercase tracking-wider text-[10px]">
                      <MapPin className="w-3.5 h-3.5" />
                      Destination City
                    </div>
                    <p className="font-bold text-slate-900 text-sm">{city}</p>
                    <p className="text-slate-500 text-[11px]">Direct handover to recipient</p>
                  </div>

                  {/* Customer */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-emerald-700 font-bold uppercase tracking-wider text-[10px]">
                      <User className="w-3.5 h-3.5" />
                      Recipient Buyer
                    </div>
                    <p className="font-bold text-slate-900 text-sm">{customerName}</p>
                    <p className="text-slate-500 text-[11px]">Requires OTP verification</p>
                  </div>

                  {/* Cargo Crates */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-emerald-700 font-bold uppercase tracking-wider text-[10px]">
                      <Package className="w-3.5 h-3.5" />
                      Produce Cargo
                    </div>
                    <p className="font-mono font-bold text-slate-900 text-sm">
                      {itemsCount} Produce Item{itemsCount !== 1 ? "s" : ""}
                    </p>
                    <p className="text-slate-500 text-[11px]">Inspect produce before pickup</p>
                  </div>
                </div>

                {/* Action Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Requires 4-digit buyer OTP confirmation upon delivery</span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <Link
                      href={`/driver/deliveries/${deliveryId}`}
                      className="btn-secondary text-xs py-2 px-3.5 flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View Details
                    </Link>

                    {status === "Assigned" && (
                      <button
                        type="button"
                        onClick={() => handlePickUp(deliveryId)}
                        disabled={isUpdatingStatus}
                        className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5 shadow-sm"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        Confirm Picked Up
                      </button>
                    )}

                    {status === "PickedUp" && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleSendOtp(deliveryId)}
                          disabled={isSendingOtp}
                          className="btn-secondary text-xs py-2 px-3.5 flex items-center gap-1.5 text-emerald-700 hover:text-emerald-800"
                        >
                          {isSendingOtp ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Send className="w-3.5 h-3.5 text-emerald-600" />
                          )}
                          Send Buyer OTP
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setOtpModalData({
                              deliveryId,
                              orderReference: orderId,
                              customerName,
                            })
                          }
                          className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5 shadow-sm"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                          Verify OTP
                        </button>
                      </>
                    )}

                    {status === "Delivered" && (
                      <span className="text-xs text-emerald-700 font-bold flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                        <CheckCircle2 className="w-4 h-4" />
                        Handover Completed
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 px-4 bg-white border border-slate-200 rounded-2xl max-w-lg mx-auto shadow-sm">
          <Truck className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="font-serif text-2xl font-bold text-slate-900">
            No Deliveries Found
          </h2>
          <p className="text-xs text-slate-500 mt-2">
            There are currently no deliveries matching your filter. Once regional hubs assign
            crates to your vehicle, they will be listed here.
          </p>
        </div>
      )}

      {/* OTP Verification Modal */}
      {otpModalData && (
        <DeliveryOtpModal
          isOpen={Boolean(otpModalData)}
          onClose={() => {
            setOtpModalData(null);
            refetch();
          }}
          deliveryId={otpModalData.deliveryId}
          orderReference={otpModalData.orderReference}
          customerName={otpModalData.customerName}
        />
      )}
    </div>
  );
}
