"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  ShieldCheck,
  Sprout,
  CheckCircle2,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  useVerifyForgotPasswordOtpMutation,
  useResetPasswordMutation,
} from "@/redux/features/auth/authApi";

const step1Schema = z.object({
  otp: z
    .string()
    .length(6, "Verification code must be exactly 6 digits")
    .regex(/^\d+$/, "Digits only"),
});

const step2Schema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

type Step1Values = z.infer<typeof step1Schema>;
type Step2Values = z.infer<typeof step2Schema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [resetToken, setResetToken] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const [verifyOtp, { isLoading: isVerifying }] =
    useVerifyForgotPasswordOtpMutation();
  const [resetPassword, { isLoading: isResetting }] =
    useResetPasswordMutation();

  const {
    register: registerOtp,
    handleSubmit: handleOtpSubmit,
    setError: setOtpError,
    formState: { errors: otpErrors },
  } = useForm<Step1Values>({
    resolver: zodResolver(step1Schema),
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    setError: setPasswordError,
    formState: { errors: passwordErrors },
  } = useForm<Step2Values>({
    resolver: zodResolver(step2Schema),
  });

  const onVerifyOtp = async (values: Step1Values) => {
    if (!email) {
      toast.error("Email address missing. Please request a new reset code.");
      router.push("/forgot-password");
      return;
    }

    try {
      const response = await verifyOtp({
        email,
        otp: values.otp,
      }).unwrap();

      const token =
        (response.data as unknown as { token?: string })?.token ||
        (response as unknown as { token?: string })?.token ||
        "verified";

      setResetToken(token);
      toast.success("Code verified! Please create your new password.");
    } catch (err: unknown) {
      const msg =
        (err as { data?: { message?: string } })?.data?.message ||
        "Invalid or expired OTP code.";
      setOtpError("root", { message: msg });
      toast.error(msg);
    }
  };

  const onResetPassword = async (values: Step2Values) => {
    try {
      const response = await resetPassword({
        token: resetToken || undefined,
        password: values.password,
      }).unwrap();

      toast.success(
        response.message || "Password updated successfully! Please sign in.",
      );
      router.push("/login");
    } catch (err: unknown) {
      const msg =
        (err as { data?: { message?: string } })?.data?.message ||
        "Failed to update password. Please try again.";
      setPasswordError("root", { message: msg });
      toast.error(msg);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#061a10] via-[#092c1d] to-[#04140c] px-4 py-12">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 text-2xl font-bold tracking-tight text-white hover:opacity-90"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30">
              <Sprout className="h-5 w-5" />
            </span>
            <span>
              Agro<span className="text-emerald-400">Connect</span>
            </span>
          </Link>
          <div className="mx-auto mt-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30">
            <KeyRound className="h-6 w-6" />
          </div>
          <h1 className="mt-3 text-2xl font-bold text-white sm:text-3xl">
            {resetToken ? "Create new password" : "Enter verification code"}
          </h1>
          <p className="mt-2 text-sm text-slate-300">
            {resetToken
              ? "Choose a strong password with at least 6 characters"
              : `Enter the code sent to ${email || "your email"}`}
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/10 bg-white/95 p-6 shadow-2xl backdrop-blur-md sm:p-8">
          {!resetToken ? (
            /* Step 1: Verify OTP */
            <form onSubmit={handleOtpSubmit(onVerifyOtp)} className="space-y-4">
              {otpErrors.root && (
                <div className="rounded-lg bg-rose-50 p-3 text-xs font-medium text-rose-700">
                  {otpErrors.root.message}
                </div>
              )}

              <div>
                <label htmlFor="otp" className="form-label text-center">
                  6-Digit Reset Code
                </label>
                <input
                  id="otp"
                  type="text"
                  maxLength={6}
                  placeholder="123456"
                  className="form-input text-center text-2xl font-bold tracking-[0.5em] placeholder:tracking-normal placeholder:font-normal placeholder:text-slate-300"
                  autoComplete="one-time-code"
                  disabled={isVerifying}
                  {...registerOtp("otp")}
                />
                {otpErrors.otp && (
                  <p className="form-error text-center">
                    {otpErrors.otp.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isVerifying}
                className="btn-primary mt-2 w-full"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Verifying code...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    <span>Verify Code</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Step 2: New Password */
            <form
              onSubmit={handlePasswordSubmit(onResetPassword)}
              className="space-y-4"
            >
              {passwordErrors.root && (
                <div className="rounded-lg bg-rose-50 p-3 text-xs font-medium text-rose-700">
                  {passwordErrors.root.message}
                </div>
              )}

              <div>
                <label htmlFor="password" className="form-label">
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter at least 6 characters"
                    className="form-input pr-10"
                    autoComplete="new-password"
                    disabled={isResetting}
                    {...registerPassword("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {passwordErrors.password && (
                  <p className="form-error">
                    {passwordErrors.password.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="form-label">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Repeat new password"
                  className="form-input"
                  autoComplete="new-password"
                  disabled={isResetting}
                  {...registerPassword("confirmPassword")}
                />
                {passwordErrors.confirmPassword && (
                  <p className="form-error">
                    {passwordErrors.confirmPassword.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isResetting}
                className="btn-primary mt-2 w-full"
              >
                {isResetting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Saving new password...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Set new password</span>
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-6 border-t border-slate-200/80 pt-6 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to sign in</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
