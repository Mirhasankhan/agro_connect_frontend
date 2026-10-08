import React from "react";
import { Sprout } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-800">
      <div className="relative flex items-center justify-center">
        <div className="h-16 w-16 rounded-full border-4 border-slate-200 border-t-emerald-600 animate-spin" />
        <div className="absolute flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <Sprout className="h-5 w-5 animate-pulse" />
        </div>
      </div>
      <p className="mt-4 text-sm font-medium tracking-wide text-slate-600">
        Connecting to Agro Connect...
      </p>
    </div>
  );
}
