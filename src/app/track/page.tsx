'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Scissors,
  Search,
  Truck,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  Loader2,
  AlertCircle,
  Package,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function PublicTrackPage() {
  const router = useRouter();
  const [orderQuery, setOrderQuery] = useState('');
  const [phoneQuery, setPhoneQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderQuery.trim()) {
      setError('Please enter your Order Number (e.g. TLK-10293).');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      // Find order by search
      const res = await fetch(
        `/api/orders?search=${encodeURIComponent(orderQuery.trim())}`
      );
      if (res.ok) {
        const json = await res.json();
        const orders = json.data?.orders || json.orders || [];
        const match = orders.find(
          (o: any) =>
            o.orderNumber?.toLowerCase() === orderQuery.trim().toLowerCase() ||
            o.id.toLowerCase() === orderQuery.trim().toLowerCase()
        );

        if (match) {
          router.push(`/track/${match.orderNumber || match.id}`);
          return;
        }
      }

      // If direct route by ID
      router.push(`/track/${orderQuery.trim().toUpperCase()}`);
    } catch (err) {
      setError(
        'Could not locate order. Please check your order reference number.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF8F9] text-gray-900 font-sans flex flex-col justify-between">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#7E153A] text-white flex items-center justify-center shadow-xs">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-gray-900 text-lg tracking-tight leading-none block">
                TailorLink<span className="text-[#7E153A]">.pk</span>
              </span>
              <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">
                Live Order Tracking
              </span>
            </div>
          </Link>

          <Link href="/login">
            <Button
              variant="outline"
              className="h-10 text-xs font-bold border-gray-200"
            >
              Customer Log In
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Track Form */}
      <main className="max-w-3xl w-full mx-auto px-6 py-16 flex-1 flex flex-col items-center justify-center text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-50 text-[#7E153A] text-xs font-bold uppercase tracking-wider mb-4 border border-red-100">
          <Sparkles size={14} /> Real-Time Workshop & Courier Tracking
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight mb-3">
          Track Your Tailoring Order
        </h1>
        <p className="text-sm text-gray-500 max-w-md mx-auto mb-8">
          Enter your Order Reference Number from your SMS / WhatsApp
          confirmation to see real-time cutting, stitching, QC, and TCS delivery
          progress.
        </p>

        <div className="w-full bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm">
          <form onSubmit={handleSearch} className="space-y-4 text-left">
            <div>
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">
                Order Number
              </label>
              <div className="relative">
                <Input
                  value={orderQuery}
                  onChange={(e) => setOrderQuery(e.target.value)}
                  placeholder="e.g. TLK-10293 or order ID"
                  className="h-14 pl-12 pr-4 bg-gray-50 border-gray-200 text-sm font-semibold rounded-2xl focus-visible:ring-[#7E153A]"
                />
                <Search
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-600 font-semibold flex items-center gap-1.5 pt-1">
                <AlertCircle size={14} /> {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-[#7E153A] hover:bg-[#630f2d] text-white font-bold text-sm rounded-2xl shadow-md shadow-[#7E153A]/20 transition-all cursor-pointer"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin mr-2" />
              ) : (
                <Package size={18} className="mr-2" />
              )}
              Track Order Live
            </Button>
          </form>
        </div>

        {/* Value Props */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12 w-full text-left">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-red-50 text-[#7E153A] shrink-0">
              <Scissors size={20} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-900">
                Workshop Transparency
              </h4>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Know exactly when your suit is cutting vs sewing.
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-700 shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-900">
                QC Pass Verification
              </h4>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Every dimension verified against your body blueprint.
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 shrink-0">
              <Truck size={20} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-900">
                TCS Express Courier
              </h4>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Doorstep delivery across 200+ Pakistani cities.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-6 text-center text-xs text-gray-400">
        <p>© 2026 TailorLink.pk · You Link it, We Stitch it.</p>
      </footer>
    </div>
  );
}
