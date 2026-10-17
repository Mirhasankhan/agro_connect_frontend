"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "react-toastify";
import {
  useBuyerCancelOrderMutation,
  useBuyerCancelOrderItemMutation,
} from "@/redux/features/order/orderApi";
import { AlertCircle, AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";

interface CancelOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "order" | "item";
  orderId: string;
  orderItemId?: string;
  targetName: string;
  refundEstimate?: number;
  onSuccess?: () => void;
}

const COMMON_REASONS = [
  "Ordered by mistake or duplicate order",
  "Found a better deal / price elsewhere",
  "Delivery timeline is too long",
  "Changed delivery address or recipient",
  "Need to adjust order quantities",
  "Other personal reason",
];

export default function CancelOrderModal({
  isOpen,
  onClose,
  mode,
  orderId,
  orderItemId,
  targetName,
  refundEstimate,
  onSuccess,
}: CancelOrderModalProps) {
  const [buyerCancelOrder, { isLoading: isCancellingOrder }] = useBuyerCancelOrderMutation();
  const [buyerCancelOrderItem, { isLoading: isCancellingItem }] = useBuyerCancelOrderItemMutation();

  const [selectedReason, setSelectedReason] = useState(COMMON_REASONS[0]);
  const [customReason, setCustomReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const isLoading = isCancellingOrder || isCancellingItem;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const finalReason =
      selectedReason === "Other personal reason" && customReason.trim()
        ? `Other: ${customReason.trim()}`
        : selectedReason;

    if (!finalReason) {
      setError("Please select or specify a cancellation reason.");
      return;
    }

    try {
      if (mode === "order") {
        await buyerCancelOrder({
          orderId,
          reason: finalReason,
        }).unwrap();
        toast.success("Order cancelled successfully! Your refund has been initiated.");
      } else if (mode === "item" && orderItemId) {
        await buyerCancelOrderItem({
          orderItemId,
          reason: finalReason,
          orderId,
        }).unwrap();
        toast.success(`Item "${targetName}" cancelled successfully! Partial refund initiated.`);
      }

      onSuccess?.();
      onClose();
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || "Failed to process cancellation";
      setError(msg);
      toast.error(msg);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isLoading && onClose()}>
      <DialogContent className="sm:max-w-md bg-white border border-slate-200 shadow-xl rounded-2xl p-6">
        <DialogHeader className="space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mb-1">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <DialogTitle className="font-serif text-xl font-bold text-slate-900">
            Cancel {mode === "order" ? "Entire Order" : "Harvest Item"}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 leading-relaxed">
            You are requesting to cancel{" "}
            <span className="font-bold text-slate-800">{targetName}</span>. According to our{" "}
            <span className="text-emerald-700 font-semibold">Agricultural Cancellation Policy</span>,
            items can only be cancelled while still in pending harvest preparation.
          </DialogDescription>
        </DialogHeader>

        {refundEstimate !== undefined && refundEstimate > 0 && (
          <div className="my-2 p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="text-xs font-medium text-slate-700">Estimated Refund Amount:</span>
            </div>
            <span className="font-mono font-bold text-emerald-700 text-sm">
              {formatCurrency(refundEstimate)}
            </span>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              Reason for Cancellation <span className="text-rose-500">*</span>
            </label>
            <div className="space-y-1.5">
              {COMMON_REASONS.map((reason) => (
                <label
                  key={reason}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                    selectedReason === reason
                      ? "border-emerald-600 bg-emerald-50/40 text-slate-900 font-semibold"
                      : "border-slate-200 hover:border-slate-300 text-slate-600"
                  }`}
                >
                  <input
                    type="radio"
                    name="cancelReason"
                    value={reason}
                    checked={selectedReason === reason}
                    onChange={() => setSelectedReason(reason)}
                    className="accent-emerald-600 w-3.5 h-3.5"
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>
          </div>

          {selectedReason === "Other personal reason" && (
            <div className="space-y-1.5 animate-fadeIn">
              <label className="block text-xs font-semibold text-slate-700">
                Please specify your reason
              </label>
              <textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                rows={2}
                placeholder="Explain why you wish to cancel this item..."
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none"
              />
            </div>
          )}

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-500 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <span>
              Once confirmed, reserved stock will be returned to the farmer and your refund will be
              sent back to your original payment method via Stripe (typically 5-10 business days).
            </span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition-colors"
            >
              Keep Order
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-md shadow-rose-600/20 disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading ? "Processing..." : "Confirm Cancellation"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
