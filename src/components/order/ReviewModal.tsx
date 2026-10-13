"use client";

import React, { useState } from "react";
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
import { Star } from "lucide-react";
import { toast } from "react-toastify";
import { useSubmitReviewMutation } from "@/redux/features/feedback/feedbackApi";

const reviewSchema = z.object({
  rating: z.number().min(1, "Please select at least 1 star").max(5),
  comment: z
    .string()
    .min(5, "Comment must be at least 5 characters")
    .max(500, "Comment cannot exceed 500 characters"),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderItemId: string;
  productName: string;
  onSuccess?: () => void;
}

export default function ReviewModal({
  isOpen,
  onClose,
  orderItemId,
  productName,
  onSuccess,
}: ReviewModalProps) {
  const [submitReviewMutation, { isLoading }] = useSubmitReviewMutation();
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 5,
      comment: "",
    },
  });

  const currentRating = watch("rating");

  const onSubmit = async (values: ReviewFormValues) => {
    try {
      await submitReviewMutation({
        orderItemId,
        rating: values.rating,
        comment: values.comment,
      }).unwrap();

      toast.success("Thank you! Your review has been submitted.");
      reset();
      onSuccess?.();
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to submit review");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-white border border-slate-200 text-slate-900 p-6 rounded-2xl shadow-xl">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl font-bold text-slate-900">
            Rate & Review Product
          </DialogTitle>
          <DialogDescription className="text-slate-500 text-xs">
            Share your feedback on <span className="text-emerald-700 font-semibold">{productName}</span> to
            help farmers and future buyers.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          {/* Star Rating Selector */}
          <div>
            <label className="form-label text-slate-700">Rating (1 to 5 Stars)</label>
            <div className="flex items-center gap-2 mt-1">
              {[1, 2, 3, 4, 5].map((star) => {
                const filled =
                  hoverRating !== null ? star <= hoverRating : star <= currentRating;
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setValue("rating", star, { shouldValidate: true })}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(null)}
                    className="p-1 transition-transform hover:scale-110 focus:outline-none"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        filled
                          ? "text-amber-400 fill-amber-400"
                          : "text-slate-200 fill-slate-100"
                      } transition-colors`}
                    />
                  </button>
                );
              })}
              <span className="text-sm font-bold text-amber-600 ml-2">
                {hoverRating !== null ? hoverRating : currentRating} / 5
              </span>
            </div>
            {errors.rating && (
              <p className="form-error mt-1">{errors.rating.message}</p>
            )}
          </div>

          {/* Comment */}
          <div>
            <label className="form-label text-slate-700">Your Review / Comments</label>
            <textarea
              {...register("comment")}
              rows={4}
              placeholder="How was the freshness, packaging, and quality of the harvest?"
              className="form-textarea w-full"
            />
            {errors.comment && (
              <p className="form-error mt-1">{errors.comment.message}</p>
            )}
          </div>

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
                  Submitting...
                </>
              ) : (
                "Submit Review"
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
