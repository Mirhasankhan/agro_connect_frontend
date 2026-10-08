"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2, Sprout, ArrowRight } from "lucide-react";
import { toast } from "react-toastify";
import { useLoginMutation } from "@/redux/features/auth/authApi";
import { useAppDispatch } from "@/redux/hooks";
import { setUser } from "@/redux/features/auth/authSlice";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect");
  const dispatch = useAppDispatch();

  const [showPassword, setShowPassword] = useState(false);
  const [login, { isLoading }] = useLoginMutation();

  const emailParam = searchParams.get("email") || "";

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: emailParam,
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      const response = await login(values).unwrap();
      const { accessToken, role, isSetuCompleted, user: userData } = (response.data as any) || {};

      dispatch(
        setUser({
          user: userData,
          token: accessToken,
          role,
          isSetupCompleted: isSetuCompleted,
        }),
      );

      toast.success(response.message || "Welcome back to Agro Connect!");

      // Strict role-isolated routing
      let targetPath = "";
      if (role === "PRODUCER") {
        if (!isSetuCompleted) {
          targetPath = "/producer/dashboard?setup=true";
        } else if (redirectPath && redirectPath.startsWith("/producer")) {
          targetPath = redirectPath;
        } else {
          targetPath = "/producer/dashboard";
        }
      } else if (role === "DRIVER") {
        if (!isSetuCompleted) {
          targetPath = "/driver/dashboard?setup=true";
        } else if (redirectPath && redirectPath.startsWith("/driver")) {
          targetPath = redirectPath;
        } else {
          targetPath = "/driver/dashboard";
        }
      } else {
        // BUYER
        if (
          redirectPath &&
          !redirectPath.startsWith("/producer") &&
          !redirectPath.startsWith("/driver") &&
          !redirectPath.startsWith("/admin") &&
          !redirectPath.startsWith("/login") &&
          !redirectPath.startsWith("/register")
        ) {
          targetPath = redirectPath;
        } else {
          targetPath = "/";
        }
      }

      router.push(targetPath);
    } catch (err: unknown) {
      const errorMessage =
        (err as { data?: { message?: string } })?.data?.message ||
        "Invalid email or password. Please try again.";
      setError("root", { message: errorMessage });
      toast.error(errorMessage);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md">
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
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Sign in to access your marketplace account
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

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="form-input pr-10"
                  autoComplete="current-password"
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
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign in</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 border-t border-slate-200/80 pt-6 text-center text-sm text-slate-600">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-semibold text-emerald-700 hover:text-emerald-800"
            >
              Create account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
