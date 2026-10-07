"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Loader2, Mail, Send, Sprout } from "lucide-react";
import { toast } from "react-toastify";
import { useSendForgotPasswordOtpMutation } from "@/redux/features/auth/authApi";

const forgotSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotFormValues = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [sendOtp, { isLoading }] = useSendForgotPasswordOtpMutation();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ForgotFormValues>({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (values: ForgotFormValues) => {
    try {
      const response = await sendOtp(values).unwrap();
      toast.success(
        response.message || "Password reset code sent to your email!",
      );
      router.push(`/reset-password?email=${encodeURIComponent(values.email)}`);
    } catch (err: unknown) {
      const errorMessage =
        (err as { data?: { message?: string } })?.data?.message ||
        "Failed to send reset code. Please check your email.";
      setError("root", { message: errorMessage });
      toast.error(errorMessage);
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
            <Mail className="h-6 w-6" />
          </div>
          <h1 className="mt-3 text-2xl font-bold text-white sm:text-3xl">
            Forgot password?
          </h1>
          <p className="mt-2 text-sm text-slate-300">
            Enter your email to receive a password reset code
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/10 bg-white/95 p-6 shadow-2xl backdrop-blur-md sm:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {errors.root && (
              <div className="rounded-lg bg-rose-50 p-3 text-xs font-medium text-rose-700">
                {errors.root.message}
              </div>
            )}

            <div>
              <label htmlFor="email" className="form-label">
                Account Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="name@example.com"
                className="form-input"
                autoComplete="email"
                disabled={isLoading}
                {...register("email")}
              />
              {errors.email && (
                <p className="form-error">{errors.email.message}</p>
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
                  <span>Sending code...</span>
                </>
              ) : (
                <>
                  <span>Send reset code</span>
                  <Send className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

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
