"use client";

import React from "react";
import Link from "next/link";
import {
  Truck,
  User,
  ShieldCheck,
  AlertTriangle,
  Clock,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";
import { useGetProfileQuery } from "@/redux/features/auth/authApi";
import { useAppSelector } from "@/redux/hooks";

export default function DriverProfilePage() {
  const { user } = useAppSelector((state) => state.auth);
  const { data } = useGetProfileQuery();

  const profile = data?.data || user;
  const driver = profile?.driverProfile;
  const status = driver?.verificationStatus || "Pending";

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="border-b border-forest-800 pb-5">
        <h1 className="font-serif text-2xl font-bold text-white">Driver & Vehicle Profile</h1>
        <p className="text-xs text-white/60 mt-0.5">
          View your registered logistics vehicle, license verification status, and contact
          information.
        </p>
      </div>

      {/* Verification Status Card */}
      <div
        className={`p-6 rounded-3xl border ${
          status === "Accepted"
            ? "bg-emerald-950/40 border-emerald-500/50"
            : status === "Rejected"
            ? "bg-red-950/40 border-red-500/50"
            : "bg-amber-950/40 border-amber-500/50"
        } space-y-3`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {status === "Accepted" && (
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
            )}
            {status === "Pending" && (
              <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
            )}
            {status === "Rejected" && (
              <div className="w-10 h-10 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
            )}

            <div>
              <h3 className="font-serif font-bold text-lg text-white">
                Verification Status: {status}
              </h3>
              <p className="text-xs text-white/70">
                {status === "Accepted" && "Your driving credentials and vehicle are fully certified."}
                {status === "Pending" && "Our safety compliance team is inspecting your driving license and registration."}
                {status === "Rejected" && `Application rejected: ${driver?.rejectionReason || "Incomplete documentation"}`}
              </p>
            </div>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-xs font-bold ${
              status === "Accepted"
                ? "bg-emerald-500/30 text-emerald-300 border border-emerald-500/50"
                : status === "Rejected"
                ? "bg-red-500/30 text-red-300 border border-red-500/50"
                : "bg-amber-500/30 text-amber-300 border border-amber-500/50"
            }`}
          >
            {status}
          </span>
        </div>

        {status === "Rejected" && (
          <div className="pt-2">
            <Link
              href="/onboarding/driver"
              className="btn-primary text-xs py-2 px-4 inline-flex items-center gap-2"
            >
              Re-upload Vehicle Documents
            </Link>
          </div>
        )}
      </div>

      {/* Vehicle Details Card */}
      <div className="bg-[#071f11] border border-forest-700/60 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex items-center gap-2 border-b border-forest-800 pb-3">
          <Truck className="w-5 h-5 text-emerald-400" />
          <h2 className="font-serif font-bold text-lg text-white">Vehicle Specifications</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          <div>
            <span className="text-white/50 block mb-1">Vehicle Classification</span>
            <p className="font-bold text-white text-sm">
              {driver?.vehicleType || "Not Specified"}
            </p>
          </div>

          <div>
            <span className="text-white/50 block mb-1">License Plate Number</span>
            <p className="font-mono font-bold text-emerald-400 text-sm">
              {driver?.licensePlate || "Pending Assignment"}
            </p>
          </div>

          <div>
            <span className="text-white/50 block mb-1">Base of Operations</span>
            <p className="font-bold text-white text-sm flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              {profile?.city || "Abidjan, Côte d'Ivoire"}
            </p>
          </div>

          <div>
            <span className="text-white/50 block mb-1">Dispatch Capability</span>
            <p className="font-bold text-emerald-400 text-sm">Active on Agro-Logistics Grid</p>
          </div>
        </div>
      </div>

      {/* Driver Contact Card */}
      <div className="bg-[#071f11] border border-forest-700/60 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex items-center gap-2 border-b border-forest-800 pb-3">
          <User className="w-5 h-5 text-emerald-400" />
          <h2 className="font-serif font-bold text-lg text-white">Driver Identity</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          <div>
            <span className="text-white/50 block mb-1">Full Name</span>
            <p className="font-bold text-white text-sm">{profile?.fullName || "Driver"}</p>
          </div>

          <div>
            <span className="text-white/50 block mb-1">Registered Email</span>
            <p className="font-bold text-white text-sm flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-emerald-400" />
              {profile?.email}
            </p>
          </div>

          <div>
            <span className="text-white/50 block mb-1">Phone Number</span>
            <p className="font-bold text-white text-sm flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              {profile?.phoneNumber || "Not provided"}
            </p>
          </div>

          <div>
            <span className="text-white/50 block mb-1">Platform Role</span>
            <p className="font-bold text-emerald-400 text-sm">DRIVER</p>
          </div>
        </div>
      </div>
    </div>
  );
}
