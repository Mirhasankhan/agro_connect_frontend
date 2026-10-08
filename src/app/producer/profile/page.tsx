"use client";

import React from "react";
import Link from "next/link";
import {
  Sprout,
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

export default function ProducerProfilePage() {
  const { user } = useAppSelector((state) => state.auth);
  const { data } = useGetProfileQuery();

  const profile = data?.data || user;
  const producer = profile?.producerProfile;
  const status = producer?.verificationStatus || "Pending";

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <h1 className="font-serif text-2xl font-bold text-slate-900">Farm & Producer Profile</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Review your registered farmland information, legal documentation, and verification status.
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
                {status === "Accepted" && "Your farmland is fully verified and active for public sales."}
                {status === "Pending" && "Our agricultural compliance officers are reviewing your submitted documents."}
                {status === "Rejected" && `Application rejected: ${producer?.rejectionReason || "Incomplete documentation"}`}
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
              href="/onboarding/producer"
              className="btn-primary text-xs py-2 px-4 inline-flex items-center gap-2"
            >
              Re-upload Required Documents
            </Link>
          </div>
        )}
      </div>

      {/* Farm Details Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Sprout className="w-5 h-5 text-emerald-600" />
          <h2 className="font-serif font-bold text-lg text-slate-900">Farmland Details</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          <div>
            <span className="text-slate-500 block mb-1">Farm / Property Name</span>
            <p className="font-bold text-slate-900 text-sm">
              {producer?.farmName || "Not Provided"}
            </p>
          </div>

          <div>
            <span className="text-slate-500 block mb-1">Producer Classification</span>
            <p className="font-bold text-slate-900 text-sm">
              {producer?.producerType || "Private Farmer"}
            </p>
          </div>

          <div>
            <span className="text-slate-500 block mb-1">Farm Area / Size</span>
            <p className="font-mono font-bold text-emerald-700 text-sm">
              {producer?.farmSize ? `${producer.farmSize} Hectares` : "Not specified"}
            </p>
          </div>

          <div>
            <span className="text-slate-500 block mb-1">Location / Commune</span>
            <p className="font-bold text-slate-900 text-sm flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              {producer?.city || profile?.city || "Ivory Coast"}
            </p>
          </div>

          {producer?.producerType === "Company" && (
            <>
              <div>
                <span className="text-slate-500 block mb-1">Company Registered Name</span>
                <p className="font-bold text-slate-900 text-sm">
                  {producer?.companyName || "N/A"}
                </p>
              </div>

              <div>
                <span className="text-slate-500 block mb-1">RCCM Number</span>
                <p className="font-mono font-bold text-slate-900 text-sm">
                  {producer?.rccmNo || "N/A"}
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Account & Contact Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <User className="w-5 h-5 text-emerald-600" />
          <h2 className="font-serif font-bold text-lg text-slate-900">Contact & Representative</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          <div>
            <span className="text-slate-500 block mb-1">Full Name</span>
            <p className="font-bold text-slate-900 text-sm">{profile?.fullName || "Producer"}</p>
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
            <span className="text-slate-500 block mb-1">User Role</span>
            <p className="font-bold text-emerald-700 text-sm">PRODUCER</p>
          </div>
        </div>
      </div>
    </div>
  );
}
