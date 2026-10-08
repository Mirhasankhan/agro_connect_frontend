"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Sprout,
  Tractor,
  Building2,
  UploadCloud,
  FileCheck,
  Loader2,
  MapPin,
  FileText,
  AlertCircle,
  X,
  CheckCircle2,
} from "lucide-react";
import { toast } from "react-toastify";
import { useCreateProducerProfileMutation } from "@/redux/features/auth/authApi";
import { useAppDispatch } from "@/redux/hooks";
import { updateProfileData } from "@/redux/features/auth/authSlice";

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
      message:
        "Company name, RCCM number, and SIREN number are required for companies",
      path: ["companyName"],
    },
  );

type ProducerFormValues = z.infer<typeof producerSchema>;

interface ProducerProfileSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProducerProfileSetupModal({
  isOpen,
  onClose,
}: ProducerProfileSetupModalProps) {
  const dispatch = useAppDispatch();
  const [createProfile, { isLoading }] = useCreateProducerProfileMutation();

  // File state
  const [nidFile, setNidFile] = useState<File | null>(null);
  const [landCertificateFile, setLandCertificateFile] = useState<File | null>(
    null,
  );
  const [farmPhotoFile, setFarmPhotoFile] = useState<File | null>(null);
  const [companyCertificateFile, setCompanyCertificateFile] =
    useState<File | null>(null);
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

  const onSubmit = async (values: ProducerFormValues) => {
    if (!nidFile) {
      toast.error("National ID document is required for verification");
      return;
    }

    if (values.producerType === "Company") {
      if (!companyCertificateFile || !rcmFile || !taxFile) {
        toast.error(
          "Company registration, RCM, and tax documents are all required for companies",
        );
        return;
      }
    }

    const formData = new FormData();

    const dataPayload = {
      producerType: values.producerType,
      farmName: values.farmName,
      farmSize: Number(values.farmSize),
      farmLocation: values.farmLocation,
      phoneNumber: values.phoneNumber,
      city: values.city,
      region: values.region,
      address: values.address,
      companyName:
        values.producerType === "Company" ? values.companyName : undefined,
      rccmNo: values.producerType === "Company" ? values.rccmNo : undefined,
      sirenNo: values.producerType === "Company" ? values.sirenNo : undefined,
    };

    formData.append("data", JSON.stringify(dataPayload));

    Object.entries(dataPayload).forEach(([key, val]) => {
      if (val !== undefined && val !== null) {
        formData.append(key, String(val));
      }
    });

    if (nidFile) formData.append("nidUrl", nidFile);
    if (landCertificateFile)
      formData.append("landCertificate", landCertificateFile);
    if (farmPhotoFile) formData.append("farmPhotoUrl", farmPhotoFile);
    if (companyCertificateFile)
      formData.append("companyCertificate", companyCertificateFile);
    if (rcmFile) formData.append("rcmUrl", rcmFile);
    if (taxFile) formData.append("taxUrl", taxFile);

    try {
      const response = await createProfile(formData).unwrap();
      dispatch(updateProfileData({ isSetupCompleted: true }));
      toast.success(
        response.message || "Producer profile created successfully!",
      );
      onClose();
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
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
        {file ? (
          <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/60 p-2.5 text-xs text-emerald-900">
            <div className="flex items-center gap-2 truncate">
              <FileCheck className="h-4 w-4 shrink-0 text-emerald-600" />
              <span className="truncate font-medium">{file.name}</span>
            </div>
            <button
              type="button"
              onClick={() => setFile(null)}
              className="ml-2 text-slate-400 hover:text-rose-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/60 p-3 text-center transition-colors hover:border-emerald-500 hover:bg-emerald-50/30">
            <UploadCloud className="h-5 w-5 text-slate-400" />
            <span className="mt-1 text-xs font-medium text-slate-600">
              Upload PDF or image
            </span>
            <input
              type="file"
              accept=".pdf,image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  setFile(e.target.files[0]);
                }
              }}
            />
          </label>
        )}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white border border-slate-200 text-slate-900 p-6 rounded-2xl shadow-xl">
        <DialogHeader>
          <div className="flex items-center gap-2 text-emerald-600 mb-1">
            <Sprout className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Profile Setup
            </span>
          </div>
          <DialogTitle className="text-xl font-bold text-slate-900">
            Complete Your Producer Profile
          </DialogTitle>
          <DialogDescription className="text-slate-600 text-xs">
            Provide your farm details and verification documents to start listing produce on AgroConnect.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-2">
          {errors.root && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errors.root.message}</span>
            </div>
          )}

          {/* Producer Type Selector */}
          <div>
            <label className="form-label mb-2">Producer Type</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setValue("producerType", "Private")}
                className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                  producerType === "Private"
                    ? "border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-600/20 text-emerald-950 font-medium"
                    : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                }`}
              >
                <Tractor
                  className={`h-5 w-5 ${
                    producerType === "Private"
                      ? "text-emerald-600"
                      : "text-slate-400"
                  }`}
                />
                <div>
                  <div className="text-sm font-semibold">Private Farmer</div>
                  <div className="text-[11px] text-slate-500">
                    Individual agricultural producer
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setValue("producerType", "Company")}
                className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                  producerType === "Company"
                    ? "border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-600/20 text-emerald-950 font-medium"
                    : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                }`}
              >
                <Building2
                  className={`h-5 w-5 ${
                    producerType === "Company"
                      ? "text-emerald-600"
                      : "text-slate-400"
                  }`}
                />
                <div>
                  <div className="text-sm font-semibold">Agricultural Enterprise</div>
                  <div className="text-[11px] text-slate-500">
                    Registered farming business
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Farm Details */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <Tractor className="h-4 w-4 text-emerald-600" />
              <span>Farm Details</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="form-label">Farm / Estate Name</label>
                <input
                  type="text"
                  placeholder="Green Meadows Farm"
                  className="form-input"
                  {...register("farmName")}
                />
                {errors.farmName && (
                  <p className="form-error">{errors.farmName.message}</p>
                )}
              </div>

              <div>
                <label className="form-label">Farm Size (Acres / Hectares)</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="15"
                  className="form-input"
                  {...register("farmSize")}
                />
                {errors.farmSize && (
                  <p className="form-error">{errors.farmSize.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="form-label">Farm Location / Region</label>
              <input
                type="text"
                placeholder="e.g. Northern Savannah agricultural belt"
                className="form-input"
                {...register("farmLocation")}
              />
              {errors.farmLocation && (
                <p className="form-error">{errors.farmLocation.message}</p>
              )}
            </div>
          </div>

          {/* Contact and Address */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-emerald-600" />
              <span>Contact & Physical Address</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  placeholder="+1 234 567 890"
                  className="form-input"
                  {...register("phoneNumber")}
                />
                {errors.phoneNumber && (
                  <p className="form-error">{errors.phoneNumber.message}</p>
                )}
              </div>

              <div>
                <label className="form-label">City</label>
                <input
                  type="text"
                  placeholder="City"
                  className="form-input"
                  {...register("city")}
                />
                {errors.city && (
                  <p className="form-error">{errors.city.message}</p>
                )}
              </div>

              <div>
                <label className="form-label">Region / State</label>
                <input
                  type="text"
                  placeholder="Region"
                  className="form-input"
                  {...register("region")}
                />
                {errors.region && (
                  <p className="form-error">{errors.region.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="form-label">Physical Address</label>
              <input
                type="text"
                placeholder="Street address or nearest landmark"
                className="form-input"
                {...register("address")}
              />
              {errors.address && (
                <p className="form-error">{errors.address.message}</p>
              )}
            </div>
          </div>

          {/* Company Details if Company */}
          {producerType === "Company" && (
            <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <Building2 className="h-4 w-4 text-emerald-600" />
                <span>Corporate Registration</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="form-label">Company Name</label>
                  <input
                    type="text"
                    placeholder="Agro Global Ltd."
                    className="form-input bg-white"
                    {...register("companyName")}
                  />
                  {errors.companyName && (
                    <p className="form-error">{errors.companyName.message}</p>
                  )}
                </div>

                <div>
                  <label className="form-label">RCCM Number</label>
                  <input
                    type="text"
                    placeholder="RCCM-12345"
                    className="form-input bg-white"
                    {...register("rccmNo")}
                  />
                </div>

                <div>
                  <label className="form-label">SIREN Number</label>
                  <input
                    type="text"
                    placeholder="SIREN-67890"
                    className="form-input bg-white"
                    {...register("sirenNo")}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Verification Documents */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <FileText className="h-4 w-4 text-emerald-600" />
              <span>Verification Documents</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {renderFileUploader("National ID / Passport", nidFile, setNidFile, true)}
              {renderFileUploader("Land Ownership / Lease Certificate", landCertificateFile, setLandCertificateFile)}
              {renderFileUploader("Farm Overview Photo", farmPhotoFile, setFarmPhotoFile)}

              {producerType === "Company" && (
                <>
                  {renderFileUploader("Company Certificate", companyCertificateFile, setCompanyCertificateFile, true)}
                  {renderFileUploader("RCM Document", rcmFile, setRcmFile, true)}
                  {renderFileUploader("Tax Clearance Certificate", taxFile, setTaxFile, true)}
                </>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="btn-secondary text-xs px-4 py-2.5"
            >
              Skip for now
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary text-xs px-5 py-2.5"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Complete Setup</span>
                </>
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
