'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Scissors,
  CheckCircle2,
  Clock,
  Truck,
  Sparkles,
  ShieldCheck,
  Package,
  MessageCircle,
  FileText,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const TRACKING_STEPS = [
  { id: 'placed', label: 'Order Placed', desc: 'Suit details submitted' },
  { id: 'payment', label: 'Payment Confirmed', desc: 'Verified & authorized' },
  {
    id: 'assigned',
    label: 'Workshop Allocated',
    desc: 'Master tailor assigned',
  },
  {
    id: 'in_stitching',
    label: 'Cutting & Tailoring',
    desc: 'Active at machine',
  },
  { id: 'qc', label: 'Quality Audit', desc: 'Measurement tolerance pass' },
  { id: 'dispatched', label: 'Dispatched via TCS', desc: 'Courier on route' },
  { id: 'delivered', label: 'Delivered', desc: 'Doorstep handover complete' },
];

export default function PublicOrderResultPage() {
  const params = useParams();
  const orderNumber = (params?.orderNumber as string) || '';

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPublicOrder() {
      if (!orderNumber) return;
      try {
        const res = await fetch(
          `/api/orders?search=${encodeURIComponent(orderNumber)}`
        );
        if (res.ok) {
          const json = await res.json();
          const list = json.data?.orders || json.orders || [];
          const match = list.find(
            (o: any) =>
              o.orderNumber?.toLowerCase() === orderNumber.toLowerCase() ||
              o.id.toLowerCase() === orderNumber.toLowerCase()
          );
          setOrder(match || list[0] || null);
        }
      } catch (err) {
        console.error('Failed to load public tracking:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchPublicOrder();
  }, [orderNumber]);

  const getStepIndex = (status: string) => {
    switch (status) {
      case 'pending_payment':
        return 0;
      case 'payment_confirmed':
        return 1;
      case 'assigned':
        return 2;
      case 'in_stitching':
        return 3;
      case 'stitching_complete':
      case 'qc_pending':
      case 'qc_approved':
        return 4;
      case 'dispatched':
      case 'in_transit':
      case 'out_for_delivery':
        return 5;
      case 'delivered':
        return 6;
      default:
        return 3;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDF8F9] flex flex-col items-center justify-center">
        <Loader2 size={36} className="animate-spin text-[#7E153A] mb-3" />
        <p className="text-sm font-semibold text-gray-600">
          Connecting to live workshop tracker...
        </p>
      </div>
    );
  }

  const activeStatus = order?.status || 'in_stitching';
  const currentStep = getStepIndex(activeStatus);
  const product = order?.productSnapshot || order?.product || {};
  const delivery = order?.deliveries?.[0] || order?.delivery || {};

  return (
    <div className="min-h-screen bg-[#FDF8F9] text-gray-900 font-sans flex flex-col justify-between">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/track" className="flex items-center gap-2.5">
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
              Customer Login
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Track View */}
      <main className="max-w-4xl w-full mx-auto px-6 py-10 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl border border-gray-100 p-6 shadow-xs">
          <div className="flex items-center gap-3">
            <Link
              href="/track"
              className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-gray-900 font-mono">
                  {orderNumber.toUpperCase()}
                </h1>
                <span className="bg-red-50 text-[#7E153A] text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  {activeStatus.replace(/_/g, ' ')}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Estimated Doorstep Delivery:{' '}
                <span className="font-bold text-gray-800">
                  {order?.estimatedDeliveryDate
                    ? new Date(order.estimatedDeliveryDate).toLocaleDateString(
                        'en-PK',
                        {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        }
                      )
                    : '5-7 Working Days'}
                </span>
              </p>
            </div>
          </div>

          <a
            href={`https://wa.me/923000000000?text=Hi%2C%20inquiring%20about%20order%20${orderNumber}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button className="bg-[#7E153A] hover:bg-[#630f2d] text-white text-xs font-bold h-10 px-4 rounded-xl shadow-xs">
              <MessageCircle size={15} className="mr-1.5" /> WhatsApp Help
            </Button>
          </a>
        </div>

        {/* Real-time Timeline */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-xs space-y-8">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <h2 className="text-base font-extrabold text-gray-900">
              Live Production & Delivery Timeline
            </h2>
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Workshop Synced
            </span>
          </div>

          <div className="space-y-6">
            {TRACKING_STEPS.map((step, idx) => {
              const isDone = idx < currentStep;
              const isCurrent = idx === currentStep;

              return (
                <div key={step.id} className="flex items-start gap-4">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 shadow-xs ${
                      isDone
                        ? 'bg-[#7E153A] text-white'
                        : isCurrent
                          ? 'bg-white border-2 border-[#7E153A] text-[#7E153A] ring-4 ring-red-50'
                          : 'bg-white border border-gray-200 text-gray-400'
                    }`}
                  >
                    {isDone ? <CheckCircle2 size={15} /> : idx + 1}
                  </div>
                  <div>
                    <h4
                      className={`text-sm font-bold ${
                        isCurrent
                          ? 'text-[#7E153A]'
                          : isDone
                            ? 'text-gray-900'
                            : 'text-gray-400'
                      }`}
                    >
                      {step.label}
                    </h4>
                    <p className="text-xs text-gray-500 mt-0.5">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Courier Consignment Box */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-50 rounded-2xl text-[#7E153A]">
              <Truck size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-900">
                TCS Express Consignment
              </p>
              <p className="text-xs text-gray-500 font-mono">
                {delivery.trackingNumber || `TCS-${orderNumber}`}
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Doorstep Delivery Active
          </span>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-6 text-center text-xs text-gray-400">
        <p>© 2026 TailorLink.pk · You Link it, We Stitch it.</p>
      </footer>
    </div>
  );
}
