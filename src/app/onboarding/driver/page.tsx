"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import logo from "@/assets/logo.png";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {  
  Truck,
  UploadCloud,
  FileCheck,
  Loader2,
  ArrowRight,
  MapPin,
  FileText,
  AlertCircle,
  X,
} from "lucide-react";
import { toast } from "react-toastify";
import { useCreateDriverProfileMutation } from "@/redux/features/auth/authApi";
import { useAppDispatch } from "@/redux/hooks";
import { updateProfileData } from "@/redux/features/auth/authSlice";
import { DriverVehicleType } from "@/types";
import { RegionCitySelect } from "@/components/common/RegionCitySelect";

const driverSchema = z.object({
  vehicleType: z.enum([
    "BIKE",
    "MOTORCYCLE",
    "THREE_WHEELER",
    "VAN",
    "TRUCK",
    "PICKUP",
  ] as const),
  registrationNumber: z.string().min(2, "Vehicle registration number is required"),
  phoneNumber: z.string().min(8, "Valid phone number is required"),
  city: z.string().min(2, "City is required"),
  region: z.string().min(2, "Region is required"),
  address: z.string().min(3, "Physical address is required"),
});

type DriverFormValues = z.infer<typeof driverSchema>;

export default function DriverOnboardingPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [createDriverProfile, { isLoading }] = useCreateDriverProfileMutation();

  // Document states
  const [nidFile, setNidFile] = useState<File | null>(null);
  const [drivingLicenseFile, setDrivingLicenseFile] = useState<File | null>(null);
  const [vehicleRegFile, setVehicleRegFile] = useState<File | null>(null);
  const [insuranceFile, setInsuranceFile] = useState<File | null>(null);
  const [policeClearanceFile, setPoliceClearanceFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    formState: { errors },
  } = useForm<DriverFormValues>({
    resolver: zodResolver(driverSchema),
    defaultValues: {
      vehicleType: "MOTORCYCLE",
    },
  });

  const selectedVehicle = watch("vehicleType");
  const watchedRegion = watch("region") || "";
  const watchedCity = watch("city") || "";

  const onSubmit = async (values: DriverFormValues) => {
    // Check all 5 mandatory documents required by backend
    if (
      !nidFile ||
      !drivingLicenseFile ||
      !vehicleRegFile ||
      !insuranceFile ||
      !policeClearanceFile
    ) {
      toast.error(
        "All 5 verification documents are required: NID, Driving License, Registration, Insurance, and Police Clearance.",
      );
      return;
    }

    const formData = new FormData();

    const dataPayload = {
      vehicleType: values.vehicleType,
      registrationNumber: values.registrationNumber,
      phoneNumber: values.phoneNumber,
      city: values.city,
      region: values.region,
      address: values.address,
    };

    formData.append("data", JSON.stringify(dataPayload));

    // Direct multi-part field appends
    Object.entries(dataPayload).forEach(([k, v]) => {
      formData.append(k, String(v));
    });

    // File attachments matching backend CustomFileFieldsInterceptor
    formData.append("nidUrl", nidFile);
    formData.append("drivingLicenseUrl", drivingLicenseFile);
    formData.append("vehicleRegistrationUrl", vehicleRegFile);
    formData.append("insuranceUrl", insuranceFile);
    formData.append("policeClearanceUrl", policeClearanceFile);

    try {
      const response = await createDriverProfile(formData).unwrap();
      dispatch(updateProfileData({ isSetupCompleted: true }));
      toast.success(response.message || "Driver profile created successfully!");
      router.push("/driver/dashboard");
    } catch (err: unknown) {
      const msg =
        (err as { data?: { message?: string } })?.data?.message ||
        "Failed to submit driver profile. Please check your documents.";
      setError("root", { message: msg });
      toast.error(msg);
    }
  };

  const renderFileUploader = (
    label: string,
    file: File | null,
    setFile: (f: File | null) => void,
  ) => {
    return (
      <div>
        <label className="form-label flex items-center justify-between">
          <span>
            {label} <span className="text-rose-500">*</span>
          </span>
          {file && (
            <span className="text-[10px] text-emerald-600 font-medium">Selected</span>
          )}
        </label>
        {file ? (
          <div className="flex items-center justify-between rounded-lg border border-emerald-300 bg-emerald-50/50 p-2.5 text-xs text-emerald-950">
            <div className="flex items-center gap-2 truncate">
              <FileCheck className="h-4 w-4 shrink-0 text-emerald-600" />
              <span className="truncate font-medium">{file.name}</span>
              <span className="text-[10px] text-slate-500">
                ({(file.size / 1024 / 1024).toFixed(1)} MB)
              </span>
            </div>
            <button
              type="button"
              onClick={() => setFile(null)}
              className="text-slate-400 hover:text-rose-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50/50 p-3.5 text-center transition-colors hover:border-emerald-500 hover:bg-emerald-50/20">
            <UploadCloud className="h-5 w-5 text-slate-400" />
            <span className="mt-1 text-xs font-medium text-slate-700">
              Upload PDF or Image
            </span>
            <span className="text-[10px] text-slate-400">Max size 10MB</span>
            <input
              type="file"
              accept=".pdf,image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(e) => {
                const selected = e.target.files?.[0];
                if (selected) setFile(selected);
              }}
            />
          </label>
        )}
      </div>
    );
  };

  const vehicleOptions: { type: DriverVehicleType; label: string; desc: string }[] = [
    { type: "BIKE", label: "Bicycle / Cargo", desc: "Short urban runs" },
    { type: "MOTORCYCLE", label: "Motorcycle", desc: "Fast urban orders" },
    { type: "THREE_WHEELER", label: "Three Wheeler", desc: "Crates & produce boxes" },
    { type: "VAN", label: "Van", desc: "Bulk city delivery" },
    { type: "PICKUP", label: "Pickup Truck", desc: "Farm-to-hub pickup" },
    { type: "TRUCK", label: "Heavy Truck", desc: "Regional harvest tonnage" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        {/* Brand Header */}
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center group transition-transform hover:scale-105"
          >
            <Image
              src={logo}
              alt="AgroConnect"
              width={181}
              height={164}
              priority
              className="h-16 w-auto object-contain"
            />
          </Link>
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-100/80 px-3 py-1 text-xs font-semibold text-emerald-800">
            <Truck className="h-3.5 w-3.5" />
            <span>Driver Verification Onboarding</span>
          </div>
          <h1 className="mt-3 text-2xl font-bold text-slate-900 sm:text-3xl">
            Complete your Driver Profile
          </h1>
          <p className="mt-2 text-sm text-slate-600 max-w-lg mx-auto">
            Provide your vehicle specifications and identity documents to become an authorized delivery driver for fresh produce.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm sm:p-10">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {errors.root && (
              <div className="flex items-center gap-2 rounded-lg bg-rose-50 p-3.5 text-xs font-medium text-rose-700 border border-rose-200">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errors.root.message}</span>
              </div>
            )}

            {/* Section 1: Vehicle Type */}
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <Truck className="h-4 w-4 text-emerald-600" />
                <span>1. Select Vehicle Type</span>
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
                {vehicleOptions.map((item) => {
                  const isSelected = selectedVehicle === item.type;
                  return (
                    <button
                      key={item.type}
                      type="button"
                      onClick={() => setValue("vehicleType", item.type)}
                      className={`flex flex-col text-left rounded-xl border p-3.5 transition-all ${
                        isSelected
                          ? "border-emerald-600 bg-emerald-50/70 text-emerald-950 ring-2 ring-emerald-600/20"
                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      <span className="text-xs font-semibold">{item.label}</span>
                      <span className="text-[11px] text-slate-400 mt-0.5">{item.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 2: Contact & Registration Info */}
            <div className="border-t border-slate-100 pt-6">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-emerald-600" />
                <span>2. Vehicle & Location Information</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div>
                  <label htmlFor="registrationNumber" className="form-label">
                    License Plate / Registration No. *
                  </label>
                  <input
                    id="registrationNumber"
                    type="text"
                    placeholder="e.g. 1234-AB-01"
                    className="form-input"
                    {...register("registrationNumber")}
                  />
                  {errors.registrationNumber && (
                    <p className="form-error">{errors.registrationNumber.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="phoneNumber" className="form-label">
                    Contact Phone Number *
                  </label>
                  <input
                    id="phoneNumber"
                    type="text"
                    placeholder="e.g. +225 0500000000"
                    className="form-input"
                    {...register("phoneNumber")}
                  />
                  {errors.phoneNumber && (
                    <p className="form-error">{errors.phoneNumber.message}</p>
                  )}
                </div>

                <RegionCitySelect
                  regionValue={watchedRegion}
                  cityValue={watchedCity}
                  onRegionChange={(reg) => {
                    setValue("region", reg, { shouldValidate: true });
                    setValue("city", "", { shouldValidate: true });
                  }}
                  onCityChange={(c) => {
                    setValue("city", c, { shouldValidate: true });
                  }}
                  regionError={errors.region?.message}
                  cityError={errors.city?.message}
                  variant="form"
                  containerClassName="contents"
                />

                <div className="sm:col-span-2">
                  <label htmlFor="address" className="form-label">
                    Base Address / Garage Location *
                  </label>
                  <input
                    id="address"
                    type="text"
                    placeholder="e.g. Cocody Angré, 8ème Tranche"
                    className="form-input"
                    {...register("address")}
                  />
                  {errors.address && (
                    <p className="form-error">{errors.address.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Section 3: 5 Mandatory Document Uploads */}
            <div className="border-t border-slate-100 pt-6">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <FileText className="h-4 w-4 text-emerald-600" />
                <span>3. Verification Documents (All 5 Required)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Regulations require verifying all driver and vehicle identity credentials before delivery assignment.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                {renderFileUploader("1. National ID Card (NID)", nidFile, setNidFile)}
                {renderFileUploader("2. Driving License", drivingLicenseFile, setDrivingLicenseFile)}
                {renderFileUploader("3. Vehicle Registration (Carte Grise)", vehicleRegFile, setVehicleRegFile)}
                {renderFileUploader("4. Vehicle Insurance Certificate", insuranceFile, setInsuranceFile)}
                <div className="sm:col-span-2">
                  {renderFileUploader("5. Police Clearance Certificate (Casier Judiciaire)", policeClearanceFile, setPoliceClearanceFile)}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="border-t border-slate-100 pt-6 flex items-center justify-between">
              <Link
                href="/"
                className="text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                Cancel and return to home
              </Link>
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Submitting driver profile...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Driver Profile</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
