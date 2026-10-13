import Link from "next/link";
import { ArrowLeft, Home, Sprout } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f4f7f5] px-4">
      <div className="w-full max-w-md text-center p-8 bg-white rounded-3xl shadow-xl border border-slate-200">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
          <Sprout className="h-8 w-8" />
        </div>

        <span className="inline-block text-xs font-semibold tracking-wider text-emerald-600  mb-2">
          Page Not Found (404)
        </span>

        <h1 className="font-serif text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Harvest Field Not Located
        </h1>

        <p className="mt-3 text-sm text-slate-600">
          Sorry, the page you are looking for does not exist, has been archived, or may have been moved.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="btn-primary w-full sm:w-auto inline-flex items-center justify-center gap-2 text-sm"
          >
            <Home className="h-4 w-4" />
            Back to Home
          </Link>
          <Link
            href="/products"
            className="btn-secondary w-full sm:w-auto inline-flex items-center justify-center gap-2 text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Explore Catalog
          </Link>
        </div>
      </div>
    </div>
  );
}
