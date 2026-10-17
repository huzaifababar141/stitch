'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Scissors,
  Ruler,
  ShieldCheck,
  Truck,
  ArrowRight,
  User,
  ChevronDown,
  Menu,
  X,
  Search,
  Check,
  Phone,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const categories = [
    {
      id: 'w-sk',
      title: "Women's Shalwar Kameez",
      desc: 'Classic and modern cuts for unstitched lawn, silk, and chiffon.',
      price: 'Stitching from Rs. 2,800',
      image: '/images/tailor/garment_w_shalwarkameez.png',
      link: '/stock?gender=female',
      badge: 'Bestseller',
    },
    {
      id: 'w-frock',
      title: 'Festive Frocks & Maxis',
      desc: 'Kalidar, flared anarkali, and flowing gowns with custom flare.',
      price: 'Stitching from Rs. 3,800',
      image: '/images/tailor/garment_w_frockmaxi.png',
      link: '/stock?gender=female',
      badge: 'Festive',
    },
    {
      id: 'm-wc',
      title: "Men's Royal Waistcoats",
      desc: 'Structured canvas, raw silk, and jamawar with bespoke pocketing.',
      price: 'Tailoring from Rs. 4,500',
      image: '/images/tailor/garment_m_waistcoat.png',
      link: '/stock?gender=male',
      badge: 'Formal',
    },
    {
      id: 'm-suit',
      title: "Men's Pent Coat & Suits",
      desc: 'Two-piece and three-piece suits crafted from Italian suiting wool.',
      price: 'Crafted from Rs. 14,500',
      image: '/images/tailor/garment_m_pentcoat.png',
      link: '/stock?gender=male',
      badge: 'Bespoke',
    },
  ];

  const faqs = [
    {
      q: 'Can I send my own unstitched fabric?',
      a: 'Yes. Once you select your garment cut, our logistics partner (TCS) picks up your unstitched fabric from your doorstep anywhere in Pakistan. You can track the shipment live until it reaches our workshop.',
    },
    {
      q: 'How do I provide my measurements without a tailor tape?',
      a: "You can either use our 2-minute Guided Visual Measurement tool, or simply choose 'Clone My Fit' and place your favorite best-fitting kurta/suit inside the pickup parcel. Our master pattern cutters will replicate its exact fit.",
    },
    {
      q: 'What is the 100% Fit Guarantee?',
      a: 'If any garment does not match your submitted specifications, we arrange free two-way courier collection and adjust or recut it completely free of charge.',
    },
    {
      q: 'What is the delivery turnaround time?',
      a: 'Standard orders are tailored, quality inspected, pressed, and dispatched within 5 to 7 business days via TCS Express courier.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#1A1A1A] font-sans flex flex-col justify-between selection:bg-[#7E153A]/15 selection:text-[#7E153A]">
      {/* ── TOP ANNOUNCEMENT BAR ── */}
      <div className="bg-[#7E153A] text-white text-[11px] font-medium tracking-wider uppercase py-2 px-4 text-center">
        <span>
          Bespoke Custom Tailoring Across Pakistan • Guaranteed Fit • Nationwide
          TCS Delivery
        </span>
      </div>

      {/* ── NAVIGATION ── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-[#7E153A] text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <Scissors className="w-5 h-5 text-[#E8D7B5]" />
            </div>
            <div>
              <span className="font-serif text-2xl font-bold tracking-tight text-gray-900 leading-none block">
                TailorLink<span className="text-[#7E153A]">.pk</span>
              </span>
              <span className="text-[9px] uppercase tracking-widest text-gray-400 font-medium block mt-0.5">
                Bespoke Tailoring Studio
              </span>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="hidden lg:flex items-center gap-8 text-xs font-semibold tracking-wider uppercase text-gray-600">
            <Link
              href="/stock"
              className="text-[#7E153A] font-bold flex items-center gap-1.5 hover:opacity-85 transition-opacity"
            >
              <span className="w-2 h-2 rounded-full bg-[#7E153A] animate-pulse" />
              Fabric Stock
            </Link>
            <Link
              href="/stock?gender=female"
              className="hover:text-[#7E153A] transition-colors"
            >
              Women
            </Link>
            <Link
              href="/stock?gender=male"
              className="hover:text-[#7E153A] transition-colors"
            >
              Men
            </Link>
            <a
              href="#how-it-works"
              className="hover:text-[#7E153A] transition-colors"
            >
              How It Works
            </a>
            <a
              href="#quality"
              className="hover:text-[#7E153A] transition-colors"
            >
              Quality Standards
            </a>
            <Link
              href="/track"
              className="hover:text-[#7E153A] transition-colors flex items-center gap-1"
            >
              <Search className="w-3.5 h-3.5 text-gray-400" />
              Track Order
            </Link>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <Link href="/login">
              <Button
                variant="outline"
                className="border-gray-200 text-gray-700 hover:text-[#7E153A] hover:bg-[#FAF0F2] text-xs font-semibold uppercase tracking-wider h-11 px-5 rounded-xl transition-all"
              >
                <User className="w-3.5 h-3.5 mr-2" />
                Sign In
              </Button>
            </Link>
            <Link href="/stock">
              <Button className="bg-[#7E153A] hover:bg-[#630f2d] text-white text-xs font-semibold uppercase tracking-wider h-11 px-6 rounded-xl shadow-sm transition-all flex items-center gap-2">
                <span>Start Order</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#E8D7B5]" />
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-2">
            <Link href="/login" className="sm:hidden">
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-9 px-3 border-gray-200"
              >
                Sign In
              </Button>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-700 hover:bg-gray-100"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-gray-100 px-6 py-5 space-y-4 shadow-lg animate-in-fade">
            <nav className="flex flex-col space-y-3 text-sm font-medium text-gray-700">
              <Link
                href="/stock"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between p-2.5 rounded-lg bg-[#FAF0F2] text-[#7E153A] font-bold"
              >
                <span>Browse Fabric Stock</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/stock?gender=female"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 hover:bg-gray-50 rounded-lg"
              >
                Women's Collection
              </Link>
              <Link
                href="/stock?gender=male"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 hover:bg-gray-50 rounded-lg"
              >
                Men's Collection
              </Link>
              <a
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 hover:bg-gray-50 rounded-lg"
              >
                How It Works
              </a>
              <a
                href="#quality"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 hover:bg-gray-50 rounded-lg"
              >
                Quality Standards
              </a>
              <Link
                href="/track"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2.5 hover:bg-gray-50 rounded-lg"
              >
                <Search className="w-4 h-4 text-gray-400" />
                Track Order
              </Link>
            </nav>
            <div className="pt-3 border-t border-gray-100 flex flex-col gap-2">
              <Link href="/stock" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full bg-[#7E153A] hover:bg-[#630f2d] text-white text-xs font-bold uppercase tracking-wider h-11 rounded-xl">
                  Start Custom Order
                </Button>
              </Link>
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button
                  variant="outline"
                  className="w-full border-gray-200 text-xs font-semibold h-11 rounded-xl"
                >
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ── HERO SECTION ── */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-[#FAF9F6]">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-gray-200 text-[#7E153A] text-xs font-semibold tracking-wider uppercase shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#7E153A]" />
              Master Craftsmen • Guaranteed Fit
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight leading-[1.15]">
              Bespoke Tailoring. <br />
              <span className="italic font-normal text-[#7E153A]">
                Crafted to Perfection.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-gray-600 max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed">
              Order custom-stitched unstitched designer lawn, silk, and formal
              suits online. Doorstep fabric pickup via TCS, guided measurement
              studio, and certified quality inspection.
            </p>

            <div className="flex flex-col sm:flex-row gap-3.5 justify-center lg:justify-start items-center pt-2">
              <Link href="/stock" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto bg-[#7E153A] hover:bg-[#630f2d] text-white text-xs font-bold uppercase tracking-widest h-14 px-8 rounded-xl shadow-md transition-all flex items-center justify-center gap-2.5">
                  <Scissors className="w-4 h-4" />
                  <span>Start Your Order</span>
                  <ArrowRight className="w-4 h-4 text-[#E8D7B5]" />
                </Button>
              </Link>
              <a href="#how-it-works" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto bg-white hover:bg-gray-50 text-gray-800 border-gray-300 text-xs font-bold uppercase tracking-widest h-14 px-7 rounded-xl transition-all"
                >
                  How It Works
                </Button>
              </a>
            </div>

            {/* Reassurance Row */}
            <div className="pt-6 border-t border-gray-200/80 grid grid-cols-3 gap-4 max-w-lg mx-auto lg:mx-0 text-center lg:text-left">
              <div>
                <p className="font-serif text-2xl sm:text-3xl font-bold text-gray-900">
                  100%
                </p>
                <p className="text-xs text-gray-500 font-medium mt-0.5">
                  Fit Guarantee
                </p>
              </div>
              <div>
                <p className="font-serif text-2xl sm:text-3xl font-bold text-gray-900">
                  5–7 Days
                </p>
                <p className="text-xs text-gray-500 font-medium mt-0.5">
                  TCS Delivery
                </p>
              </div>
              <div>
                <p className="font-serif text-2xl sm:text-3xl font-bold text-[#7E153A]">
                  14 SPI
                </p>
                <p className="text-xs text-gray-500 font-medium mt-0.5">
                  Couture Stitching
                </p>
              </div>
            </div>
          </div>

          {/* Right Visual Column (Dual Garment Atelier Preview) */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/80 shadow-lg space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FAF0F2] text-[#7E153A] flex items-center justify-center font-bold">
                    <Ruler className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-base font-bold text-gray-900">
                      Bespoke Tailoring Studio
                    </h3>
                    <p className="text-xs text-gray-500">
                      Unstitched Fabrics to Finished Suits
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                  Available
                </span>
              </div>

              {/* Garment Preview Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#FAF9F6] p-4 rounded-2xl border border-gray-100 text-center space-y-2">
                  <div className="relative aspect-[3/4] w-full">
                    <Image
                      src="/images/tailor/garment_w_shalwarkameez.png"
                      alt="Women's Shalwar Kameez"
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-contain"
                    />
                  </div>
                  <p className="font-serif text-xs font-bold text-gray-900">
                    Women's Collection
                  </p>
                  <p className="text-[11px] text-[#7E153A] font-semibold">
                    From Rs. 2,800
                  </p>
                </div>

                <div className="bg-[#FAF9F6] p-4 rounded-2xl border border-gray-100 text-center space-y-2">
                  <div className="relative aspect-[3/4] w-full">
                    <Image
                      src="/images/tailor/garment_m_waistcoat.png"
                      alt="Men's Waistcoat"
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-contain"
                    />
                  </div>
                  <p className="font-serif text-xs font-bold text-gray-900">
                    Men's Collection
                  </p>
                  <p className="text-[11px] text-[#7E153A] font-semibold">
                    From Rs. 4,500
                  </p>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs text-gray-500 border-t border-gray-100">
                <span className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#7E153A]" /> 24-Point
                  Quality Inspection
                </span>
                <span className="font-semibold text-gray-800">TCS Tracked</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TEXTILE BRANDS STRIP ── */}
      <section className="py-10 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-[10px] font-bold uppercase tracking-[0.25em] text-gray-400 mb-6">
            Expert Tailoring for Pakistan's Leading Designer Brands
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 opacity-75">
            {[
              'Sapphire',
              'Khaadi',
              'Sana Safinaz',
              'Maria.B',
              'Junaid Jamshed',
              'Bareeze',
              'Gul Ahmed',
              'Alkaram',
            ].map((brand) => (
              <span
                key={brand}
                className="font-serif text-sm font-semibold tracking-wider text-gray-700"
              >
                {brand}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3-STEP ATELIER WORKFLOW ── */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#7E153A] block">
              Effortless Process
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900">
              How TailorLink Works
            </h2>
            <p className="text-sm text-gray-500">
              Three simple steps to custom-tailored perfection, without stepping
              out of your home.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#FAF9F6] p-8 rounded-3xl border border-gray-100 space-y-4">
              <span className="font-serif text-3xl font-bold text-[#7E153A]">
                01
              </span>
              <h3 className="font-serif text-xl font-bold text-gray-900">
                Select Style & Send Fabric
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Choose your garment silhouette. TCS picks up your unstitched
                fabric from your doorstep, or you can pick from our curated
                in-house fabric stock.
              </p>
            </div>

            <div className="bg-[#FAF9F6] p-8 rounded-3xl border border-gray-100 space-y-4">
              <span className="font-serif text-3xl font-bold text-[#7E153A]">
                02
              </span>
              <h3 className="font-serif text-xl font-bold text-gray-900">
                Provide Your Fit
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Enter your measurements using our simple visual guide, or choose
                "Clone My Fit" to include your best-fitting garment in the
                pickup bag.
              </p>
            </div>

            <div className="bg-[#FAF9F6] p-8 rounded-3xl border border-gray-100 space-y-4">
              <span className="font-serif text-3xl font-bold text-[#7E153A]">
                03
              </span>
              <h3 className="font-serif text-xl font-bold text-gray-900">
                Tailored & Delivered
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Crafted by master tailors, inspected through our multi-point
                quality protocol, steam-pressed, and delivered to your doorstep
                in 5–7 days.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── GARMENT CATEGORIES ── */}
      <section className="py-20 bg-[#FAF9F6] border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#7E153A] block mb-1">
                Atelier Silhouettes
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900">
                Custom Tailoring Options
              </h2>
            </div>
            <Link
              href="/stock"
              className="text-xs font-bold uppercase tracking-wider text-[#7E153A] hover:underline flex items-center gap-1"
            >
              <span>View Full Catalog</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div className="relative aspect-[4/5] bg-[#F7F5F0] p-6 flex items-center justify-center">
                  <span className="absolute top-4 left-4 bg-white/90 text-gray-800 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-xs">
                    {item.badge}
                  </span>
                  <div className="relative w-full h-full">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-contain"
                    />
                  </div>
                </div>

                <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-gray-900">
                      {item.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-[#7E153A]">
                      {item.price}
                    </span>
                    <Link
                      href={item.link}
                      className="text-xs font-bold text-gray-900 hover:text-[#7E153A] flex items-center gap-1"
                    >
                      <span>Select</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── QUALITY STANDARDS ── */}
      <section id="quality" className="py-20 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#7E153A] block">
              Craftsmanship
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900">
              The TailorLink Quality Standard
            </h2>
            <p className="text-sm text-gray-500">
              Built on industrial precision, verified dimensions, and high-grade
              materials.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-[#FAF9F6] border border-gray-100 space-y-2">
              <Scissors className="w-6 h-6 text-[#7E153A]" />
              <h3 className="font-serif text-base font-bold text-gray-900">
                14 Stitches Per Inch
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                High-density seam construction using German spun thread for
                superior durability and clean drape.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#FAF9F6] border border-gray-100 space-y-2">
              <ShieldCheck className="w-6 h-6 text-[#7E153A]" />
              <h3 className="font-serif text-base font-bold text-gray-900">
                Micro-Dot Interlining
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Fused canvas prevents collar, placket, and cuff buckling after
                washing or dry cleaning.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#FAF9F6] border border-gray-100 space-y-2">
              <Ruler className="w-6 h-6 text-[#7E153A]" />
              <h3 className="font-serif text-base font-bold text-gray-900">
                Physical QC Inspection
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Every garment is checked against your fit profile with strict
                ±0.25 inch tolerance checks.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#FAF9F6] border border-gray-100 space-y-2">
              <Truck className="w-6 h-6 text-[#7E153A]" />
              <h3 className="font-serif text-base font-bold text-gray-900">
                Insured TCS Delivery
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Complete milestone tracking from fabric pickup to final doorstep
                handover across Pakistan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ACCORDION ── */}
      <section className="py-20 bg-[#FAF9F6] border-t border-gray-100">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-12 space-y-2">
            <h2 className="font-serif text-3xl font-bold text-gray-900">
              Frequently Asked Questions
            </h2>
            <p className="text-xs text-gray-500">
              Everything you need to know about our custom tailoring process.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(i)}
                  className="w-full text-left p-5 flex items-center justify-between font-serif text-base font-bold text-gray-900 hover:text-[#7E153A] transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform ${openFaq === i ? 'rotate-180 text-[#7E153A]' : ''}`}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 text-xs text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CALL TO ACTION ── */}
      <section className="py-16 bg-[#7E153A] text-white">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-6">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white">
            Ready to experience tailored perfection?
          </h2>
          <p className="text-sm text-red-100 max-w-xl mx-auto leading-relaxed">
            Send us your unstitched designer suits or explore our fabric stock.
            Complete fit guarantee with nationwide doorstep delivery.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-2">
            <Link href="/stock" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto bg-white hover:bg-gray-100 text-[#7E153A] text-xs font-bold uppercase tracking-widest h-12 px-7 rounded-xl shadow-md">
                Start Custom Order
              </Button>
            </Link>
            <Link href="/track" className="w-full sm:w-auto">
              <Button
                variant="outline"
                className="w-full sm:w-auto bg-transparent border-white/40 text-white hover:bg-white/10 text-xs font-bold uppercase tracking-widest h-12 px-7 rounded-xl"
              >
                Track Existing Order
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-gray-900 text-gray-400 py-12 border-t border-gray-800 text-xs">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#7E153A] text-white flex items-center justify-center">
                <Scissors className="w-4 h-4 text-[#E8D7B5]" />
              </div>
              <span className="font-serif text-lg font-bold text-white">
                TailorLink<span className="text-[#7E153A]">.pk</span>
              </span>
            </div>
            <p className="text-gray-400 leading-relaxed text-[11px]">
              Pakistan's centralized custom tailoring service. Precision cuts,
              master craftsmanship, and live TCS courier tracking.
            </p>
          </div>

          <div className="space-y-2.5">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">
              Garments
            </h4>
            <ul className="space-y-1.5 text-gray-400 text-[11px]">
              <li>
                <Link href="/stock?gender=female" className="hover:text-white">
                  Women's Shalwar Kameez
                </Link>
              </li>
              <li>
                <Link href="/stock?gender=female" className="hover:text-white">
                  Festive Frocks & Maxis
                </Link>
              </li>
              <li>
                <Link href="/stock?gender=male" className="hover:text-white">
                  Men's Royal Waistcoats
                </Link>
              </li>
              <li>
                <Link href="/stock?gender=male" className="hover:text-white">
                  Bespoke Two-Piece Suits
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-2.5">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">
              Customer Care
            </h4>
            <ul className="space-y-1.5 text-gray-400 text-[11px]">
              <li>
                <Link href="/track" className="hover:text-white">
                  Track Order
                </Link>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-white">
                  How It Works
                </a>
              </li>
              <li>
                <Link href="/help" className="hover:text-white">
                  Help & Support
                </Link>
              </li>
              <li>
                <Link href="/help" className="hover:text-white">
                  Fit Guarantee Policy
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-2.5">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">
              Direct Support
            </h4>
            <p className="text-[11px] text-gray-400">
              Available Mon–Sat (10am–8pm PKT)
            </p>
            <p className="font-semibold text-white text-[12px]">
              +92 (300) 000-0000
            </p>
            <p className="text-gray-400 text-[11px]">support@tailorlink.pk</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 pt-6 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-gray-500 text-[11px]">
          <p>
            © {new Date().getFullYear()} TailorLink.pk. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="/help" className="hover:text-white">
              Privacy Policy
            </Link>
            <Link href="/help" className="hover:text-white">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
