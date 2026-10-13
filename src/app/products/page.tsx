"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Search,
  Filter,
  SlidersHorizontal,
  RotateCcw,
  Package,
  Layers,
  X,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/product/ProductCard";
import { useGetAllProductsQuery, ProductQueryParams } from "@/redux/features/product/productApi";
import { useGetAllCategoriesQuery } from "@/redux/features/category/categoryApi";
import { SellingUnit } from "@/types";
import Pagination from "@/utils/pagination";

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
  const initialCategory = searchParams.get("categoryId") || "";

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedUnit, setSelectedUnit] = useState<SellingUnit | "">("");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [sortOption, setSortOption] = useState<string>("newest");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Sync state if URL query param changes
  useEffect(() => {
    setSearchTerm(searchParams.get("search") || "");
    setSelectedCategory(searchParams.get("categoryId") || "");
  }, [searchParams]);

  // Fetch categories from backend API
  const {
    data: categoriesData,
    isLoading: isLoadingCategories,
    isError: isCategoriesError,
  } = useGetAllCategoriesQuery();

  const categories = categoriesData?.data?.categories?.filter((c) => c.isActive !== false) || [];

  // Build API Query Parameters
  const queryParams: ProductQueryParams = {
    page: currentPage,
    limit: 10,
  };

  if (searchTerm.trim()) {
    queryParams.search = searchTerm.trim();
  }
  if (selectedCategory) {
    queryParams.categoryId = selectedCategory;
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

  const { data, isLoading } = useGetAllProductsQuery(queryParams);

  const products = data?.data?.products || [];
  const meta = data?.data?.meta;
  const totalPages = meta?.totalPage || 1;

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);

    const params = new URLSearchParams(searchParams.toString());
    if (categoryId) {
      params.set("categoryId", categoryId);
    } else {
      params.delete("categoryId");
    }
    router.push(`/products?${params.toString()}`);
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setSelectedUnit("");
    setMinPrice("");
    setMaxPrice("");
    setSortOption("newest");
    setCurrentPage(1);
    router.push("/products");
  };

  const activeCategoryObj = categories.find((c) => c.id === selectedCategory);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Navbar />

      {/* Header Banner */}
      <div className="bg-white border-b border-slate-200 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl space-y-2">           
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900">
              Fresh Harvests & Farm Goods
            </h1>
            <p className="text-sm text-slate-600">
              Explore freshly harvested produce across Côte d&apos;Ivoire with dynamic tiered bulk
              discounts directly from verified producers.
            </p>
          </div>
        </div>
      </div>

      {/* Main Catalog Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        {/* Top Controls Bar: Search, Sort & Mobile Filter Toggle */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-8 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm">
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
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          </div>

          {/* Right Controls: Active category chip, Sort & Mobile Toggle */}
          <div className="flex items-center gap-3">
            {activeCategoryObj && (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
                <span>Category: {activeCategoryObj.name}</span>
                <button
                  type="button"
                  onClick={() => handleCategorySelect("")}
                  className="hover:text-emerald-950 p-0.5"
                  title="Clear category"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}

            <button
              type="button"
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="lg:hidden flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-200 transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
              Filters
            </button>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 hidden sm:inline">Sort:</span>
              <select
                value={sortOption}
                onChange={(e) => {
                  setSortOption(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 transition-colors"
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
            } bg-white border border-slate-200/90 rounded-2xl p-5 space-y-6 h-fit shadow-sm`}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-emerald-600" />
                <h3 className="font-serif font-bold text-slate-900 text-base">Filter Harvests</h3>
              </div>
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-[11px] text-slate-500 hover:text-emerald-600 flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            </div>

            {/* PRODUCT CATEGORIES FILTER - Dynamic from Backend API */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-emerald-600" />
                  Category
                </label>
                {selectedCategory && (
                  <button
                    type="button"
                    onClick={() => handleCategorySelect("")}
                    className="text-[10px] text-emerald-600 hover:underline"
                  >
                    Clear
                  </button>
                )}
              </div>

              {isLoadingCategories ? (
                <div className="space-y-1.5">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-8 bg-slate-100 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : isCategoriesError ? (
                <p className="text-xs text-rose-500">Failed to load categories</p>
              ) : categories.length === 0 ? (
                <p className="text-xs text-slate-400">No categories available</p>
              ) : (
                <div className="flex flex-col gap-1 max-h-56 overflow-y-auto pr-1">
                  <button
                    type="button"
                    onClick={() => handleCategorySelect("")}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                      selectedCategory === ""
                        ? "bg-emerald-600 text-white font-semibold shadow-sm"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    All Harvests
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleCategorySelect(cat.id)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                        selectedCategory === cat.id
                          ? "bg-emerald-600 text-white font-semibold shadow-sm"
                          : "text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Selling Unit Filter */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="text-xs font-semibold text-slate-700 block tracking-wider">
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
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="text-xs font-semibold text-slate-700 block tracking-wider">
                Price Range (৳)
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
          </aside>

          {/* Products Grid */}
          <div className="lg:col-span-3 space-y-8">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="h-80 bg-slate-200/70 rounded-2xl border border-slate-200 animate-pulse"
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
                  <div className="pt-6">
                    <Pagination
                      page={currentPage}
                      setPage={setCurrentPage}
                      totalPage={totalPages}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20 px-4 bg-white border border-slate-200 rounded-3xl shadow-sm">
                <Package className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <h3 className="font-serif text-xl font-bold text-slate-900">No Products Found</h3>
                <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1 mb-6">
                  We couldn&apos;t find any harvests matching your current filters. Try resetting
                  your category, search, or price range.
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
