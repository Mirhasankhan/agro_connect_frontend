"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import {
  Sprout,
  ShoppingCart,
  Heart,
  Search,
  LogOut,
  Menu,
  X,
  Package,
  Truck,
  LayoutDashboard,
  ChevronDown,
  ShoppingBag,
  MessageSquare,
  User,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { logout, updateProfileData } from "@/redux/features/auth/authSlice";
import { useGetProfileQuery } from "@/redux/features/auth/authApi";
import { useGetCartQuery, useGetWishlistQuery } from "@/redux/features/shopping/shoppingApi";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  // Fetch real-time profile when authenticated to guarantee accurate full name and avatar
  const { data: profileResponse } = useGetProfileQuery(undefined, {
    skip: !isAuthenticated,
  });

  const profile = profileResponse?.data;
  const displayUser = profile || user;
  const displayName =
    displayUser?.fullName?.trim() ||
    displayUser?.email?.split("@")[0] ||
    "User";

  useEffect(() => {
    if (profile?.fullName && profile.fullName !== user?.fullName) {
      dispatch(updateProfileData(profile));
    }
  }, [profile, user?.fullName, dispatch]);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const isBuyerOrGuest = !displayUser || displayUser.role === "BUYER";

  // Only query cart and wishlist if authenticated buyer
  const { data: cartData } = useGetCartQuery(undefined, {
    skip: !isAuthenticated || !isBuyerOrGuest,
  });
  const { data: wishlistData } = useGetWishlistQuery(undefined, {
    skip: !isAuthenticated || !isBuyerOrGuest,
  });

  const cartItemCount = cartData?.data?.length || 0;
  const wishlistItemCount = wishlistData?.data?.length || 0;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const handleLogout = () => {
    if (typeof document !== "undefined") {
      document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
    dispatch(logout());
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    if (typeof window !== "undefined") {
      window.location.replace("/");
    } else {
      router.push("/");
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/90 bg-white/95 backdrop-blur-md text-slate-800 transition-all shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0 group">
            <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <Sprout className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-2xl font-bold tracking-tight text-slate-900">
                Agro<span className="text-emerald-600 font-sans font-extrabold ml-0.5">Connect</span>
              </span>
              <span className="text-[10px] uppercase tracking-widest text-emerald-700 font-semibold">
                Côte d&apos;Ivoire
              </span>
            </div>
          </Link>

          {/* Center Navigation Links - Desktop */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium">
            <Link
              href="/"
              className={`transition-colors hover:text-emerald-700 ${
                pathname === "/" ? "text-emerald-600 font-semibold" : "text-slate-600"
              }`}
            >
              Home
            </Link>
            <Link
              href="/products"
              className={`transition-colors hover:text-emerald-700 ${
                pathname.startsWith("/products")
                  ? "text-emerald-600 font-semibold"
                  : "text-slate-600"
              }`}
            >
              Marketplace
            </Link>
            <Link
              href="/#for-whom"
              className="text-slate-600 hover:text-emerald-700 transition-colors"
            >
              For Whom
            </Link>
            <Link
              href="/#benefits"
              className="text-slate-600 hover:text-emerald-700 transition-colors"
            >
              Benefits
            </Link>
            {isAuthenticated && user?.role === "BUYER" && (
              <Link
                href="/orders"
                className={`transition-colors hover:text-emerald-700 ${
                  pathname === "/orders" ? "text-emerald-600 font-semibold" : "text-slate-600"
                }`}
              >
                My Orders
              </Link>
            )}
          </nav>

          {/* Search Bar - Desktop */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex items-center relative flex-1 max-w-xs xl:max-w-sm"
          >
            <input
              type="text"
              placeholder="Search bananas, rice, cassava..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100/90 border border-slate-200 rounded-full py-2 pl-10 pr-4 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          </form>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Wishlist Button (Buyer / Guest) */}
            {isBuyerOrGuest && (
              <Link
                href="/wishlist"
                title="Saved Wishlist"
                className={`relative p-2.5 rounded-full transition-colors ${
                  pathname === "/wishlist"
                    ? "text-emerald-700 bg-emerald-50"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <Heart
                  className={`w-5 h-5 ${
                    wishlistItemCount > 0 ? "fill-rose-500 text-rose-500" : ""
                  }`}
                />
                {wishlistItemCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-emerald-600 text-[10px] font-bold text-white flex items-center justify-center">
                    {wishlistItemCount}
                  </span>
                )}
              </Link>
            )}

            {/* Messages Button (Buyer only) */}
            {isAuthenticated && user?.role === "BUYER" && (
              <Link
                href="/messages"
                title="Direct Messages"
                className="relative p-2.5 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                <MessageSquare className="w-5 h-5" />
              </Link>
            )}

            {/* Cart Button (Buyer / Guest) */}
            {isBuyerOrGuest && (
              <Link
                href="/cart"
                className="relative p-2.5 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                title="Cart"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartItemCount > 0 && (
                  <span className="absolute top-1 right-1 w-5 h-5 rounded-full bg-emerald-600 text-xs font-bold text-white flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </Link>
            )}

            {/* Auth Dropdown or Login / Register */}
            {isAuthenticated && displayUser ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 hover:border-emerald-500 text-sm transition-all focus:outline-none"
                >
                  <div className="w-7 h-7 rounded-full bg-emerald-100 border border-emerald-200 overflow-hidden flex items-center justify-center text-xs font-bold text-emerald-800 shrink-0">
                    {displayUser.profileImage ? (
                      <Image
                        src={displayUser.profileImage}
                        alt={displayName}
                        width={28}
                        height={28}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      displayName.charAt(0).toUpperCase()
                    )}
                  </div>
                  <span className="hidden sm:inline font-medium text-xs text-slate-800 max-w-[120px] truncate">
                    {displayName}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-60 rounded-2xl bg-white border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                    onMouseLeave={() => setUserMenuOpen(false)}
                  >
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <p className="text-xs font-semibold text-slate-900 truncate">
                        {displayName}
                      </p>
                      {displayUser.email && (
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {displayUser.email}
                        </p>
                      )}
                      <p className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider mt-1">
                        Role: {displayUser.role}
                      </p>
                    </div>

                    {displayUser.role === "PRODUCER" ? (
                      <Link
                        href="/producer/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 hover:text-emerald-700 transition-colors"
                      >
                        <User className="w-4 h-4 text-emerald-600" />
                        Farm & Personal Profile
                      </Link>
                    ) : (
                      <Link
                        href="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 hover:text-emerald-700 transition-colors"
                      >
                        <User className="w-4 h-4 text-emerald-600" />
                        My Profile & Password
                      </Link>
                    )}

                    {displayUser.role === "PRODUCER" && (
                      <Link
                        href="/producer/dashboard"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 hover:text-emerald-700 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-emerald-600" />
                        Producer Dashboard
                      </Link>
                    )}

                    {displayUser.role === "DRIVER" && (
                      <Link
                        href="/driver/dashboard"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 hover:text-emerald-700 transition-colors"
                      >
                        <Truck className="w-4 h-4 text-emerald-600" />
                        Driver Dashboard
                      </Link>
                    )}

                    {displayUser.role === "BUYER" && (
                      <>
                        <Link
                          href="/wishlist"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 hover:text-emerald-700 transition-colors"
                        >
                          <Heart className="w-4 h-4 text-rose-500" />
                          My Wishlist {wishlistItemCount > 0 ? `(${wishlistItemCount})` : ""}
                        </Link>

                        <Link
                          href="/messages"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 hover:text-emerald-700 transition-colors"
                        >
                          <MessageSquare className="w-4 h-4 text-emerald-600" />
                          Direct Messages
                        </Link>

                        <Link
                          href="/orders"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 hover:text-emerald-700 transition-colors"
                        >
                          <Package className="w-4 h-4 text-emerald-600" />
                          My Orders
                        </Link>

                        <Link
                          href="/cart"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 hover:text-emerald-700 transition-colors"
                        >
                          <ShoppingBag className="w-4 h-4 text-emerald-600" />
                          My Cart ({cartItemCount})
                        </Link>
                      </>
                    )}

                    <div className="my-1 border-t border-slate-100" />

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-rose-600 hover:bg-rose-50 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  href="/login"
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="btn-primary text-xs py-2 px-5"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-4 shadow-md">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-600"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </form>

          <nav className="flex flex-col space-y-1 text-sm font-medium">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50"
            >
              Home
            </Link>
            <Link
              href="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50"
            >
              Marketplace
            </Link>
            <Link
              href="/#for-whom"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50"
            >
              For Whom
            </Link>
            <Link
              href="/#benefits"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50"
            >
              Benefits
            </Link>
            {isAuthenticated && displayUser && (
              <div className="pt-2 border-t border-slate-100 space-y-1">
                <div className="flex items-center gap-3 px-3 py-2 bg-slate-50 rounded-xl mb-1">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-200 overflow-hidden flex items-center justify-center text-xs font-bold text-emerald-800 shrink-0">
                    {displayUser.profileImage ? (
                      <Image
                        src={displayUser.profileImage}
                        alt={displayName}
                        width={32}
                        height={32}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      displayName.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-900 truncate">
                      {displayName}
                    </p>
                    {displayUser.email && (
                      <p className="text-[11px] text-slate-500 truncate">
                        {displayUser.email}
                      </p>
                    )}
                  </div>
                </div>

                <Link
                  href={displayUser.role === "PRODUCER" ? "/producer/profile" : "/profile"}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50 text-xs font-medium"
                >
                  <User className="w-4 h-4 text-emerald-600" />
                  {displayUser.role === "PRODUCER" ? "Farm & Personal Profile" : "My Profile & Password"}
                </Link>

                {displayUser.role === "BUYER" && (
                  <>
                    <Link
                      href="/wishlist"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50 text-xs font-medium"
                    >
                      <Heart className="w-4 h-4 text-rose-500" />
                      My Wishlist {wishlistItemCount > 0 ? `(${wishlistItemCount})` : ""}
                    </Link>
                    <Link
                      href="/messages"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50 text-xs font-medium"
                    >
                      <MessageSquare className="w-4 h-4 text-emerald-600" />
                      Direct Messages
                    </Link>
                    <Link
                      href="/orders"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50 text-xs font-medium"
                    >
                      <Package className="w-4 h-4 text-emerald-600" />
                      My Orders
                    </Link>
                  </>
                )}

                {displayUser.role === "PRODUCER" && (
                  <Link
                    href="/producer/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-emerald-700 hover:bg-emerald-50 text-xs font-semibold"
                  >
                    <LayoutDashboard className="w-4 h-4 text-emerald-600" />
                    Producer Dashboard
                  </Link>
                )}

                {displayUser.role === "DRIVER" && (
                  <Link
                    href="/driver/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-emerald-700 hover:bg-emerald-50 text-xs font-semibold"
                  >
                    <Truck className="w-4 h-4 text-emerald-600" />
                    Driver Dashboard
                  </Link>
                )}

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-rose-600 hover:bg-rose-50 text-xs font-medium text-left"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  Sign Out
                </button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
