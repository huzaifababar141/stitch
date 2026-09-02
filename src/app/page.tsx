import Link from 'next/link';
import {
  Scissors,
  Ruler,
  ShieldCheck,
  Truck,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  User,
  Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div
      className="min-h-screen bg-[#FAFAFA] text-gray-900 font-sans flex flex-col justify-between"
      suppressHydrationWarning
    >
      {/* HEADER / NAVIGATION BAR */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-[#7E153A] text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-gray-900 leading-none">
                Stitch<span className="text-[#7E153A]">.pk</span>
              </span>
              <p className="text-[10px] text-gray-400 font-medium tracking-wider uppercase">
                Tailoring Reimagined
              </p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a
              href="#features"
              className="hover:text-[#7E153A] transition-colors"
            >
              Features
            </a>
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
              Quality Control
            </a>
          </nav>

          {/* Right Header Actions (LOGIN BUTTON) */}
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button
                variant="outline"
                className="border-[#7E153A] text-[#7E153A] hover:bg-[#7E153A]/5 font-semibold px-5 h-11 rounded-lg transition-all flex items-center gap-2"
              >
                <User className="w-4 h-4" />
                Log In
              </Button>
            </Link>

            <Link href="/login" className="hidden sm:inline-block">
              <Button className="bg-[#7E153A] hover:bg-[#630f2d] text-white font-semibold px-6 h-11 rounded-lg shadow-md shadow-[#7E153A]/20 transition-all flex items-center gap-2">
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-16 pb-24 lg:pt-24 lg:pb-32 bg-gradient-to-b from-white via-[#FDF8F9] to-[#FAFAFA]">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Hero Content Left */}
          <div className="space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#7E153A]/10 border border-[#7E153A]/20 text-[#7E153A] text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              Pakistan's 1st Centralized Digital Tailoring Factory
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight leading-[1.15]">
              Bespoke Tailoring. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7E153A] to-[#A01B4C]">
                Guaranteed Perfect Fit.
              </span>
            </h1>

            <p className="text-lg text-gray-600 max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed">
              Order custom-stitched unstitched suits online with complete
              confidence. Guided body measurement studio, master tailor
              craftsmanship, internal QC inspection, and live TCS courier
              tracking.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center">
              <Link href="/login" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto bg-[#7E153A] hover:bg-[#630f2d] text-white font-bold h-14 px-8 text-base rounded-xl shadow-lg shadow-[#7E153A]/25 flex items-center justify-center gap-3">
                  <Scissors className="w-5 h-5" />
                  Create Custom Order
                </Button>
              </Link>
              <Link href="#how-it-works" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto border-gray-300 text-gray-700 hover:bg-gray-50 h-14 px-8 text-base rounded-xl"
                >
                  See How It Works
                </Button>
              </Link>
            </div>

            {/* Trust Metrics */}
            <div className="pt-6 border-t border-gray-200/60 grid grid-cols-3 gap-6 max-w-lg mx-auto lg:mx-0 text-center lg:text-left">
              <div>
                <p className="text-2xl font-bold text-gray-900">100%</p>
                <p className="text-xs text-gray-500 font-medium">
                  Fit Guarantee
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">24-48h</p>
                <p className="text-xs text-gray-500 font-medium">QC Dispatch</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-[#7E153A] flex items-center justify-center lg:justify-start gap-1">
                  4.9 <Star className="w-4 h-4 fill-current text-[#7E153A]" />
                </p>
                <p className="text-xs text-gray-500 font-medium">
                  Customer Rating
                </p>
              </div>
            </div>
          </div>

          {/* Hero Visual Cards Right */}
          <div className="relative">
            <div className="relative mx-auto max-w-md lg:max-w-none bg-[#7E153A] p-8 lg:p-10 rounded-3xl text-white shadow-2xl space-y-6">
              <div className="flex items-center justify-between pb-6 border-b border-white/20">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white">
                    <Ruler className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-lg">
                      Guided Measurement Studio
                    </p>
                    <p className="text-xs text-white/80">
                      AI-assisted body dimension validation
                    </p>
                  </div>
                </div>
                <span className="bg-white text-[#7E153A] text-xs font-extrabold px-3 py-1 rounded-full">
                  ACTIVE
                </span>
              </div>

              {/* Feature Cards inside Hero */}
              <div className="space-y-4">
                <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-white" /> Shalwar
                    Kameez / Kurta Customization
                  </span>
                  <span className="font-mono text-xs opacity-90">Verified</span>
                </div>
                <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-white" /> Internal
                    Quality Check Protocol
                  </span>
                  <span className="font-mono text-xs opacity-90">
                    Pass/Fail
                  </span>
                </div>
                <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-white" /> TCS Courier Live
                    Tracking Integration
                  </span>
                  <span className="font-mono text-xs opacity-90">Realtime</span>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between text-xs text-white/70">
                <span>Centralized Digital Factory</span>
                <span>Zero Miscommunication</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section
        id="features"
        className="py-20 bg-white border-t border-gray-100"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Why Choose TailorLink<span className="text-[#7E153A]">.pk</span>?
            </h2>
            <p className="text-gray-600">
              We eliminate direct customer-to-tailor miscommunication with a
              centralized production system.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#FAFAFA] p-8 rounded-2xl border border-gray-100 space-y-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-[#7E153A]/10 text-[#7E153A] flex items-center justify-center font-bold">
                <Ruler className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Guided Measurement Studio
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Enter measurements using our visual anatomical guide. Our AI
                algorithm checks ranges to prevent fitting errors.
              </p>
            </div>

            <div className="bg-[#FAFAFA] p-8 rounded-2xl border border-gray-100 space-y-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-[#7E153A]/10 text-[#7E153A] flex items-center justify-center font-bold">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Strict Quality Inspection
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Every suit undergoes multi-point inspection by certified QC
                inspectors before dispatch. No flawed stitching ever reaches
                you.
              </p>
            </div>

            <div className="bg-[#FAFAFA] p-8 rounded-2xl border border-gray-100 space-y-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-[#7E153A]/10 text-[#7E153A] flex items-center justify-center font-bold">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Integrated TCS Delivery
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Track your order seamlessly from fabric pickup to doorstep
                courier delivery with real-time milestone updates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-400 py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#7E153A] text-white flex items-center justify-center">
              <Scissors className="w-4 h-4" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">
              TailorLink.pk
            </span>
          </div>

          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} Stitch / TailorLink.pk — Centralized
            Custom Tailoring Platform. All rights reserved.
          </p>

          <div className="flex items-center gap-6 text-sm">
            <Link href="/login" className="hover:text-white transition-colors">
              Log In
            </Link>
            <Link
              href="/register"
              className="hover:text-white transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
