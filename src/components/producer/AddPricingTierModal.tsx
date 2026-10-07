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
import { Loader2, TrendingDown, Sparkles } from "lucide-react";
import { toast } from "react-toastify";
import { useAddPricingTierMutation } from "@/redux/features/product/productApi";
import { SellingUnit } from "@/types";
import { formatCurrency, formatUnit } from "@/utils/formatters";

interface AddPricingTierModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  basePrice: number;
  sellingUnit?: SellingUnit;
}

export default function AddPricingTierModal({
  isOpen,
  onClose,
  productId,
  productName,
  basePrice,
  sellingUnit,
}: AddPricingTierModalProps) {
  const [addTierMutation, { isLoading }] = useAddPricingTierMutation();

  const tierSchema = z.object({
    quantity: z.string().min(1, "Threshold quantity is required").refine(
      (val) => Number(val) > 1,
      "Bulk quantity must be greater than 1"
    ),
    pricePerUnit: z.string().min(1, "Discounted unit price is required").refine(
      (val) => Number(val) > 0 && Number(val) < basePrice,
      `Discounted price must be greater than 0 and less than standard price (${formatCurrency(basePrice)})`
    ),
  });

  type TierFormValues = z.infer<typeof tierSchema>;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<TierFormValues>({
    resolver: zodResolver(tierSchema),
  });

  const enteredQty = watch("quantity");
  const enteredPrice = watch("pricePerUnit");

  const discountPercent =
    enteredPrice && !isNaN(Number(enteredPrice)) && Number(enteredPrice) < basePrice
      ? Math.round(((basePrice - Number(enteredPrice)) / basePrice) * 100)
      : 0;

  const onSubmit = async (values: TierFormValues) => {
    try {
      await addTierMutation({
        productId,
        quantity: Number(values.quantity),
        pricePerUnit: Number(values.pricePerUnit),
      }).unwrap();

      toast.success("Bulk pricing tier added successfully!");
      reset();
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to add pricing tier");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-[#0a2315] border-forest-700 text-white p-6 rounded-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2 text-amber-400 mb-1">
            <TrendingDown className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Bulk Incentive</span>
          </div>
          <DialogTitle className="font-serif text-xl font-bold text-white">
            Add Bulk Pricing Tier
          </DialogTitle>
          <DialogDescription className="text-white/60 text-xs">
            Set volume discounts for <span className="text-emerald-400 font-semibold">{productName}</span>. Standard rate:{" "}
            <span className="text-emerald-400 font-bold font-mono">
              {formatCurrency(basePrice)} / {formatUnit(sellingUnit)}
            </span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          {/* Threshold Quantity */}
          <div>
            <label className="form-label text-white/80">
              Minimum Quantity Threshold ({formatUnit(sellingUnit)})
            </label>
            <input
              type="number"
              placeholder="e.g. 10, 50, 100"
              {...register("quantity")}
              className="form-input w-full"
            />
            {errors.quantity && <p className="form-error mt-1">{errors.quantity.message}</p>}
          </div>

          {/* Discounted Unit Price */}
          <div>
            <label className="form-label text-white/80">
              Discounted Price Per Unit (FCFA)
            </label>
            <input
              type="number"
              placeholder="e.g. 1200"
              {...register("pricePerUnit")}
              className="form-input w-full"
            />
            {errors.pricePerUnit && (
              <p className="form-error mt-1">{errors.pricePerUnit.message}</p>
            )}
          </div>

          {/* Savings Preview Callout */}
          {discountPercent > 0 && (
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>
                Buyers ordering <strong>{enteredQty || 0}+ {formatUnit(sellingUnit)}</strong> will receive a{" "}
                <strong>{discountPercent}% discount</strong>!
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3">
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
              className="btn-primary text-xs py-2 px-5 flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Pricing Tier"
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
