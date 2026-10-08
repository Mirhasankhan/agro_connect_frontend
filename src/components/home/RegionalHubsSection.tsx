"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, ArrowRight, Compass, ShieldCheck } from "lucide-react";

interface RegionalHub {
  name: string;
  department: string;
  specialties: string[];
  producerCount: string;
  description: string;
  tag: string;
}

const REGIONAL_HUBS: RegionalHub[] = [
  {
    name: "Bouaké Hub",
    department: "Vallée du Bandama",
    specialties: ["Igname", "Maïs", "Arachide", "Manioc"],
    producerCount: "160+ Producers",
    description: "Central trading crossroads known for highest grade yams and essential cereal harvests.",
    tag: "Central Basin",
  },
  {
    name: "Korhogo Hub",
    department: "Région du Poro",
    specialties: ["Anacarde (Cashew)", "Mangue", "Riz de Savane", "Sésame"],
    producerCount: "130+ Producers",
    description: "Northern sunshine belt producing export-grade cashews, juicy Kent mangoes, and milled rice.",
    tag: "Northern Savannah",
  },
  {
    name: "Yamoussoukro Hub",
    department: "Région du Bélier",
    specialties: ["Banane Plantain", "Attiéké Root", "Tomates", "Piment"],
    producerCount: "115+ Producers",
    description: "Lush soils feeding Abidjan and central cities with weekly harvests of fresh plantains and vegetables.",
    tag: "Capital Terroir",
  },
  {
    name: "San Pédro Hub",
    department: "Bas-Sassandra",
    specialties: ["Cacao", "Café", "Huile de Palme", "Noix de Coco"],
    producerCount: "90+ Producers",
    description: "Coastal forest terroir specializing in premium certified tree crops and palm commodities.",
    tag: "Coastal Belt",
  },
];

export default function RegionalHubsSection() {
  return (
    <section className="py-20 bg-white border-b border-slate-200/90 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-3">
              <Compass className="w-3.5 h-3.5 text-emerald-600" />
              <span>Traceable Provenance</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              Direct From Regional Farm Hubs
            </h2>
            <p className="text-sm text-slate-600 mt-2 max-w-xl">
              Every harvest listed on Agro Connect is geo-verified from certified cooperatives across Côte d&apos;Ivoire.
            </p>
          </div>

          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
          >
            Explore all regional harvests
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Hub Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {REGIONAL_HUBS.map((hub, index) => (
            <motion.div
              key={hub.name}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{
                duration: 0.35,
                delay: index * 0.08,
                ease: "easeOut",
              }}
              whileHover={{ y: -4 }}
              className="group bg-slate-50/70 hover:bg-white rounded-3xl p-6 border border-slate-200 hover:border-emerald-400/80 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Header of card */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/70 px-2.5 py-1 rounded-full border border-emerald-200/60">
                    {hub.tag}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-600">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{hub.producerCount}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 mb-2">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100/80 flex items-center justify-center text-emerald-700 flex-shrink-0 group-hover:scale-105 transition-transform">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                      {hub.name}
                    </h3>
                    <p className="text-xs text-slate-600 font-medium">{hub.department}</p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                  {hub.description}
                </p>

                {/* Specialties Pills */}
                <div className="mt-4 pt-3 border-t border-slate-200/60">
                  <span className="block text-[10px] uppercase font-bold text-slate-600 tracking-wider mb-2">
                    Key Harvests:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {hub.specialties.map((spec) => (
                      <span
                        key={spec}
                        className="text-[11px] font-medium px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-slate-700"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-6 pt-3">
                <Link
                  href={`/products?search=${encodeURIComponent(hub.name.split(" ")[0])}`}
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white hover:bg-emerald-600 text-slate-700 hover:text-white border border-slate-200 hover:border-emerald-600 text-xs font-semibold shadow-xs transition-all"
                >
                  <span>Browse {hub.name.split(" ")[0]} Crops</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
