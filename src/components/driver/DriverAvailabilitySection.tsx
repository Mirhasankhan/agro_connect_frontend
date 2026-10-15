"use client";

import React, { useState } from "react";
import {
  Leaf,
  Loader2,
  AlertTriangle,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  useGetProfileQuery,
  useToggleOnlineStatusMutation,
} from "@/redux/features/auth/authApi";
import { useAppSelector } from "@/redux/hooks";

interface DriverAvailabilitySectionProps {
  activeDeliveriesCount?: number;
}

export default function DriverAvailabilitySection({
  activeDeliveriesCount = 0,
}: DriverAvailabilitySectionProps) {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  const { data: profileData, isLoading: isProfileLoading } = useGetProfileQuery(
    undefined,
    { skip: !isAuthenticated }
  );

  const [toggleOnlineStatus, { isLoading: isToggling }] =
    useToggleOnlineStatusMutation();

  const driverUser = profileData?.data || user;
  const driverProfile = driverUser?.driverProfile;
  const isAvailable = Boolean(driverProfile?.isAvailable);
  const verificationStatus = driverProfile?.verificationStatus || "Pending";
  const isAccepted = verificationStatus === "Accepted";
  const isRejected = verificationStatus === "Rejected";

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Dynamic location formatted cleanly without arbitrary abbreviations
  const userCity = driverUser?.city;
  const userRegion = driverUser?.region;
  const locationParts = [userCity, userRegion].filter(Boolean);
  const locationDisplay =
    locationParts.length > 0
      ? locationParts.join(", ")
      : "Central Hub";

  const handleToggle = async () => {
    setErrorMessage(null);

    if (!isAccepted) {
      const msg = isRejected
        ? "Your driver verification was rejected. Please review your profile documents."
        : "Your driver verification is pending approval. You cannot go online until approved.";
      toast.warn(msg);
      setErrorMessage(msg);
      return;
    }

    if (isAvailable && activeDeliveriesCount > 0) {
      const msg = `You have ${activeDeliveriesCount} active delivery in progress. Complete delivery before going offline.`;
      toast.error(msg);
      setErrorMessage(msg);
      return;
    }

    try {
      const response = await toggleOnlineStatus().unwrap();
      const message =
        response?.message ||
        `You are now ${!isAvailable ? "Online" : "Offline"}`;
      toast.success(message);
    } catch (err: any) {
      const errMsg =
        err?.data?.message ||
        err?.message ||
        "Failed to update availability. Please try again.";
      setErrorMessage(errMsg);
      toast.error(errMsg);
    }
  };

  return (
    <div className="w-full flex flex-col items-center select-none">
      {/* The Main Driver Status Card */}
      <div
        className={`relative w-full max-w-[370px] rounded-[28px] overflow-hidden transition-all duration-300 shadow-xl ${
          isAvailable
            ? "bg-gradient-to-b from-[#1b6b3a] via-[#145a2f] to-[#0e4422] text-white shadow-emerald-950/25"
            : "bg-gradient-to-b from-[#252c38] via-[#1e2430] to-[#161a23] text-white shadow-slate-950/35"
        }`}
      >
        {/* Card Header Area */}
        <div className="pt-6 px-6 pb-1">
          <div className="flex items-start justify-between">
            <div className="space-y-0.5">            
              <h2 className="text-[26px] font-bold text-white tracking-tight leading-tight">
                {isAvailable ? "You're Online" : "You're Offline"}
              </h2>
              <p
                className={`text-xs font-normal pt-0.5 ${
                  isAvailable ? "text-[#d1fae5]/80" : "text-slate-300/80"
                }`}
              >
                {isAvailable
                  ? "You're visible to Admins for delivery assignments"
                  : "Go online to receive delivery requests"}
              </p>
            </div>

            {/* Offline Leaf Badge */}
            {!isAvailable && (
              <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 shrink-0 shadow-sm">
                <Leaf className="w-4 h-4 text-slate-300 stroke-[1.8]" />
              </div>
            )}
          </div>
        </div>

        {/* Center Dial & Action Area */}
        <div className="py-6 flex flex-col items-center justify-center">
          {/* Outer Concentric Ring */}
          <div
            className={`w-36 h-36 rounded-full flex items-center justify-center transition-all duration-300 ${
              isAvailable
                ? "bg-[#0e4423]/70 border border-[#4ade80]/20 shadow-inner"
                : "bg-[#181d26]/80 border border-white/10"
            }`}
          >
            {/* Interactive Inner Button */}
            <button
              type="button"
              onClick={handleToggle}
              disabled={isToggling || isProfileLoading || !isAccepted}
              title={
                !isAccepted
                  ? "Verification required to go online"
                  : isAvailable
                  ? "Click to go Offline"
                  : "Click to go Online"
              }
              aria-label={isAvailable ? "Tap to go offline" : "Tap to go online"}
              className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer active:scale-95 hover:scale-105 focus:outline-none focus:ring-4 ${
                !isAccepted
                  ? "opacity-60 cursor-not-allowed"
                  : isAvailable
                  ? "bg-[#22c55e] hover:bg-[#16a34a] shadow-md shadow-emerald-950/30 focus:ring-emerald-400/40"
                  : "bg-[#ef4444] hover:bg-[#dc2626] shadow-[0_0_32px_rgba(239,68,68,0.5)] focus:ring-rose-400/40"
              }`}
            >
              {isToggling ? (
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              ) : isAvailable ? (
                /* Online Icon: Clean white outline navigation arrow */
                <svg
                  className="w-8 h-8 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="3 11 22 2 13 21 11 13 3 11" />
                </svg>
              ) : (
                /* Offline Icon: Clean white outline circular ring */
                <div className="w-7 h-7 rounded-full border-[2.6px] border-white" />
              )}
            </button>
          </div>

          {/* Action Prompt */}
          <button
            type="button"
            onClick={handleToggle}
            disabled={isToggling || isProfileLoading || !isAccepted}
            className={`mt-4 text-xs sm:text-sm font-medium transition-colors hover:underline focus:outline-none cursor-pointer ${
              isAvailable
                ? "text-[#bbf7d0]/90 hover:text-white"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {isToggling
              ? "Updating status..."
              : isAvailable
              ? "Tap to go offline"
              : "Tap to go online"}
          </button>
        </div>

      </div>

      {/* Warning or Error Messages if present */}
      {errorMessage && (
        <div className="mt-3 max-w-[370px] w-full flex items-center gap-2 text-xs text-rose-800 bg-rose-50 border border-rose-200 rounded-xl px-3.5 py-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {!isAccepted && (
        <div className="mt-3 max-w-[370px] w-full flex items-center gap-2 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3.5 py-2.5">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>
            {isRejected
              ? "Driver verification rejected. Please update documents in profile."
              : "Driver verification pending. You can go online once verified."}
          </span>
        </div>
      )}
    </div>
  );
}
