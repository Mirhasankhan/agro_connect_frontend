import React from "react";
import Link from "next/link";
import { Sprout, Mail, Phone, MapPin, ShieldCheck, Truck, Award } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-300 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-full bg-emerald-500 p-0.5 flex items-center justify-center">
                <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center">
                  <Sprout className="w-5 h-5 text-emerald-400" />
                </div>
              </div>
              <span className="font-serif text-2xl font-bold tracking-tight text-white">
                Agro<span className="text-emerald-400 font-sans">Connect</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Agricultural platform number 1 in Ivory Coast. Connecting certified local producers
              directly with wholesale & retail buyers, offering dynamic bulk pricing and reliable
              temperature-controlled logistics.
            </p>
            <div className="pt-2 flex flex-col space-y-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span>Plateau & Cocody, Abidjan, Côte d&apos;Ivoire</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>+225 07 00 00 00 00</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400" />
                <span>support@agroconnect.ci</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif font-bold text-white text-base mb-4 tracking-wide">
              Marketplace
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/products" className="hover:text-emerald-400 transition-colors">
                  All Harvests & Products
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-emerald-400 transition-colors">
                  Wholesale Bulk Discounts
                </Link>
              </li>
              <li>
                <Link href="/#benefits" className="hover:text-emerald-400 transition-colors">
                  Quality Standards
                </Link>
              </li>
              <li>
                <Link href="/#for-whom" className="hover:text-emerald-400 transition-colors">
                  How Ordering Works
                </Link>
              </li>
            </ul>
          </div>

          {/* Partner with us */}
          <div>
            <h4 className="font-serif font-bold text-white text-base mb-4 tracking-wide">
              Join Our Network
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/register" className="hover:text-emerald-400 transition-colors">
                  Sell as a Farmer / Producer
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-emerald-400 transition-colors">
                  Deliver as a Transporter / Driver
                </Link>
              </li>
              <li>
                <Link href="/onboarding/producer" className="hover:text-emerald-400 transition-colors">
                  Producer Verification Process
                </Link>
              </li>
              <li>
                <Link href="/onboarding/driver" className="hover:text-emerald-400 transition-colors">
                  Driver Vehicle Inspection
                </Link>
              </li>
              <li>
                <Link href="/#for-whom" className="hover:text-emerald-400 transition-colors">
                  Wholesale Buyer Accounts
                </Link>
              </li>
            </ul>
          </div>

          {/* Trust & Guarantee */}
          <div>
            <h4 className="font-serif font-bold text-white text-base mb-4 tracking-wide">
              Trust & Security
            </h4>
            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <span>100% Certified local farm inspection</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Truck className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <span>Tracked delivery with OTP confirmation</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Award className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <span>Transparent tiered wholesale pricing</span>
              </div>
              <div className="pt-2 text-[11px] text-emerald-400 font-mono">
                Currency: XOF (CFA Franc)
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Agro Connect Côte d&apos;Ivoire. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/" className="hover:text-emerald-400 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/" className="hover:text-emerald-400 transition-colors">
              Terms of Service
            </Link>
            <Link href="/" className="hover:text-emerald-400 transition-colors">
              Agricultural Standards
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
