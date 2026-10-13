"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

interface FaqItem {
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    question: "How does the 6-digit OTP delivery verification work?",
    answer:
      "When you place an order, our system generates a unique encrypted 6-digit OTP code visible only in your buyer dashboard. When the driver delivers the goods, you inspect the harvest. Once satisfied with the freshness and weight, you share the OTP code with the driver. When the driver enters this code, the delivery is verified and escrow funds are released to the farmer and driver.",
  },
  {
    question: "Can I buy individual quantities or must I purchase in bulk?",
    answer:
      "You can purchase both! Each listing displays its minimum order quantity (e.g. 5 kg or 1 crate). For household buyers, you can purchase smaller quantities at standard fair prices. If you buy larger volumes (50 kg, 200 kg, or metric tons), our automated tiered pricing automatically triggers substantial discounts.",
  },
  {
    question: "How are bulk tiered discounts calculated?",
    answer:
      "Producers configure their own wholesale pricing tiers directly on their dashboard (e.g., 1-20 kg at ৳1,000/kg, 21-100 kg at ৳850/kg, and 100+ kg at ৳700/kg). When you adjust the quantity in your cart or on the product page, our calculator applies the discounted rate instantly.",
  },
  {
    question: "Which cities and agricultural regions are currently covered?",
    answer:
      "We connect major production basins (Bouaké, Korhogo, Yamoussoukro, San Pédro, Daloa) with delivery destinations across Greater Abidjan (Cocody, Yopougon, Plateau, Marcory, Bingerville) and key provincial capitals.",
  },
  {
    question: "What happens if the delivered produce does not match description?",
    answer:
      "Because payments are held in escrow until OTP confirmation, you have complete peace of mind. If the goods are damaged, spoiled, or incomplete upon delivery, do NOT provide the OTP. You can flag an issue directly in the app or contact our dispute support team for an instant refund or replacement dispatch.",
  },
  {
    question: "How can farmers or transporters join Agro Connect?",
    answer:
      "Registration is free! Choose 'Farmer/Producer' or 'Transporter/Driver' on our signup page. Our verification team validates your national ID, farm coordinates, or vehicle documents within 24 hours so you can start selling or delivering immediately.",
  },
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section className="py-20 bg-slate-50 border-b border-slate-200/90 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-3">
            <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>Got Questions?</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Everything you need to know about purchasing, escrow security, and delivery on Agro Connect.
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3.5">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={faq.question}
                className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  className="w-full py-4.5 px-5 sm:px-6 text-left flex items-center justify-between gap-4 font-semibold text-sm sm:text-base text-slate-900 hover:text-emerald-700 transition-colors focus:outline-none"
                >
                  <span className="leading-snug">{faq.question}</span>
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-transform duration-200 ${
                      isOpen
                        ? "bg-emerald-100 text-emerald-800 rotate-180"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                    >
                      <div className="px-5 sm:px-6 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Contact fallback */}
        <div className="mt-10 p-6 rounded-2xl bg-emerald-50/60 border border-emerald-200/70 text-center flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left">
            <h4 className="text-sm font-bold text-slate-900">Still have questions?</h4>
            <p className="text-xs text-slate-600 mt-0.5">
              Our regional agro support advisors are available to assist with custom bulk sourcing.
            </p>
          </div>
          <Link
            href="/messages"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs whitespace-nowrap transition-colors"
          >
            <span>Contact Agro Support</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
