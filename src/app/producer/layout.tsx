"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Sprout,
  LayoutDashboard,
  Package,
  ShoppingBag,
  DollarSign,
  User,
  LogOut,
  Menu,
  X,
  Plus,
  ShieldCheck,
  AlertTriangle,
  Clock,
  MessageSquare,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { logout } from "@/redux/features/auth/authSlice";
import { useGetProfileQuery } from "@/redux/features/auth/authApi";

export default function ProducerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const { data: profileData } = useGetProfileQuery(undefined, {
    skip: !isAuthenticated,
  });

  const producerUser = profileData?.data || user;
  const producerProfile = producerUser?.producerProfile;
  const verificationStatus = producerProfile?.verificationStatus || "Pending";
  const isAccepted = verificationStatus === "Accepted";

  const handleLogout = () => {
    dispatch(logout());
    if (typeof document !== "undefined") {
      document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
    router.push("/");
  };

  const navItems = [
    {
      label: "Dashboard",
      href: "/producer/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "My Harvests & Products",
      href: "/producer/products",
      icon: Package,
    },
    {
      label: "Orders to Fulfill",
      href: "/producer/orders",
      icon: ShoppingBag,
    },
    {
      label: "Earnings & Payouts",
      href: "/producer/earnings",
      icon: DollarSign,
    },
    {
      label: "Buyer Inquiries & Chat",
      href: "/producer/messages",
      icon: MessageSquare,
    },
    {
      label: "Farm Profile",
      href: "/producer/profile",
      icon: User,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      {/* SIDEBAR - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200 shrink-0 select-none">
        {/* Brand */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <Link href="/producer/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
              <Sprout className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <span className="font-serif font-bold text-lg text-slate-900">AgroConnect</span>
              <span className="block text-[10px] uppercase tracking-widest text-emerald-600 font-bold">
                Producer Hub
              </span>
            </div>
          </Link>
        </div>

        {/* Farm Preview */}
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/70">
          <p className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
            Active Farm
          </p>
          <p className="font-bold text-sm text-slate-900 truncate mt-0.5">
            {producerProfile?.farmName || producerProfile?.companyName || "My Farm"}
          </p>
          <div className="flex items-center gap-1.5 mt-1.5">
            {verificationStatus === "Accepted" && (
              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-bold px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                Verified Producer
              </span>
            )}
            {verificationStatus === "Pending" && (
              <span className="inline-flex items-center gap-1 text-[10px] text-amber-700 font-bold px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200">
                <Clock className="w-3 h-3 text-amber-600" />
                Review Pending
              </span>
            )}
            {verificationStatus === "Rejected" && (
              <span className="inline-flex items-center gap-1 text-[10px] text-red-700 font-bold px-2 py-0.5 rounded-full bg-red-50 border border-red-200">
                <AlertTriangle className="w-3 h-3 text-red-600" />
                Action Required
              </span>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/producer/dashboard" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions - Isolated to Producer context */}
        <div className="p-4 border-t border-slate-200">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors text-left"
          >
            <LogOut className="w-4 h-4 text-red-500" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MOBILE DRAWER */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative w-72 bg-white border-r border-slate-200 p-6 flex flex-col z-10 shadow-xl">
            <div className="flex items-center justify-between pb-6 border-b border-slate-200">
              <span className="font-serif font-bold text-lg text-slate-900">AgroConnect</span>
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(false)}
                className="p-1 text-slate-500 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 py-6 space-y-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold ${
                      isActive
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-3 px-3.5 py-2.5 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl"
            >
              <LogOut className="w-4 h-4 text-red-500" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 border-b border-slate-200 bg-white/95 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between gap-4 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="font-serif font-bold text-lg text-slate-900 truncate">Producer Workspace</h2>
          </div>

          <div className="flex items-center gap-3">
            {isAccepted ? (
              <Link
                href="/producer/products/create"
                className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Add Harvest</span>
              </Link>
            ) : (
              <button
                type="button"
                disabled
                title="Adding new harvest is disabled while your producer verification is pending approval."
                className="btn-primary opacity-50 cursor-not-allowed text-xs py-2 px-3.5 flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Add Harvest (Pending)</span>
              </button>
            )}

            <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center font-bold text-xs text-emerald-800">
              {producerUser?.fullName?.charAt(0).toUpperCase() || "P"}
            </div>
          </div>
        </header>

        {/* Global Verification Status Banner */}
        {verificationStatus === "Pending" && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 sm:px-8 py-3 text-xs text-amber-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Verification in progress:</strong> Your farm documents are being reviewed
                by Agro Connect admins. Adding new harvests is disabled until your account is Accepted.
              </span>
            </div>
            <Link
              href="/producer/profile"
              className="text-amber-800 underline font-semibold hover:text-amber-950 shrink-0 hidden sm:inline"
            >
              Check documents
            </Link>
          </div>
        )}

        {verificationStatus === "Rejected" && (
          <div className="bg-red-50 border-b border-red-200 px-4 sm:px-8 py-3 text-xs text-red-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>
                <strong>Action needed:</strong> Your verification was rejected: &ldquo;
                {producerProfile?.rejectionReason || "Incomplete documentation"}&rdquo;. Please
                update your farm documents.
              </span>
            </div>
            <Link
              href="/producer/profile"
              className="text-red-800 underline font-semibold hover:text-red-950 shrink-0"
            >
              Update Profile
            </Link>
          </div>
        )}

        {/* Child Pages */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
