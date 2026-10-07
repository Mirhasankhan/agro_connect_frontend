"use client";

import React, { useState } from "react";
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
} from "lucide-react";
import { toast } from "react-toastify";
import {
  useMarkDeliveryStatusMutation,
  useSendDeliveryCompletionOtpMutation,
} from "@/redux/features/order/orderApi";
import { useGetDriverWisePaymentsQuery } from "@/redux/features/payment/paymentApi";
import DeliveryOtpModal from "@/components/driver/DeliveryOtpModal";
import { formatCurrency, formatUnit, formatDate } from "@/utils/formatters";
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

  const { data: paymentsData, isLoading } = useGetDriverWisePaymentsQuery();
  const [markDeliveryStatus, { isLoading: isUpdatingStatus }] = useMarkDeliveryStatusMutation();
  const [sendOtpMutation, { isLoading: isSendingOtp }] = useSendDeliveryCompletionOtpMutation();

  const [otpModalData, setOtpModalData] = useState<{
    deliveryId: string;
    orderReference?: string;
    customerName?: string;
  } | null>(null);

  // Derive delivery items from payment/order records or active assigned records
  const payments = paymentsData?.data?.payments || [];

  const handlePickUp = async (deliveryId: string) => {
    try {
      await markDeliveryStatus({
        deliveryId,
        status: "PickedUp",
      }).unwrap();
      toast.success("Delivery marked as Picked Up! Safe journey to the destination.");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update delivery status");
    }
  };

  const handleSendOtp = async (deliveryId: string) => {
    try {
      await sendOtpMutation(deliveryId).unwrap();
      toast.success("6-Digit OTP sent to customer via email & SMS!");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to send OTP code");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-forest-800 pb-5">
        <h1 className="font-serif text-2xl font-bold text-white">Assigned Deliveries</h1>
        <p className="text-xs text-white/60 mt-0.5">
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
                  ? "bg-emerald-500 text-white shadow-md shadow-emerald-950/60"
                  : "bg-forest-900/60 text-white/70 hover:text-white hover:bg-forest-800"
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
            className="w-full bg-forest-950 border border-forest-700 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-white/40 focus:outline-none focus:border-emerald-500"
          />
          <Search className="w-4 h-4 text-emerald-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Deliveries List */}
      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-forest-900/40 rounded-3xl border border-forest-800" />
          ))}
        </div>
      ) : payments.length > 0 ? (
        <div className="space-y-4">
          {payments.map((p) => {
            const deliveryId = p.id;
            const orderId = p.order?.orderId || p.id.slice(-6).toUpperCase();
            const isCompleted = p.isTransferred;
            const status = (isCompleted ? "Delivered" : "PickedUp") as DeliveryStatus;

            return (
              <div
                key={p.id}
                className="bg-[#071f11] border border-forest-700/60 hover:border-emerald-500/70 rounded-3xl p-6 transition-all shadow-xl space-y-4"
              >
                {/* Header row: Order # & Status Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-forest-800/80 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-mono font-bold text-white text-base">#{orderId}</span>
                      <span className="text-[11px] text-white/50 block">
                        Assigned on {p.createdAt ? formatDate(p.createdAt) : "Recently"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 border ${
                        status === "Delivered"
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                          : status === "PickedUp"
                          ? "bg-blue-500/20 text-blue-300 border-blue-500/40"
                          : "bg-amber-500/20 text-amber-300 border-amber-500/40"
                      }`}
                    >
                      {status === "Delivered" && <CheckCircle2 className="w-3.5 h-3.5" />}
                      {status === "PickedUp" && <Truck className="w-3.5 h-3.5" />}
                      {status === "Assigned" && <Clock className="w-3.5 h-3.5" />}
                      {status}
                    </span>

                    <span className="font-mono font-bold text-emerald-400 text-sm bg-forest-950 px-3 py-1 rounded-xl border border-forest-800">
                      Fee: {formatCurrency(p.amount || 50)}
                    </span>
                  </div>
                </div>

                {/* Cargo Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Destination */}
                  <div className="p-4 rounded-2xl bg-forest-950/60 border border-forest-800/80 space-y-2">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-bold uppercase tracking-wider text-[11px]">
                      <MapPin className="w-3.5 h-3.5" />
                      Destination & Delivery Note
                    </div>
                    <p className="font-bold text-white">Abidjan Urban Delivery</p>
                    <p className="text-white/60">
                      Delivery instructions: Hand over directly to recipient with OTP verification.
                    </p>
                  </div>

                  {/* Produce in Cargo */}
                  <div className="p-4 rounded-2xl bg-forest-950/60 border border-forest-800/80 space-y-2">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-bold uppercase tracking-wider text-[11px]">
                      <Package className="w-3.5 h-3.5" />
                      Produce Manifest
                    </div>
                    {p.order?.items && p.order.items.length > 0 ? (
                      <div className="space-y-1">
                        {p.order.items.map((it, idx) => (
                          <div key={idx} className="flex justify-between text-white/80">
                            <span>{it.productName || "Crop"}</span>
                            <span className="font-mono">
                              {it.quantity} {it.sellingUnit && formatUnit(it.sellingUnit)}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-white/60">Harvest crate handover attached to manifest.</p>
                    )}
                  </div>
                </div>

                {/* Action Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="text-[11px] text-white/50 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Requires 6-digit OTP confirmation to release delivery charge</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {status === "Assigned" && (
                      <button
                        type="button"
                        onClick={() => handlePickUp(deliveryId)}
                        disabled={isUpdatingStatus}
                        className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5 shadow-md shadow-emerald-950/60"
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
                          className="btn-secondary text-xs py-2 px-3.5 flex items-center gap-1.5 text-emerald-300 hover:text-white"
                        >
                          {isSendingOtp ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Send className="w-3.5 h-3.5 text-emerald-400" />
                          )}
                          Send OTP to Buyer
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setOtpModalData({
                              deliveryId,
                              orderReference: orderId,
                              customerName: "Buyer Recipient",
                            })
                          }
                          className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5 shadow-md shadow-emerald-950/60"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                          Verify 6-Digit OTP
                        </button>
                      </>
                    )}

                    {status === "Delivered" && (
                      <span className="text-xs text-emerald-400 font-bold flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/30">
                        <CheckCircle2 className="w-4 h-4" />
                        Handover Completed & Fee Released
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 px-4 bg-[#071f11] border border-forest-800 rounded-3xl max-w-lg mx-auto">
          <Truck className="w-16 h-16 text-emerald-400/60 mx-auto mb-4" />
          <h2 className="font-serif text-2xl font-bold text-white">No Deliveries Found</h2>
          <p className="text-xs text-white/60 mt-2">
            There are currently no deliveries matching your filter. Once regional hubs assign
            crates to your vehicle, they will be listed here.
          </p>
        </div>
      )}

      {/* OTP Verification Modal */}
      {otpModalData && (
        <DeliveryOtpModal
          isOpen={Boolean(otpModalData)}
          onClose={() => setOtpModalData(null)}
          deliveryId={otpModalData.deliveryId}
          orderReference={otpModalData.orderReference}
          customerName={otpModalData.customerName}
        />
      )}
    </div>
  );
}
