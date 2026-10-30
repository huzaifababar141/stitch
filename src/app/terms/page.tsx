import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import {
  Scissors,
  ShieldCheck,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  ChevronRight,
  Sparkles,
  Truck,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Terms of Service — TailorLink.pk',
  description:
    'Terms and conditions governing custom bespoke tailoring, in-house fabric stock purchases, fitting guarantees, and alteration services at TailorLink.pk.',
};

export default function TermsOfServicePage() {
  const lastUpdated = 'October 30, 2026';

  const sections = [
    { id: 'introduction', title: '1. Acceptance of Terms & Introduction' },
    {
      id: 'services',
      title: '2. Bespoke Tailoring & In-House Fabric Services',
    },
    { id: 'orders-pricing', title: '3. Orders, Pricing & Payment Terms' },
    { id: 'measurements', title: '4. Measurements, Sizing & Master Samples' },
    { id: 'fabric-stock', title: '5. In-House Fabric Stock & Sourcing' },
    {
      id: 'fit-guarantee',
      title: '6. 100% Guaranteed Fit & Alteration Policy',
    },
    {
      id: 'production-delivery',
      title: '7. Turnaround Timelines & Courier Delivery',
    },
    { id: 'cancellations-refunds', title: '8. Cancellation & Refund Policy' },
    { id: 'customer-conduct', title: '9. User Accounts & Customer Conduct' },
    {
      id: 'intellectual-property',
      title: '10. Intellectual Property & Atelier Rights',
    },
    { id: 'liability', title: '11. Limitation of Liability & Force Majeure' },
    { id: 'governing-law', title: '12. Governing Law & Dispute Resolution' },
    { id: 'contact', title: '13. Atelier Support & Contact Information' },
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#1A1A1A] font-sans selection:bg-[#7E153A]/15 selection:text-[#7E153A] flex flex-col justify-between">
      {/* ── TOP HEADER ── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 sm:gap-3 group shrink-0"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#7E153A] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform shrink-0">
              <Scissors className="w-4 h-4 sm:w-5 sm:h-5 text-[#E8D7B5]" />
            </div>
            <div>
              <span className="font-serif text-lg sm:text-2xl font-bold tracking-tight text-gray-900 leading-none block">
                TailorLink<span className="text-[#7E153A]">.pk</span>
              </span>
              <span className="text-[8px] sm:text-[9px] uppercase tracking-widest text-gray-400 font-medium block mt-0.5">
                Bespoke Tailoring Studio
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold tracking-wider uppercase text-gray-600">
            <Link
              href="/stock"
              className="hover:text-[#7E153A] transition-colors"
            >
              Fabric Stock
            </Link>
            <Link
              href="/track"
              className="hover:text-[#7E153A] transition-colors"
            >
              Track Order
            </Link>
            <Link
              href="/help"
              className="hover:text-[#7E153A] transition-colors"
            >
              Help
            </Link>
            <Link
              href="/privacy"
              className="hover:text-[#7E153A] transition-colors"
            >
              Privacy
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs font-bold text-gray-700 hover:text-[#7E153A]"
              >
                Sign In
              </Button>
            </Link>
            <Link href="/new-order">
              <Button
                size="sm"
                className="bg-[#7E153A] hover:bg-[#630f2d] text-white text-xs font-bold rounded-xl shadow-xs px-4"
              >
                Start Order
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full space-y-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Link href="/" className="hover:text-[#7E153A] transition-colors">
            Home
          </Link>
          <ChevronRight size={12} />
          <span className="text-gray-900 font-semibold">Terms of Service</span>
        </div>

        {/* Hero Title Card */}
        <div className="bg-linear-to-r from-[#7E153A] via-[#921943] to-[#5a0f2a] rounded-3xl p-6 sm:p-10 text-white shadow-lg space-y-3 relative overflow-hidden">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-white text-[11px] font-bold uppercase tracking-wider">
            <FileText size={13} className="text-[#E8D7B5]" /> Legal Agreement
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            Terms of Service
          </h1>
          <p className="text-xs sm:text-sm text-red-100 max-w-2xl leading-relaxed">
            Please read these Terms of Service carefully before ordering bespoke
            tailoring, purchasing in-house fabrics, or submitting custom
            measurements through TailorLink.pk.
          </p>
          <div className="pt-2 flex items-center gap-3 text-xs text-red-200">
            <Clock size={14} />
            <span>
              Effective Last Updated: <strong>{lastUpdated}</strong>
            </span>
          </div>

          <div className="absolute -right-8 -bottom-8 w-60 h-60 rounded-full bg-white/5 pointer-events-none blur-2xl" />
        </div>

        {/* Content Layout: Quick Jump + Document Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Quick Table of Contents Sidebar */}
          <aside className="lg:col-span-4 bg-white rounded-2xl border border-gray-100 p-5 shadow-xs sticky top-24 hidden lg:block space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Table of Contents
            </h3>
            <nav className="space-y-1 text-xs">
              {sections.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="block py-1.5 px-2 rounded-lg text-gray-600 hover:text-[#7E153A] hover:bg-red-50/50 font-medium transition-colors"
                >
                  {s.title}
                </a>
              ))}
            </nav>
            <div className="pt-3 border-t border-gray-100 text-[11px] text-gray-400">
              Need assistance? Contact our legal team at{' '}
              <span className="font-semibold text-gray-700">
                support@tailorlink.pk
              </span>
              .
            </div>
          </aside>

          {/* Legal Document Clauses */}
          <article className="lg:col-span-8 bg-white rounded-3xl border border-gray-100 p-6 sm:p-10 shadow-xs space-y-10 text-gray-800 leading-relaxed text-sm">
            {/* Section 1 */}
            <section id="introduction" className="space-y-3">
              <h2 className="text-lg sm:text-xl font-black text-gray-900 border-b border-gray-100 pb-2">
                1. Acceptance of Terms & Introduction
              </h2>
              <p>
                Welcome to <strong>TailorLink.pk</strong>{' '}
                (&quot;TailorLink&quot;, &quot;we&quot;, &quot;us&quot;, or
                &quot;our&quot;). TailorLink operates a digital tailoring
                atelier platform and in-house fabric stock registry enabling
                customers across Pakistan and overseas to commission bespoke
                custom-stitched apparel and purchase curated unstitched designer
                fabrics.
              </p>
              <p>
                By creating an account, browsing our catalog, placing an order
                for in-house fabric or custom stitching, or submitting
                physical/digital measurements, you agree to be bound by these
                Terms of Service (&quot;Terms&quot;) and our{' '}
                <Link
                  href="/privacy"
                  className="text-[#7E153A] font-bold hover:underline"
                >
                  Privacy Policy
                </Link>
                . If you do not agree with any part of these Terms, please do
                not use our services.
              </p>
            </section>

            {/* Section 2 */}
            <section id="services" className="space-y-3">
              <h2 className="text-lg sm:text-xl font-black text-gray-900 border-b border-gray-100 pb-2">
                2. Bespoke Tailoring & In-House Fabric Services
              </h2>
              <p>TailorLink provides three core integrated apparel services:</p>
              <ul className="list-disc pl-5 space-y-1.5 text-gray-700">
                <li>
                  <strong>Bespoke Custom Stitching:</strong> Tailoring of
                  women&apos;s ethnic wear (Shalwar Kameez, Frocks, Maxis,
                  Kurtis, Trousers) and men&apos;s traditional and formal wear
                  (Shalwar Kameez, Waistcoats/Sadris, 2-Piece Pent Coats,
                  Trousers).
                </li>
                <li>
                  <strong>Curated In-House Fabric Stock:</strong> Direct
                  purchase of inspected unstitched fabrics (Lawn, Cotton,
                  Chiffon, Silk, Linen, Khaddar, Organza, Wool blends) bundled
                  seamlessly with bespoke tailoring options.
                </li>
                <li>
                  <strong>Doorstep Courier Logistics:</strong> Coordinated
                  fabric pickup from customer premises and tracked delivery of
                  finished garments nationwide through certified courier
                  partners.
                </li>
              </ul>
            </section>

            {/* Section 3 */}
            <section id="orders-pricing" className="space-y-3">
              <h2 className="text-lg sm:text-xl font-black text-gray-900 border-b border-gray-100 pb-2">
                3. Orders, Pricing & Payment Terms
              </h2>
              <p>
                All prices quoted on TailorLink.pk are displayed in{' '}
                <strong>Pakistani Rupees (PKR)</strong> inclusive of applicable
                craft handling charges unless explicitly stated otherwise.
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-gray-700">
                <li>
                  <strong>Transparent Price Calculations:</strong> When
                  commissioning an order, prices are split into Fabric Cost,
                  Base Stitching Fee, and optional Add-on embellishments
                  (piping, laces, custom lining, canvas structuring).
                </li>
                <li>
                  <strong>Payment Methods:</strong> We accept online
                  debit/credit cards, direct bank wire transfer, JazzCash,
                  Easypaisa, and Cash on Delivery (COD) for eligible order
                  brackets within covered postal zones.
                </li>
                <li>
                  <strong>Order Confirmation:</strong> An order is deemed
                  formally accepted once payment confirmation or verified
                  advance deposit has been authenticated by our billing gateway.
                </li>
              </ul>
            </section>

            {/* Section 4 */}
            <section id="measurements" className="space-y-3">
              <h2 className="text-lg sm:text-xl font-black text-gray-900 border-b border-gray-100 pb-2">
                4. Measurements, Sizing & Master Samples
              </h2>
              <p>
                Custom bespoke garments are tailored to the exact specifications
                submitted by the client. TailorLink offers three measurement
                options:
              </p>
              <ol className="list-decimal pl-5 space-y-2 text-gray-700">
                <li>
                  <strong>Digital Measurement Studio:</strong> You may input
                  your anatomical dimensions (chest, waist, shoulders, sleeve
                  length, bicep, collar, shirt length, inseam) through our
                  guided visual studio.
                </li>
                <li>
                  <strong>Standard Size Presets:</strong> You may select
                  standard pret sizes (XS, S, M, L, XL) with custom length
                  calibrations.
                </li>
                <li>
                  <strong>Sample Garment Replicating:</strong> You may dispatch
                  a physical well-fitting master sample to our atelier, which
                  our master cutters measure and return alongside your completed
                  order without modification.
                </li>
              </ol>
              <p className="text-xs bg-amber-50 p-3 rounded-xl border border-amber-200 text-amber-900">
                <strong>Notice:</strong> TailorLink is not responsible for
                ill-fitting garments resulting from inaccurate user-supplied
                dimensions when the finished garment matches the recorded
                submitted specifications.
              </p>
            </section>

            {/* Section 5 */}
            <section id="fabric-stock" className="space-y-3">
              <h2 className="text-lg sm:text-xl font-black text-gray-900 border-b border-gray-100 pb-2">
                5. In-House Fabric Stock & Sourcing
              </h2>
              <p>
                All fabrics listed in our{' '}
                <strong>In-House Stock Registry</strong> are sourced directly
                from verified Pakistani mills, authorized brand stockists, and
                certified textile artisans.
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-gray-700">
                <li>
                  <strong>Fabric Integrity Guarantee:</strong> We warrant that
                  fabrics described as pure (e.g. Pure Silk, Giza Cotton,
                  Cambric, Fine Lawn) match the advertised weave and
                  composition.
                </li>
                <li>
                  <strong>Color Accuracy:</strong> We endeavor to display fabric
                  tones with extreme photographic fidelity; however, slight
                  nuances may occur due to device display color profiles.
                </li>
                <li>
                  <strong>Shrinkage & Pre-Washing:</strong> Unless pre-shrunk by
                  the manufacturer, natural fiber fabrics (particularly Cotton
                  and Khaddar) may undergo standard dimensional shrinkage of
                  2–4% upon first wash.
                </li>
              </ul>
            </section>

            {/* Section 6 */}
            <section id="fit-guarantee" className="space-y-3">
              <h2 className="text-lg sm:text-xl font-black text-gray-900 border-b border-gray-100 pb-2">
                6. 100% Guaranteed Fit & Alteration Policy
              </h2>
              <div className="bg-[#7E153A]/5 border border-[#7E153A]/20 rounded-2xl p-4 sm:p-5 space-y-2">
                <div className="flex items-center gap-2 text-[#7E153A] font-extrabold text-sm">
                  <ShieldCheck size={18} /> Our Perfect Fit Commitment
                </div>
                <p className="text-xs text-gray-700 leading-relaxed">
                  Every garment crafted by TailorLink includes our signature{' '}
                  <strong>Free 1st Alteration Guarantee</strong>. If your
                  garment does not drape or fit as specified in your profile, we
                  will alter it free of charge.
                </p>
              </div>
              <ul className="list-disc pl-5 space-y-1.5 text-gray-700">
                <li>
                  <strong>Claim Window:</strong> Alteration requests must be
                  filed through your customer dashboard under{' '}
                  <Link
                    href="/orders"
                    className="text-[#7E153A] font-bold hover:underline"
                  >
                    My Orders
                  </Link>{' '}
                  within <strong>seven (7) calendar days</strong> of parcel
                  delivery confirmation.
                </li>
                <li>
                  <strong>Free Courier Pickup:</strong> For genuine fitting
                  discrepancies, TailorLink coordinates and finances two-way
                  courier collection and return.
                </li>
                <li>
                  <strong>Margin Allowances:</strong> All bespoke garments are
                  cut with internal side seam allowances (1.5 to 2.0 inches) to
                  facilitate future loosening or tightening.
                </li>
              </ul>
            </section>

            {/* Section 7 */}
            <section id="production-delivery" className="space-y-3">
              <h2 className="text-lg sm:text-xl font-black text-gray-900 border-b border-gray-100 pb-2">
                7. Turnaround Timelines & Courier Delivery
              </h2>
              <p>
                Standard bespoke production requires{' '}
                <strong>5 to 7 business days</strong> from the date fabric and
                measurements are verified. Formal wedding suiting and heavy
                hand-embellished wear require{' '}
                <strong>10 to 14 business days</strong>.
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-gray-700">
                <li>
                  <strong>Dispatch & Tracking:</strong> Upon clearing our
                  24-point QC audit, orders are dispatched with real-time
                  tracking numbers provided via SMS, WhatsApp, and your
                  dashboard at{' '}
                  <Link
                    href="/track"
                    className="text-[#7E153A] font-bold hover:underline"
                  >
                    tailorlink.pk/track
                  </Link>
                  .
                </li>
                <li>
                  <strong>Courier Transit:</strong> Domestic transit via premium
                  couriers (TCS, Leopards, CallCourier) typically requires 24 to
                  48 hours for major urban centers (Lahore, Karachi, Islamabad,
                  Rawalpindi, Faisalabad) and 3 to 4 business days for
                  peripheral territories.
                </li>
              </ul>
            </section>

            {/* Section 8 */}
            <section id="cancellations-refunds" className="space-y-3">
              <h2 className="text-lg sm:text-xl font-black text-gray-900 border-b border-gray-100 pb-2">
                8. Cancellation & Refund Policy
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                <li>
                  <strong>Before Fabric Cutting:</strong> An order may be
                  cancelled with a 100% refund if the cancellation request is
                  received before fabric cutting commences (typically within 24
                  hours of placement).
                </li>
                <li>
                  <strong>After Fabric Cutting:</strong> Because bespoke
                  tailored items are made-to-measure to unique anatomical
                  specifications, orders cannot be cancelled or fully refunded
                  once the fabric has been cut by the master tailor.
                </li>
                <li>
                  <strong>In-House Fabric Only:</strong> Uncut in-house fabrics
                  purchased without tailoring may be returned within 7 days in
                  original, unwashed, unaltered packaging subject to a 10%
                  restocking inspection fee.
                </li>
              </ul>
            </section>

            {/* Section 9 */}
            <section id="customer-conduct" className="space-y-3">
              <h2 className="text-lg sm:text-xl font-black text-gray-900 border-b border-gray-100 pb-2">
                9. User Accounts & Customer Conduct
              </h2>
              <p>
                When creating an account on TailorLink.pk, you must provide
                accurate, current, and complete contact information. You are
                responsible for safeguarding your login credentials and for all
                activities that occur under your account.
              </p>
            </section>

            {/* Section 10 */}
            <section id="intellectual-property" className="space-y-3">
              <h2 className="text-lg sm:text-xl font-black text-gray-900 border-b border-gray-100 pb-2">
                10. Intellectual Property & Atelier Rights
              </h2>
              <p>
                All trademarks, logos, visual diagrams, digital measurement
                guides, design software, and proprietary content displayed on
                TailorLink.pk are the intellectual property of TailorLink
                Technologies. Unauthorized copying, scraping, or commercial
                exploitation is strictly prohibited.
              </p>
            </section>

            {/* Section 11 */}
            <section id="liability" className="space-y-3">
              <h2 className="text-lg sm:text-xl font-black text-gray-900 border-b border-gray-100 pb-2">
                11. Limitation of Liability & Force Majeure
              </h2>
              <p>
                To the fullest extent permitted by applicable law,
                TailorLink&apos;s total aggregate liability arising out of any
                order shall not exceed the total amount paid by the customer for
                that specific order. TailorLink is not liable for production or
                delivery delays caused by events beyond reasonable control
                (natural disasters, road blockades, civil unrest, courier
                network strikes).
              </p>
            </section>

            {/* Section 12 */}
            <section id="governing-law" className="space-y-3">
              <h2 className="text-lg sm:text-xl font-black text-gray-900 border-b border-gray-100 pb-2">
                12. Governing Law & Dispute Resolution
              </h2>
              <p>
                These Terms are governed by and construed in accordance with the{' '}
                <strong>laws of the Islamic Republic of Pakistan</strong>. Any
                disputes arising out of or in connection with these Terms shall
                be subject to the exclusive jurisdiction of the competent courts
                of Lahore, Pakistan.
              </p>
            </section>

            {/* Section 13 */}
            <section
              id="contact"
              className="space-y-3 pt-4 border-t border-gray-100"
            >
              <h2 className="text-lg sm:text-xl font-black text-gray-900">
                13. Atelier Support & Contact Information
              </h2>
              <p>
                For questions or assistance regarding these Terms of Service:
              </p>
              <div className="bg-gray-50 rounded-2xl p-4 sm:p-5 text-xs space-y-1.5 text-gray-700">
                <p>
                  <strong>Entity:</strong> TailorLink.pk (Digital Atelier &
                  Bespoke Studio)
                </p>
                <p>
                  <strong>Customer Support:</strong> support@tailorlink.pk
                </p>
                <p>
                  <strong>Legal & Compliance:</strong> legal@tailorlink.pk
                </p>
                <p>
                  <strong>Hotline & WhatsApp:</strong> +92 300 1234567
                </p>
                <p>
                  <strong>Atelier Hours:</strong> Monday – Saturday, 9:00 AM –
                  8:00 PM PKT
                </p>
              </div>
            </section>
          </article>
        </div>
      </main>

      {/* ── FOOTER ── */}
      <footer className="bg-gray-900 text-gray-400 py-8 text-xs border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>
            © {new Date().getFullYear()} TailorLink.pk. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-gray-300">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <Link href="/stock" className="hover:text-white transition-colors">
              Fabric Stock
            </Link>
            <Link
              href="/privacy"
              className="hover:text-white transition-colors"
            >
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-white font-bold">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
