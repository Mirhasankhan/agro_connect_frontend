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
  Truck,
  UploadCloud,
  FileCheck,
  Loader2,
  FileText,
  AlertCircle,
  X,
  CheckCircle2,
} from "lucide-react";
import { toast } from "react-toastify";
import { useCreateDriverProfileMutation } from "@/redux/features/auth/authApi";
import { useAppDispatch } from "@/redux/hooks";
import { updateProfileData } from "@/redux/features/auth/authSlice";
import { DriverVehicleType } from "@/types";

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

interface DriverProfileSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DriverProfileSetupModal({
  isOpen,
  onClose,
}: DriverProfileSetupModalProps) {
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

  const onSubmit = async (values: DriverFormValues) => {
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

    Object.entries(dataPayload).forEach(([k, v]) => {
      formData.append(k, String(v));
    });

    formData.append("nidUrl", nidFile);
    formData.append("drivingLicenseUrl", drivingLicenseFile);
    formData.append("vehicleRegistrationUrl", vehicleRegFile);
    formData.append("insuranceUrl", insuranceFile);
    formData.append("policeClearanceUrl", policeClearanceFile);

    try {
      const response = await createDriverProfile(formData).unwrap();
      dispatch(updateProfileData({ isSetupCompleted: true }));
      toast.success(response.message || "Driver profile created successfully!");
      onClose();
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
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          {label} <span className="text-rose-500">*</span>
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
            <Truck className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Profile Setup
            </span>
          </div>
          <DialogTitle className="text-xl font-bold text-slate-900">
            Complete Your Driver Profile
          </DialogTitle>
          <DialogDescription className="text-slate-600 text-xs">
            Register your vehicle and verification documents to begin accepting delivery orders on AgroConnect.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-2">
          {errors.root && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errors.root.message}</span>
            </div>
          )}

          {/* Vehicle Type Selection */}
          <div>
            <label className="form-label mb-2">Select Vehicle Type</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {(
                [
                  "BIKE",
                  "MOTORCYCLE",
                  "THREE_WHEELER",
                  "VAN",
                  "PICKUP",
                  "TRUCK",
                ] as DriverVehicleType[]
              ).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setValue("vehicleType", type)}
                  className={`rounded-xl border p-2.5 text-center text-xs font-semibold transition-all ${
                    selectedVehicle === type
                      ? "border-emerald-600 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-600/20"
                      : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  {type.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>

          {/* Vehicle & Contact Details */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <Truck className="h-4 w-4 text-emerald-600" />
              <span>Vehicle & Contact Details</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="form-label">Registration Plate Number</label>
                <input
                  type="text"
                  placeholder="e.g. ABC-1234"
                  className="form-input"
                  {...register("registrationNumber")}
                />
                {errors.registrationNumber && (
                  <p className="form-error">
                    {errors.registrationNumber.message}
                  </p>
                )}
              </div>

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
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                placeholder="Street address or base station location"
                className="form-input"
                {...register("address")}
              />
              {errors.address && (
                <p className="form-error">{errors.address.message}</p>
              )}
            </div>
          </div>

          {/* Verification Documents */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <FileText className="h-4 w-4 text-emerald-600" />
              <span>Mandatory Verification Documents</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {renderFileUploader("National ID / Passport", nidFile, setNidFile)}
              {renderFileUploader("Driver's License", drivingLicenseFile, setDrivingLicenseFile)}
              {renderFileUploader("Vehicle Registration (Logbook)", vehicleRegFile, setVehicleRegFile)}
              {renderFileUploader("Insurance Certificate", insuranceFile, setInsuranceFile)}
            </div>
            {renderFileUploader("Police Clearance Certificate", policeClearanceFile, setPoliceClearanceFile)}
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
