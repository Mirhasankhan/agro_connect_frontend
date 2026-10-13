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
import { Loader2 } from "lucide-react";
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
    quantity: z.string().min(1, "Quantity is required").refine(
      (val) => Number(val) > 0,
      "Quantity must be greater than 0"
    ),
    pricePerUnit: z.string().min(1, "Price is required").refine(
      (val) => Number(val) > 0,
      "Price must be greater than 0"
    ),
  });

  type TierFormValues = z.infer<typeof tierSchema>;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TierFormValues>({
    resolver: zodResolver(tierSchema),
  });

  const onSubmit = async (values: TierFormValues) => {
    try {
      await addTierMutation({
        productId,
        quantity: Number(values.quantity),
        pricePerUnit: Number(values.pricePerUnit),
      }).unwrap();

      toast.success("Pricing tier added successfully!");
      reset();
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to add pricing tier");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-white border border-slate-200 text-slate-900 p-6 rounded-2xl shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-slate-900">
            Add Pricing Tier
          </DialogTitle>
          <DialogDescription className="text-slate-500 text-xs">
            Set bulk pricing for {productName} (Current standard price: {formatCurrency(basePrice)}/{formatUnit(sellingUnit)}).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div>
            <label className="form-label text-slate-700">
              Minimum Quantity ({formatUnit(sellingUnit)})
            </label>
            <input
              type="number"
              placeholder="e.g. 10"
              {...register("quantity")}
              className="form-input w-full"
            />
            {errors.quantity && (
              <p className="form-error mt-1">{errors.quantity.message}</p>
            )}
          </div>

          <div>
            <label className="form-label text-slate-700">
              Price Per Unit (৳)
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
                "Save Tier"
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
