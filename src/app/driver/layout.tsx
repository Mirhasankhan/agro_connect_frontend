"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Truck,
  LayoutDashboard,
  Navigation,
  DollarSign,
  User,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Store,
  MessageSquare,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { logout } from "@/redux/features/auth/authSlice";
import { useGetProfileQuery } from "@/redux/features/auth/authApi";

export default function DriverLayout({
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

  const driverUser = profileData?.data || user;
  const driverProfile = driverUser?.driverProfile;
  const verificationStatus = driverProfile?.verificationStatus || "Pending";

  const handleLogout = () => {
    dispatch(logout());
    router.push("/login");
  };

  const navItems = [
    {
      label: "Dashboard",
      href: "/driver/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Assigned Deliveries",
      href: "/driver/deliveries",
      icon: Navigation,
    },
    {
      label: "Delivery Earnings",
      href: "/driver/earnings",
      icon: DollarSign,
    },
    {
      label: "Logistics Chat",
      href: "/messages",
      icon: MessageSquare,
    },
    {
      label: "Vehicle & Profile",
      href: "/driver/profile",
      icon: User,
    },
  ];

  return (
    <div className="min-h-screen bg-[#041409] text-white flex">
      {/* SIDEBAR - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#061e10] border-r border-forest-800/80 shrink-0 select-none">
        {/* Brand */}
        <div className="p-6 border-b border-forest-800/80 flex items-center justify-between">
          <Link href="/driver/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
              <Truck className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <span className="font-serif font-bold text-lg text-white">AgroConnect</span>
              <span className="block text-[10px] uppercase tracking-widest text-emerald-400 font-bold">
                Driver Hub
              </span>
            </div>
          </Link>
        </div>

        {/* Vehicle Preview */}
        <div className="px-5 py-4 border-b border-forest-800/60 bg-[#05180d]">
          <p className="text-[11px] text-white/50 uppercase tracking-wider font-semibold">
            Registered Vehicle
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="font-bold text-white text-xs">
              {driverProfile?.vehicleType || "VEHICLE"}
            </span>
            {driverProfile?.licensePlate && (
              <span className="font-mono text-[10px] bg-forest-900 border border-forest-700 px-1.5 py-0.5 rounded text-emerald-400">
                {driverProfile.licensePlate}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 mt-1.5">
            {verificationStatus === "Accepted" && (
              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-300 font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40">
                <ShieldCheck className="w-3 h-3" />
                Verified Driver
              </span>
            )}
            {verificationStatus === "Pending" && (
              <span className="inline-flex items-center gap-1 text-[10px] text-amber-300 font-bold px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40">
                <Clock className="w-3 h-3" />
                License In Review
              </span>
            )}
            {verificationStatus === "Rejected" && (
              <span className="inline-flex items-center gap-1 text-[10px] text-red-300 font-bold px-2 py-0.5 rounded-full bg-red-500/20 border border-red-500/40">
                <AlertTriangle className="w-3 h-3" />
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
              (item.href !== "/driver/dashboard" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-emerald-500 text-white shadow-md shadow-emerald-950"
                    : "text-white/70 hover:text-white hover:bg-forest-900/60"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-forest-800/80 space-y-1.5">
          <Link
            href="/"
            className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs text-white/70 hover:text-white hover:bg-forest-900/60 transition-colors"
          >
            <Store className="w-4 h-4 text-emerald-400" />
            <span>Buyer Marketplace</span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs text-red-300 hover:text-red-200 hover:bg-red-950/40 transition-colors text-left"
          >
            <LogOut className="w-4 h-4 text-red-400" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MOBILE DRAWER */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative w-72 bg-[#061e10] border-r border-forest-800 p-6 flex flex-col z-10">
            <div className="flex items-center justify-between pb-6 border-b border-forest-800">
              <span className="font-serif font-bold text-lg text-white">AgroConnect</span>
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(false)}
                className="p-1 text-white/70 hover:text-white"
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
                      isActive ? "bg-emerald-500 text-white" : "text-white/70 hover:text-white"
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
              className="flex items-center gap-3 px-3.5 py-2.5 text-xs text-red-300 hover:text-red-200"
            >
              <LogOut className="w-4 h-4 text-red-400" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 border-b border-forest-800/80 bg-[#061a0e]/90 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between gap-4 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 text-white/80 hover:text-white"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="font-serif font-bold text-lg text-white truncate">Driver Operations</h2>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/driver/deliveries"
              className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5 shadow-md shadow-emerald-950/60"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>My Deliveries</span>
            </Link>

            <div className="w-8 h-8 rounded-full bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center font-bold text-xs text-emerald-300">
              {driverUser?.fullName?.charAt(0).toUpperCase() || "D"}
            </div>
          </div>
        </header>

        {/* Global Verification Status Banner */}
        {verificationStatus === "Pending" && (
          <div className="bg-amber-950/60 border-b border-amber-800/60 px-4 sm:px-8 py-3 text-xs text-amber-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>Document verification in progress:</strong> Your driving license, vehicle
                registration, and insurance are being reviewed. You will receive delivery dispatch
                requests once activated.
              </span>
            </div>
            <Link
              href="/driver/profile"
              className="text-amber-300 underline font-semibold hover:text-white shrink-0 hidden sm:inline"
            >
              Review documents
            </Link>
          </div>
        )}

        {verificationStatus === "Rejected" && (
          <div className="bg-red-950/60 border-b border-red-800/60 px-4 sm:px-8 py-3 text-xs text-red-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span>
                <strong>Action needed:</strong> Your driver application was rejected: &ldquo;
                {driverProfile?.rejectionReason || "Invalid vehicle documents"}&rdquo;. Please
                update your registration.
              </span>
            </div>
            <Link
              href="/driver/profile"
              className="text-red-300 underline font-semibold hover:text-white shrink-0"
            >
              Update Registration
            </Link>
          </div>
        )}

        {/* Child Pages */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
