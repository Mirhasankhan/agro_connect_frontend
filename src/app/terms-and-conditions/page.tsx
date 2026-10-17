import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const sections = [
  {
    title: "1. Acceptance of these terms",
    content:
      "By creating an Agro Connect account or using our marketplace, you agree to these Terms and Conditions. If you do not agree, please do not use the platform.",
  },
  {
    title: "2. Accounts and eligibility",
    content:
      "You must provide accurate, current information when registering and keep your login details secure. You are responsible for activity performed through your account. Producer and driver accounts may require additional verification before they can offer services.",
  },
  {
    title: "3. Marketplace transactions",
    content:
      "Agro Connect connects buyers, producers, and drivers. Product descriptions, availability, pricing, delivery estimates, and tier discounts are provided by the relevant producer or platform partner and may change before an order is confirmed.",
  },
  {
    title: "4. Orders, payments, and delivery",
    content:
      "You agree to provide accurate delivery details and pay the amount shown at checkout. Delivery handover may require the order verification process, including an OTP. Orders may be cancelled or adjusted where products are unavailable, delivery cannot be completed, or a transaction appears fraudulent.",
  },
  {
    title: "5. User responsibilities",
    content:
      "You must use Agro Connect lawfully and respectfully. Do not misuse another person's account, submit misleading information, interfere with the service, attempt unauthorized access, or upload harmful content.",
  },
  {
    title: "6. Product quality and disputes",
    content:
      "We work to support reliable agricultural commerce, but agricultural products can vary by season, harvest, and handling. If an order has a quality, quantity, or delivery issue, report it promptly through the available support channels so it can be reviewed.",
  },
  {
    title: "7. Service availability",
    content:
      "We may update, suspend, or discontinue parts of the platform for maintenance, safety, legal, or operational reasons. We will make reasonable efforts to keep the service available but cannot guarantee uninterrupted access.",
  },
  {
    title: "8. Changes to these terms",
    content:
      "We may update these terms as Agro Connect develops. The updated version will be posted on this page with a revised date. Continued use of the platform after an update means you accept the revised terms.",
  },
];

export default function TermsAndConditionsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <Navbar />
      <main className="flex-1">
        <section className="border-b border-emerald-950/80 bg-[#041d0f] px-4 py-16 text-white sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
              Agro Connect
            </p>
            <h1 className="font-serif text-4xl font-bold sm:text-5xl">
              Terms and Conditions
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-emerald-100/80">
              These terms explain the rules for using the Agro Connect marketplace and
              participating in our agricultural network.
            </p>
            <p className="mt-5 text-xs text-emerald-200/70">Last updated: October 17, 2026</p>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
            <div className="space-y-8">
              {sections.map((section) => (
                <article key={section.title}>
                  <h2 className="font-serif text-xl font-bold text-slate-900">{section.title}</h2>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{section.content}</p>
                </article>
              ))}
            </div>
            <div className="mt-10 border-t border-slate-200 pt-6 text-sm text-slate-600">
              Questions about these terms?{" "}
              <Link href="/privacy-policy" className="font-semibold text-emerald-700 hover:underline">
                Read our Privacy Policy
              </Link>{" "}
              or contact the Agro Connect team through the contact details in the footer.
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
