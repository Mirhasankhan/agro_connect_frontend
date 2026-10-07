"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Search,
  Filter,
  SlidersHorizontal,
  RotateCcw,
  Package,
  ChevronLeft,
  ChevronRight,
  TrendingDown,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/product/ProductCard";
import { useGetAllProductsQuery, ProductQueryParams } from "@/redux/features/product/productApi";
import { SellingUnit } from "@/types";

const SELLING_UNITS: { label: string; value: SellingUnit }[] = [
  { label: "Kilogram (KG)", value: "KG" },
  { label: "Bag (SAC)", value: "BAG" },
  { label: "Piece (PIECE)", value: "PIECE" },
  { label: "Liter (LITER)", value: "LITER" },
  { label: "Bundle (BOTTE)", value: "BUNDLE" },
  { label: "Gram (G)", value: "GRAM" },
  { label: "Dozen (DOUZAINE)", value: "DOZEN" },
];

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read initial query params from URL
  const initialSearch = searchParams.get("search") || "";

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedUnit, setSelectedUnit] = useState<SellingUnit | "">("");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [sortOption, setSortOption] = useState<string>("newest");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Sync state if URL query param changes
  useEffect(() => {
    if (initialSearch) {
      setSearchTerm(initialSearch);
    }
  }, [initialSearch]);

  // Build API Query Parameters
  const queryParams: ProductQueryParams = {
    page: currentPage,
    limit: 12,
  };

  if (searchTerm.trim()) {
    queryParams.search = searchTerm.trim();
  }
  if (selectedUnit) {
    queryParams.sellingUnit = selectedUnit;
  }
  if (minPrice && !isNaN(Number(minPrice))) {
    queryParams.minPrice = Number(minPrice);
  }
  if (maxPrice && !isNaN(Number(maxPrice))) {
    queryParams.maxPrice = Number(maxPrice);
  }

  // Handle Sort
  if (sortOption === "newest") {
    queryParams.sort = "createdAt";
    queryParams.order = "desc";
  } else if (sortOption === "price_asc") {
    queryParams.sort = "pricePerUnit";
    queryParams.order = "asc";
  } else if (sortOption === "price_desc") {
    queryParams.sort = "pricePerUnit";
    queryParams.order = "desc";
  } else if (sortOption === "rating") {
    queryParams.sort = "avgRating";
    queryParams.order = "desc";
  }

  const { data, isLoading, isFetching } = useGetAllProductsQuery(queryParams);

  const products = data?.data?.products || [];
  const meta = data?.data?.meta;
  const totalPages = meta?.totalPage || 1;

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedUnit("");
    setMinPrice("");
    setMaxPrice("");
    setSortOption("newest");
    setCurrentPage(1);
    router.push("/products");
  };

  return (
    <div className="min-h-screen bg-[#04160a] text-white flex flex-col">
      <Navbar />

      {/* Header Banner */}
      <div className="bg-gradient-to-b from-[#082314] to-[#04160a] border-b border-forest-800/80 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs uppercase tracking-widest text-emerald-400 font-bold">
              Direct Farmer Marketplace
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white">
              Fresh Harvests & Farm Goods
            </h1>
            <p className="text-sm text-white/70">
              Explore freshly harvested produce across Côte d&apos;Ivoire with dynamic tiered bulk
              discounts.
            </p>
          </div>
        </div>
      </div>

      {/* Main Catalog Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        {/* Top Controls Bar: Search, Sort & Mobile Filter Toggle */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-8 bg-[#071f12] p-4 rounded-2xl border border-forest-700/60 shadow-lg">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search products by name or description..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-forest-950/80 border border-forest-700 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-white/40 focus:outline-none focus:border-emerald-500"
            />
            <Search className="w-4 h-4 text-emerald-400 absolute left-3.5 top-3" />
          </div>

          {/* Right Controls: Sort & Mobile Toggle */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="lg:hidden flex items-center gap-2 px-3 py-2 rounded-xl bg-forest-900 border border-forest-700 text-xs text-white"
            >
              <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
              Filters
            </button>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-white/60 hidden sm:inline">Sort:</span>
              <select
                value={sortOption}
                onChange={(e) => {
                  setSortOption(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-forest-950 border border-forest-700 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="newest">Newest Harvests</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Catalog Body: Filters Sidebar + Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters (Desktop & Mobile Drawer) */}
          <aside
            className={`lg:block ${
              mobileFilterOpen ? "block mb-6" : "hidden"
            } bg-[#071f12] border border-forest-700/60 rounded-2xl p-5 space-y-6 h-fit`}
          >
            <div className="flex items-center justify-between border-b border-forest-800 pb-3">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-emerald-400" />
                <h3 className="font-serif font-bold text-white text-base">Filter Harvests</h3>
              </div>
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-[11px] text-white/50 hover:text-emerald-400 flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            </div>

            {/* Selling Unit Filter */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-white/80 block uppercase tracking-wider">
                Selling Unit
              </label>
              <select
                value={selectedUnit}
                onChange={(e) => {
                  setSelectedUnit(e.target.value as SellingUnit | "");
                  setCurrentPage(1);
                }}
                className="form-select w-full text-xs"
              >
                <option value="">All Units</option>
                {SELLING_UNITS.map((unit) => (
                  <option key={unit.value} value={unit.value}>
                    {unit.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range Filter */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-white/80 block uppercase tracking-wider">
                Price Range (CFA)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => {
                    setMinPrice(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="form-input text-xs"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => {
                    setMaxPrice(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="form-input text-xs"
                />
              </div>
            </div>

            {/* Bulk Discounts Note */}
            <div className="p-3 rounded-xl bg-forest-950/60 border border-forest-800 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                <TrendingDown className="w-3.5 h-3.5" />
                Tiered Wholesale
              </div>
              <p className="text-[11px] text-white/60 leading-relaxed">
                Click into any product to access the interactive Volume Calculator and unlock lower
                unit prices for bulk orders.
              </p>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="lg:col-span-3 space-y-8">
            {isLoading || isFetching ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="h-80 bg-forest-900/40 rounded-2xl border border-forest-800 animate-pulse"
                  />
                ))}
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {products.map((prod) => (
                    <ProductCard key={prod.id} product={prod} />
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-6">
                    <button
                      type="button"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage <= 1}
                      className="p-2 rounded-xl bg-forest-900 border border-forest-700 text-white hover:bg-forest-800 disabled:opacity-40 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          type="button"
                          onClick={() => setCurrentPage(page)}
                          className={`w-8 h-8 rounded-xl text-xs font-semibold transition-colors ${
                            page === currentPage
                              ? "bg-emerald-500 text-white shadow-md shadow-emerald-950"
                              : "bg-forest-950 border border-forest-800 text-white/70 hover:text-white hover:bg-forest-900"
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage >= totalPages}
                      className="p-2 rounded-xl bg-forest-900 border border-forest-700 text-white hover:bg-forest-800 disabled:opacity-40 transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20 px-4 bg-[#071f12] border border-forest-800 rounded-3xl">
                <Package className="w-12 h-12 text-emerald-400 mx-auto mb-3 opacity-80" />
                <h3 className="font-serif text-xl font-bold text-white">No Products Found</h3>
                <p className="text-sm text-white/60 max-w-sm mx-auto mt-1 mb-6">
                  We couldn&apos;t find any harvests matching your current filters. Try resetting
                  your search or price range.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="btn-primary text-xs py-2 px-5 inline-flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
