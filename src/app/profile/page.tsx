"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  Camera,
  ShieldCheck,
  CheckCircle2,
  Package,
  MessageSquare,
  ShoppingCart,
  ArrowRight,
  Save,
  RotateCcw,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { updateProfileData } from "@/redux/features/auth/authSlice";
import {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
} from "@/redux/features/auth/authApi";
import { toast } from "sonner";
import { RegionCitySelect } from "@/components/common/RegionCitySelect";

export default function BuyerProfilePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  // Profile Query
  const {
    data: profileResponse,
    isLoading: isProfileLoading,
    refetch: refetchProfile,
  } = useGetProfileQuery(undefined, {
    skip: !isAuthenticated,
  });

  // Mutations
  const [updateProfile, { isLoading: isUpdatingProfile }] =
    useUpdateProfileMutation();
  const [changePassword, { isLoading: isChangingPassword }] =
    useChangePasswordMutation();

  const profile = profileResponse?.data || user;

  // Active Tab
  const [activeTab, setActiveTab] = useState<"profile" | "security">("profile");

  // Profile Form State
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

  // Sync profile data when loaded
  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || "");
      setPhoneNumber(profile.phoneNumber || "");
      setCity(profile.city || "");
      setRegion(profile.region || "");
      setAddress(profile.address || "");
    }
  }, [profile]);

  // Auth Redirect if guest
  useEffect(() => {
    if (!isAuthenticated && typeof window !== "undefined") {
      router.push("/login?redirect=/profile");
    }
  }, [isAuthenticated, router]);

  // Handle Photo Picker
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file (PNG, JPG, WEBP)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file must be under 5MB");
      return;
    }

    setAvatarFile(file);
    const objectUrl = URL.createObjectURL(file);
    setAvatarPreview(objectUrl);
    toast.info("Image selected! Click 'Save Changes' to update your avatar.");
  };

  // Submit Profile Changes
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

      // Refetch latest profile data from server
      refetchProfile();
      setAvatarFile(null);
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

      // Clear password fields
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

  if (!isAuthenticated || isProfileLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f4f7f5]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <p className="text-sm font-medium text-slate-500">
              Loading your profile...
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const currentDisplayImage =
    avatarPreview || profile?.profileImage || null;

  const currentDisplayName =
    fullName.trim() || profile?.fullName || "Valued Buyer";

  return (
    <div className="min-h-screen flex flex-col bg-[#f4f7f5]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Page Title & Breadcrumb */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 tracking-wider mb-2">
            <Link href="/" className="hover:text-emerald-700 transition-colors">
              Home
            </Link>
            <span>/</span>
            <span>My Account</span>
            <span>/</span>
            <span className="text-emerald-700">Profile & Security</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-700 text-white shadow-md">
                  <User className="h-6 w-6" />
                </span>
                Account & Profile Settings
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Manage your personal information, delivery contact details, and account security credentials.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 px-3 py-1 text-xs font-bold text-emerald-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                {profile?.role === "BUYER"
                  ? "Buyer Account"
                  : `${profile?.role || "User"} Account`}
              </span>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Sidebar: User Card & Navigation Tabs */}
          <div className="lg:col-span-4 space-y-6">
            {/* Identity Card */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-r from-emerald-600 to-teal-700" />

              {/* Avatar with Camera Button */}
              <div className="relative mx-auto mt-6 mb-4 w-24 h-24 rounded-full ring-4 ring-white shadow-md overflow-hidden bg-emerald-100 flex items-center justify-center group">
                {currentDisplayImage ? (
                  <Image
                    src={currentDisplayImage}
                    alt={currentDisplayName}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <span className="text-3xl font-bold text-emerald-800 font-serif">
                    {currentDisplayName.charAt(0).toUpperCase()}
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/40 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-xs"
                  title="Upload profile photo"
                >
                  <Camera className="w-5 h-5 mb-0.5" />
                  <span className="text-[10px] font-semibold">Change</span>
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handlePhotoSelect}
                className="hidden"
              />

              <h2 className="font-serif text-lg font-bold text-slate-900 leading-snug">
                {currentDisplayName}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5 truncate">
                {profile?.email}
              </p>

              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-center gap-2">
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Status: {profile?.status || "ACTIVE"}
                </span>
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-4 w-full inline-flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Camera className="w-4 h-4 text-emerald-600" />
                Upload New Avatar
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-2 shadow-sm space-y-1">
              <button
                type="button"
                onClick={() => setActiveTab("profile")}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === "profile"
                    ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/20"
                    : "text-slate-700 hover:bg-slate-50"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4" />
                  <span>Personal Profile</span>
                </div>
                <ArrowRight className="w-4 h-4 opacity-70" />
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("security")}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === "security"
                    ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/20"
                    : "text-slate-700 hover:bg-slate-50"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <Lock className="w-4 h-4" />
                  <span>Password & Security</span>
                </div>
                <ArrowRight className="w-4 h-4 opacity-70" />
              </button>
            </div>

            {/* Quick Buyer Links */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-3">
              <h3 className="text-xs font-bold tracking-wider text-slate-500">
                Buyer Shortcuts
              </h3>
              <div className="space-y-1 text-sm">
                <Link
                  href="/orders"
                  className="flex items-center justify-between py-2 text-slate-700 hover:text-emerald-700 transition-colors font-medium"
                >
                  <span className="flex items-center gap-2.5">
                    <Package className="w-4 h-4 text-emerald-600" />
                    My Harvest Orders
                  </span>
                  <span className="text-xs text-slate-400">View</span>
                </Link>
                <Link
                  href="/messages"
                  className="flex items-center justify-between py-2 text-slate-700 hover:text-emerald-700 transition-colors font-medium"
                >
                  <span className="flex items-center gap-2.5">
                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                    Direct Messaging
                  </span>
                  <span className="text-xs text-slate-400">Chat</span>
                </Link>
                <Link
                  href="/cart"
                  className="flex items-center justify-between py-2 text-slate-700 hover:text-emerald-700 transition-colors font-medium"
                >
                  <span className="flex items-center gap-2.5">
                    <ShoppingCart className="w-4 h-4 text-emerald-600" />
                    Shopping Cart
                  </span>
                  <span className="text-xs text-slate-400">Cart</span>
                </Link>
              </div>
            </div>

            {/* Trust Assurance Badge */}
            <div className="rounded-2xl bg-emerald-50 border border-emerald-200/60 p-4 flex items-start gap-3 text-xs text-emerald-900">
              <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Your personal and delivery information is encrypted and only shared with verified farm producers and transport drivers for active order fulfillment.
              </p>
            </div>
          </div>

          {/* Right Content Area: Forms */}
          <div className="lg:col-span-8">
            {activeTab === "profile" && (
              <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm">
                <div className="border-b border-slate-100 pb-5 mb-6">
                  <h2 className="font-serif text-xl font-bold text-slate-900 flex items-center gap-2">
                    <User className="w-5 h-5 text-emerald-600" />
                    Personal & Delivery Information
                  </h2>
                </div>

                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  {/* Full Name & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 tracking-wider mb-2">
                        Full Name <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="e.g. Jean-Baptiste Kouamé"
                          required
                          className="w-full bg-slate-50/70 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-medium"
                        />
                        <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 tracking-wider mb-2">
                        Email Address
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
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 tracking-wider mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="+880 07 12 34 56 78"
                        className="w-full bg-slate-50/70 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-medium"
                      />
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    </div>
                  </div>

                  {/* City & Region */}
                  <RegionCitySelect
                    regionValue={region}
                    cityValue={city}
                    onRegionChange={(newRegion) => {
                      setRegion(newRegion);
                      setCity("");
                    }}
                    onCityChange={(newCity) => {
                      setCity(newCity);
                    }}
                    variant="profile"
                  />

                  {/* Street Address */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 tracking-wider mb-2">
                      Delivery Street Address
                    </label>
                    <textarea
                      rows={3}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="e.g. Cocody Danga, Rue des Hibiscus, Villa 14"
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

            {activeTab === "security" && (
              <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm">
                <div className="border-b border-slate-100 pb-5 mb-6">
                  <h2 className="font-serif text-xl font-bold text-slate-900 flex items-center gap-2">
                    <KeyRound className="w-5 h-5 text-emerald-600" />
                    Change Account Password
                  </h2>
                </div>

                <form onSubmit={handleChangePasswordSubmit} className="space-y-6">
                  {/* Current Password */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 tracking-wider mb-2">
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
                      <label className="block text-xs font-bold text-slate-700 tracking-wider mb-2">
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
                      <label className="block text-xs font-bold text-slate-700 tracking-wider mb-2">
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

                  {/* Password Checklist */}
                  <div className="rounded-2xl bg-slate-50 border border-slate-200/60 p-4 space-y-2">
                    <p className="text-xs font-bold text-slate-700">
                      Password Requirements:
                    </p>
                    <ul className="text-xs text-slate-600 space-y-1.5">
                      <li className="flex items-center gap-2">
                        <CheckCircle2
                          className={`w-3.5 h-3.5 ${newPassword.length >= 6
                              ? "text-emerald-600"
                              : "text-slate-400"
                            }`}
                        />
                        <span>At least 6 characters in length</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2
                          className={`w-3.5 h-3.5 ${confirmPassword && newPassword === confirmPassword
                              ? "text-emerald-600"
                              : "text-slate-400"
                            }`}
                        />
                        <span>Both new password fields match</span>
                      </li>
                    </ul>
                  </div>

                  {/* Form Actions */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                    <button
                      type="submit"
                      disabled={isChangingPassword}
                      className="w-full sm:w-auto px-6 py-2.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      {isChangingPassword ? (
                        <>
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
        </div>
      </main>

      <Footer />
    </div>
  );
}
