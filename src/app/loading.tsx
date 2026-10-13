import React from "react";
import Image from "next/image";

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-800">
      <div className="relative flex items-center justify-center">
        {/* Animated spinner ring around the logo */}
        <div className="h-24 w-24 rounded-full border-4 border-emerald-100 border-t-emerald-600 animate-spin" />

        {/* Soft glowing ambient aura */}
        <div className="absolute inset-0 rounded-full bg-emerald-500/10 blur-xl animate-pulse" />

        {/* Logo Container */}
        <div className="absolute flex h-16 w-16 items-center justify-center rounded-full bg-white p-2 shadow-md ring-1 ring-slate-100">
          <Image
            src="/logo9.png"
            alt="Agro Connect"
            width={64}
            height={64}
            priority
            className="h-full w-full object-contain animate-pulse"
          />
        </div>
      </div>

      <div className="mt-6 flex flex-col items-center gap-2">
        <p className="text-sm font-medium tracking-wide text-slate-700">
          Connecting to Agro Connect...
        </p>
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-bounce [animation-delay:-0.3s]" />
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-bounce [animation-delay:-0.15s]" />
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-bounce" />
        </div>
      </div>
    </div>
  );
}
