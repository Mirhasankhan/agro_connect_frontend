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
import { useSubmitReportMutation } from "@/redux/features/feedback/feedbackApi";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderItemId: string;
  productName: string;
  onSuccess?: () => void;
}

export default function ReportModal({
  isOpen,
  onClose,
  orderItemId,
  productName,
  onSuccess,
}: ReportModalProps) {
  const [submitReportMutation, { isLoading }] = useSubmitReportMutation();
  const [reason, setReason] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!reason.trim() || reason.trim().length < 10) {
      setError("Please describe the issue in at least 10 characters.");
      return;
    }

    try {
      await submitReportMutation({
        orderItemId,
        reason: reason.trim(),
        fileUrl: fileUrl.trim() || undefined,
      }).unwrap();

      toast.success("Report submitted successfully. Admin will review the dispute.");
      setReason("");
      setFileUrl("");
      onSuccess?.();
      onClose();
    } catch (err: any) {
      const msg = err?.data?.message || "Failed to submit report";
      setError(msg);
      toast.error(msg);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-white border border-slate-200 text-slate-900 p-6 rounded-2xl shadow-xl">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl font-bold text-slate-900">
            Report an Issue
          </DialogTitle>
          <DialogDescription className="text-slate-500 text-xs">
            Filing a claim for <span className="font-semibold text-slate-800">{productName}</span>. Claims must be submitted within 24 hours of delivery.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Issue Description / Reason <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Describe the issue with this item (damaged produce, wrong quantity, spoilage)..."
              className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Photo / Evidence Link (Optional)
            </label>
            <input
              type="url"
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
              placeholder="https://example.com/photo.jpg"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Provide an image URL showing the damaged or missing items to assist review.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all disabled:opacity-50"
            >
              {isLoading ? "Submitting..." : "Submit Report"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
