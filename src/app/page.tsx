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
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [openFooterSection, setOpenFooterSection] = useState<string | null>(
    null
  );

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const toggleFooterSection = (section: string) => {
    setOpenFooterSection(openFooterSection === section ? null : section);
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
      q: 'How does fabric selection work?',
      a: 'You can choose from our curated in-house fabric stock, or order custom tailoring for unstitched suits from leading designer brands. We craft each garment according to your selected cut and exact fit.',
    },
    {
      q: 'How do I provide my measurements?',
      a: 'You can use our 2-minute Guided Visual Measurement studio to enter your measurements with clear step-by-step illustrations, pick from standard size presets, or save your profile for 1-click reordering.',
    },
    {
      q: 'What is the 100% Fit Guarantee?',
      a: 'If any garment does not match your submitted specifications, we arrange free two-way courier collection and adjust or recut it completely free of charge.',
    },
    {
      q: 'What is the delivery turnaround time?',
      a: 'Standard orders are tailored, quality inspected, pressed, and dispatched within 5 to 7 business days via express courier.',
    },
  ];

  const announcements = [
    'Bespoke Custom Tailoring Across Pakistan',
    '100% Guaranteed Fit',
    'Nationwide Express Delivery',
    'Curated Designer Fabric Stock',
    'Master Craftsmen & 24-Point QC Protocol',
  ];

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#FAF9F6] text-[#1A1A1A] font-sans flex flex-col justify-between selection:bg-[#7E153A]/15 selection:text-[#7E153A]">
      {/* ── TOP ANNOUNCEMENT BAR (CONTINUOUS SLIDING TICKER) ── */}
      <div className="w-full bg-[#7E153A] text-white text-[10px] sm:text-[11px] font-medium tracking-wide sm:tracking-wider uppercase py-2 sm:py-2.5 overflow-hidden border-b border-[#630f2d]/50 select-none">
        <div className="flex w-max animate-marquee">
          {/* Track 1 */}
          <div className="flex items-center shrink-0">
            {announcements.map((item, idx) => (
              <span key={`a-${idx}`} className="inline-flex items-center">
                <span>{item}</span>
                <span className="mx-6 sm:mx-10 text-[#E8D7B5] opacity-70 font-bold">
                  •
                </span>
              </span>
            ))}
          </div>
          {/* Track 2 (Seamless loop mirror) */}
          <div className="flex items-center shrink-0" aria-hidden="true">
            {announcements.map((item, idx) => (
              <span key={`b-${idx}`} className="inline-flex items-center">
                <span>{item}</span>
                <span className="mx-6 sm:mx-10 text-[#E8D7B5] opacity-70 font-bold">
                  •
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── NAVIGATION ── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-2">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 sm:gap-3 group shrink-0 min-w-0"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#7E153A] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform shrink-0">
              <Scissors className="w-4 h-4 sm:w-5 sm:h-5 text-[#E8D7B5]" />
            </div>
            <div className="min-w-0">
              <span className="font-serif text-lg sm:text-2xl font-bold tracking-tight text-gray-900 leading-none block truncate">
                TailorLink<span className="text-[#7E153A]">.pk</span>
              </span>
              <span className="text-[8px] sm:text-[9px] uppercase tracking-widest text-gray-400 font-medium block mt-0.5 truncate">
                Bespoke Tailoring Studio
              </span>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="hidden lg:flex items-center gap-8 text-xs font-semibold tracking-wider uppercase text-gray-600">
            <Link
              href="/stock"
              className="hover:text-[#7E153A] transition-colors"
            >
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
          <div className="hidden sm:flex items-center gap-2.5">
            <Link href="/login">
              <Button
                variant="outline"
                className="border-gray-200 text-gray-700 hover:text-[#7E153A] hover:bg-[#FAF0F2] text-xs font-semibold uppercase tracking-wider h-10 px-4 rounded-xl transition-all"
              >
                <User className="w-3.5 h-3.5 mr-1.5" />
                Sign In
              </Button>
            </Link>
            <Link href="/stock">
              <Button className="bg-[#7E153A] hover:bg-[#630f2d] text-white text-xs font-semibold uppercase tracking-wider h-10 px-5 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer">
                <span>Start Order</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#E8D7B5]" />
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-1.5 shrink-0">
            <Link href="/login" className="sm:hidden">
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-8 px-2.5 border-gray-200 text-gray-700 cursor-pointer"
              >
                Sign In
              </Button>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 sm:p-2 rounded-lg text-gray-700 hover:bg-gray-100 cursor-pointer"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              ) : (
                <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-gray-100 px-4 sm:px-6 py-4 space-y-3 shadow-lg">
            <nav className="flex flex-col space-y-2 text-sm font-medium text-gray-700">
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
            <div className="pt-2 border-t border-gray-100 flex flex-col gap-2">
              <Link href="/stock" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full bg-[#7E153A] hover:bg-[#630f2d] text-white text-xs font-bold uppercase tracking-wider h-10 rounded-xl cursor-pointer">
                  Start Custom Order
                </Button>
              </Link>
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button
                  variant="outline"
                  className="w-full border-gray-200 text-xs font-semibold h-10 rounded-xl cursor-pointer"
                >
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ── HERO SECTION ── */}
      <section className="relative overflow-hidden pt-8 pb-14 sm:pt-12 sm:pb-20 lg:pt-20 lg:pb-28 bg-[#FAF9F6] w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6 text-center lg:text-left min-w-0">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-white border border-gray-200 text-[#7E153A] text-[10px] sm:text-xs font-semibold tracking-wide sm:tracking-wider uppercase shadow-2xs max-w-full">
              <ShieldCheck className="w-3.5 h-3.5 text-[#7E153A] shrink-0" />
              <span>Master Craftsmen • Guaranteed Fit</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight leading-[1.18] sm:leading-[1.15] break-words">
              Bespoke Tailoring.{' '}
              <span className="italic font-normal text-[#7E153A] block sm:inline">
                Crafted to Perfection.
              </span>
            </h1>

            <p className="text-xs sm:text-base lg:text-lg text-gray-600 max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed">
              Premium custom tailoring made effortless. Digital sizing, master
              craftsmanship, and guaranteed doorstep delivery nationwide.
            </p>

            <div className="grid grid-cols-2 gap-2 sm:gap-3.5 max-w-sm sm:max-w-md mx-auto lg:mx-0 w-full pt-1 sm:pt-2">
              <Link href="/stock" className="w-full">
                <Button className="w-full bg-[#7E153A] hover:bg-[#630f2d] text-white text-[11px] sm:text-xs font-bold uppercase tracking-wide sm:tracking-wider h-11 sm:h-13 px-2 sm:px-6 rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer">
                  <Scissors className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Start Order</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#E8D7B5] shrink-0 hidden sm:inline" />
                </Button>
              </Link>
              <a href="#how-it-works" className="w-full">
                <Button
                  variant="outline"
                  className="w-full bg-white hover:bg-gray-50 text-gray-800 border-gray-300 text-[11px] sm:text-xs font-bold uppercase tracking-wide sm:tracking-wider h-11 sm:h-13 px-2 sm:px-6 rounded-xl transition-all cursor-pointer truncate"
                >
                  How It Works
                </Button>
              </a>
            </div>

            {/* Reassurance Row */}
            <div className="pt-4 sm:pt-6 border-t border-gray-200/80 grid grid-cols-3 gap-2 sm:gap-4 max-w-lg mx-auto lg:mx-0 text-center lg:text-left">
              <div>
                <p className="font-serif text-xl sm:text-3xl font-bold text-gray-900">
                  100%
                </p>
                <p className="text-[10px] sm:text-xs text-gray-500 font-medium mt-0.5">
                  Fit Guarantee
                </p>
              </div>
              <div>
                <p className="font-serif text-xl sm:text-3xl font-bold text-gray-900">
                  5–7 Days
                </p>
                <p className="text-[10px] sm:text-xs text-gray-500 font-medium mt-0.5">
                  Express Delivery
                </p>
              </div>
              <div>
                <p className="font-serif text-xl sm:text-3xl font-bold text-[#7E153A]">
                  14 SPI
                </p>
                <p className="text-[10px] sm:text-xs text-gray-500 font-medium mt-0.5">
                  Couture Stitch
                </p>
              </div>
            </div>
          </div>

          {/* Right Visual Column (Dual Garment Atelier Preview) */}
          <div className="lg:col-span-5 relative w-full min-w-0">
            <div className="relative mx-auto w-full max-w-md lg:max-w-none bg-white p-4 sm:p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-gray-200/80 shadow-md space-y-3.5 sm:space-y-5">
              <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-gray-100 gap-2">
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#FAF0F2] text-[#7E153A] flex items-center justify-center font-bold shrink-0">
                    <Ruler className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-serif text-sm sm:text-base font-bold text-gray-900 truncate">
                      Bespoke Tailoring Studio
                    </h3>
                    <p className="text-[10px] sm:text-xs text-gray-500 truncate">
                      Unstitched to Finished Suits
                    </p>
                  </div>
                </div>
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2 sm:px-2.5 py-0.5 sm:py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full shrink-0">
                  Available
                </span>
              </div>

              {/* Garment Preview Row */}
              <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
                <div className="bg-[#FAF9F6] p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-100 text-center space-y-1.5 sm:space-y-2">
                  <div className="relative aspect-[3/4] w-full">
                    <Image
                      src="/images/tailor/garment_w_shalwarkameez.png"
                      alt="Women's Shalwar Kameez"
                      fill
                      priority
                      sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 20vw"
                      className="object-contain"
                    />
                  </div>
                  <p className="font-serif text-[11px] sm:text-xs font-bold text-gray-900 truncate">
                    Women's Collection
                  </p>
                  <p className="text-[10px] sm:text-[11px] text-[#7E153A] font-semibold">
                    From Rs. 2,800
                  </p>
                </div>

                <div className="bg-[#FAF9F6] p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-100 text-center space-y-1.5 sm:space-y-2">
                  <div className="relative aspect-[3/4] w-full">
                    <Image
                      src="/images/tailor/garment_m_waistcoat.png"
                      alt="Men's Waistcoat"
                      fill
                      priority
                      sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 20vw"
                      className="object-contain"
                    />
                  </div>
                  <p className="font-serif text-[11px] sm:text-xs font-bold text-gray-900 truncate">
                    Men's Collection
                  </p>
                  <p className="text-[10px] sm:text-[11px] text-[#7E153A] font-semibold">
                    From Rs. 4,500
                  </p>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-[11px] sm:text-xs text-gray-500 border-t border-gray-100 gap-2">
                <span className="flex items-center gap-1 sm:gap-1.5 truncate">
                  <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#7E153A] shrink-0" />
                  <span className="truncate">24-Point Quality Inspection</span>
                </span>
                <span className="font-semibold text-gray-800 shrink-0">
                  Tracked Delivery
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TEXTILE BRANDS STRIP ── */}
      <section className="py-6 sm:py-10 bg-white border-y border-gray-100 w-full overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <p className="text-center text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] sm:tracking-[0.25em] text-gray-400 mb-4 sm:mb-6">
            Expert Tailoring for Pakistan's Leading Designer Brands
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3.5 sm:gap-8 lg:gap-10 opacity-75">
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
                className="font-serif text-xs sm:text-sm font-semibold tracking-wider text-gray-700"
              >
                {brand}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3-STEP ATELIER WORKFLOW ── */}
      <section id="how-it-works" className="py-12 sm:py-20 bg-white w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-16 space-y-1.5 sm:space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] sm:tracking-[0.25em] text-[#7E153A] block">
              Effortless Process
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-gray-900">
              How TailorLink Works
            </h2>
            <p className="text-xs sm:text-sm text-gray-500">
              Three simple steps to custom-tailored perfection from home.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8">
            <div className="bg-[#FAF9F6] p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-gray-100 space-y-2.5 sm:space-y-4">
              <span className="font-serif text-2xl sm:text-3xl font-bold text-[#7E153A]">
                01
              </span>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-gray-900">
                Select Style & Fabric
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Choose your silhouette and select from curated in-house fabric
                or custom designer suits.
              </p>
            </div>

            <div className="bg-[#FAF9F6] p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-gray-100 space-y-2.5 sm:space-y-4">
              <span className="font-serif text-2xl sm:text-3xl font-bold text-[#7E153A]">
                02
              </span>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-gray-900">
                Provide Your Fit
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Submit measurements with our guided visual tool or choose a
                standard size preset.
              </p>
            </div>

            <div className="bg-[#FAF9F6] p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-gray-100 space-y-2.5 sm:space-y-4">
              <span className="font-serif text-2xl sm:text-3xl font-bold text-[#7E153A]">
                03
              </span>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-gray-900">
                Tailored & Delivered
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Stitched by master craftsmen, quality inspected, and delivered
                to your doorstep in 5–7 days.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── GARMENT CATEGORIES ── */}
      <section className="py-12 sm:py-20 bg-[#FAF9F6] border-t border-gray-100 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-12 gap-3 sm:gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] sm:tracking-[0.25em] text-[#7E153A] block mb-1">
                Atelier Silhouettes
              </span>
              <h2 className="font-serif text-2xl sm:text-4xl font-bold text-gray-900">
                Custom Tailoring Options
              </h2>
            </div>
            <Link
              href="/stock"
              className="text-xs font-bold uppercase tracking-wider text-[#7E153A] hover:underline flex items-center gap-1 self-start sm:self-auto"
            >
              <span>View Full Catalog</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {categories.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl sm:rounded-3xl overflow-hidden border border-gray-100 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div className="relative aspect-[4/5] bg-[#F7F5F0] p-4 sm:p-6 flex items-center justify-center">
                  <span className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-white/90 text-gray-800 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full shadow-2xs">
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

                <div className="p-4 sm:p-6 space-y-2.5 sm:space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-serif text-base sm:text-lg font-bold text-gray-900">
                      {item.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5 sm:mt-1 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                  <div className="pt-3 sm:pt-4 border-t border-gray-100 flex items-center justify-between">
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
      <section
        id="quality"
        className="py-12 sm:py-20 bg-white border-t border-gray-100 w-full"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-16 space-y-1.5 sm:space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] sm:tracking-[0.25em] text-[#7E153A] block">
              Craftsmanship
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-gray-900">
              The TailorLink Quality Standard
            </h2>
            <p className="text-xs sm:text-sm text-gray-500">
              Built on industrial precision, verified dimensions, and high-grade
              materials.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6">
            <div className="p-4 sm:p-6 rounded-2xl bg-[#FAF9F6] border border-gray-100 space-y-1.5 sm:space-y-2">
              <Scissors className="w-5 h-5 sm:w-6 sm:h-6 text-[#7E153A]" />
              <h3 className="font-serif text-base font-bold text-gray-900">
                14 Stitches Per Inch
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                High-density seam construction using German spun thread for
                superior durability and clean drape.
              </p>
            </div>

            <div className="p-4 sm:p-6 rounded-2xl bg-[#FAF9F6] border border-gray-100 space-y-1.5 sm:space-y-2">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-[#7E153A]" />
              <h3 className="font-serif text-base font-bold text-gray-900">
                Micro-Dot Interlining
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Fused canvas prevents collar, placket, and cuff buckling after
                washing or dry cleaning.
              </p>
            </div>

            <div className="p-4 sm:p-6 rounded-2xl bg-[#FAF9F6] border border-gray-100 space-y-1.5 sm:space-y-2">
              <Ruler className="w-5 h-5 sm:w-6 sm:h-6 text-[#7E153A]" />
              <h3 className="font-serif text-base font-bold text-gray-900">
                Physical QC Inspection
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Every garment is checked against your fit profile with strict
                ±0.25 inch tolerance checks.
              </p>
            </div>

            <div className="p-4 sm:p-6 rounded-2xl bg-[#FAF9F6] border border-gray-100 space-y-1.5 sm:space-y-2">
              <Truck className="w-5 h-5 sm:w-6 sm:h-6 text-[#7E153A]" />
              <h3 className="font-serif text-base font-bold text-gray-900">
                Insured Express Delivery
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Complete milestone tracking from atelier stitching to final
                doorstep handover across Pakistan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ACCORDION ── */}
      <section className="py-12 sm:py-20 bg-[#FAF9F6] border-t border-gray-100 w-full">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12 space-y-1 sm:space-y-2">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900">
              Frequently Asked Questions
            </h2>
            <p className="text-xs text-gray-500">
              Everything you need to know about our custom tailoring process.
            </p>
          </div>

          <div className="space-y-2.5 sm:space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(i)}
                  className="w-full text-left p-4 sm:p-5 flex items-center justify-between font-serif text-sm sm:text-base font-bold text-gray-900 hover:text-[#7E153A] transition-colors gap-3 cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${openFaq === i ? 'rotate-180 text-[#7E153A]' : ''}`}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CALL TO ACTION ── */}
      <section className="py-12 sm:py-16 bg-[#7E153A] text-white w-full">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-4 sm:space-y-6">
          <h2 className="font-serif text-2xl sm:text-4xl font-bold text-white">
            Ready to experience tailored perfection?
          </h2>
          <p className="text-xs sm:text-sm text-red-100 max-w-xl mx-auto leading-relaxed">
            Order bespoke custom tailoring or explore our curated fabric stock.
            Complete fit guarantee with nationwide doorstep delivery.
          </p>
          <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 justify-center items-center pt-2 w-full">
            <Link href="/stock" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto bg-white hover:bg-gray-100 text-[#7E153A] text-xs font-bold uppercase tracking-wider sm:tracking-widest h-11 sm:h-12 px-6 sm:px-7 rounded-xl shadow-xs cursor-pointer">
                Start Custom Order
              </Button>
            </Link>
            <Link href="/track" className="w-full sm:w-auto">
              <Button
                variant="outline"
                className="w-full sm:w-auto bg-transparent border-white/40 text-white hover:bg-white/10 text-xs font-bold uppercase tracking-wider sm:tracking-widest h-11 sm:h-12 px-6 sm:px-7 rounded-xl cursor-pointer"
              >
                Track Existing Order
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-gray-900 text-gray-400 py-10 sm:py-12 border-t border-gray-800 text-xs w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-8 mb-8 sm:mb-10">
          <div className="space-y-2.5 sm:space-y-3 pb-2 sm:pb-0">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#7E153A] text-white flex items-center justify-center shrink-0">
                <Scissors className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#E8D7B5]" />
              </div>
              <span className="font-serif text-base sm:text-lg font-bold text-white">
                TailorLink<span className="text-[#7E153A]">.pk</span>
              </span>
            </div>
            <p className="text-gray-400 leading-relaxed text-[11px]">
              Pakistan's centralized custom tailoring service. Precision cuts,
              master craftsmanship, and live courier tracking.
            </p>
          </div>

          {/* Garments (Dropdown on mobile, static on desktop) */}
          <div className="border-b border-gray-800/80 sm:border-none pb-2.5 sm:pb-0">
            <button
              type="button"
              onClick={() => toggleFooterSection('garments')}
              className="w-full flex items-center justify-between py-1.5 sm:py-0 text-left cursor-pointer sm:cursor-default"
            >
              <h4 className="font-bold text-white text-xs uppercase tracking-wider">
                Garments
              </h4>
              <ChevronDown
                className={`w-4 h-4 text-gray-400 transition-transform duration-200 sm:hidden ${
                  openFooterSection === 'garments'
                    ? 'rotate-180 text-white'
                    : ''
                }`}
              />
            </button>
            <div
              className={`${
                openFooterSection === 'garments' ? 'block' : 'hidden'
              } sm:block pt-2 sm:pt-2`}
            >
              <ul className="space-y-2 sm:space-y-1.5 text-gray-400 text-[11px]">
                <li>
                  <Link
                    href="/stock?gender=female"
                    className="hover:text-white transition-colors block py-0.5 sm:py-0"
                  >
                    Women's Shalwar Kameez
                  </Link>
                </li>
                <li>
                  <Link
                    href="/stock?gender=female"
                    className="hover:text-white transition-colors block py-0.5 sm:py-0"
                  >
                    Festive Frocks & Maxis
                  </Link>
                </li>
                <li>
                  <Link
                    href="/stock?gender=male"
                    className="hover:text-white transition-colors block py-0.5 sm:py-0"
                  >
                    Men's Royal Waistcoats
                  </Link>
                </li>
                <li>
                  <Link
                    href="/stock?gender=male"
                    className="hover:text-white transition-colors block py-0.5 sm:py-0"
                  >
                    Bespoke Two-Piece Suits
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Customer Care (Dropdown on mobile, static on desktop) */}
          <div className="border-b border-gray-800/80 sm:border-none pb-2.5 sm:pb-0">
            <button
              type="button"
              onClick={() => toggleFooterSection('customer_care')}
              className="w-full flex items-center justify-between py-1.5 sm:py-0 text-left cursor-pointer sm:cursor-default"
            >
              <h4 className="font-bold text-white text-xs uppercase tracking-wider">
                Customer Care
              </h4>
              <ChevronDown
                className={`w-4 h-4 text-gray-400 transition-transform duration-200 sm:hidden ${
                  openFooterSection === 'customer_care'
                    ? 'rotate-180 text-white'
                    : ''
                }`}
              />
            </button>
            <div
              className={`${
                openFooterSection === 'customer_care' ? 'block' : 'hidden'
              } sm:block pt-2 sm:pt-2`}
            >
              <ul className="space-y-2 sm:space-y-1.5 text-gray-400 text-[11px]">
                <li>
                  <Link
                    href="/track"
                    className="hover:text-white transition-colors block py-0.5 sm:py-0"
                  >
                    Track Order
                  </Link>
                </li>
                <li>
                  <a
                    href="#how-it-works"
                    className="hover:text-white transition-colors block py-0.5 sm:py-0"
                  >
                    How It Works
                  </a>
                </li>
                <li>
                  <Link
                    href="/help"
                    className="hover:text-white transition-colors block py-0.5 sm:py-0"
                  >
                    Help & Support
                  </Link>
                </li>
                <li>
                  <Link
                    href="/help"
                    className="hover:text-white transition-colors block py-0.5 sm:py-0"
                  >
                    Fit Guarantee Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Direct Support (Dropdown on mobile, static on desktop) */}
          <div className="border-b border-gray-800/80 sm:border-none pb-2.5 sm:pb-0">
            <button
              type="button"
              onClick={() => toggleFooterSection('support')}
              className="w-full flex items-center justify-between py-1.5 sm:py-0 text-left cursor-pointer sm:cursor-default"
            >
              <h4 className="font-bold text-white text-xs uppercase tracking-wider">
                Direct Support
              </h4>
              <ChevronDown
                className={`w-4 h-4 text-gray-400 transition-transform duration-200 sm:hidden ${
                  openFooterSection === 'support' ? 'rotate-180 text-white' : ''
                }`}
              />
            </button>
            <div
              className={`${
                openFooterSection === 'support' ? 'block' : 'hidden'
              } sm:block pt-2 sm:pt-2 space-y-1.5`}
            >
              <p className="text-[11px] text-gray-400">
                Available Mon–Sat (10am–8pm PKT)
              </p>
              <p className="font-semibold text-white text-[12px]">
                +92 (300) 000-0000
              </p>
              <p className="text-gray-400 text-[11px]">support@tailorlink.pk</p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-gray-500 text-[11px]">
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
