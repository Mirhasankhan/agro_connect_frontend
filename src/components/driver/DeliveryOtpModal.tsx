"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ShieldCheck, Loader2, KeyRound } from "lucide-react";
import { toast } from "react-toastify";
import { useVerifyDeliveryCompletionOtpMutation } from "@/redux/features/order/orderApi";

const otpSchema = z.object({
  otp: z
    .string()
    .length(4, "OTP must be exactly 4 digits")
    .regex(/^\d+$/, "OTP must contain only numbers"),
});

type OtpFormValues = z.infer<typeof otpSchema>;

interface DeliveryOtpModalProps {
  isOpen: boolean;
  onClose: () => void;
  deliveryId: string;
  orderReference?: string;
  customerName?: string;
}

export default function DeliveryOtpModal({
  isOpen,
  onClose,
  deliveryId,
  orderReference,
  customerName,
}: DeliveryOtpModalProps) {
  const [verifyOtpMutation, { isLoading }] = useVerifyDeliveryCompletionOtpMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
  });

  const onSubmit = async (values: OtpFormValues) => {
    try {
      await verifyOtpMutation({
        deliveryId,
        otp: values.otp,
      }).unwrap();

      toast.success("Delivery verified and completed! Escrow funds released.");
      reset();
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message || "Invalid OTP code. Please verify with buyer.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-white border border-slate-200 text-slate-900 p-6 rounded-2xl shadow-xl">
        <DialogHeader>
          <div className="flex items-center gap-2 text-emerald-600 mb-1">
            <KeyRound className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Handover Check</span>
          </div>
          <DialogTitle className="font-serif text-xl font-bold text-slate-900">
            Verify Buyer Delivery OTP
          </DialogTitle>
          <DialogDescription className="text-slate-500 text-xs">
            Ask the buyer <strong className="text-slate-900">{customerName || "Customer"}</strong> for
            their 4-digit confirmation code sent to their phone/email for order{" "}
            <span className="text-emerald-700 font-mono">#{orderReference || "Reference"}</span>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pt-3">
          <div>
            <label className="form-label text-slate-700">4-Digit Confirmation OTP</label>
            <input
              type="text"
              maxLength={4}
              placeholder="1234"
              {...register("otp")}
              className="form-input text-center font-mono text-2xl tracking-[0.3em] font-bold py-3 bg-slate-50 border-slate-200 text-slate-900"
            />
            {errors.otp && <p className="form-error text-center mt-1">{errors.otp.message}</p>}
          </div>

          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Verifying the OTP immediately marks the delivery complete and credits your delivery fee.</span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="btn-secondary text-xs py-2 px-4"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary text-xs py-2.5 px-6 flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Confirm & Complete Delivery"
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
