"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, CheckCircle2, BellRing } from "lucide-react";

export default function HarvestNewsletterSection() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() && email.includes("@")) {
      setSubscribed(true);
    }
  };

  return (
    <section className="py-16 bg-white border-b border-slate-200/90 relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-[#042814] text-white p-8 sm:p-12 relative overflow-hidden shadow-xl"
        >
          {/* Subtle decorative circles */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-emerald-500/15 blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-amber-400/10 blur-2xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-700/60 border border-emerald-500/30 text-emerald-200 text-xs font-semibold backdrop-blur-sm">
              <BellRing className="w-3.5 h-3.5 text-amber-300" />
              <span>Weekly Agricultural Bulletin</span>
            </div>

            <h3 className="font-serif text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Get Weekly Harvest Reports & Wholesale Price Alerts
            </h3>

            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-lg mx-auto">
              Stay ahead of seasonal commodity price fluctuations, new cooperative arrivals in Bouaké and Korhogo, and bulk discounts.
            </p>

            {subscribed ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-6 p-4 rounded-2xl bg-emerald-700/70 border border-emerald-400/50 inline-flex items-center gap-3 text-white text-xs sm:text-sm font-semibold"
              >
                <CheckCircle2 className="w-5 h-5 text-amber-300 flex-shrink-0" />
                <span>Thank you! You are now subscribed to the weekly Agro Connect bulletin.</span>
              </motion.div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="mt-6 flex flex-col sm:flex-row items-center gap-3 max-w-md mx-auto"
              >
                <div className="relative w-full">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full pl-11 pr-4 py-3 rounded-full bg-white text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm border border-transparent focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-sm"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-3 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm whitespace-nowrap transition-all shadow-md active:scale-95 hover:scale-105"
                >
                  Subscribe Free
                </button>
              </form>
            )}

            <div className="pt-2 flex flex-wrap items-center justify-center gap-6 text-[11px] text-emerald-200/80">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-300" />
                Zero spam
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-300" />
                Unsubscribe anytime
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-300" />
                Weekly harvest market updates
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
