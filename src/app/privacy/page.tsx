import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import {
  Scissors,
  ShieldCheck,
  Lock,
  Eye,
  FileText,
  Clock,
  CheckCircle2,
  ChevronRight,
  Database,
  Smartphone,
  Share2,
  Key,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Privacy Policy — TailorLink.pk',
  description:
    'Our commitment to safeguarding your personal data, body measurement profiles, bespoke style archives, and billing privacy at TailorLink.pk.',
};

export default function PrivacyPolicyPage() {
  const lastUpdated = 'October 30, 2026';

  const sections = [
    { id: 'introduction', title: '1. Introduction & Overview' },
    { id: 'data-we-collect', title: '2. Information We Collect' },
    {
      id: 'measurements-privacy',
      title: '3. Anatomical Measurements & Photos',
    },
    { id: 'how-we-use-data', title: '4. How We Utilize Your Data' },
    {
      id: 'storage-security',
      title: '5. Storage & Cloudflare R2 Infrastructure',
    },
    { id: 'third-parties', title: '6. Third-Party Sharing & Couriers' },
    { id: 'cookies', title: '7. Cookies & Session Technologies' },
    { id: 'data-retention', title: '8. Data Retention & Repeat Orders' },
    { id: 'user-rights', title: '9. Your Rights & Account Deletion' },
    { id: 'peca-compliance', title: '10. Legal Compliance (PECA 2016)' },
    { id: 'contact', title: '11. Data Protection Officer Contact' },
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
              href="/terms"
              className="hover:text-[#7E153A] transition-colors"
            >
              Terms
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
          <span className="text-gray-900 font-semibold">Privacy Policy</span>
        </div>

        {/* Hero Title Card */}
        <div className="bg-linear-to-r from-[#1A1A2E] via-[#2A1B3D] to-[#3B1736] rounded-3xl p-6 sm:p-10 text-white shadow-lg space-y-3 relative overflow-hidden">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-white text-[11px] font-bold uppercase tracking-wider">
            <Lock size={13} className="text-[#E8D7B5]" /> Data Protection
            Protocol
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            Privacy Policy
          </h1>
          <p className="text-xs sm:text-sm text-gray-300 max-w-2xl leading-relaxed">
            Your personal trust, bodily dimensions, and bespoke styling choices
            are deeply personal. We treat your data with the highest discretion,
            security, and integrity.
          </p>
          <div className="pt-2 flex items-center gap-3 text-xs text-gray-400">
            <Clock size={14} />
            <span>
              Effective Last Updated: <strong>{lastUpdated}</strong>
            </span>
          </div>

          <div className="absolute -right-8 -bottom-8 w-60 h-60 rounded-full bg-white/5 pointer-events-none blur-2xl" />
        </div>

        {/* Content Layout: Sidebar + Document */}
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
                  className="block py-1.5 px-2 rounded-lg text-gray-600 hover:text-[#7E153A] hover:bg-purple-50/50 font-medium transition-colors"
                >
                  {s.title}
                </a>
              ))}
            </nav>
            <div className="pt-3 border-t border-gray-100 text-[11px] text-gray-400">
              Have privacy concerns? Email our Data Protection Officer at{' '}
              <span className="font-semibold text-gray-700">
                privacy@tailorlink.pk
              </span>
              .
            </div>
          </aside>

          {/* Policy Clauses */}
          <article className="lg:col-span-8 bg-white rounded-3xl border border-gray-100 p-6 sm:p-10 shadow-xs space-y-10 text-gray-800 leading-relaxed text-sm">
            {/* Section 1 */}
            <section id="introduction" className="space-y-3">
              <h2 className="text-lg sm:text-xl font-black text-gray-900 border-b border-gray-100 pb-2">
                1. Introduction & Overview
              </h2>
              <p>
                At <strong>TailorLink.pk</strong> (&quot;TailorLink&quot;,
                &quot;we&quot;, &quot;us&quot;), we are committed to upholding
                the privacy and security of every patron who entrusts us with
                their custom apparel commissions, measurements, and fabric
                orders.
              </p>
              <p>
                This Privacy Policy explains what personal information we
                collect, how it is used to craft your bespoke garments, how it
                is secured using modern encrypted cloud infrastructure, and the
                rights you maintain over your data.
              </p>
            </section>

            {/* Section 2 */}
            <section id="data-we-collect" className="space-y-3">
              <h2 className="text-lg sm:text-xl font-black text-gray-900 border-b border-gray-100 pb-2">
                2. Information We Collect
              </h2>
              <p>
                We collect only the information necessary to fulfill your
                orders:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                <li>
                  <strong>Contact & Identity Data:</strong> Full name,
                  telephone/mobile number, email address, and physical delivery
                  address (including city, postal code, and prominent
                  landmarks).
                </li>
                <li>
                  <strong>Bespoke Garment Specifications:</strong> Desired
                  silhouettes (Shalwar Kameez, Waistcoat, Pent Coat, Maxi,
                  etc.), collar designs, cuff preferences, pocket styles, piping
                  accents, and embroidery requests.
                </li>
                <li>
                  <strong>Transactional Details:</strong> Order amounts, payment
                  gateway transaction tokens, payment methods, billing
                  timestamps, and shipping tracking numbers.
                </li>
              </ul>
            </section>

            {/* Section 3 */}
            <section id="measurements-privacy" className="space-y-3">
              <h2 className="text-lg sm:text-xl font-black text-gray-900 border-b border-gray-100 pb-2">
                3. Anatomical Measurements & Style References
              </h2>
              <div className="bg-[#1A1A2E]/5 border border-[#1A1A2E]/15 rounded-2xl p-4 sm:p-5 space-y-2">
                <div className="flex items-center gap-2 text-gray-900 font-extrabold text-sm">
                  <ShieldCheck size={18} className="text-[#7E153A]" />{' '}
                  Confidential Bodily Measurements
                </div>
                <p className="text-xs text-gray-700 leading-relaxed">
                  Bodily measurements (chest, waist, hip, neck, sleeve,
                  shoulder, inseam, posture calibrations) are treated as{' '}
                  <strong>strictly confidential</strong>. They are only
                  disclosed internally to the assigned master cutter and quality
                  control inspector working on your garment.
                </p>
              </div>
              <p>
                When you upload reference photos (e.g. neck designs, sleeve
                styling, or inspiration shots), these assets are stored in
                isolated encrypted cloud storage and are never used for
                marketing without your express written consent.
              </p>
            </section>

            {/* Section 4 */}
            <section id="how-we-use-data" className="space-y-3">
              <h2 className="text-lg sm:text-xl font-black text-gray-900 border-b border-gray-100 pb-2">
                4. How We Utilize Your Data
              </h2>
              <p>
                We process your personal information strictly for the following
                operational purposes:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-gray-700">
                <li>
                  Cutting, tailoring, stitching, and finishing your custom
                  garments.
                </li>
                <li>
                  Assigning orders to certified master craftsmen based on
                  specialty.
                </li>
                <li>
                  Conducting 24-point Quality Control (QC) dimensional
                  verification before dispatch.
                </li>
                <li>
                  Coordinating courier collection and delivery through verified
                  shipping carriers.
                </li>
                <li>
                  Dispatching real-time transactional updates (SMS, email,
                  WhatsApp tracking alerts).
                </li>
                <li>
                  Processing warranty alterations under our 100% Fit Guarantee.
                </li>
              </ul>
            </section>

            {/* Section 5 */}
            <section id="storage-security" className="space-y-3">
              <h2 className="text-lg sm:text-xl font-black text-gray-900 border-b border-gray-100 pb-2">
                5. Storage & Cloudflare R2 Infrastructure
              </h2>
              <p>
                All uploaded product imagery, fabric swatches, and customer
                reference photos are stored securely on{' '}
                <strong>Cloudflare R2 Object Storage</strong>, featuring robust
                global encryption-at-rest and TLS 1.3 encryption-in-transit.
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-gray-700">
                <li>
                  <strong>Database Encryption:</strong> Customer records, hashed
                  credentials, and measurement profiles are stored in secure
                  PostgreSQL databases with SSL connection pooling.
                </li>
                <li>
                  <strong>No Plaintext Card Storage:</strong> We do not store
                  raw credit/debit card numbers or CVV codes on our servers. All
                  financial operations are processed via PCI-DSS Level 1
                  compliant payment gateways.
                </li>
              </ul>
            </section>

            {/* Section 6 */}
            <section id="third-parties" className="space-y-3">
              <h2 className="text-lg sm:text-xl font-black text-gray-900 border-b border-gray-100 pb-2">
                6. Third-Party Sharing & Couriers
              </h2>
              <p className="font-semibold text-gray-900">
                We never sell, rent, or trade your personal information to
                third-party advertisers.
              </p>
              <p>
                We disclose limited necessary data only to trusted service
                partners bound by non-disclosure and security obligations:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-gray-700">
                <li>
                  <strong>Logistics & Couriers:</strong> Name, delivery address,
                  and phone number shared with authorized shipping carriers
                  (TCS, Leopards, CallCourier) solely for delivery dispatch.
                </li>
                <li>
                  <strong>SMS / WhatsApp Service Providers:</strong> Phone
                  numbers utilized strictly to transmit order confirmation
                  receipts and live tracking milestones.
                </li>
                <li>
                  <strong>Legal Authorities:</strong> If required by court
                  subpoena or mandatory statutory law of Pakistan.
                </li>
              </ul>
            </section>

            {/* Section 7 */}
            <section id="cookies" className="space-y-3">
              <h2 className="text-lg sm:text-xl font-black text-gray-900 border-b border-gray-100 pb-2">
                7. Cookies & Session Technologies
              </h2>
              <p>
                TailorLink.pk uses strictly necessary functional cookies and
                local session tokens to keep you securely signed in, preserve
                active tailoring carts, and save measurement drafts across
                devices. You can control cookie preferences in your browser
                settings.
              </p>
            </section>

            {/* Section 8 */}
            <section id="data-retention" className="space-y-3">
              <h2 className="text-lg sm:text-xl font-black text-gray-900 border-b border-gray-100 pb-2">
                8. Data Retention & Repeat Orders
              </h2>
              <p>
                Your saved measurement profiles remain securely stored in your
                account indefinitely to enable seamless{' '}
                <strong>1-Click Reordering</strong> for future festive
                collections and seasons. You can edit, update, or remove any
                measurement profile at any time in{' '}
                <Link
                  href="/measurements"
                  className="text-[#7E153A] font-bold hover:underline"
                >
                  Measurement Profiles
                </Link>
                .
              </p>
            </section>

            {/* Section 9 */}
            <section id="user-rights" className="space-y-3">
              <h2 className="text-lg sm:text-xl font-black text-gray-900 border-b border-gray-100 pb-2">
                9. Your Rights & Account Deletion
              </h2>
              <p>
                As a TailorLink customer, you retain full sovereignty over your
                information:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-gray-700">
                <li>
                  <strong>Access & Export:</strong> You can review and export
                  your orders and measurements from your account dashboard.
                </li>
                <li>
                  <strong>Correction:</strong> You can update addresses, phone
                  numbers, and profile labels at any time.
                </li>
                <li>
                  <strong>Erasure & Account Deletion:</strong> You may request
                  complete erasure of your account and personal records by
                  submitting a request to{' '}
                  <span className="font-semibold text-gray-900">
                    privacy@tailorlink.pk
                  </span>
                  .
                </li>
              </ul>
            </section>

            {/* Section 10 */}
            <section id="peca-compliance" className="space-y-3">
              <h2 className="text-lg sm:text-xl font-black text-gray-900 border-b border-gray-100 pb-2">
                10. Legal Compliance (PECA 2016)
              </h2>
              <p>
                TailorLink operates in compliance with the{' '}
                <strong>Prevention of Electronic Crimes Act (PECA 2016)</strong>{' '}
                of the Islamic Republic of Pakistan and applicable consumer
                protection statutes. We implement organizational and technical
                safeguards designed to protect personal data against
                unauthorized access, alteration, or disclosure.
              </p>
            </section>

            {/* Section 11 */}
            <section
              id="contact"
              className="space-y-3 pt-4 border-t border-gray-100"
            >
              <h2 className="text-lg sm:text-xl font-black text-gray-900">
                11. Data Protection Officer Contact
              </h2>
              <p>
                For questions, privacy inquiries, or data deletion requests:
              </p>
              <div className="bg-gray-50 rounded-2xl p-4 sm:p-5 text-xs space-y-1.5 text-gray-700">
                <p>
                  <strong>Privacy Office:</strong> TailorLink Data Protection &
                  Compliance
                </p>
                <p>
                  <strong>Email:</strong> privacy@tailorlink.pk
                </p>
                <p>
                  <strong>Support Desk:</strong> support@tailorlink.pk
                </p>
                <p>
                  <strong>Postal Address:</strong> TailorLink Digital Atelier,
                  Gulberg III, Lahore, Pakistan
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
            <Link href="/privacy" className="text-white font-bold">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
