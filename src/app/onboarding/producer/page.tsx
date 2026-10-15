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
  Tractor,
  Building2,
  UploadCloud,
  FileCheck,
  ArrowRight,
  MapPin,
  FileText,
  AlertCircle,
  X,
} from "lucide-react";
import { toast } from "react-toastify";
import { useCreateProducerProfileMutation } from "@/redux/features/auth/authApi";
import { useAppDispatch } from "@/redux/hooks";
import { updateProfileData } from "@/redux/features/auth/authSlice";
import { ProducerType } from "@/types";
import RegionCitySelect from "@/components/common/RegionCitySelect";

const producerSchema = z
  .object({
    producerType: z.enum(["Private", "Company"] as const),
    farmName: z.string().min(2, "Farm name is required"),
    farmSize: z
      .string()
      .min(1, "Farm size is required")
      .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: "Farm size must be a number greater than 0",
      }),
    farmLocation: z.string().min(2, "Farm location is required"),
    phoneNumber: z.string().min(8, "Valid phone number is required"),
    city: z.string().min(2, "City is required"),
    region: z.string().min(2, "Region is required"),
    address: z.string().min(3, "Physical address is required"),
    companyName: z.string().optional(),
    rccmNo: z.string().optional(),
    sirenNo: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.producerType === "Company") {
        return !!data.companyName && !!data.rccmNo && !!data.sirenNo;
      }
      return true;
    },
    {
      message: "Company name, RCCM number, and SIREN number are required for companies",
      path: ["companyName"],
    },
  );

type ProducerFormValues = z.infer<typeof producerSchema>;

export default function ProducerOnboardingPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [createProfile, { isLoading }] = useCreateProducerProfileMutation();

  // File state
  const [nidFile, setNidFile] = useState<File | null>(null);
  const [landCertificateFile, setLandCertificateFile] = useState<File | null>(null);
  const [farmPhotoFile, setFarmPhotoFile] = useState<File | null>(null);
  const [companyCertificateFile, setCompanyCertificateFile] = useState<File | null>(null);
  const [rcmFile, setRcmFile] = useState<File | null>(null);
  const [taxFile, setTaxFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    formState: { errors },
  } = useForm<ProducerFormValues>({
    resolver: zodResolver(producerSchema),
    defaultValues: {
      producerType: "Private",
    },
  });

  const producerType = watch("producerType");
  const selectedRegion = watch("region");
  const selectedCity = watch("city");

  const onSubmit = async (values: ProducerFormValues) => {
    // Validate required documents
    if (!nidFile) {
      toast.error("National ID document is required for verification");
      return;
    }

    if (values.producerType === "Company") {
      if (!companyCertificateFile || !rcmFile || !taxFile) {
        toast.error("Company registration, RCM, and tax documents are all required for companies");
        return;
      }
    }

    const formData = new FormData();

    // Data payload for ParseFormDataInterceptor
    const dataPayload = {
      producerType: values.producerType,
      farmName: values.farmName,
      farmSize: Number(values.farmSize),
      farmLocation: values.farmLocation,
      phoneNumber: values.phoneNumber,
      city: values.city,
      region: values.region,
      address: values.address,
      companyName: values.producerType === "Company" ? values.companyName : undefined,
      rccmNo: values.producerType === "Company" ? values.rccmNo : undefined,
      sirenNo: values.producerType === "Company" ? values.sirenNo : undefined,
    };

    formData.append("data", JSON.stringify(dataPayload));

    // Direct field appends for multi-part safety
    Object.entries(dataPayload).forEach(([key, val]) => {
      if (val !== undefined && val !== null) {
        formData.append(key, String(val));
      }
    });

    // File attachments matching backend CustomFileFieldsInterceptor
    if (nidFile) formData.append("nidUrl", nidFile);
    if (landCertificateFile) formData.append("landCertificate", landCertificateFile);
    if (farmPhotoFile) formData.append("farmPhotoUrl", farmPhotoFile);
    if (companyCertificateFile) formData.append("companyCertificate", companyCertificateFile);
    if (rcmFile) formData.append("rcmUrl", rcmFile);
    if (taxFile) formData.append("taxUrl", taxFile);

    try {
      const response = await createProfile(formData).unwrap();
      dispatch(updateProfileData({ isSetupCompleted: true }));
      toast.success(response.message || "Producer profile created successfully!");
      router.push("/producer/dashboard");
    } catch (err: unknown) {
      const msg =
        (err as { data?: { message?: string } })?.data?.message ||
        "Failed to submit profile. Please verify your documents and details.";
      setError("root", { message: msg });
      toast.error(msg);
    }
  };

  const renderFileUploader = (
    label: string,
    file: File | null,
    setFile: (f: File | null) => void,
    required = false,
  ) => {
    return (
      <div>
        <label className="form-label flex items-center justify-between">
          <span>
            {label} {required && <span className="text-rose-500">*</span>}
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
            <Tractor className="h-3.5 w-3.5" />
            <span>Producer Verification Onboarding</span>
          </div>
          <h1 className="mt-3 text-2xl font-bold text-slate-900 sm:text-3xl">
            Complete your Farm Profile
          </h1>
          <p className="mt-2 text-sm text-slate-600 max-w-lg mx-auto">
            Provide your agricultural details and verification documents so buyers know they are purchasing directly from certified producers.
          </p>
        </div>

        {/* Form Container */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm sm:p-10">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {errors.root && (
              <div className="flex items-center gap-2 rounded-lg bg-rose-50 p-3.5 text-xs font-medium text-rose-700 border border-rose-200">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errors.root.message}</span>
              </div>
            )}

            {/* Section 1: Producer Type */}
            <div>
              <h2 className="text-sm font-semibold  tracking-wider text-slate-900 flex items-center gap-2">
                <Tractor className="h-4 w-4 text-emerald-600" />
                <span>1. Producer Category</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Select whether you operate as an individual farmer or registered company.
              </p>
              <div className="grid grid-cols-2 gap-4 mt-3">
                {[
                  {
                    type: "Private" as ProducerType,
                    label: "Private / Individual Farmer",
                    desc: "Smallholder or independent producer",
                    icon: Tractor,
                  },
                  {
                    type: "Company" as ProducerType,
                    label: "Agricultural Company / Cooperative",
                    desc: "Registered business with RCCM/SIREN",
                    icon: Building2,
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = producerType === item.type;
                  return (
                    <button
                      key={item.type}
                      type="button"
                      onClick={() => setValue("producerType", item.type)}
                      className={`flex flex-col text-left rounded-xl border p-4 transition-all ${isSelected
                        ? "border-emerald-600 bg-emerald-50/70 text-emerald-950 ring-2 ring-emerald-600/20"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                        }`}
                    >
                      <Icon className={`h-5 w-5 ${isSelected ? "text-emerald-700" : "text-slate-400"}`} />
                      <span className="mt-2 text-xs font-semibold">{item.label}</span>
                      <span className="text-[11px] text-slate-400 mt-0.5">{item.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 2: Farm Details */}
            <div className="border-t border-slate-100 pt-6">
              <h2 className="text-sm font-semibold  tracking-wider text-slate-900 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-emerald-600" />
                <span>2. Farm & Location Details</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div>
                  <label htmlFor="farmName" className="form-label">
                    Farm / Plantation Name *
                  </label>
                  <input
                    id="farmName"
                    type="text"
                    placeholder="e.g. Ferme Espoir de Bouaké"
                    className="form-input"
                    {...register("farmName")}
                  />
                  {errors.farmName && (
                    <p className="form-error">{errors.farmName.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="farmSize" className="form-label">
                    Cultivated Size (Hectares) *
                  </label>
                  <input
                    id="farmSize"
                    type="number"
                    step="0.1"
                    placeholder="e.g. 5.5"
                    className="form-input"
                    {...register("farmSize")}
                  />
                  {errors.farmSize && (
                    <p className="form-error">{errors.farmSize.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="farmLocation" className="form-label">
                    Farm Location / District *
                  </label>
                  <input
                    id="farmLocation"
                    type="text"
                    placeholder="e.g. Vallée du Bandama"
                    className="form-input"
                    {...register("farmLocation")}
                  />
                  {errors.farmLocation && (
                    <p className="form-error">{errors.farmLocation.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="phoneNumber" className="form-label">
                    Contact Phone Number *
                  </label>
                  <input
                    id="phoneNumber"
                    type="text"
                    placeholder="e.g. +880 0700000000"
                    className="form-input"
                    {...register("phoneNumber")}
                  />
                  {errors.phoneNumber && (
                    <p className="form-error">{errors.phoneNumber.message}</p>
                  )}
                </div>

                <RegionCitySelect
                  regionValue={selectedRegion}
                  cityValue={selectedCity}
                  onRegionChange={(newRegion) => {
                    setValue("region", newRegion, { shouldValidate: true, shouldDirty: true });
                    setValue("city", "", { shouldValidate: true, shouldDirty: true });
                  }}
                  onCityChange={(newCity) => {
                    setValue("city", newCity, { shouldValidate: true, shouldDirty: true });
                  }}
                  regionError={errors.region?.message}
                  cityError={errors.city?.message}
                  required
                  containerClassName="contents"
                />

                <div className="sm:col-span-2">
                  <label htmlFor="address" className="form-label">
                    Physical Address / Directions *
                  </label>
                  <input
                    id="address"
                    type="text"
                    placeholder="e.g. Route de Brobo, Km 12"
                    className="form-input"
                    {...register("address")}
                  />
                  {errors.address && (
                    <p className="form-error">{errors.address.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Section 3: Company Legal Information (Conditional) */}
            {producerType === "Company" && (
              <div className="border-t border-slate-100 pt-6">
                <h2 className="text-sm font-semibold  tracking-wider text-slate-900 flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-emerald-600" />
                  <span>3. Company Business Details</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                  <div className="sm:col-span-3">
                    <label htmlFor="companyName" className="form-label">
                      Registered Company Name *
                    </label>
                    <input
                      id="companyName"
                      type="text"
                      placeholder="e.g. AgroIvoire SARL"
                      className="form-input"
                      {...register("companyName")}
                    />
                    {errors.companyName && (
                      <p className="form-error">{errors.companyName.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="rccmNo" className="form-label">
                      RCCM Number *
                    </label>
                    <input
                      id="rccmNo"
                      type="text"
                      placeholder="CI-ABJ-202X-B-XXXX"
                      className="form-input"
                      {...register("rccmNo")}
                    />
                  </div>

                  <div>
                    <label htmlFor="sirenNo" className="form-label">
                      SIREN / Tax ID *
                    </label>
                    <input
                      id="sirenNo"
                      type="text"
                      placeholder="e.g. 123456789"
                      className="form-input"
                      {...register("sirenNo")}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Section 4: Document Uploads */}
            <div className="border-t border-slate-100 pt-6">
              <h2 className="text-sm font-semibold  tracking-wider text-slate-900 flex items-center gap-2">
                <FileText className="h-4 w-4 text-emerald-600" />
                <span>{producerType === "Company" ? "4. Verification Documents" : "3. Verification Documents"}</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Our verification team reviews these credentials to grant certified status.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                {renderFileUploader("National ID Card (NID)", nidFile, setNidFile, true)}

                {producerType === "Private" ? (
                  <>
                    {renderFileUploader("Land Ownership / Lease Certificate", landCertificateFile, setLandCertificateFile)}
                    {renderFileUploader("Farm Overview Photo", farmPhotoFile, setFarmPhotoFile)}
                  </>
                ) : (
                  <>
                    {renderFileUploader("Company Certificate", companyCertificateFile, setCompanyCertificateFile, true)}
                    {renderFileUploader("RCM Document", rcmFile, setRcmFile, true)}
                    {renderFileUploader("Tax Clearance (DFE)", taxFile, setTaxFile, true)}
                  </>
                )}
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
                    <span>Submitting profile...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Producer Profile</span>
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
