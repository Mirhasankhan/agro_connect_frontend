"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Star, Quote, BadgeCheck, MessageSquareQuote } from "lucide-react";

interface Testimonial {
  name: string;
  role: string;
  location: string;
  badge: string;
  avatar: string;
  rating: number;
  quote: string;
  metric: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    name: "Kouadio Konan",
    role: "Cooperative President, 42 Farmers",
    location: "Bouaké, Vallée du Bandama",
    badge: "Certified Producer",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    rating: 5,
    quote:
      "Before Agro Connect, over 30% of our yam harvest spoiled while waiting for intermediary trucks. Now buyers in Abidjan reserve our produce weeks ahead, and we are paid instantly via OTP upon arrival.",
    metric: "3.2 Tons Sold This Season",
  },
  {
    name: "Aminata Touré",
    role: "Executive Chef & Restaurant Owner",
    location: "Cocody, Abidjan",
    badge: "Verified Bulk Buyer",
    avatar:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
    rating: 5,
    quote:
      "We source plantains, cassava, and seasonal vegetables directly from rural farms twice a week. The bulk tiered pricing saved our restaurant group 24% on monthly produce costs, and the produce is incomparably fresh.",
    metric: "24% Procurement Cost Saved",
  },
  {
    name: "Mamadou Bakayoko",
    role: "Agro Fleet Transporter (3.5T Van)",
    location: "Yamoussoukro",
    badge: "Verified Transporter",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
    rating: 5,
    quote:
      "No more waiting empty-handed at market stations. I get scheduled farm pickup dispatches straight to my phone. Deliveries are OTP confirmed at the receiver, and earnings hit my wallet immediately.",
    metric: "180+ Completed Routes",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-20 bg-white border-b border-slate-200/90 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-3">
            <MessageSquareQuote className="w-3.5 h-3.5 text-emerald-600" />
            <span>Voices From The Soil</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            Trusted by Growers & Buyers Alike
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Real feedback from cooperatives, restaurants, and transporters transforming the agricultural supply chain.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{
                duration: 0.35,
                delay: index * 0.1,
                ease: "easeOut",
              }}
              whileHover={{ y: -4 }}
              className="bg-slate-50/70 rounded-3xl p-7 border border-slate-200/90 hover:border-emerald-300 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Rating & Quote Icon */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(item.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <Quote className="w-6 h-6 text-slate-300 rotate-180" />
                </div>

                {/* Quote Text */}
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                  &ldquo;{item.quote}&rdquo;
                </p>
              </div>

              {/* Author Info */}
              <div className="mt-6 pt-5 border-t border-slate-200/80">
                <div className="flex items-center gap-3">
                  <div className="relative w-11 h-11 rounded-full overflow-hidden bg-slate-200 border-2 border-white shadow-xs flex-shrink-0">
                    <Image
                      src={item.avatar}
                      alt={item.name}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                        {item.name}
                      </h4>
                      <BadgeCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    </div>
                    <p className="text-[11px] text-slate-600 truncate">{item.role}</p>
                    <p className="text-[10px] text-emerald-700 font-medium truncate mt-0.5">
                      {item.location}
                    </p>
                  </div>
                </div>

                <div className="mt-3 inline-block px-2.5 py-1 rounded-lg bg-emerald-100/60 text-emerald-800 text-[10px] font-bold">
                  {item.metric}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
