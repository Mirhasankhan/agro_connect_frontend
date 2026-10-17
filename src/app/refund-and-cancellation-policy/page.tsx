import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  CheckCircle2,
  Clock,
  ShieldCheck,
  Truck,
  RotateCcw,
  AlertTriangle,
  HelpCircle,
  FileText,
} from "lucide-react";

const policyCards = [
  {
    icon: Clock,
    title: "1. Buyer Cancellation (Before Hub Dispatch)",
    badge: "100% Full Refund",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    description:
      "Buyers have the full flexibility to cancel an entire order or individual items before any farmer dispatches their harvest crates to our regional aggregation hubs. Full payment including delivery charges will be refunded directly to your payment card.",
    bulletPoints: [
      "Full order cancellation yields a 100% refund of item totals + delivery fee.",
      "Cancelling individual items refunds that item's subtotal instantly.",
      "Reserved farm stock is automatically released back to the producer's inventory.",
    ],
  },
  {
    icon: Truck,
    title: "2. Once Dispatched to Central Hub",
    badge: "Hub Logistics Locked",
    badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
    description:
      "Because fresh agricultural produce (fruits, leafy greens, dairy, poultry) is perishable, once a producer delivers crates to the regional hub, self-service cancellation is locked to safeguard against severe food spoilage and logistics waste.",
    bulletPoints: [
      "Produce undergoes quality inspection at the central hub upon arrival.",
      "Dispatched items can no longer be self-cancelled by buyers in the portal.",
      "Buyers facing urgent circumstances may contact Platform Admin for special assistance.",
    ],
  },
  {
    icon: RotateCcw,
    title: "3. Multi-Vendor Basket & Partial Cancellation",
    badge: "Independent Fulfillment",
    badgeColor: "bg-sky-50 text-sky-700 border-sky-200",
    description:
      "When an order contains harvests from multiple independent farmers, each harvest item is managed as a distinct fulfillment lifecycle.",
    bulletPoints: [
      "If Farmer A cancels or cannot supply their item, Farmer B's item still delivers smoothly.",
      "The buyer automatically receives a partial refund for any unfulfilled item.",
      "Order status updates transparently to Partially Cancelled.",
    ],
  },
  {
    icon: AlertTriangle,
    title: "4. Producer Inability to Fulfill (Crop Deficit)",
    badge: "Automated Buyer Protection",
    badgeColor: "bg-rose-50 text-rose-700 border-rose-200",
    description:
      "Agriculture involves seasonal variables like sudden rain, pests, or harvest shortfall. If a producer cannot fulfill an assigned order item, they must flag it before hub dispatch.",
    bulletPoints: [
      "Producer selects a certified reason (Crop damage, spoilage, or shortfall).",
      "Buyer receives an automated Stripe refund without needing to file a claim.",
      "If it was the sole item in the order, the full delivery charge is refunded as well.",
    ],
  },
  {
    icon: ShieldCheck,
    title: "5. Doorstep OTP Delivery & Verification",
    badge: "Certified Handover",
    badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
    description:
      "When a certified transporter arrives at the destination, orders cannot be cancelled mid-transit. The handover is cryptographically verified using a 6-digit OTP code sent to the buyer's registered email.",
    bulletPoints: [
      "Real-time GPS tracking is visible on the order tracking dashboard.",
      "Never disclose your OTP code until produce crates have arrived at your doorstep.",
      "Verifying OTP marks the order Delivered and releases escrowed farmer earnings.",
    ],
  },
  {
    icon: FileText,
    title: "6. 24-Hour Post-Delivery Quality Disputes",
    badge: "Quality Guarantee",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    description:
      "If produce arrives damaged, spoiled, or inconsistent with certified standards, buyers are protected by our 24-hour dispute window.",
    bulletPoints: [
      "Submit a Dispute Report from your Order Details page within 24 hours of delivery.",
      "Attach photos of damaged goods and provide details.",
      "Transporter and producer payouts are held in escrow while Admin mediates.",
      "Upon review approval, refunds are credited back to the customer's card.",
    ],
  },
];

const faqs = [
  {
    q: "How long does it take for my refund to show up on my card?",
    a: "Refunds are processed automatically via Stripe to your original credit or debit card. While Agro Connect issues the refund instantly, banking networks typically take between 5 to 10 business days to reflect the credit on your bank statement.",
  },
  {
    q: "Can I cancel my order if the driver is already on the road?",
    a: "No. Once a delivery driver picks up the order from the aggregation hub, the order status changes to 'Shipped' and cannot be cancelled. If there are quality issues upon arrival, you can inspect the items and use our 24-hour Quality Dispute feature.",
  },
  {
    q: "What happens if only one producer cancels in my multi-item order?",
    a: "You will be refunded immediately for that specific item's full subtotal. The remaining items from other farms will still be aggregated at the hub and delivered to you as scheduled.",
  },
  {
    q: "Are delivery fees refunded when I cancel?",
    a: "If your full order is cancelled before hub dispatch (or if all producers in your order cancel), the entire delivery charge (৳50) is 100% refunded. In partial item cancellations where other items are still delivered, the delivery fee remains in place.",
  },
];

export default function RefundAndCancellationPolicyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <main className="flex-1">
        {/* Hero Banner */}
        <section className="border-b border-emerald-950/80 bg-[#041d0f] px-4 py-16 text-white sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl space-y-3">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">
              Agro Connect Bangladesh
            </span>
            <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight">
              Refund & Cancellation Policy
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-emerald-100/80 pt-1">
              Clear, transparent guidelines designed to balance buyer protection with the unique perishability and logistics of fresh agricultural harvests.
            </p>
            <p className="text-xs text-emerald-300/70 pt-2 font-mono">
              Effective Date: October 17, 2026 • Version 2.4
            </p>
          </div>
        </section>

        {/* Core Policy Matrix */}
        <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
          <div className="grid grid-cols-1 gap-6">
            {policyCards.map((card, idx) => {
              const Icon = card.icon;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-4 hover:border-slate-300 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
                        <Icon className="w-5 h-5" />
                      </div>
                      <h3 className="font-serif font-bold text-lg text-slate-900">
                        {card.title}
                      </h3>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border inline-block w-fit ${card.badgeColor}`}
                    >
                      {card.badge}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {card.description}
                  </p>

                  <ul className="space-y-2 text-xs text-slate-700 pt-1">
                    {card.bulletPoints.map((bp, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{bp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          {/* Dispute & Escalation Guidelines */}
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-emerald-700" />
              <h3 className="font-serif font-bold text-lg text-slate-900">
                Administrative Oversight & Mediation
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              Agro Connect administration retains superuser mediation authority. In exceptional events such as severe cyclones, national highway blockades, or verifiable vendor discrepancies, our administrative team may manually approve emergency order cancellations, re-dispatch drivers, or execute full manual refunds.
            </p>
          </div>

          {/* FAQs */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <HelpCircle className="w-5 h-5 text-emerald-600" />
              <h3 className="font-serif font-bold text-xl text-slate-900">
                Frequently Asked Questions
              </h3>
            </div>

            <div className="divide-y divide-slate-100">
              {faqs.map((faq, i) => (
                <div key={i} className="py-4 space-y-1.5 first:pt-0 last:pb-0">
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                    {faq.q}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Bar */}
          <div className="p-6 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-serif font-bold text-base">Have questions about an existing order?</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Our support team is available 24/7 to assist with disputes and cancellations.
              </p>
            </div>
            <Link
              href="/orders"
              className="btn-primary text-xs py-2.5 px-6 whitespace-nowrap"
            >
              Go to My Orders
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
