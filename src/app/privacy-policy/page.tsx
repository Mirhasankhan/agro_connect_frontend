import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const sections = [
  {
    title: "1. Information we collect",
    content:
      "When you register or use Agro Connect, we may collect your name, email address, account role, contact details, delivery information, order details, and information you provide during producer or driver verification.",
  },
  {
    title: "2. How we use your information",
    content:
      "We use this information to create and secure your account, process orders and payments, coordinate delivery, verify marketplace participants, provide support, improve the platform, and send important service messages.",
  },
  {
    title: "3. Sharing information",
    content:
      "We share only the information needed to operate a transaction. For example, relevant delivery details may be shared with the producer or driver handling an order. We may also use trusted service providers for hosting, payments, communications, and analytics.",
  },
  {
    title: "4. Security and retention",
    content:
      "We use reasonable administrative and technical safeguards to protect account and transaction information. We retain information for as long as needed to provide the service, meet legal obligations, resolve disputes, and enforce our agreements.",
  },
  {
    title: "5. Cookies and local storage",
    content:
      "Agro Connect may use cookies or browser storage to maintain sessions, remember preferences, and keep the application secure. You can control cookies through your browser, although some features may not work correctly when they are disabled.",
  },
  {
    title: "6. Your choices",
    content:
      "You may review or update information in your account where those controls are available. You may also contact us to ask about your personal information, request a correction, or raise a privacy concern. Some records may need to be retained for legal or operational reasons.",
  },
  {
    title: "7. Children’s privacy",
    content:
      "Agro Connect is intended for users who can legally enter into these terms. We do not knowingly collect personal information from children who are not permitted to use the service.",
  },
  {
    title: "8. Policy updates",
    content:
      "We may update this Privacy Policy when our services or legal requirements change. We will publish the new version on this page and update the date above.",
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <Navbar />
      <main className="flex-1">
        <section className="border-b border-emerald-950/80 bg-[#041d0f] px-4 py-16 text-white sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
              Agro Connect
            </p>
            <h1 className="font-serif text-4xl font-bold sm:text-5xl">Privacy Policy</h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-emerald-100/80">
              This policy describes the information we collect, how we use it, and the choices
              available to you when you use Agro Connect.
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
              By using Agro Connect, you also agree to our{" "}
              <Link
                href="/terms-and-conditions"
                className="font-semibold text-emerald-700 hover:underline"
              >
                Terms and Conditions
              </Link>
              .
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
