import React from "react";
import { Sprout } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#061a10] text-white">
      <div className="relative flex items-center justify-center">
        <div className="h-16 w-16 rounded-full border-4 border-emerald-500/20 border-t-emerald-400 animate-spin" />
        <div className="absolute flex h-10 w-10 items-center justify-center rounded-full bg-[#0c2b1c] text-emerald-400">
          <Sprout className="h-5 w-5 animate-pulse" />
        </div>
      </div>
      <p className="mt-4 font-serif text-sm font-semibold tracking-wide text-emerald-200">
        Connecting to Agro Connect...
      </p>
    </div>
  );
}
