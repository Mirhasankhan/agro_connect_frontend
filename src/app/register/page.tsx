"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Eye,
  EyeOff,
  Loader2,
  Sprout,
  ShoppingBag,
  Tractor,
  Truck,
  ArrowRight,
} from "lucide-react";
import { toast } from "react-toastify";
import { useRegisterMutation } from "@/redux/features/auth/authApi";

const registerSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["BUYER", "PRODUCER", "DRIVER"]),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [registerUser, { isLoading }] = useRegisterMutation();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: "BUYER",
    },
  });

  const selectedRole = watch("role");

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      const response = await registerUser(values).unwrap();
      toast.success(
        response.message || "Verification code sent to your email!",
      );
      router.push(
        `/verify-otp?email=${encodeURIComponent(values.email)}&role=${values.role}`,
      );
    } catch (err: unknown) {
      const errorMessage =
        (err as { data?: { message?: string } })?.data?.message ||
        "Registration failed. Please try again.";
      setError("root", { message: errorMessage });
      toast.error(errorMessage);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Brand Header */}
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 text-2xl font-bold tracking-tight text-slate-900 hover:opacity-90"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-600/10">
              <Sprout className="h-5 w-5" />
            </span>
            <span>
              Agro<span className="text-emerald-600">Connect</span>
            </span>
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-slate-900 sm:text-3xl">
            Create your account
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Join the agricultural marketplace network
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

            {/* Role Selection */}
            <div>
              <label className="form-label">I want to join as</label>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  {
                    role: "BUYER" as const,
                    label: "Buyer",
                    desc: "Shop produce",
                    icon: ShoppingBag,
                  },
                  {
                    role: "PRODUCER" as const,
                    label: "Producer",
                    desc: "Sell harvests",
                    icon: Tractor,
                  },
                  {
                    role: "DRIVER" as const,
                    label: "Driver",
                    desc: "Deliver orders",
                    icon: Truck,
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = selectedRole === item.role;
                  return (
                    <button
                      key={item.role}
                      type="button"
                      onClick={() => setValue("role", item.role)}
                      className={`flex flex-col items-center justify-center rounded-xl border p-3 text-center transition-all ${
                        isSelected
                          ? "border-emerald-600 bg-emerald-50/80 text-emerald-900 ring-2 ring-emerald-600/20"
                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <Icon
                        className={`h-5 w-5 ${
                          isSelected ? "text-emerald-600" : "text-slate-400"
                        }`}
                      />
                      <span className="mt-1.5 text-xs font-semibold">
                        {item.label}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {item.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
              {errors.role && (
                <p className="form-error">{errors.role.message}</p>
              )}
            </div>

            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="form-label">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                placeholder="e.g. Jean Kouassi"
                className="form-input"
                autoComplete="name"
                disabled={isLoading}
                {...register("fullName")}
              />
              {errors.fullName && (
                <p className="form-error">{errors.fullName.message}</p>
              )}
            </div>

            {/* Email Address */}
            <div>
              <label htmlFor="email" className="form-label">
                Email Address
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

            {/* Password */}
            <div>
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password (6+ chars)"
                  className="form-input pr-10"
                  autoComplete="new-password"
                  disabled={isLoading}
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="form-error">{errors.password.message}</p>
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
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <span>Sign Up</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 border-t border-slate-200/80 pt-6 text-center text-sm text-slate-600">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-emerald-700 hover:text-emerald-800"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
