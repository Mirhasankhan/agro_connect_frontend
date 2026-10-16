"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Package,
  Plus,
  Search,
  AlertCircle,
  Clock,
  Eye,
  Pencil,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  useGetProducerProductsQuery,
  useUpdateProductMutation,
} from "@/redux/features/product/productApi";
import { useGetProfileQuery } from "@/redux/features/auth/authApi";
import AddPricingTierModal from "@/components/producer/AddPricingTierModal";
import { formatCurrency, formatUnit } from "@/utils/formatters";
import { TProduct, SellingUnit } from "@/types";
import Pagination from "@/utils/pagination";

export default function ProducerProductsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "outOfStock">("all");
  const [page, setPage] = useState(1);

  const { data: profileData } = useGetProfileQuery();
  const verificationStatus = profileData?.data?.producerProfile?.verificationStatus;
  const isAccepted = verificationStatus === "Accepted";
  const isRejected = verificationStatus === "Rejected";

  const queryParams: any = {
    page,
    limit: 10,
  };
  if (searchTerm.trim()) queryParams.search = searchTerm.trim();
  if (statusFilter !== "all") queryParams.status = statusFilter;

  const { data, isLoading } = useGetProducerProductsQuery(queryParams);
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();

  const products = data?.data?.products || [];
  const totalPages = data?.data?.meta?.totalPage || 1;

  // Add Tier Modal State
  const [selectedProductForTier, setSelectedProductForTier] = useState<{
    id: string;
    name: string;
    basePrice: number;
    sellingUnit: SellingUnit;
  } | null>(null);

  const handleToggleActive = async (product: TProduct) => {
    try {
      await updateProduct({
        productId: product.id,
        isActive: !product.isActive,
      }).unwrap();
      toast.success(
        `${product.name} is now ${!product.isActive ? "Active" : "Hidden from marketplace"}`
      );
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update product status");
    }
  };

  return (
    <div className="space-y-6">
      {/* Verification Status Warning for Pending / Rejected */}
      {!isAccepted && (
        <div
          className={`flex items-start gap-3 rounded-2xl border p-4 text-xs ${isRejected
              ? "border-rose-200 bg-rose-50 text-rose-800"
              : "border-amber-200 bg-amber-50 text-amber-800"
            }`}
        >
          {isRejected ? (
            <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
          ) : (
            <Clock className="h-5 w-5 shrink-0 text-amber-600" />
          )}
          <div className="space-y-0.5">
            <p className="font-semibold text-sm">
              {isRejected
                ? "Producer Verification Rejected"
                : "Producer Verification Pending Admin Approval"}
            </p>
            <p>
              {isRejected
                ? "Your producer verification was not approved. You cannot list new products until your account is approved."
                : "Your producer account is currently under review by administrators. Adding new harvest produce will remain disabled until your account is Accepted."}
            </p>
          </div>
        </div>
      )}

      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="font-serif text-2xl font-bold text-slate-900">Harvest Inventory</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your agricultural produce, available stock, and bulk wholesale discount tiers.
          </p>
        </div>

        {isAccepted ? (
          <Link
            href="/producer/products/create"
            className="btn-primary text-xs py-2.5 px-4 flex items-center justify-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add New Harvest
          </Link>
        ) : (
          <button
            type="button"
            disabled
            title={
              isRejected
                ? "Account verification was rejected. Please contact support."
                : "Account verification is pending. You can add products once your producer profile is Accepted."
            }
            className="btn-primary opacity-50 cursor-not-allowed text-xs py-2.5 px-4 flex items-center justify-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add New Harvest (Pending Approval)
          </button>
        )}
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative w-full sm:max-w-xs">
          <input
            type="text"
            placeholder="Search your harvests..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
          />
          <Search className="w-4 h-4 text-emerald-600 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500">Stock:</span>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as any);
              setPage(1);
            }}
            className="bg-slate-50 border border-slate-200 rounded-xl py-1.5 px-3 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 w-full sm:w-auto"
          >
            <option value="all">All Harvests</option>
            <option value="active">In Stock (Active)</option>
            <option value="outOfStock">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-8 space-y-4 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-slate-100 rounded-xl" />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500  tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Harvest</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Base Unit Price</th>
                  <th className="py-3.5 px-4">Available Stock</th>
                  <th className="py-3.5 px-4">Units Sold</th>
                  <th className="py-3.5 px-4">Offers</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((prod) => {
                  const img =
                    prod.imageUrls?.[0] ||
                    "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=150&q=80";

                  return (
                    <tr key={prod.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Harvest image + name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <Link
                            href={`/producer/products/${prod.id}`}
                            className="relative w-11 h-11 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200 hover:opacity-90 transition-opacity"
                          >
                            <Image src={img} alt={prod.name} fill className="object-cover" />
                          </Link>
                          <div>
                            <Link
                              href={`/producer/products/${prod.id}`}
                              className="font-serif font-bold text-slate-900 text-sm line-clamp-1 hover:text-emerald-700 transition-colors"
                            >
                              {prod.name}
                            </Link>
                            <span className="text-[10px] text-slate-400">
                              Unit: {formatUnit(prod.sellingUnit)}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 text-emerald-700 font-medium">
                        {prod.category?.name || "General"}
                      </td>

                      {/* Price */}
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">
                        {formatCurrency(prod.pricePerUnit)}
                      </td>

                      {/* Stock */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`font-mono font-semibold ${prod.availableQuantity > 0 ? "text-slate-800" : "text-red-500"
                            }`}
                        >
                          {prod.availableQuantity} {formatUnit(prod.sellingUnit)}
                        </span>
                      </td>

                      {/* Sold */}
                      <td className="py-3.5 px-4 font-mono text-slate-600">{prod.sold || 0}</td>

                      {/* Bulk Pricing Tier Builder */}
                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedProductForTier({
                              id: prod.id,
                              name: prod.name,
                              basePrice: prod.pricePerUnit,
                              sellingUnit: prod.sellingUnit,
                            })
                          }
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 text-[11px] font-semibold transition-colors"
                        >

                          <span>+ Add Tier</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/producer/products/${prod.id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50 text-[11px] font-medium transition-colors"
                            title="View Harvest Details"
                          >
                            <Eye className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Details</span>
                          </Link>

                          <Link
                            href={`/producer/products/${prod.id}/edit`}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50 text-[11px] font-medium transition-colors"
                            title="Edit Harvest"
                          >
                            <Pencil className="w-3.5 h-3.5 text-blue-600" />
                            <span>Edit</span>
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleToggleActive(prod)}
                            disabled={isUpdating}
                            title={prod.isActive ? "Hide from marketplace" : "Make visible on marketplace"}
                            className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold border transition-colors ${prod.isActive
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-red-50 hover:text-red-700 hover:border-red-200"
                                : "bg-slate-100 text-slate-500 border-slate-200 hover:text-slate-700"
                              }`}
                          >
                            {prod.isActive ? "Active" : "Hidden"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {totalPages > 1 && (
              <div className="p-4 border-t border-slate-200 bg-white">
                <Pagination
                  page={page}
                  setPage={setPage}
                  totalPage={totalPages}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-16 px-4">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-serif text-lg font-bold text-slate-900">No Harvests Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-6">
              You haven&apos;t added any produce yet. List your vegetables, fruits, or tubers to
              start selling to verified buyers.
            </p>
            {isAccepted ? (
              <Link href="/producer/products/create" className="btn-primary text-xs py-2 px-5">
                Add Your First Harvest
              </Link>
            ) : (
              <button
                type="button"
                disabled
                title="Account verification is pending. You can add products once your producer profile is Accepted."
                className="btn-primary opacity-50 cursor-not-allowed text-xs py-2 px-5"
              >
                Add Your First Harvest (Pending Approval)
              </button>
            )}
          </div>
        )}
      </div>

      {/* Add Pricing Tier Modal */}
      {selectedProductForTier && (
        <AddPricingTierModal
          isOpen={Boolean(selectedProductForTier)}
          onClose={() => setSelectedProductForTier(null)}
          productId={selectedProductForTier.id}
          productName={selectedProductForTier.name}
          basePrice={selectedProductForTier.basePrice}
          sellingUnit={selectedProductForTier.sellingUnit}
        />
      )}
    </div>
  );
}
