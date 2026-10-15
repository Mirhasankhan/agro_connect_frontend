import type { Metadata } from "next";
import AboutUsClient from "./AboutUsClient";

export const metadata: Metadata = {
  title: "About Us | Agro Connect - From Fields to Tables",
  description:
    "Learn about Agro Connect Bangladesh. We connect certified local farmers directly with wholesale and retail buyers through transparent bulk pricing, escrow security, and reliable temperature-controlled transport.",
  openGraph: {
    title: "About Us | Agro Connect Bangladesh",
    description:
      "Empowering local farmers, simplifying wholesale procurement, and delivering verified fresh agricultural harvests directly across Bangladesh.",
    type: "website",
  },
};

export default function AboutPage() {
  return <AboutUsClient />;
}
