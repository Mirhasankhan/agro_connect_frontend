"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import logo from "@/assets/logo.png";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, ShieldCheck, ArrowRight } from "lucide-react";
import { toast } from "react-toastify";
import { useVerifyRegistrationMutation } from "@/redux/features/auth/authApi";
import { useAppDispatch } from "@/redux/hooks";
import { setUser } from "@/redux/features/auth/authSlice";

const otpSchema = z.object({
  otp: z
    .string()
    .length(4, "Verification code must be exactly 4 digits")
    .regex(/^\d+$/, "Verification code must contain digits only"),
});

type OtpFormValues = z.infer<typeof otpSchema>;

export default function VerifyOtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const dispatch = useAppDispatch();

  const [verifyOtp, { isLoading }] = useVerifyRegistrationMutation();
  const [resending, setResending] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
  });

  const onSubmit = async (values: OtpFormValues) => {
    if (!email) {
      toast.error("Missing registration email. Please register again.");
      router.push("/register");
      return;
    }

    try {
      const response = await verifyOtp({
        email,
        otp: values.otp,
      }).unwrap();

      toast.success(response.message || "Account verified successfully! You can login now.");

      if (response?.data?.accessToken) {
        const { accessToken, role: userRole } = response.data;
        dispatch(
          setUser({
            token: accessToken,
            role: userRole,
            isSetupCompleted: false,
          }),
        );

        if (userRole === "PRODUCER") {
          router.push("/producer/dashboard?setup=true");
        } else if (userRole === "DRIVER") {
          router.push("/driver/dashboard?setup=true");
        } else {
          router.push("/");
        }
      } else {
        router.push(`/login?email=${encodeURIComponent(email)}`);
      }
    } catch (err: unknown) {
      const errorMessage =
        (err as { data?: { message?: string } })?.data?.message ||
        "Invalid or expired verification code.";
      setError("root", { message: errorMessage });
      toast.error(errorMessage);
    }
  };

  const handleResend = () => {
    setResending(true);
    setTimeout(() => {
      setResending(false);
      toast.info("If your account is pending, a new code has been sent.");
    }, 1200);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md">
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
          <div className="mx-auto mt-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-600/20">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h1 className="mt-3 text-2xl font-bold text-slate-900 sm:text-3xl">
            Verify your email
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            We sent a 4-digit code to{" "}
            <span className="font-semibold text-emerald-600">
              {email || "your email"}
            </span>
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {errors.root && (
              <div className="rounded-lg bg-rose-50 p-3 text-xs font-medium text-rose-700">
                {errors.root.message}
              </div>
            )}

            <div>
              <label htmlFor="otp" className="form-label text-center">
                Enter 4-Digit Code
              </label>
              <input
                id="otp"
                type="text"
                maxLength={4}
                placeholder="1234"
                className="form-input text-center text-2xl font-bold tracking-[0.5em] placeholder:tracking-normal placeholder:font-normal placeholder:text-slate-300"
                autoComplete="one-time-code"
                disabled={isLoading}
                {...register("otp")}
              />
              {errors.otp && (
                <p className="form-error text-center">{errors.otp.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary mt-2 w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <span>Verify and continue</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 flex items-center justify-between border-t border-slate-200/80 pt-6 text-xs text-slate-500">
            <span>Didn&apos;t receive code?</span>
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="font-semibold text-emerald-700 hover:text-emerald-800 disabled:opacity-50"
            >
              {resending ? "Sending..." : "Resend code"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
