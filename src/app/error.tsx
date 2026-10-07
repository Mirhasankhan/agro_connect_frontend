"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCcw, Home } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log unexpected runtime error
    console.error("Unhandled App Runtime Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f4f7f5] px-4">
      <div className="w-full max-w-md text-center p-8 bg-white rounded-3xl shadow-xl border border-slate-200">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
          <AlertTriangle className="h-8 w-8" />
        </div>

        <span className="inline-block text-xs font-semibold tracking-wider text-amber-700 uppercase mb-2">
          Application Error
        </span>

        <h1 className="font-serif text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Unexpected Disturbance
        </h1>

        <p className="mt-3 text-sm text-slate-600">
          We encountered an unexpected error while processing this page. Your data and cart session remain safe.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="btn-primary w-full sm:w-auto inline-flex items-center justify-center gap-2 text-sm"
          >
            <RefreshCcw className="h-4 w-4" />
            Try Again
          </button>
          <Link
            href="/"
            className="btn-secondary w-full sm:w-auto inline-flex items-center justify-center gap-2 text-sm"
          >
            <Home className="h-4 w-4" />
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
