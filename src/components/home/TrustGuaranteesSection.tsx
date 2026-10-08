"use client";

import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Scale, Leaf, Truck, CheckCircle2 } from "lucide-react";

export default function TrustGuaranteesSection() {
  const guarantees = [
    {
      icon: ShieldCheck,
      title: "Escrow Payment Protection",
      description:
        "Funds remain secured in our platform escrow. The producer is only paid after you inspect the delivery and provide your 6-digit OTP.",
      color: "text-emerald-700 bg-emerald-50 border-emerald-200",
    },
    {
      icon: Scale,
      title: "Fair Producer Pricing",
      description:
        "We cut out parasitic brokers so farmers earn a living wage and wholesale buyers pay up to 30% below terminal city market prices.",
      color: "text-amber-700 bg-amber-50 border-amber-200",
    },
    {
      icon: Leaf,
      title: "100% Traceable Terroir",
      description:
        "Every listing details farm location, harvest date, and producer certification. Know exactly where your food was cultivated.",
      color: "text-lime-700 bg-lime-50 border-lime-200",
    },
    {
      icon: Truck,
      title: "Agro-Logistics Fleet",
      description:
        "Dedicated motorbikes, vans, and heavy trucks optimized for agricultural cargo with prompt dispatch directly from rural farm gates.",
      color: "text-blue-700 bg-blue-50 border-blue-200",
    },
  ];

  return (
    <section className="py-16 bg-slate-50 border-b border-slate-200/90 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {guarantees.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{
                  duration: 0.35,
                  delay: index * 0.08,
                  ease: "easeOut",
                }}
                className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between"
              >
                <div>
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center border mb-4 ${item.color}`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif text-base sm:text-lg font-bold text-slate-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Guaranteed Standard</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
