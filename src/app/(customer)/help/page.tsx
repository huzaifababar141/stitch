'use client';

import React from 'react';
import {
  HelpCircle,
  MessageCircle,
  Phone,
  Mail,
  ShieldCheck,
  Truck,
  Scissors,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HelpSupportPage() {
  const faqs = [
    {
      q: 'How does doorstep fabric pickup & delivery work?',
      a: 'Once you paste your suit link and submit measurements, our courier partner TCS picks up the unstitched fabric from your home (or we purchase it directly for you), delivers it to our centralized stitching workshop, and returns the finished tailored suit to your doorstep within 5-7 working days.',
    },
    {
      q: 'What if the garment does not fit me perfectly?',
      a: 'We offer a 100% Perfect Fit Guarantee. If any measurement deviates from your submitted profile, we provide free doorstep alteration within 7 days of delivery.',
    },
    {
      q: 'Can I send my physical sample suit for measurements?',
      a: 'Yes! Select "Sample Suit Pickup" during checkout, and TCS will collect your best-fitting sample suit along with your unstitched fabric. Our master tailors will replicate its exact measurements.',
    },
    {
      q: 'Which payment methods are accepted?',
      a: 'We accept Cash on Delivery (COD) across Pakistan, JazzCash, EasyPaisa, and all major Debit/Credit cards via secure 256-bit encrypted checkout.',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 font-sans">
      <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-[#7E153A] text-xs font-bold uppercase tracking-wider mb-2">
            <HelpCircle size={14} /> Support & Assistance
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Help & Customer Care
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Need assistance with your order, measurements, or delivery? Our
            dedicated team is here to help.
          </p>
        </div>

        <a
          href="https://wa.me/923000000000?text=Hi%20TailorLink%20Support%2C%20I%20need%20assistance%20with%20my%20order"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button className="bg-[#7E153A] hover:bg-[#630f2d] text-white text-xs font-bold px-6 h-11 rounded-xl shadow-md shadow-[#7E153A]/20 cursor-pointer">
            <MessageCircle size={16} className="mr-1.5" /> Instant WhatsApp Chat
          </Button>
        </a>
      </div>

      {/* Support Channels */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs flex flex-col justify-between space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <MessageCircle size={20} />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-gray-900">
              WhatsApp Hotline
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Mon–Sat (9am to 9pm PKT)
            </p>
          </div>
          <a
            href="https://wa.me/923000000000"
            className="text-xs font-bold text-emerald-700 hover:underline pt-2 border-t border-gray-100"
          >
            +92 300 0000000 →
          </a>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs flex flex-col justify-between space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
            <Mail size={20} />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-gray-900">
              Email Inquiries
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Response within 2 hours
            </p>
          </div>
          <a
            href="mailto:support@tailorlink.pk"
            className="text-xs font-bold text-blue-700 hover:underline pt-2 border-t border-gray-100"
          >
            support@tailorlink.pk →
          </a>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs flex flex-col justify-between space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
            <RotateCcw size={20} />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-gray-900">
              Alteration Request
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              7-day free doorstep fix
            </p>
          </div>
          <span className="text-xs font-bold text-purple-700 pt-2 border-t border-gray-100">
            Available in Order Tracking
          </span>
        </div>
      </div>

      {/* FAQs */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-xs space-y-6">
        <h2 className="text-base font-extrabold text-gray-900">
          Frequently Asked Questions
        </h2>
        <div className="divide-y divide-gray-100 space-y-4">
          {faqs.map((f, i) => (
            <div key={i} className="pt-4 first:pt-0 space-y-1.5">
              <h3 className="text-sm font-extrabold text-gray-900">{f.q}</h3>
              <p className="text-xs text-gray-600 leading-relaxed">{f.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
