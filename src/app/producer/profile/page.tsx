"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Sprout,
  User,
  ShieldCheck,
  AlertTriangle,
  Clock,
  MapPin,
  Phone,
  Mail,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  Camera,
  CheckCircle2,
  Loader2,
  Building2,
  FileText,
  ExternalLink,
  Save,
  RotateCcw,
  Image as ImageIcon,
  Info,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { updateProfileData } from "@/redux/features/auth/authSlice";
import {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
} from "@/redux/features/auth/authApi";
import { toast } from "sonner";

export default function ProducerProfilePage() {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  // Fetch real-time profile data (includes user details and producerProfile)
  const {
    data: profileResponse,
    isLoading: isProfileLoading,
    refetch: refetchProfile,
  } = useGetProfileQuery(undefined, {
    skip: !isAuthenticated,
  });

  const [updateProfile, { isLoading: isUpdatingProfile }] =
    useUpdateProfileMutation();
  const [changePassword, { isLoading: isChangingPassword }] =
    useChangePasswordMutation();

  const profile = profileResponse?.data || user;
  const producer = profile?.producerProfile;
  const verificationStatus = producer?.verificationStatus || "Pending";

  // Tab State: "farm" | "personal" | "security"
  const [activeTab, setActiveTab] = useState<"farm" | "personal" | "security">("farm");

  // Personal Profile Form State
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [city, setCity] = useState("");
  const [region, setRegion] = useState("");
  const [address, setAddress] = useState("");

  // Avatar Upload State
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Change Password Form State
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Sync profile data into personal form state when loaded
  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || "");
      setPhoneNumber(profile.phoneNumber || "");
      setCity(profile.city || "");
      setRegion(profile.region || "");
      setAddress(profile.address || "");
    }
  }, [profile]);

  // Clean up avatar preview URL on unmount
  useEffect(() => {
    return () => {
      if (avatarPreview && avatarPreview.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  // Handle Photo Picker
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file (PNG, JPG, JPEG, WEBP)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file must be under 5MB");
      return;
    }

    setAvatarFile(file);
    const objectUrl = URL.createObjectURL(file);
    setAvatarPreview(objectUrl);
    toast.info("Profile photo selected! Click 'Save Changes' to apply.");
  };

  // Submit Personal Profile Update
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      toast.error("Full name cannot be empty");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("fullName", fullName.trim());

      if (phoneNumber.trim()) {
        formData.append("phoneNumber", phoneNumber.trim());
      }
      if (city.trim()) {
        formData.append("city", city.trim());
      }
      if (region.trim()) {
        formData.append("region", region.trim());
      }
      if (address.trim()) {
        formData.append("address", address.trim());
      }
      if (avatarFile) {
        formData.append("profileImage", avatarFile);
      }

      const res = await updateProfile(formData).unwrap();
      toast.success(res?.message || "Profile updated successfully!");

      // Update Redux state immediately
      dispatch(
        updateProfileData({
          fullName: fullName.trim(),
          phoneNumber: phoneNumber.trim(),
          city: city.trim(),
          region: region.trim(),
          address: address.trim(),
        }),
      );

      // Refetch profile data from server
      await refetchProfile();
      setAvatarFile(null);
      setAvatarPreview(null);
    } catch (err: any) {
      const errorMsg =
        err?.data?.message || err?.message || "Failed to update profile";
      toast.error(errorMsg);
    }
  };

  // Submit Change Password
  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!oldPassword) {
      toast.error("Please enter your current password");
      return;
    }

    if (!newPassword) {
      toast.error("Please enter your new password");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New password and confirmation do not match");
      return;
    }

    if (oldPassword === newPassword) {
      toast.error("New password cannot be the same as your current password");
      return;
    }

    try {
      const res = await changePassword({
        oldPassword,
        newPassword,
      }).unwrap();

      toast.success(
        res?.message || "Password changed successfully! Keep it secure.",
      );

      // Clear password inputs
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      const errorMsg =
        err?.data?.message ||
        err?.message ||
        "Failed to change password. Please check your current password.";
      toast.error(errorMsg);
    }
  };

  const currentDisplayImage =
    avatarPreview || profile?.profileImage || null;
  const currentDisplayName =
    fullName.trim() || profile?.fullName || "Agricultural Producer";
  const farmDisplayName =
    producer?.farmName || producer?.companyName || "Registered Farmland";

  // Documents list
  const documents = [
    {
      title: "National Identity / Passport",
      url: producer?.nidUrl,
      type: "Identification",
      desc: "Producer personal identity document used for identity validation.",
    },
    {
      title: "Land Title / Certificate",
      url: producer?.landCertificate,
      type: "Land Tenure",
      desc: "Cadastral ownership deed or official farmland occupancy attestation.",
    },
    {
      title: "Farmland Photo",
      url: producer?.farmPhotoUrl,
      type: "Site Inspection",
      desc: "Verified aerial or field photo of active agricultural cultivation.",
    },
    ...(producer?.producerType === "Company"
      ? [
          {
            title: "Company Registration Certificate",
            url: producer?.companyCertificate,
            type: "Corporate Entity",
            desc: "Official enterprise incorporation certificate.",
          },
          {
            title: "Trade & Property Register (RCCM)",
            url: producer?.rcmUrl,
            type: "Trade Register",
            desc: "Commerce register document (RCCM).",
          },
          {
            title: "Tax Clearance / DGI Attestation",
            url: producer?.taxUrl,
            type: "Tax Compliance",
            desc: "Tax administration declaration and clearance certificate.",
          },
        ]
      : []),
  ];

  if (isProfileLoading && !profile) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <Loader2 className="w-9 h-9 animate-spin text-emerald-600" />
        <p className="text-sm font-medium text-slate-500">
          Loading farm profile & credentials...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Page Header */}
      <div className="border-b border-slate-200 pb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
            <Sprout className="w-4 h-4" />
            <span>Producer Workspace</span>
            <span className="text-slate-400">/</span>
            <span className="text-slate-600">Farm & Personal Profile</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Farm & Producer Profile
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review your verified farmland records, update your personal representative information, and manage account security.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
              verificationStatus === "Accepted"
                ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                : verificationStatus === "Rejected"
                ? "bg-red-100 text-red-800 border border-red-200"
                : "bg-amber-100 text-amber-800 border border-amber-200"
            }`}
          >
            {verificationStatus === "Accepted" && <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />}
            {verificationStatus === "Pending" && <Clock className="w-3.5 h-3.5 text-amber-600" />}
            {verificationStatus === "Rejected" && <AlertTriangle className="w-3.5 h-3.5 text-red-600" />}
            Verification: {verificationStatus}
          </span>
        </div>
      </div>

      {/* Global Status Banner (Pending or Rejected) */}
      {verificationStatus === "Pending" && (
        <div className="p-4 sm:p-5 rounded-2xl border border-amber-200 bg-amber-50/90 text-amber-900 shadow-sm flex items-start gap-3.5">
          <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="font-bold text-sm">Farmland Verification In Review</h3>
            <p className="text-xs text-amber-800 leading-relaxed">
              Your registered agricultural parcels and legal documentation are currently being verified by our regional compliance team. You can view all submitted documents below. Adding new public harvests is enabled once approval is complete.
            </p>
          </div>
        </div>
      )}

      {verificationStatus === "Rejected" && (
        <div className="p-4 sm:p-5 rounded-2xl border border-red-200 bg-red-50/90 text-red-900 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="font-bold text-sm">Farm Verification Requires Revision</h3>
              <p className="text-xs text-red-800 leading-relaxed">
                Reason: &ldquo;{producer?.rejectionReason || "Incomplete or unverifiable documentation"}&rdquo;.
              </p>
            </div>
          </div>
          <Link
            href="/onboarding/producer"
            className="btn-primary text-xs py-2 px-4 shrink-0 shadow-sm"
          >
            Re-upload Documents
          </Link>
        </div>
      )}

      {/* Hero Producer Identity Card */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800" />

        <div className="relative pt-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left">
            {/* Avatar with Camera Trigger */}
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full ring-4 ring-white shadow-md overflow-hidden bg-emerald-100 flex items-center justify-center shrink-0 group">
              {currentDisplayImage ? (
                <Image
                  src={currentDisplayImage}
                  alt={currentDisplayName}
                  fill
                  sizes="112px"
                  className="object-cover"
                />
              ) : (
                <span className="text-3xl sm:text-4xl font-serif font-bold text-emerald-800">
                  {currentDisplayName.charAt(0).toUpperCase()}
                </span>
              )}

              <button
                type="button"
                onClick={() => {
                  setActiveTab("personal");
                  fileInputRef.current?.click();
                }}
                className="absolute inset-0 bg-slate-900/50 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-[2px]"
                title="Change Profile Picture"
              >
                <Camera className="w-5 h-5 mb-0.5" />
                <span className="text-[10px] font-bold">Change</span>
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              onChange={handlePhotoSelect}
              className="hidden"
            />

            <div className="space-y-1.5 min-w-0">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Sprout className="w-3 h-3" />
                  Producer
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {producer?.producerType === "Company" ? "Commercial Agribusiness" : "Private Farmer"}
                </span>
              </div>

              <h2 className="font-serif text-xl sm:text-2xl font-bold text-slate-900 truncate">
                {currentDisplayName}
              </h2>

              <p className="text-xs sm:text-sm font-semibold text-emerald-700 flex items-center justify-center sm:justify-start gap-1.5 truncate">
                <Sprout className="w-4 h-4 shrink-0" />
                <span>{farmDisplayName}</span>
                {producer?.farmLocation && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-500 font-normal flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {producer.farmLocation}
                    </span>
                  </>
                )}
              </p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-500 pt-1">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {profile?.email}
                </span>
                {profile?.phoneNumber && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {profile.phoneNumber}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Metrics / Action */}
          <div className="flex sm:flex-row md:flex-col items-center md:items-end justify-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
            <button
              type="button"
              onClick={() => setActiveTab("personal")}
              className="text-xs font-semibold px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5 text-slate-500" />
              Edit Personal Info
            </button>
            {avatarFile && (
              <span className="text-[11px] text-amber-700 font-bold bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full animate-pulse">
                New photo ready to save
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-2 sm:gap-4 overflow-x-auto select-none">
        <button
          type="button"
          onClick={() => setActiveTab("farm")}
          className={`flex items-center gap-2 py-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all shrink-0 ${
            activeTab === "farm"
              ? "border-emerald-600 text-emerald-700 bg-emerald-50/40 rounded-t-xl"
              : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
          }`}
        >
          <Sprout className="w-4 h-4" />
          <span>Farmland Profile & Legal Docs</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-600 font-normal">
            Read-Only
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("personal")}
          className={`flex items-center gap-2 py-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all shrink-0 ${
            activeTab === "personal"
              ? "border-emerald-600 text-emerald-700 bg-emerald-50/40 rounded-t-xl"
              : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
          }`}
        >
          <User className="w-4 h-4" />
          <span>Personal Representative Details</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800 font-bold">
            Updateable
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("security")}
          className={`flex items-center gap-2 py-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all shrink-0 ${
            activeTab === "security"
              ? "border-emerald-600 text-emerald-700 bg-emerald-50/40 rounded-t-xl"
              : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Change Password</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: FARMLAND PROFILE & COMPLIANCE (READ-ONLY)         */}
      {/* ========================================================= */}
      {activeTab === "farm" && (
        <div className="space-y-8 animate-in fade-in duration-150">
          {/* Read-Only Notice */}
          <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 text-xs text-slate-600 shadow-sm">
            <Info className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-slate-800">
                Official Agricultural Record & Compliance Lock
              </p>
              <p className="leading-relaxed text-slate-600">
                To guarantee agricultural safety, provenance traceability, and fair trade guarantees across Côte d&apos;Ivoire, your verified farm coordinates, land tenure deeds, and corporate registries are locked for direct editing. To request certified revisions to your farmland size or legal entity, please submit a compliance request to Agro Connect administration.
              </p>
            </div>
          </div>

          {/* Farmland Core Specifications */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                  <Sprout className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-serif font-bold text-lg text-slate-900">
                    Farmland Enterprise Specifications
                  </h2>
                  <p className="text-xs text-slate-500">
                    Officially recorded agricultural estate details
                  </p>
                </div>
              </div>

              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                Status: {verificationStatus}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100">
                <span className="text-slate-500 font-medium block mb-1">
                  Farm / Plantation Name
                </span>
                <p className="font-bold text-slate-900 text-sm">
                  {producer?.farmName || "Not specified"}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100">
                <span className="text-slate-500 font-medium block mb-1">
                  Producer Classification
                </span>
                <p className="font-bold text-slate-900 text-sm">
                  {producer?.producerType === "Company"
                    ? "Commercial Company"
                    : "Private Farmer"}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100">
                <span className="text-slate-500 font-medium block mb-1">
                  Total Farmland Surface
                </span>
                <p className="font-mono font-bold text-emerald-700 text-sm">
                  {producer?.farmSize ? `${producer.farmSize} Hectares` : "Not specified"}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100">
                <span className="text-slate-500 font-medium block mb-1">
                  Farm Location / Cadastral Plot
                </span>
                <p className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{producer?.farmLocation || "Ivory Coast"}</span>
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100">
                <span className="text-slate-500 font-medium block mb-1">
                  Producer City & Region
                </span>
                <p className="font-bold text-slate-900 text-sm">
                  {profile?.city || profile?.region
                    ? `${profile.city || ""}${profile.city && profile.region ? ", " : ""}${profile.region || ""}`
                    : "Côte d'Ivoire"}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100">
                <span className="text-slate-500 font-medium block mb-1">
                  Stripe Payout Capability
                </span>
                <p className="font-bold text-slate-900 text-sm truncate">
                  {producer?.stripeAccountId ? (
                    <span className="text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Connected Account
                    </span>
                  ) : (
                    <span className="text-slate-500">AgroConnect Platform Managed</span>
                  )}
                </p>
              </div>

              {/* Company Specific Fields */}
              {producer?.producerType === "Company" && (
                <>
                  <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100">
                    <span className="text-slate-500 font-medium block mb-1">
                      Registered Corporate Name
                    </span>
                    <p className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{producer?.companyName || "N/A"}</span>
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100">
                    <span className="text-slate-500 font-medium block mb-1">
                      RCCM Registry Number
                    </span>
                    <p className="font-mono font-bold text-slate-900 text-sm">
                      {producer?.rccmNo || "N/A"}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100">
                    <span className="text-slate-500 font-medium block mb-1">
                      SIREN Identification
                    </span>
                    <p className="font-mono font-bold text-slate-900 text-sm">
                      {producer?.sirenNo || "N/A"}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Submitted Legal Documents Gallery */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-serif font-bold text-lg text-slate-900">
                    Submitted Certificates & Legal Records
                  </h2>
                  <p className="text-xs text-slate-500">
                    Official files registered during producer onboarding
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {documents.map((doc, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col justify-between gap-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-emerald-600 shrink-0 shadow-xs">
                        {doc.url?.match(/\.(jpeg|jpg|png|webp)/i) ? (
                          <ImageIcon className="w-4 h-4" />
                        ) : (
                          <FileText className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
                          {doc.type}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm">
                          {doc.title}
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {doc.desc}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        doc.url
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {doc.url ? "On File" : "Missing"}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    {doc.url ? (
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Inspect Stored Document</span>
                      </a>
                    ) : (
                      <span className="text-xs text-slate-400 italic">
                        No digital attachment submitted
                      </span>
                    )}

                    <span className="text-[10px] text-slate-400">
                      Encrypted Cloud File
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: PERSONAL REPRESENTATIVE DETAILS (EDITABLE)         */}
      {/* ========================================================= */}
      {activeTab === "personal" && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm animate-in fade-in duration-150">
          <div className="border-b border-slate-100 pb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-serif font-bold text-xl text-slate-900">
                  Update Personal Representative Information
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Update your contact details, operational address, and public profile avatar.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-6">
            {/* Avatar Row */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-full bg-emerald-100 border-2 border-emerald-300 overflow-hidden shrink-0 flex items-center justify-center font-bold text-lg text-emerald-800 shadow-xs">
                  {currentDisplayImage ? (
                    <Image
                      src={currentDisplayImage}
                      alt={currentDisplayName}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  ) : (
                    <span>{currentDisplayName.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Profile Avatar / Photo
                  </h4>
                  <p className="text-xs text-slate-500">
                    Appears in the producer workspace navbar, harvest listings, and buyer chats.
                  </p>
                  {avatarFile && (
                    <p className="text-xs text-emerald-700 font-semibold mt-1">
                      Selected: {avatarFile.name} ({(avatarFile.size / 1024).toFixed(0)} KB)
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {avatarFile && (
                  <button
                    type="button"
                    onClick={() => {
                      setAvatarFile(null);
                      setAvatarPreview(null);
                    }}
                    className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    Remove Selection
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5 shadow-xs"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Choose Photo</span>
                </button>
              </div>
            </div>

            {/* Full Name & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Full Legal Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Yao Kouamé Pascal"
                    required
                    className="w-full bg-slate-50/70 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-medium"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Registered Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={profile?.email || ""}
                    disabled
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-500 cursor-not-allowed font-medium"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Primary account login address cannot be changed.
                </p>
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Phone Number (For Order & Delivery Coordination)
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+225 07 12 34 56 78"
                  className="w-full bg-slate-50/70 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-medium"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            {/* City & Region */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  City / Commune
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Yamoussoukro, Abidjan, Daloa"
                    className="w-full bg-slate-50/70 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-medium"
                  />
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Region / District
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    placeholder="e.g. Bélier, Sassandra-Marahoué"
                    className="w-full bg-slate-50/70 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-medium"
                  />
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
              </div>
            </div>

            {/* Street Address */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Physical / Headquarters Address
              </label>
              <textarea
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Quartier Résidentiel, Route de Toumodi, PK 12"
                className="w-full bg-slate-50/70 border border-slate-200 rounded-xl p-3.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-medium"
              />
            </div>

            {/* Form Actions */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setFullName(profile?.fullName || "");
                  setPhoneNumber(profile?.phoneNumber || "");
                  setCity(profile?.city || "");
                  setRegion(profile?.region || "");
                  setAddress(profile?.address || "");
                  setAvatarFile(null);
                  setAvatarPreview(null);
                }}
                disabled={isUpdatingProfile}
                className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Discard Changes
              </button>

              <button
                type="submit"
                disabled={isUpdatingProfile}
                className="w-full sm:w-auto px-6 py-2.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isUpdatingProfile ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Profile Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: Change PASSWORD                        */}
      {/* ========================================================= */}
      {activeTab === "security" && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm animate-in fade-in duration-150">
          <div className="border-b border-slate-100 pb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-serif font-bold text-xl text-slate-900">
                  Change Account Password
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Keep your producer account secure by using a strong, unique password.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleChangePasswordSubmit} className="space-y-6">
            {/* Current Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Current Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showOldPassword ? "text" : "password"}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full bg-slate-50/70 border border-slate-200 rounded-xl py-2.5 pl-10 pr-11 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-medium"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <button
                  type="button"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
                  tabIndex={-1}
                >
                  {showOldPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* New Password & Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  New Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    required
                    minLength={6}
                    className="w-full bg-slate-50/70 border border-slate-200 rounded-xl py-2.5 pl-10 pr-11 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-medium"
                  />
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
                    tabIndex={-1}
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Confirm New Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-type new password"
                    required
                    minLength={6}
                    className="w-full bg-slate-50/70 border border-slate-200 rounded-xl py-2.5 pl-10 pr-11 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-medium"
                  />
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Checklist */}
            <div className="rounded-2xl bg-slate-50 border border-slate-200/60 p-4 space-y-2">
              <p className="text-xs font-bold text-slate-700">
                Security Recommendations:
              </p>
              <ul className="text-xs text-slate-600 space-y-1.5">
                <li className="flex items-center gap-2">
                  <CheckCircle2
                    className={`w-3.5 h-3.5 ${
                      newPassword.length >= 6
                        ? "text-emerald-600"
                        : "text-slate-400"
                    }`}
                  />
                  <span>At least 6 characters in length</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2
                    className={`w-3.5 h-3.5 ${
                      confirmPassword && newPassword === confirmPassword
                        ? "text-emerald-600"
                        : "text-slate-400"
                    }`}
                  />
                  <span>Both password fields match exactly</span>
                </li>
              </ul>
            </div>

            {/* Submit Action */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="submit"
                disabled={isChangingPassword}
                className="w-full sm:w-auto px-6 py-2.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isChangingPassword ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Update Password</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
