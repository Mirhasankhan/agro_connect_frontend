"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { TReport } from "@/types";
import { formatDate } from "@/utils/formatters";

interface ReportViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: TReport | null;
  productName: string;
}

export default function ReportViewModal({
  isOpen,
  onClose,
  report,
  productName,
}: ReportViewModalProps) {
  if (!report) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-white border border-slate-200 text-slate-900 p-6 rounded-2xl shadow-xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="font-serif text-lg font-bold text-slate-900">
              Dispute Details
            </DialogTitle>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                report.status === "Pending"
                  ? "bg-amber-50 text-amber-700 border-amber-200"
                  : report.status === "Resolved"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-rose-50 text-rose-700 border-rose-200"
              }`}
            >
              {report.status === "Pending"
                ? "Under Review"
                : report.status === "Resolved"
                ? "Resolved (Refunded)"
                : "Claim Dismissed"}
            </span>
          </div>
          <DialogDescription className="text-slate-500 text-xs mt-1">
            Produce: <span className="font-semibold text-slate-800">{productName}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
              Your Reported Issue ({formatDate(report.createdAt)})
            </span>
            <p className="text-slate-800 leading-relaxed whitespace-pre-wrap">
              {report.reason}
            </p>
            {report.fileUrl && (
              <div className="pt-2">
                <a
                  href={report.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-700 underline font-semibold text-[11px] hover:text-emerald-800"
                >
                  View Attached Evidence Image ↗
                </a>
              </div>
            )}
          </div>

          {report.adminComment ? (
            <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1">
              <span className="text-[10px] font-bold text-emerald-800 block uppercase tracking-wider">
                Admin Resolution Note
              </span>
              <p className="text-slate-800 leading-relaxed">
                {report.adminComment}
              </p>
            </div>
          ) : (
            <p className="text-[11px] text-slate-400 italic">
              {report.status === "Pending"
                ? "Our support team is reviewing your report. Producer payout is held in escrow until resolution."
                : "No admin comments recorded."}
            </p>
          )}

          <div className="flex justify-end pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
