"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

const FAQS = [
  {
    question: "How does Agro Connect verify farmers and produce quality?",
    answer:
      "Every producer must complete our strict onboarding process including national identification verification, agricultural land certificates, and on-site hub inspections. All harvests are categorized into clear standard grades with authentic photo documentation.",
  },
  {
    question: "How does the Escrow and OTP system protect both sides?",
    answer:
      "When a buyer places an order, payment is secured in escrow. A unique 6-digit OTP is generated for the buyer. When the delivery arrives, the buyer inspects the freshness and weight. Only when satisfied does the buyer give the OTP to the driver, releasing payments instantly.",
  },
  {
    question: "Can hotels, supermarkets, and catering companies buy in wholesale bulk?",
    answer:
      "Yes. Agro Connect features automatic volume tier discounts. When purchasing in 50 kg, 200 kg, or metric ton increments, wholesale pricing kicks in automatically with scheduled repeat freight options.",
  },
  {
    question: "Who handles the transportation and delivery?",
    answer:
      "We maintain a network of vetted, temperature-conscious freight drivers registered on our driver platform. Drivers receive dedicated cargo manifests and are compensated promptly upon verified OTP confirmation.",
  },
];

interface FaqSectionProps {
  id?: string;
}

export default function FaqSection({ id = "faq" }: FaqSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id={id} className="py-20 bg-slate-50 border-t border-slate-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-14">
          <span className="text-xs tracking-widest text-emerald-700 font-bold">
            Got Questions?
          </span>
          <h2 className="font-serif text-3xl font-bold text-slate-900 mt-2">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-slate-600 mt-2">
            Everything you need to know about our sourcing, escrow, and agricultural logistics.
          </p>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={faq.question}
                className="border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-sm transition-colors"
              >
                <button
                  type="button"
                  id={`${id}-btn-${index}`}
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full flex items-center justify-between p-5 text-left font-serif text-base font-bold text-slate-900 hover:text-emerald-700 transition-colors focus:outline-none"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ml-4 ${
                      isOpen ? "rotate-180 text-emerald-600" : ""
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3"
                    >
                      {faq.answer}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
