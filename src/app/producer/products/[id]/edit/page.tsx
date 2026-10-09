"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {
  ArrowLeft,
  Save,
  Upload,
  X,
  Plus,
  Package,
  Sparkles,
  AlertCircle,
  Loader2,
  Eye,
  Camera,
  Trash2,
  Layers,
} from "lucide-react";
import {
  useGetProductDetailsQuery,
  useUpdateProductMutation,
  useUpdateProductImagesMutation,
} from "@/redux/features/product/productApi";
import { useGetAllCategoriesQuery } from "@/redux/features/category/categoryApi";
import AddPricingTierModal from "@/components/producer/AddPricingTierModal";
import { SellingUnit } from "@/types";
import { formatCurrency, formatUnit } from "@/utils/formatters";

const SELLING_UNITS: { label: string; value: SellingUnit }[] = [
  { label: "Kilogram (KG)", value: "KG" },
  { label: "Bag (SAC)", value: "BAG" },
  { label: "Piece (PIECE)", value: "PIECE" },
  { label: "Liter (LITER)", value: "LITER" },
  { label: "Bundle (BOTTE)", value: "BUNDLE" },
  { label: "Gram (G)", value: "GRAM" },
  { label: "Dozen (DOUZAINE)", value: "DOZEN" },
];

const updateProductSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  categoryId: z.string().min(1, "Please select a category"),
  sellingUnit: z.enum([
    "KG",
    "GRAM",
    "PIECE",
    "DOZEN",
    "LITER",
    "BAG",
    "BUNDLE",
  ] as const),
  pricePerUnit: z
    .string()
    .min(1, "Price per unit is required")
    .refine((v) => Number(v) > 0, "Price must be greater than 0"),
  availableQuantity: z
    .string()
    .min(1, "Available quantity is required")
    .refine((v) => Number(v) >= 0, "Quantity cannot be negative"),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
});

type UpdateProductFormValues = z.infer<typeof updateProductSchema>;

export default function EditProductPage() {
  const params = useParams();
  const productId = params?.id as string;


  const [isTierModalOpen, setIsTierModalOpen] = useState(false);

  // Queries
  const {
    data: productData,
    isLoading: isLoadingProduct,
    isError: isProductError,
    refetch: refetchProduct,
  } = useGetProductDetailsQuery(productId, { skip: !productId });

  const { data: categoriesData, isLoading: isLoadingCategories } =
    useGetAllCategoriesQuery();

  const categories = useMemo(
    () => categoriesData?.data?.categories?.filter((c) => c.isActive !== false) || [],
    [categoriesData]
  );

  const product = productData?.data?.product;

  // Mutations
  const [updateProduct, { isLoading: isUpdatingDetails }] =
    useUpdateProductMutation();
  const [updateProductImages, { isLoading: isUpdatingImages }] =
    useUpdateProductImagesMutation();

  // Images State
  const [keptImages, setKeptImages] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newFilePreviews, setNewFilePreviews] = useState<string[]>([]);

  // Form Setup
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<UpdateProductFormValues>({
    resolver: zodResolver(updateProductSchema),
    defaultValues: {
      name: "",
      description: "",
      categoryId: "",
      sellingUnit: "KG",
      pricePerUnit: "",
      availableQuantity: "",
      isActive: true,
      isFeatured: false,
    },
  });

  // Sync loaded product data into form and images state
  useEffect(() => {
    if (product) {
      const selectedCatId =
        product.categoryId ||
        product.category?.id ||
        categories.find((c) => c.name === product.category?.name)?.id ||
        "";

      reset({
        name: product.name || "",
        description: product.description || "",
        categoryId: selectedCatId,
        sellingUnit: product.sellingUnit || "KG",
        pricePerUnit: String(product.pricePerUnit ?? ""),
        availableQuantity: String(product.availableQuantity ?? ""),
        isActive: Boolean(product.isActive),
        isFeatured: Boolean(product.isFeatured),
      });

      setKeptImages(product.imageUrls || []);
    }
  }, [product, reset, categories]);

  // Handle New File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      setNewFiles((prev) => [...prev, ...filesArray]);

      const previews = filesArray.map((file) => URL.createObjectURL(file));
      setNewFilePreviews((prev) => [...prev, ...previews]);
    }
  };

  // Remove one of the existing kept images
  const handleRemoveKeptImage = (urlToRemove: string) => {
    const totalRemaining = keptImages.length - 1 + newFiles.length;
    if (totalRemaining < 1) {
      toast.error("Every harvest must have at least one photo. Upload a new photo before deleting this one.");
      return;
    }
    setKeptImages((prev) => prev.filter((url) => url !== urlToRemove));
  };

  // Remove one of the newly added pending files
  const handleRemoveNewFile = (index: number) => {
    // Revoke object URL to prevent memory leaks
    if (newFilePreviews[index]) {
      URL.revokeObjectURL(newFilePreviews[index]);
    }
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
    setNewFilePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Restore all original images from product
  const handleResetImages = () => {
    newFilePreviews.forEach((url) => URL.revokeObjectURL(url));
    setNewFiles([]);
    setNewFilePreviews([]);
    setKeptImages(product?.imageUrls || []);
  };

  // 1. Submit Details Update (PUT /api/v1/product/update)
  const onUpdateDetails = async (values: UpdateProductFormValues) => {
    try {
      const payload = {
        productId,
        name: values.name.trim(),
        description: values.description.trim(),
        categoryId: values.categoryId,
        sellingUnit: values.sellingUnit,
        pricePerUnit: Math.round(Number(values.pricePerUnit)),
        availableQuantity: Math.round(Number(values.availableQuantity)),
        isActive: values.isActive,
        isFeatured: values.isFeatured,
      };

      const res = await updateProduct(payload).unwrap();
      toast.success(res?.message || "Crop details saved successfully!");
      refetchProduct();
    } catch (err: unknown) {
      const error = err as { data?: { message?: string }; message?: string };
      toast.error(
        error?.data?.message || error?.message || "Failed to update crop details"
      );
    }
  };

  // 2. Submit Images Update (PUT /api/v1/product/update-images)
  const onUpdateImages = async (e: React.FormEvent) => {
    e.preventDefault();

    const totalImages = keptImages.length + newFiles.length;
    if (totalImages === 0) {
      toast.error("Please keep or upload at least one image of this harvest.");
      return;
    }

    try {
      const formData = new FormData();

      // Interceptor expects JSON in "data" field
      const dataPayload = {
        productId,
        keptImages,
      };
      formData.append("data", JSON.stringify(dataPayload));
      formData.append("productId", productId);

      // Append kept image URLs
      keptImages.forEach((imgUrl) => {
        formData.append("keptImages", imgUrl);
      });

      // Append new file objects
      newFiles.forEach((file) => {
        formData.append("imageUrls", file);
      });

      const res = await updateProductImages(formData).unwrap();
      toast.success(res?.message || "Crop photography updated successfully!");

      // Cleanup local blob previews
      newFilePreviews.forEach((url) => URL.revokeObjectURL(url));
      setNewFiles([]);
      setNewFilePreviews([]);

      refetchProduct();
    } catch (err: unknown) {
      const error = err as { data?: { message?: string }; message?: string };
      toast.error(
        error?.data?.message ||
        error?.message ||
        "Failed to update crop photos"
      );
    }
  };

  if (isLoadingProduct) {
    return (
      <div className="flex min-h-[500px] flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        <p className="text-xs text-slate-500">Loading harvest information...</p>
      </div>
    );
  }

  if (isProductError || !product) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-8 text-center space-y-4">
        <AlertCircle className="mx-auto h-10 w-10 text-rose-500" />
        <div>
          <h2 className="text-lg font-bold text-rose-950">Harvest Not Found</h2>
          <p className="mt-1 text-xs text-rose-700">
            This crop product could not be retrieved or you do not have permission to edit it.
          </p>
        </div>
        <Link
          href="/producer/products"
          className="btn-secondary inline-flex items-center gap-2 text-xs"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Harvest Inventory
        </Link>
      </div>
    );
  }

  const hasImageChanges =
    newFiles.length > 0 ||
    keptImages.length !== (product.imageUrls?.length || 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          <Link
            href={`/producer/products/${productId}`}
            className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            title="Back to Harvest Details"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-serif text-2xl font-bold text-slate-900">
                Edit Harvest: {product.name}
              </h1>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${product.isActive
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-slate-100 text-slate-600 border-slate-200"
                  }`}
              >
                {product.isActive ? "Active" : "Hidden"}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Update crop pricing, stock quantities, description, and photo gallery.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href={`/producer/products/${productId}`}
            className="btn-secondary text-xs py-2 px-3.5 flex items-center gap-1.5"
          >
            <Eye className="h-3.5 w-3.5" />
            View Details
          </Link>
          <Link
            href="/producer/products"
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Inventory List
          </Link>
        </div>
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Crop Details Form (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <form
            onSubmit={handleSubmit(onUpdateDetails)}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="font-serif text-base font-bold text-slate-900 flex items-center gap-2">
                  <Package className="h-4 w-4 text-emerald-600" />
                  Crop Details & Inventory
                </h2>
                <p className="text-xs text-slate-500">
                  Update product name, category, standard pricing, and storage inventory.
                </p>
              </div>             
            </div>

            {/* Produce Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Produce Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                {...register("name")}
                placeholder="e.g. Organic Roma Tomatoes"
                className={`w-full rounded-xl border px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 ${errors.name
                    ? "border-rose-300 focus:border-rose-500 focus:ring-rose-200"
                    : "border-slate-200 focus:border-emerald-500 focus:ring-emerald-200"
                  }`}
              />
              {errors.name && (
                <p className="text-rose-600 text-[11px] mt-1">{errors.name.message}</p>
              )}
            </div>

            {/* Category & Selling Unit Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Category <span className="text-rose-500">*</span>
                </label>
                <select
                  {...register("categoryId")}
                  disabled={isLoadingCategories}
                  className={`w-full rounded-xl border px-3.5 py-2.5 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 ${errors.categoryId
                      ? "border-rose-300 focus:border-rose-500 focus:ring-rose-200"
                      : "border-slate-200 focus:border-emerald-500 focus:ring-emerald-200"
                    }`}
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {errors.categoryId && (
                  <p className="text-rose-600 text-[11px] mt-1">
                    {errors.categoryId.message}
                  </p>
                )}
              </div>

              {/* Selling Unit */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Selling Unit <span className="text-rose-500">*</span>
                </label>
                <select
                  {...register("sellingUnit")}
                  className={`w-full rounded-xl border px-3.5 py-2.5 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 ${errors.sellingUnit
                      ? "border-rose-300 focus:border-rose-500 focus:ring-rose-200"
                      : "border-slate-200 focus:border-emerald-500 focus:ring-emerald-200"
                    }`}
                >
                  {SELLING_UNITS.map((unit) => (
                    <option key={unit.value} value={unit.value}>
                      {unit.label}
                    </option>
                  ))}
                </select>
                {errors.sellingUnit && (
                  <p className="text-rose-600 text-[11px] mt-1">
                    {errors.sellingUnit.message}
                  </p>
                )}
              </div>
            </div>

            {/* Standard Price & Available Quantity Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Price Per Unit */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Base Price Per Unit (XOF) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-medium text-slate-400">
                    CFA
                  </span>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    {...register("pricePerUnit")}
                    placeholder="500"
                    className={`w-full rounded-xl border pl-12 pr-3.5 py-2.5 text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 ${errors.pricePerUnit
                        ? "border-rose-300 focus:border-rose-500 focus:ring-rose-200"
                        : "border-slate-200 focus:border-emerald-500 focus:ring-emerald-200"
                      }`}
                  />
                </div>
                {errors.pricePerUnit && (
                  <p className="text-rose-600 text-[11px] mt-1">
                    {errors.pricePerUnit.message}
                  </p>
                )}
              </div>

              {/* Available Stock */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Available Stock Quantity <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="1"
                    min="0"
                    {...register("availableQuantity")}
                    placeholder="100"
                    className={`w-full rounded-xl border px-3.5 py-2.5 text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 ${errors.availableQuantity
                        ? "border-rose-300 focus:border-rose-500 focus:ring-rose-200"
                        : "border-slate-200 focus:border-emerald-500 focus:ring-emerald-200"
                      }`}
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400 uppercase">
                    {watch("sellingUnit")}
                  </span>
                </div>
                {errors.availableQuantity && (
                  <p className="text-rose-600 text-[11px] mt-1">
                    {errors.availableQuantity.message}
                  </p>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Harvest Description & Quality Specifications{" "}
                <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={4}
                {...register("description")}
                placeholder="Describe freshness, harvest date, variety, organic practices, handling..."
                className={`w-full rounded-xl border px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 ${errors.description
                    ? "border-rose-300 focus:border-rose-500 focus:ring-rose-200"
                    : "border-slate-200 focus:border-emerald-500 focus:ring-emerald-200"
                  }`}
              />
              {errors.description && (
                <p className="text-rose-600 text-[11px] mt-1">
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Visibility & Feature Toggles */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  {...register("isActive")}
                  className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <span className="text-xs font-semibold text-slate-900 block">
                    Active Marketplace Listing
                  </span>
                  <span className="text-[11px] text-slate-500">
                    When checked, buyers can discover and order this harvest.
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer border-t border-slate-200/70 pt-2.5">
                <input
                  type="checkbox"
                  {...register("isFeatured")}
                  className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <span className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                    Featured Produce <Sparkles className="h-3 w-3 text-amber-500" />
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Highlight this product on the marketplace showcase banner.
                  </span>
                </div>
              </label>
            </div>

            {/* Save Details Button */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="submit"
                disabled={isUpdatingDetails}
                className="btn-primary text-xs py-2.5 px-5 flex items-center gap-2 shadow-sm"
              >
                {isUpdatingDetails ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <Save className="h-3.5 w-3.5" />
                    Save Crop Details
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Wholesale Bulk Pricing Tiers Section */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="font-serif text-base font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="h-4 w-4 text-amber-600" />
                  Wholesale Volume Tiers
                </h2>
                <p className="text-xs text-slate-500">
                  Tiered prices applied automatically when buyers purchase in volume.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsTierModalOpen(true)}
                className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Tier
              </button>
            </div>

            {product.pricingTiers && product.pricingTiers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Order Quantity Threshold</th>
                      <th className="py-2.5 px-3">Wholesale Unit Price</th>
                      <th className="py-2.5 px-3 text-right">Per-Unit Savings</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {product.pricingTiers.map((tier, i) => {
                      const savings = Math.max(0, product.pricePerUnit - tier.pricePerUnit);
                      return (
                        <tr key={i} className="hover:bg-slate-50/80">
                          <td className="py-2.5 px-3 font-semibold text-slate-900">
                            {tier.quantity}+ {formatUnit(product.sellingUnit)}
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold text-emerald-700">
                            {formatCurrency(tier.pricePerUnit)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-emerald-600">
                            {savings > 0 ? `-${formatCurrency(savings)}` : "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-xs text-slate-500">
                <p>No volume discount tiers established for this crop yet.</p>
                <button
                  type="button"
                  onClick={() => setIsTierModalOpen(true)}
                  className="mt-2 text-emerald-700 font-semibold hover:underline"
                >
                  Create wholesale discount tier
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Photography Management Form (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <form
            onSubmit={onUpdateImages}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="font-serif text-base font-bold text-slate-900 flex items-center gap-2">
                  <Camera className="h-4 w-4 text-emerald-600" />
                 Harvest Photos
                </h2>
                <p className="text-xs text-slate-500">
                  Manage harvest gallery photos, add new images, or remove obsolete ones.
                </p>
              </div>            
            </div>

            {/* Currently Kept Saved Photos */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-700">
                  Saved Photos ({keptImages.length})
                </label>
                {keptImages.length < (product.imageUrls?.length || 0) && (
                  <button
                    type="button"
                    onClick={handleResetImages}
                    className="text-[11px] text-emerald-700 hover:underline"
                  >
                    Reset to original
                  </button>
                )}
              </div>

              {keptImages.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {keptImages.map((url, idx) => (
                    <div
                      key={idx}
                      className="group relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-100"
                    >
                      <Image
                        src={url}
                        alt={`Harvest photo ${idx + 1}`}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
                        <button
                          type="button"
                          onClick={() => handleRemoveKeptImage(url)}
                          className="p-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-colors shadow-sm"
                          title="Remove this photo"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[9px] font-semibold text-white">
                        #{idx + 1}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-amber-200 bg-amber-50/60 p-4 text-center text-xs text-amber-800">
                  <AlertCircle className="h-5 w-5 text-amber-600 mx-auto mb-1" />
                  <p className="font-semibold">All existing photos marked for removal</p>
                  <p className="text-[11px] text-amber-700 mt-0.5">
                    You must upload at least one new harvest photo below before saving.
                  </p>
                </div>
              )}
            </div>

            {/* Upload New Photos Dropzone */}
            <div className="border-t border-slate-100 pt-4">
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Upload New Harvest Photos
              </label>

              <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-2xl p-6 bg-slate-50/60 hover:bg-emerald-50/30 cursor-pointer transition-all">
                <Upload className="h-7 w-7 text-emerald-600 mb-2" />
                <span className="text-xs font-semibold text-slate-900">
                  Click to select photos
                </span>
                <span className="text-[11px] text-slate-500 mt-0.5">
                  PNG, JPG, WEBP up to 5MB
                </span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              {/* Previews of newly selected files */}
              {newFilePreviews.length > 0 && (
                <div className="mt-3 space-y-2">
                  <span className="text-[11px] font-semibold text-emerald-700 block">
                    New Photos to Upload ({newFilePreviews.length})
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {newFilePreviews.map((previewUrl, idx) => (
                      <div
                        key={idx}
                        className="group relative aspect-square rounded-xl overflow-hidden border-2 border-emerald-400 bg-slate-100"
                      >
                        <Image
                          src={previewUrl}
                          alt={`New preview ${idx + 1}`}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveNewFile(idx)}
                          className="absolute top-1 right-1 p-1 rounded-full bg-slate-900/70 text-white hover:bg-rose-600 transition-colors"
                          title="Cancel upload"
                        >
                          <X className="h-3 w-3" />
                        </button>
                        <span className="absolute bottom-1 left-1 rounded bg-emerald-600 px-1.5 py-0.5 text-[9px] font-semibold text-white">
                          New
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Save Photos Button */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="submit"
                disabled={
                  isUpdatingImages ||
                  keptImages.length + newFiles.length === 0 ||
                  !hasImageChanges
                }
                className="btn-primary text-xs py-2.5 px-5 flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdatingImages ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Uploading Photos...
                  </>
                ) : (
                  <>
                    <Upload className="h-3.5 w-3.5" />
                    Save Harvest Photography
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Add Bulk Pricing Tier Modal */}
      <AddPricingTierModal
        isOpen={isTierModalOpen}
        onClose={() => {
          setIsTierModalOpen(false);
          refetchProduct();
        }}
        productId={product.id}
        productName={product.name}
        basePrice={product.pricePerUnit}
        sellingUnit={product.sellingUnit}
      />
    </div>
  );
}
