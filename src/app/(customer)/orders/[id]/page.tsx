'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Truck,
  Scissors,
  Sparkles,
  ShieldCheck,
  MapPin,
  Phone,
  FileText,
  MessageCircle,
  User,
  Copy,
  ExternalLink,
  Download,
  Calendar,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useOrderRealtime } from '@/hooks/useOrderRealtime';

// ─── Status Configuration ───────────────────────────────────────────────────

const STATUS_STEPS = [
  {
    id: 'placed',
    label: 'Order Placed',
    desc: 'Suit details & link submitted',
    icon: FileText,
  },
  {
    id: 'payment_confirmed',
    label: 'Payment Confirmed',
    desc: 'Paid via JazzCash / EasyPaisa',
    icon: ShieldCheck,
  },
  {
    id: 'assigned_tailor',
    label: 'Assigned to Master',
    desc: 'Allocated to Master Zubair',
    icon: User,
  },
  {
    id: 'in_stitching',
    label: 'In Stitching',
    desc: 'Custom cutting & tailoring underway',
    icon: Scissors,
  },
  {
    id: 'quality_check',
    label: 'Quality Inspection',
    desc: 'Final measurement QC pass',
    icon: Sparkles,
  },
  {
    id: 'dispatched',
    label: 'Dispatched via TCS',
    desc: 'Handed over to courier',
    icon: Truck,
  },
  {
    id: 'delivered',
    label: 'Delivered',
    desc: 'Successfully delivered to doorstep',
    icon: CheckCircle2,
  },
];

export default function OrderTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const orderId = (params?.id as string) || 'ORD-20240801-001';

  // Connect to Supabase Realtime for live updates
  const { orderStatus: realtimeStatus } = useOrderRealtime(orderId);

  // Current order state
  const [order] = useState({
    id: orderId,
    status: 'in_stitching',
    statusLabel: 'In Stitching',
    placedDate: 'Aug 01, 2026 at 02:45 PM',
    estimatedDelivery: 'Aug 08, 2026',
    daysRemaining: 3,
    tcsTrackingNumber: 'TCS-9842104928',
    stitchingTier: 'Premium Stitching (PKR 3,000)',
    totalPrice: 7850,
    paymentMethod: 'JazzCash / EasyPaisa (Paid)',
    product: {
      title: 'Mahay Lawn 3 Piece Unstitched',
      brand: 'Sana Safinaz',
      price: 4850,
      imageUrl: '/login_bg.jpg',
      url: 'https://www.sanasafinaz.com/pk/mahay-lawn-3-piece-unstitched',
    },
    tailor: {
      name: 'Master Zubair Ahmad',
      role: 'Head Master Tailor',
      workshop: 'Lahore Workshop #4',
      rating: '4.9 ★',
      completedOrders: '1,240+',
    },
    address: {
      name: 'Sarah Khan',
      phone: '+92 300 1234567',
      street: 'House #42, Block C-2, Gulberg III',
      city: 'Lahore',
      province: 'Punjab',
      postalCode: '54600',
    },
    measurements: {
      shoulder: '14"',
      bust: '38"',
      waist: '32"',
      hip: '40"',
      shirt_length: '44"',
      sleeve_length: '22"',
      neck_style: 'Round Neck with Patti',
      sleeve_style: 'Full Sleeve',
      fit: 'Regular Fit',
      special_notes:
        'Please add subtle lace bordering on sleeves and bottom hem.',
    },
  });

  // Derived status — combines base status with live Realtime status without useEffect setState
  const activeStatus = realtimeStatus || order.status;

  // Get index of current status step
  const getStepIndex = (status: string) => {
    switch (status) {
      case 'placed':
        return 0;
      case 'payment_confirmed':
        return 1;
      case 'assigned_tailor':
        return 2;
      case 'in_stitching':
        return 3;
      case 'quality_check':
        return 4;
      case 'dispatched':
        return 5;
      case 'delivered':
        return 6;
      default:
        return 3;
    }
  };

  const currentStepIdx = getStepIndex(activeStatus);

  const handleCopyTracking = () => {
    navigator.clipboard.writeText(order.tcsTrackingNumber);
    toast({ title: 'Tracking # Copied', description: order.tcsTrackingNumber });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-2">
      {/* Top Header & Breadcrumbs ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
            <Link
              href="/dashboard"
              className="hover:text-[#7E153A] flex items-center gap-1"
            >
              <ArrowLeft size={14} /> Dashboard
            </Link>
            <span>/</span>
            <Link href="/orders" className="hover:text-[#7E153A]">
              Orders
            </Link>
            <span>/</span>
            <span className="font-semibold text-gray-900">{order.id}</span>
          </div>

          <div className="flex items-center gap-3">
            <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">
              Order #{order.id}
            </h1>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#7E153A]/10 text-[#7E153A]">
              <span className="w-2 h-2 rounded-full bg-[#7E153A] animate-ping" />
              Live Realtime Sync
            </span>
          </div>

          <p className="text-xs text-gray-500 flex items-center gap-2">
            <Calendar size={13} /> Placed on {order.placedDate}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() =>
              toast({
                title: 'Invoice Downloaded',
                description: 'PDF saved to your downloads.',
              })
            }
            className="h-10 text-xs font-semibold"
          >
            <Download size={14} className="mr-1.5" /> PDF Invoice
          </Button>

          <Button
            onClick={() =>
              window.open(
                `https://wa.me/923001234567?text=Hi, I need an update on my order ${order.id}`,
                '_blank'
              )
            }
            className="h-10 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
          >
            <MessageCircle size={14} className="mr-1.5" /> WhatsApp Support
          </Button>
        </div>
      </div>

      {/* Main 6-Step Visual Timeline ────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-base font-bold text-gray-900">
              Live Production Timeline
            </h2>
            <p className="text-xs text-gray-500">
              Track your garment through master tailoring & inspection
            </p>
          </div>
          <div className="bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-xl px-4 py-2 text-xs font-bold flex items-center gap-2">
            <Truck size={16} className="text-emerald-600" />
            <span>
              Est. Delivery: {order.estimatedDelivery} ({order.daysRemaining}{' '}
              days left)
            </span>
          </div>
        </div>

        {/* Stepper Pipeline */}
        <div className="relative">
          {/* Connecting Line */}
          <div className="absolute top-6 left-6 right-6 h-1 bg-gray-100 -z-0 hidden md:block" />
          <div
            className="absolute top-6 left-6 h-1 bg-gradient-to-r from-[#7E153A] to-[#A01B4C] -z-0 transition-all duration-700 hidden md:block"
            style={{
              width: `${(currentStepIdx / (STATUS_STEPS.length - 1)) * 100}%`,
            }}
          />

          <div className="grid grid-cols-1 md:grid-cols-7 gap-4 relative z-10">
            {STATUS_STEPS.map((step, idx) => {
              const isCompleted = idx < currentStepIdx;
              const isCurrent = idx === currentStepIdx;
              const StepIcon = step.icon;

              return (
                <div
                  key={step.id}
                  className="flex flex-col items-center text-center group"
                >
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-sm ${
                      isCurrent
                        ? 'bg-[#7E153A] text-white ring-4 ring-[#7E153A]/20 scale-110'
                        : isCompleted
                          ? 'bg-emerald-600 text-white'
                          : 'bg-gray-100 text-gray-400 border border-gray-200'
                    }`}
                  >
                    {isCompleted ? (
                      <Check size={20} className="stroke-[3]" />
                    ) : (
                      <StepIcon size={20} />
                    )}
                  </div>

                  <h3
                    className={`text-xs font-bold mt-3 transition-colors ${
                      isCurrent
                        ? 'text-[#7E153A]'
                        : isCompleted
                          ? 'text-gray-900'
                          : 'text-gray-400'
                    }`}
                  >
                    {step.label}
                  </h3>
                  <p className="text-[10px] text-gray-400 mt-1 max-w-[110px] leading-tight">
                    {step.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: Suit & Measurements Snapshot ───────────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Product & Suit Snapshot */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-base font-bold text-gray-900 mb-4 border-b border-gray-100 pb-3">
              Garment & Suit Details
            </h2>

            <div className="flex flex-col sm:flex-row gap-6">
              <div className="w-36 h-48 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-100">
                <img
                  src={order.product.imageUrl}
                  alt={order.product.title}
                  className="object-cover w-full h-full"
                />
              </div>

              <div className="flex-1 space-y-3">
                <div>
                  <span className="text-[10px] font-bold text-[#7E153A] uppercase tracking-widest">
                    {order.product.brand}
                  </span>
                  <h3 className="text-base font-bold text-gray-900 leading-snug">
                    {order.product.title}
                  </h3>
                  <a
                    href={order.product.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1 font-medium"
                  >
                    View Original Brand Link <ExternalLink size={12} />
                  </a>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs bg-gray-50/70 p-3.5 rounded-xl border border-gray-100">
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-semibold">
                      Stitching Tier
                    </span>
                    <span className="font-bold text-gray-900">
                      {order.stitchingTier}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-semibold">
                      Payment Status
                    </span>
                    <span className="font-bold text-emerald-700">
                      {order.paymentMethod}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-semibold">
                      Suit Price
                    </span>
                    <span className="font-bold text-gray-900">
                      PKR {order.product.price.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-semibold">
                      Total Paid
                    </span>
                    <span className="font-extrabold text-[#7E153A]">
                      PKR {order.totalPrice.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Formatted Measurements Snapshot */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Scissors size={18} className="text-[#7E153A]" />
                Tailoring Measurements Snapshot
              </h2>
              <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-md">
                Recorded in Inches
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
              {[
                { label: 'Shoulder', val: order.measurements.shoulder },
                { label: 'Bust / Chest', val: order.measurements.bust },
                { label: 'Waist', val: order.measurements.waist },
                { label: 'Hip', val: order.measurements.hip },
                { label: 'Shirt Length', val: order.measurements.shirt_length },
                {
                  label: 'Sleeve Length',
                  val: order.measurements.sleeve_length,
                },
              ].map((m) => (
                <div
                  key={m.label}
                  className="bg-gray-50 p-3 rounded-xl text-center border border-gray-100"
                >
                  <p className="text-base font-extrabold text-gray-900">
                    {m.val}
                  </p>
                  <p className="text-[10px] text-gray-500 font-semibold uppercase mt-0.5">
                    {m.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Custom Preferences */}
            <div className="bg-red-50/40 rounded-xl p-4 border border-red-100 space-y-2 text-xs">
              <h4 className="font-bold text-[#7E153A]">
                Selected Styles & Special Notes:
              </h4>
              <p>
                <strong className="text-gray-900">Neckline:</strong>{' '}
                {order.measurements.neck_style}
              </p>
              <p>
                <strong className="text-gray-900">Sleeves:</strong>{' '}
                {order.measurements.sleeve_style}
              </p>
              <p>
                <strong className="text-gray-900">Fit:</strong>{' '}
                {order.measurements.fit}
              </p>
              <p>
                <strong className="text-gray-900">Notes for Tailor:</strong>{' '}
                {order.measurements.special_notes}
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Tailor, TCS Courier & Delivery Address ────────── */}
        <div className="space-y-6">
          {/* Assigned Tailor Card */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
              <User size={16} className="text-[#7E153A]" />
              Assigned Master Tailor
            </h2>

            <div className="flex items-center gap-3.5 p-3 rounded-xl bg-gray-50 border border-gray-100 mb-4">
              <div className="w-12 h-12 rounded-full bg-[#7E153A] text-white font-extrabold text-base flex items-center justify-center shadow-md">
                Z
              </div>
              <div>
                <h3 className="font-bold text-sm text-gray-900">
                  {order.tailor.name}
                </h3>
                <p className="text-xs text-gray-500">
                  {order.tailor.role} · {order.tailor.workshop}
                </p>
                <div className="flex items-center gap-2 text-[10px] font-bold text-[#7E153A] mt-1">
                  <span>{order.tailor.rating}</span>
                  <span>·</span>
                  <span className="text-gray-500">
                    {order.tailor.completedOrders} garments stitched
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-xs text-emerald-900 font-semibold flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
              <span>Garment is backed by 7-Day Free Alteration Guarantee</span>
            </div>
          </div>

          {/* TCS Courier Tracking Card */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Truck size={16} className="text-[#7E153A]" />
              Courier Tracking (TCS)
            </h2>

            <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 mb-4 space-y-2">
              <span className="text-[10px] uppercase font-bold text-gray-400 block">
                TCS Air Express Tracking #
              </span>
              <div className="flex items-center justify-between font-mono font-bold text-sm text-gray-900">
                <span>{order.tcsTrackingNumber}</span>
                <button
                  onClick={handleCopyTracking}
                  className="p-1.5 rounded-md hover:bg-gray-200 text-gray-600 transition-colors"
                  title="Copy Tracking #"
                >
                  <Copy size={14} />
                </button>
              </div>
            </div>

            <a
              href={`https://www.tcsexpress.com/tracking?track=${order.tcsTrackingNumber}`}
              target="_blank"
              rel="noreferrer"
              className="w-full flex items-center justify-center gap-2 text-xs font-bold text-white bg-[#7E153A] hover:bg-[#630f2d] py-3 rounded-xl transition-colors shadow-md shadow-[#7E153A]/20"
            >
              Track Live on TCS Courier ↗
            </a>
          </div>

          {/* Delivery Address Card */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <MapPin size={16} className="text-[#7E153A]" />
              Doorstep Delivery Address
            </h2>

            <div className="space-y-1.5 text-xs text-gray-700">
              <p className="font-bold text-gray-900">{order.address.name}</p>
              <p className="flex items-center gap-1.5 text-gray-500">
                <Phone size={12} /> {order.address.phone}
              </p>
              <p className="text-gray-600">{order.address.street}</p>
              <p className="text-gray-600">
                {order.address.city}, {order.address.province} -{' '}
                {order.address.postalCode}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
