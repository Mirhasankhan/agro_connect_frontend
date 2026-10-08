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
      <div className="border-b border-slate-200 pb-5">
        <h1 className="font-serif text-2xl font-bold text-slate-900">Driver & Vehicle Profile</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          View your registered logistics vehicle, license verification status, and contact
          information.
        </p>
      </div>

      {/* Verification Status Card */}
      <div
        className={`p-6 rounded-2xl border ${
          status === "Accepted"
            ? "bg-emerald-50 border-emerald-200"
            : status === "Rejected"
            ? "bg-red-50 border-red-200"
            : "bg-amber-50 border-amber-200"
        } space-y-3 shadow-sm`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {status === "Accepted" && (
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
            )}
            {status === "Pending" && (
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
            )}
            {status === "Rejected" && (
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
            )}

            <div>
              <h3 className="font-serif font-bold text-lg text-slate-900">
                Verification Status: {status}
              </h3>
              <p className="text-xs text-slate-600">
                {status === "Accepted" && "Your driving credentials and vehicle are fully certified."}
                {status === "Pending" && "Our safety compliance team is inspecting your driving license and registration."}
                {status === "Rejected" && `Application rejected: ${driver?.rejectionReason || "Incomplete documentation"}`}
              </p>
            </div>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-xs font-bold ${
              status === "Accepted"
                ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                : status === "Rejected"
                ? "bg-red-100 text-red-800 border border-red-200"
                : "bg-amber-100 text-amber-800 border border-amber-200"
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
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Truck className="w-5 h-5 text-emerald-600" />
          <h2 className="font-serif font-bold text-lg text-slate-900">Vehicle Specifications</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          <div>
            <span className="text-slate-500 block mb-1">Vehicle Classification</span>
            <p className="font-bold text-slate-900 text-sm">
              {driver?.vehicleType || "Not Specified"}
            </p>
          </div>

          <div>
            <span className="text-slate-500 block mb-1">License Plate Number</span>
            <p className="font-mono font-bold text-emerald-700 text-sm">
              {driver?.licensePlate || "Pending Assignment"}
            </p>
          </div>

          <div>
            <span className="text-slate-500 block mb-1">Base of Operations</span>
            <p className="font-bold text-slate-900 text-sm flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              {profile?.city || "Abidjan, Côte d'Ivoire"}
            </p>
          </div>

          <div>
            <span className="text-slate-500 block mb-1">Dispatch Capability</span>
            <p className="font-bold text-emerald-700 text-sm">Active on Agro-Logistics Grid</p>
          </div>
        </div>
      </div>

      {/* Driver Contact Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <User className="w-5 h-5 text-emerald-600" />
          <h2 className="font-serif font-bold text-lg text-slate-900">Driver Identity</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          <div>
            <span className="text-slate-500 block mb-1">Full Name</span>
            <p className="font-bold text-slate-900 text-sm">{profile?.fullName || "Driver"}</p>
          </div>

          <div>
            <span className="text-slate-500 block mb-1">Registered Email</span>
            <p className="font-bold text-slate-900 text-sm flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-emerald-600" />
              {profile?.email}
            </p>
          </div>

          <div>
            <span className="text-slate-500 block mb-1">Phone Number</span>
            <p className="font-bold text-slate-900 text-sm flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              {profile?.phoneNumber || "Not provided"}
            </p>
          </div>

          <div>
            <span className="text-slate-500 block mb-1">Platform Role</span>
            <p className="font-bold text-emerald-700 text-sm">DRIVER</p>
          </div>
        </div>
      </div>
    </div>
  );
}
