"use client";

import React, { useState } from "react";
import Link from "next/link";
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
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { logout } from "@/redux/features/auth/authSlice";
import { useGetCartQuery, useGetWishlistQuery } from "@/redux/features/shopping/shoppingApi";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Only query cart and wishlist if authenticated
  const { data: cartData } = useGetCartQuery(undefined, {
    skip: !isAuthenticated,
  });
  const { data: wishlistData } = useGetWishlistQuery(undefined, {
    skip: !isAuthenticated,
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
    dispatch(logout());
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-forest-800/40 bg-[#061a10]/95 backdrop-blur-md text-white transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0 group">
            <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-emerald-600 via-primary-500 to-emerald-400 p-0.5 shadow-md shadow-emerald-950/40 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#061a10] rounded-full flex items-center justify-center">
                <Sprout className="w-6 h-6 text-emerald-400 group-hover:text-emerald-300 transition-colors" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-2xl font-bold tracking-tight text-white group-hover:text-emerald-200 transition-colors">
                Agro<span className="text-emerald-400 font-sans font-extrabold ml-0.5">Connect</span>
              </span>
              <span className="text-[10px] uppercase tracking-widest text-emerald-400/80 font-medium">
                Côte d&apos;Ivoire
              </span>
            </div>
          </Link>

          {/* Center Navigation Links - Desktop */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium">
            <Link
              href="/"
              className={`transition-colors hover:text-emerald-300 ${
                pathname === "/" ? "text-emerald-400 font-semibold" : "text-white/80"
              }`}
            >
              Home
            </Link>
            <Link
              href="/products"
              className={`transition-colors hover:text-emerald-300 ${
                pathname.startsWith("/products")
                  ? "text-emerald-400 font-semibold"
                  : "text-white/80"
              }`}
            >
              Marketplace
            </Link>
            <Link
              href="/#for-whom"
              className="text-white/80 hover:text-emerald-300 transition-colors"
            >
              For Whom
            </Link>
            <Link
              href="/#benefits"
              className="text-white/80 hover:text-emerald-300 transition-colors"
            >
              Benefits
            </Link>
            {isAuthenticated && (
              <Link
                href="/orders"
                className={`transition-colors hover:text-emerald-300 ${
                  pathname === "/orders" ? "text-emerald-400 font-semibold" : "text-white/80"
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
              className="w-full bg-forest-900/60 border border-forest-700/60 rounded-full py-2 pl-10 pr-4 text-xs text-white placeholder-white/40 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
            />
            <Search className="w-4 h-4 text-white/40 absolute left-3 pointer-events-none" />
          </form>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Wishlist Button */}
            {isAuthenticated && (
              <Link
                href="/products"
                title="Wishlist"
                className="relative p-2.5 rounded-full text-white/80 hover:text-white hover:bg-forest-800/60 transition-colors"
              >
                <Heart className="w-5 h-5" />
                {wishlistItemCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-emerald-500 text-[10px] font-bold text-white flex items-center justify-center">
                    {wishlistItemCount}
                  </span>
                )}
              </Link>
            )}

            {/* Messages Button */}
            {isAuthenticated && (
              <Link
                href="/messages"
                title="Direct Messages"
                className="relative p-2.5 rounded-full text-white/80 hover:text-white hover:bg-forest-800/60 transition-colors"
              >
                <MessageSquare className="w-5 h-5" />
              </Link>
            )}

            {/* Cart Button */}
            <Link
              href="/cart"
              className="relative p-2.5 rounded-full text-white/80 hover:text-white hover:bg-forest-800/60 transition-colors"
              title="Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartItemCount > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 rounded-full bg-emerald-500 text-xs font-bold text-white flex items-center justify-center animate-pulse">
                  {cartItemCount}
                </span>
              )}
            </Link>

            {/* Auth Dropdown or Login / Register */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-forest-900/80 border border-forest-700/70 hover:border-emerald-500 text-sm transition-all focus:outline-none"
                >
                  <div className="w-7 h-7 rounded-full bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-xs font-bold text-emerald-300">
                    {user.fullName?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <span className="hidden sm:inline font-medium text-xs text-white max-w-[100px] truncate">
                    {user.fullName || "User"}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-white/60" />
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#092316] border border-forest-700/70 shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                    onMouseLeave={() => setUserMenuOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-forest-800">
                      <p className="text-xs font-semibold text-white truncate">{user.fullName}</p>
                      <p className="text-[11px] text-emerald-400 font-medium">
                        Role: {user.role}
                      </p>
                    </div>

                    {user.role === "PRODUCER" && (
                      <Link
                        href="/producer/dashboard"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-white/90 hover:bg-forest-800/80 hover:text-emerald-300 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-emerald-400" />
                        Producer Dashboard
                      </Link>
                    )}

                    {user.role === "DRIVER" && (
                      <Link
                        href="/driver/dashboard"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-white/90 hover:bg-forest-800/80 hover:text-emerald-300 transition-colors"
                      >
                        <Truck className="w-4 h-4 text-emerald-400" />
                        Driver Dashboard
                      </Link>
                    )}

                    <Link
                      href="/messages"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-white/90 hover:bg-forest-800/80 hover:text-emerald-300 transition-colors"
                    >
                      <MessageSquare className="w-4 h-4 text-emerald-400" />
                      Direct Messages
                    </Link>

                    <Link
                      href="/orders"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-white/90 hover:bg-forest-800/80 hover:text-emerald-300 transition-colors"
                    >
                      <Package className="w-4 h-4 text-emerald-400" />
                      My Orders
                    </Link>

                    <Link
                      href="/cart"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-white/90 hover:bg-forest-800/80 hover:text-emerald-300 transition-colors"
                    >
                      <ShoppingBag className="w-4 h-4 text-emerald-400" />
                      My Cart ({cartItemCount})
                    </Link>

                    <div className="my-1 border-t border-forest-800" />

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-red-300 hover:bg-red-950/40 hover:text-red-200 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4 text-red-400" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  href="/login"
                  className="px-4 py-2 text-xs font-semibold text-white/90 hover:text-white transition-colors"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-xs font-semibold rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-950/40 transition-all hover:scale-105 active:scale-95"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-white/80 hover:text-white focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#061a10] border-b border-forest-800 px-4 pt-3 pb-6 space-y-4">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-forest-900 border border-forest-700 rounded-xl py-2 pl-10 pr-4 text-sm text-white placeholder-white/40 focus:outline-none focus:border-emerald-500"
            />
            <Search className="w-4 h-4 text-white/40 absolute left-3 top-3" />
          </form>

          <nav className="flex flex-col space-y-2 text-sm font-medium">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-white hover:bg-forest-800"
            >
              Home
            </Link>
            <Link
              href="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-white hover:bg-forest-800"
            >
              Marketplace
            </Link>
            <Link
              href="/#for-whom"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-white/80 hover:bg-forest-800"
            >
              For Whom
            </Link>
            <Link
              href="/#benefits"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-white/80 hover:bg-forest-800"
            >
              Benefits
            </Link>
            {isAuthenticated && (
              <>
                <Link
                  href="/messages"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg text-white hover:bg-forest-800"
                >
                  Messages
                </Link>
                <Link
                  href="/orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg text-white hover:bg-forest-800"
                >
                  My Orders
                </Link>
              </>
            )}
            {isAuthenticated && user?.role === "PRODUCER" && (
              <Link
                href="/producer/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-emerald-400 hover:bg-forest-800 font-semibold"
              >
                Producer Dashboard
              </Link>
            )}
            {isAuthenticated && user?.role === "DRIVER" && (
              <Link
                href="/driver/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-emerald-400 hover:bg-forest-800 font-semibold"
              >
                Driver Dashboard
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
