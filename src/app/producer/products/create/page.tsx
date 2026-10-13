"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";
import {
  ArrowLeft,
  UploadCloud,
  X,
  Plus,
  Trash2,
  TrendingDown,
  Leaf,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  useCreateProductMutation,
} from "@/redux/features/product/productApi";
import { useGetAllCategoriesQuery } from "@/redux/features/category/categoryApi";
import { useGetProfileQuery } from "@/redux/features/auth/authApi";
import { SellingUnit } from "@/types";
import { formatUnit } from "@/utils/formatters";

const SELLING_UNITS: { label: string; value: SellingUnit }[] = [
  { label: "Kilogram (KG)", value: "KG" },
  { label: "Bag (SAC)", value: "BAG" },
  { label: "Piece (PIECE)", value: "PIECE" },
  { label: "Liter (LITER)", value: "LITER" },
  { label: "Bundle (BOTTE)", value: "BUNDLE" },
  { label: "Gram (G)", value: "GRAM" },
  { label: "Dozen (DOUZAINE)", value: "DOZEN" },
];

const productSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  categoryId: z.string().min(1, "Category is required"),
  sellingUnit: z.enum([
    "KG",
    "GRAM",
    "PIECE",
    "DOZEN",
    "LITER",
    "BAG",
    "BUNDLE",
  ] as const),
  pricePerUnit: z.string().min(1, "Price per unit is required").refine(
    (v) => Number(v) > 0,
    "Price must be greater than 0"
  ),
  availableQuantity: z.string().min(1, "Available quantity is required").refine(
    (v) => Number(v) > 0,
    "Quantity must be greater than 0"
  ),
  pricingTiers: z
    .array(
      z.object({
        quantity: z.string().min(1, "Quantity required").refine((v) => Number(v) > 0, "Must be > 0"),
        pricePerUnit: z
          .string()
          .min(1, "Price required")
          .refine((v) => Number(v) > 0, "Must be > 0"),
      })
    )
    .optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

export default function CreateProductPage() {
  const router = useRouter();
  const [createProductMutation, { isLoading }] = useCreateProductMutation();

  const { data: profileData } = useGetProfileQuery();
  const verificationStatus = profileData?.data?.producerProfile?.verificationStatus;
  const isAccepted = verificationStatus === "Accepted";

  // Query categories dynamically from backend API
  const { data: categoriesData, isLoading: isLoadingCategories } = useGetAllCategoriesQuery();
  const categories = categoriesData?.data?.categories?.filter((c) => c.isActive !== false) || [];

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      sellingUnit: "KG",
      pricingTiers: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "pricingTiers",
  });

  const currentSellingUnit = watch("sellingUnit");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...filesArray]);

      const newPreviews = filesArray.map((file) => URL.createObjectURL(file));
      setFilePreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setFilePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (values: ProductFormValues) => {
    if (selectedFiles.length === 0) {
      toast.error("Please upload at least one image of the harvest");
      return;
    }

    try {
      const formData = new FormData();

      const dataPayload = {
        name: values.name,
        description: values.description,
        categoryId: values.categoryId,
        sellingUnit: values.sellingUnit,
        pricePerUnit: Number(values.pricePerUnit),
        availableQuantity: Number(values.availableQuantity),
        pricingTiers: (values.pricingTiers || []).map((t) => ({
          quantity: Number(t.quantity),
          pricePerUnit: Number(t.pricePerUnit),
        })),
      };

      formData.append("data", JSON.stringify(dataPayload));
      formData.append("name", values.name);
      formData.append("description", values.description);
      formData.append("categoryId", values.categoryId);
      formData.append("sellingUnit", values.sellingUnit);
      formData.append("pricePerUnit", String(values.pricePerUnit));
      formData.append("availableQuantity", String(values.availableQuantity));

      // Append image files
      selectedFiles.forEach((file) => {
        formData.append("imageUrls", file);
      });

      await createProductMutation(formData).unwrap();
      toast.success("Harvest published successfully!");
      router.push("/producer/products");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to create product");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button & Title */}
      <div className="flex items-center gap-3">
        <Link
          href="/producer/products"
          className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="font-serif text-2xl font-bold text-slate-900">Add Fresh Harvest</h1>
          <p className="text-xs text-slate-500">
            Publish your agricultural produce to the Agro Connect marketplace.
          </p>
        </div>
      </div>

      {!isAccepted && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800">
          <Leaf className="h-5 w-5 shrink-0 text-amber-600" />
          <div className="space-y-0.5">
            <p className="font-semibold text-sm">Producer Verification Pending Approval</p>
            <p>
              Your producer profile is currently under review by administrators.
              Publishing harvests to the marketplace is disabled until your account is Accepted.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-5 shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Leaf className="w-5 h-5 text-emerald-600" />
            <h2 className="font-serif font-bold text-lg text-slate-900">1. Crop Details</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="form-label">Harvest / Produce Name</label>
              <input
                type="text"
                placeholder="e.g. Fresh White Cassava (Manioc Blanc Frais)"
                {...register("name")}
                className="form-input"
              />
              {errors.name && <p className="form-error">{errors.name.message}</p>}
            </div>

            <div>
              <label className="form-label">Category</label>
              <select
                {...register("categoryId")}
                className="form-select"
                disabled={isLoadingCategories}
              >
                <option value="">
                  {isLoadingCategories ? "Loading categories..." : "Select Category"}
                </option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && <p className="form-error">{errors.categoryId.message}</p>}
            </div>

            <div>
              <label className="form-label">Selling Unit</label>
              <select {...register("sellingUnit")} className="form-select">
                {SELLING_UNITS.map((unit) => (
                  <option key={unit.value} value={unit.value}>
                    {unit.label}
                  </option>
                ))}
              </select>
              {errors.sellingUnit && <p className="form-error">{errors.sellingUnit.message}</p>}
            </div>

            <div>
              <label className="form-label">Standard Price Per Unit (৳)</label>
              <input
                type="number"
                placeholder="e.g. 1500"
                {...register("pricePerUnit")}
                className="form-input"
              />
              {errors.pricePerUnit && <p className="form-error">{errors.pricePerUnit.message}</p>}
            </div>

            <div>
              <label className="form-label">Available Harvest Quantity</label>
              <input
                type="number"
                placeholder="e.g. 500"
                {...register("availableQuantity")}
                className="form-input"
              />
              {errors.availableQuantity && (
                <p className="form-error">{errors.availableQuantity.message}</p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="form-label">Harvest Description & Quality Notes</label>
              <textarea
                rows={4}
                placeholder="Describe your soil conditions, freshness, post-harvest storage, and harvest dates..."
                {...register("description")}
                className="form-textarea"
              />
              {errors.description && <p className="form-error">{errors.description.message}</p>}
            </div>
          </div>
        </div>

        {/* Dynamic Bulk Pricing Tier Builder Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-amber-600" />
              <div>
                <h2 className="font-serif font-bold text-lg text-slate-900">
                  2. Bulk Discount Tiers (Wholesale Incentives)
                </h2>
                <p className="text-xs text-slate-500">
                  Attract bulk restaurants, hotels, and wholesalers by offering discounted rates for
                  higher quantities.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => append({ quantity: "", pricePerUnit: "" })}
              className="btn-secondary text-xs py-2 px-3.5 flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Tier
            </button>
          </div>

          {fields.length > 0 ? (
            <div className="space-y-3">
              {fields.map((field, index) => {
                return (
                  <div
                    key={field.id}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3"
                  >
                    <div className="grid grid-cols-2 gap-3 w-full sm:w-auto sm:flex-1">
                      <div>
                        <label className="text-[11px] text-slate-600 block mb-1">
                          Min Quantity ({formatUnit(currentSellingUnit)})
                        </label>
                        <input
                          type="number"
                          placeholder="e.g. 10"
                          {...register(`pricingTiers.${index}.quantity` as const)}
                          className="form-input text-xs"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] text-slate-600 block mb-1">
                          Discounted Unit Price (৳)
                        </label>
                        <input
                          type="number"
                          placeholder="e.g. 1200"
                          {...register(`pricingTiers.${index}.pricePerUnit` as const)}
                          className="form-input text-xs"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-2 sm:pt-0">
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                        title="Remove tier"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-500">
              No bulk tiers added yet. Click &ldquo;Add Tier&rdquo; above to set discount thresholds
              for wholesale purchasers.
            </div>
          )}
        </div>

        {/* Harvest Photos Upload */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-5 shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <UploadCloud className="w-5 h-5 text-emerald-600" />
            <h2 className="font-serif font-bold text-lg text-slate-900">3. Harvest Photos</h2>
          </div>

          <label className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50 hover:bg-slate-50/80">
            <UploadCloud className="w-10 h-10 text-emerald-600 mb-2 opacity-80" />
            <span className="text-sm font-semibold text-slate-900">Click or drag images to upload</span>
            <span className="text-xs text-slate-500 mt-1">PNG, JPG, or WEBP up to 10MB</span>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          {/* Previews */}
          {filePreviews.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {filePreviews.map((preview, idx) => (
                <div
                  key={idx}
                  className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 group"
                >
                  <Image
                    src={preview}
                    alt="Preview"
                    fill
                    unoptimized
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(idx)}
                    className="absolute top-1.5 right-1.5 p-1 rounded-full bg-slate-900/70 text-white hover:text-red-400 transition-colors z-10"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link href="/producer/products" className="btn-secondary text-xs py-3 px-6">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isLoading || !isAccepted}
            title={!isAccepted ? "Account verification is pending. You cannot publish harvests until approved." : ""}
            className={`btn-primary text-xs py-3 px-8 flex items-center gap-2 shadow-sm ${
              !isAccepted ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? (
              <>              
                Publishing Harvest...
              </>
            ) : !isAccepted ? (
              "Publish Harvest (Pending Approval)"
            ) : (
              "Publish Harvest"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
