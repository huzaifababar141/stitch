'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  HelpCircle,
  MessageCircle,
  Phone,
  Mail,
  ShieldCheck,
  Truck,
  Scissors,
  RotateCcw,
  ChevronDown,
  Sparkles,
  Clock,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HelpSupportPage() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does doorstep fabric pickup & TCS delivery work?',
      a: 'Once you paste your suit link and submit measurements, our courier partner TCS picks up the unstitched fabric from your home (or we purchase it directly for you), delivers it to our centralized stitching workshop, and returns the finished tailored suit to your doorstep within 5-7 working days across Pakistan.',
    },
    {
      q: 'What if the garment does not fit me perfectly?',
      a: 'We offer a 100% Perfect Fit Guarantee. If any measurement deviates from your submitted profile, we provide free doorstep pickup and alteration within 7 days of delivery. You can request this with 1 click directly from your order tracking screen.',
    },
    {
      q: 'Can I send my physical sample suit for measurements?',
      a: 'Yes! Select "Sample Suit Pickup" during checkout (Step 3), and TCS will collect your best-fitting sample suit along with your unstitched fabric. Our master tailors will replicate its exact collar, chest, waist, and paicha dimensions, returning both suits safely.',
    },
    {
      q: 'Which payment methods are accepted?',
      a: 'We accept Cash on Delivery (COD) across Pakistan, JazzCash, EasyPaisa, Raast, and all major Visa/Mastercard debit and credit cards via secure 256-bit encrypted checkout.',
    },
    {
      q: 'How can I track my tailoring order progression?',
      a: 'You can track all 7 production stages live in the Customer Portal: Order Placed → Master Assigned → Precision Cutting → Master Stitching → 14-Point QC → TCS Dispatched → Delivered. You will also receive real-time WhatsApp alerts at each milestone.',
    },
  ];

  return (
    <div className="w-full min-w-0 max-w-5xl mx-auto space-y-5 sm:space-y-8 font-sans">
      {/* ── Top Header Banner ── */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 p-4 sm:p-6 md:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
        <div className="space-y-1 sm:space-y-1.5 min-w-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-red-50 text-[#7E153A] flex items-center justify-center font-bold shrink-0">
              <HelpCircle size={20} />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
              Help & Customer Care
            </h1>
          </div>
          <p className="text-xs text-gray-500 max-w-xl leading-relaxed">
            Need assistance with your tailoring order, body measurements, or
            courier delivery? Our dedicated customer happiness team is here to
            assist.
          </p>
        </div>

        <a
          href="https://wa.me/923000000000?text=Hi%20TailorLink%20Support%2C%20I%20need%20assistance%20with%20my%20order"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto shrink-0"
        >
          <Button className="w-full sm:w-auto h-11 bg-[#7E153A] hover:bg-[#630f2d] text-white text-xs font-bold px-6 rounded-xl shadow-md shadow-[#7E153A]/20 cursor-pointer flex items-center justify-center gap-1.5">
            <MessageCircle size={16} /> Instant WhatsApp Chat
          </Button>
        </a>
      </div>

      {/* ── Support Channels Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 p-4 sm:p-6 shadow-xs flex flex-col justify-between space-y-3.5 hover:shadow-md transition-all">
          <div className="space-y-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <MessageCircle size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-gray-900">
                WhatsApp Live Hotline
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Mon–Sat (9:00 AM to 9:00 PM PKT)
              </p>
            </div>
          </div>
          <a
            href="https://wa.me/923000000000"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center justify-between pt-3 border-t border-gray-100"
          >
            <span>+92 300 0000000</span>
            <ExternalLink size={12} />
          </a>
        </div>

        <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 p-4 sm:p-6 shadow-xs flex flex-col justify-between space-y-3.5 hover:shadow-md transition-all">
          <div className="space-y-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <Mail size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-gray-900">
                Email Customer Desk
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Average reply time under 2 hours
              </p>
            </div>
          </div>
          <a
            href="mailto:support@tailorlink.pk"
            className="text-xs font-bold text-blue-700 hover:text-blue-800 flex items-center justify-between pt-3 border-t border-gray-100"
          >
            <span>support@tailorlink.pk</span>
            <ExternalLink size={12} />
          </a>
        </div>

        <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 p-4 sm:p-6 shadow-xs flex flex-col justify-between space-y-3.5 hover:shadow-md transition-all">
          <div className="space-y-2.5">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
              <RotateCcw size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-gray-900">
                Free 7-Day Alteration
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Free rider doorstep pickup & re-stitch
              </p>
            </div>
          </div>
          <Link
            href="/orders"
            className="text-xs font-bold text-purple-700 hover:text-purple-800 flex items-center justify-between pt-3 border-t border-gray-100"
          >
            <span>Track & Request Fix</span>
            <ExternalLink size={12} />
          </Link>
        </div>
      </div>

      {/* ── Accordion FAQs ── */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 p-4 sm:p-6 md:p-8 shadow-xs space-y-4">
        <div className="border-b border-gray-100 pb-3">
          <h2 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
            <Sparkles size={16} className="text-[#7E153A]" /> Frequently Asked
            Questions
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Answers to common questions regarding unstitched suit stitching and
            doorstep delivery
          </p>
        </div>

        <div className="space-y-2.5">
          {faqs.map((f, i) => {
            const isOpen = openFaqIndex === i;
            return (
              <div
                key={i}
                className="rounded-2xl border border-gray-100 overflow-hidden transition-all bg-gray-50/50"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : i)}
                  className="w-full p-4 text-left flex items-center justify-between gap-3 cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <span className="font-extrabold text-xs sm:text-sm text-gray-900">
                    {f.q}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`text-gray-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[#7E153A]' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pt-1 text-xs text-gray-600 leading-relaxed border-t border-gray-100 bg-white">
                    {f.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
