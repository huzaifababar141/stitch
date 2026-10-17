'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShoppingBag,
  Ruler,
  Clock,
  CheckCircle2,
  Truck,
  Package,
  ChevronRight,
  Plus,
  AlertCircle,
  Scissors,
  Sparkles,
  Gift,
  Boxes,
  Zap,
  Tag,
  Wallet,
  Shirt,
  Eye,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

// ─── Status Helpers ───────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  string,
  {
    label: string;
    color: string;
    bg: string;
    icon: React.ElementType;
    progress: number;
  }
> = {
  pending_payment: {
    label: 'Pending Payment',
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    icon: AlertCircle,
    progress: 15,
  },
  payment_confirmed: {
    label: 'Payment Confirmed',
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    icon: CheckCircle2,
    progress: 30,
  },
  assigned: {
    label: 'Assigned to Tailor',
    color: 'text-indigo-700',
    bg: 'bg-indigo-50',
    icon: Scissors,
    progress: 45,
  },
  in_stitching: {
    label: 'In Stitching',
    color: 'text-[#7E153A]',
    bg: 'bg-red-50',
    icon: Scissors,
    progress: 60,
  },
  stitching_complete: {
    label: 'Stitching Complete',
    color: 'text-purple-700',
    bg: 'bg-purple-50',
    icon: Sparkles,
    progress: 75,
  },
  qc_pending: {
    label: 'QC Inspection',
    color: 'text-purple-700',
    bg: 'bg-purple-50',
    icon: Sparkles,
    progress: 75,
  },
  qc_approved: {
    label: 'QC Approved',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    icon: CheckCircle2,
    progress: 85,
  },
  dispatched: {
    label: 'Dispatched',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    icon: Truck,
    progress: 90,
  },
  in_transit: {
    label: 'In Transit',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    icon: Truck,
    progress: 92,
  },
  out_for_delivery: {
    label: 'Out for Delivery',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    icon: Truck,
    progress: 96,
  },
  delivered: {
    label: 'Delivered',
    color: 'text-green-700',
    bg: 'bg-green-50',
    icon: CheckCircle2,
    progress: 100,
  },
  return_requested: {
    label: 'Alteration Requested',
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    icon: Scissors,
    progress: 90,
  },
  cancelled: {
    label: 'Cancelled',
    color: 'text-gray-700',
    bg: 'bg-gray-100',
    icon: AlertCircle,
    progress: 0,
  },
};

const ORDER_STEPS = [
  {
    key: 'placed',
    label: 'Order Placed',
    statuses: [
      'pending_payment',
      'payment_confirmed',
      'assigned',
      'in_stitching',
      'stitching_complete',
      'qc_pending',
      'qc_approved',
      'dispatched',
      'in_transit',
      'out_for_delivery',
      'delivered',
      'return_requested',
    ],
  },
  {
    key: 'assigned',
    label: 'Assigned to Master',
    statuses: [
      'assigned',
      'in_stitching',
      'stitching_complete',
      'qc_pending',
      'qc_approved',
      'dispatched',
      'in_transit',
      'out_for_delivery',
      'delivered',
      'return_requested',
    ],
  },
  {
    key: 'stitching',
    label: 'In Stitching',
    statuses: [
      'in_stitching',
      'stitching_complete',
      'qc_pending',
      'qc_approved',
      'dispatched',
      'in_transit',
      'out_for_delivery',
      'delivered',
      'return_requested',
    ],
  },
  {
    key: 'qc',
    label: 'Quality Check',
    statuses: [
      'stitching_complete',
      'qc_pending',
      'qc_approved',
      'dispatched',
      'in_transit',
      'out_for_delivery',
      'delivered',
      'return_requested',
    ],
  },
  {
    key: 'dispatched',
    label: 'Dispatched TCS',
    statuses: [
      'dispatched',
      'in_transit',
      'out_for_delivery',
      'delivered',
      'return_requested',
    ],
  },
  {
    key: 'delivered',
    label: 'Delivered',
    statuses: ['delivered', 'return_requested'],
  },
];

function getTimelineForStatus(status: string) {
  const currentStepIdx = ORDER_STEPS.findLastIndex((step) =>
    step.statuses.includes(status)
  );
  return ORDER_STEPS.map((step, idx) => ({
    label: step.label,
    done: idx <= currentStepIdx,
    current: idx === currentStepIdx,
  }));
}

function OrderProgressBar({ progress }: { progress: number }) {
  return (
    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
      <div
        className="bg-gradient-to-r from-[#7E153A] to-[#A01B4C] h-1.5 rounded-full transition-all duration-700"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

function OrderTimeline({
  timeline,
}: {
  timeline: { label: string; done: boolean; current: boolean }[];
}) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 mt-3 scrollbar-none flex-nowrap">
      {timeline.map((step, i) => (
        <div key={i} className="flex items-center gap-1.5 shrink-0">
          <div
            className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold shrink-0 ${
              step.current
                ? 'bg-[#7E153A] text-white shadow-xs'
                : step.done
                  ? 'bg-gray-100 text-gray-700'
                  : 'bg-gray-50 text-gray-400 border border-gray-200'
            }`}
          >
            {step.done && !step.current && (
              <CheckCircle2 size={10} className="shrink-0 text-emerald-600" />
            )}
            {step.current && (
              <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse shrink-0" />
            )}
            <span>{step.label}</span>
          </div>
          {i < timeline.length - 1 && (
            <div
              className={`w-3 h-px shrink-0 ${
                step.done ? 'bg-gray-300' : 'bg-gray-200'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Main Dashboard Page ──────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();

  const [profile, setProfile] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [measurementProfiles, setMeasurementProfiles] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      if (authLoading) return;
      if (!user) {
        setLoadingData(false);
        return;
      }

      try {
        setLoadingData(true);
        const [profileRes, ordersRes, measurementsRes] = await Promise.all([
          fetch('/api/users/profile'),
          fetch('/api/orders?limit=20'),
          fetch('/api/measurements'),
        ]);

        if (profileRes.ok) {
          const profileJson = await profileRes.json();
          setProfile(profileJson.data || profileJson);
        }

        if (ordersRes.ok) {
          const ordersJson = await ordersRes.json();
          const items = ordersJson.data?.orders || ordersJson.orders || [];
          setOrders(items);
        }

        if (measurementsRes.ok) {
          const measurementsJson = await measurementsRes.json();
          setMeasurementProfiles(
            measurementsJson.data || measurementsJson || []
          );
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoadingData(false);
      }
    }

    fetchDashboardData();
  }, [user, authLoading]);

  // Derived user details
  const displayName = profile?.firstName
    ? `${profile.firstName} ${profile.lastName || ''}`.trim()
    : user?.user_metadata?.first_name
      ? `${user.user_metadata.first_name} ${user.user_metadata.last_name || ''}`.trim()
      : user?.email?.split('@')[0] || 'Customer';

  // Derived Stats
  const activeOrders = orders.filter(
    (o) =>
      o.status !== 'delivered' &&
      o.status !== 'cancelled' &&
      o.status !== 'refunded'
  );
  const defaultMeasurement =
    measurementProfiles.find((m) => m.isDefault) || measurementProfiles[0];
  const referralCredit = profile?.metadata?.referralCredit || 0;

  if (authLoading || loadingData) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 font-sans min-w-0 w-full animate-in fade-in duration-300">
        {/* Hero banner skeleton */}
        <div className="bg-gradient-to-r from-[#F8E9E0] via-[#F7ECE4] to-[#F5DDD8] rounded-2xl p-6 sm:p-8 min-h-[130px] flex items-center justify-between shadow-xs animate-pulse">
          <div className="space-y-2">
            <div className="h-4 w-28 bg-[#7A1038]/15 rounded" />
            <div className="h-7 w-48 bg-[#7A1038]/25 rounded-md" />
            <div className="h-3 w-64 bg-[#7A1038]/15 rounded" />
          </div>
          <div className="hidden sm:flex items-center gap-2 bg-white/70 rounded-xl px-4 py-2 border border-[#7A1038]/10 text-xs font-semibold text-[#7A1038]">
            <Loader2 size={16} className="animate-spin text-[#7A1038]" />
            <span>Loading dashboard...</span>
          </div>
        </div>

        {/* Metric cards skeletons – 2 cols on mobile, 4 on desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4.5">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-100 p-3 sm:p-4.5 flex items-center justify-between shadow-xs min-h-[88px] sm:h-[100px] animate-pulse"
            >
              <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-100 shrink-0" />
                <div className="space-y-1.5 sm:space-y-2 min-w-0">
                  <div className="h-5 sm:h-6 w-10 sm:w-12 bg-gray-200 rounded" />
                  <div className="h-2.5 sm:h-3 w-16 sm:w-20 bg-gray-100 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Content area skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6 space-y-4 shadow-xs animate-pulse">
            <div className="h-5 w-40 bg-gray-200 rounded" />
            <div className="h-28 bg-gray-50 rounded-xl" />
            <div className="h-28 bg-gray-50 rounded-xl" />
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4 shadow-xs animate-pulse">
            <div className="h-5 w-32 bg-gray-200 rounded" />
            <div className="h-36 bg-gray-50 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 font-sans min-w-0 w-full">
      {/* ── 1. WELCOME HERO BANNER ── */}
      {/*
        Layout (left → right):
          [greeting block]   [tagline – flex center]   [image – absolute, right edge]   [button]
        The image is pinned to the right, strictly behind the button (right-[168px]).
        The tagline is a flex item that naturally centers between greeting and button.
        overflow-hidden clips the top of the tall image cleanly.
      */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#F8E9E0] via-[#F7ECE4] to-[#F5DDD8] p-4 sm:p-5 sm:pl-8 sm:pr-6 min-h-[130px] flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 shadow-[0_4px_20px_rgba(122,16,56,0.05)] border border-[#F1E6E1]/70">
        {/* 1. Greeting block – fluid on mobile, fixed width on tablet/desktop */}
        <div className="relative z-10 w-full sm:w-[260px] lg:w-[300px] sm:shrink-0">
          <p className="text-xs sm:text-[14px] font-medium text-[#6B6B7B] leading-tight">
            Welcome back,
          </p>
          <h1 className="text-[20px] sm:text-[24px] lg:text-[28px] font-bold text-[#1A1A2E] tracking-tight mt-0.5 leading-snug">
            {displayName}
          </h1>
          <p className="text-xs sm:text-[13px] text-[#6B6B7B] mt-1 leading-normal">
            You have{' '}
            <strong className="font-bold text-[#7A1038]">
              {activeOrders.length} active{' '}
              {activeOrders.length === 1 ? 'order' : 'orders'}
            </strong>{' '}
            in tailoring production.
          </p>
          <div className="h-[2px] w-[36px] bg-[#7A1038] mt-2 sm:mt-2.5 rounded-full" />
        </div>

        {/* 2. Tagline – reduced font size and shifted leftward */}
        <div className="hidden lg:flex flex-1 items-center justify-center relative z-10 select-none -translate-x-6 xl:-translate-x-10">
          <p className="font-serif italic text-[#1A1A2E] text-[13.5px] xl:text-[15px] leading-snug text-center">
            Traditional Craft
            <br />
            Modern Comfort
          </p>
        </div>

        {/* 3. Suit image – shifted left so button does not overlap */}
        <div
          aria-hidden="true"
          className="pointer-events-none select-none absolute right-[215px] xl:right-[235px] top-0 hidden lg:block h-full w-[195px] xl:w-[210px] z-0"
        >
          <Image
            src="/images/dashboard/suit_banner.png"
            alt=""
            fill
            priority
            className="object-contain object-right-bottom"
          />
        </div>

        {/* 4. Button – full-width on mobile, auto on tablet/desktop */}
        <Link
          href="/new-order"
          className="relative z-10 w-full sm:w-auto sm:shrink-0 sm:ml-auto"
        >
          <button className="w-full sm:w-auto h-10 px-4 sm:px-5 rounded-[10px] bg-[#7A1038] hover:bg-[#650D2F] text-white text-[13px] font-semibold flex items-center justify-center gap-1.5 shadow-sm shadow-[#7A1038]/25 transition-all duration-150 active:scale-[0.98] cursor-pointer whitespace-nowrap">
            <Plus size={15} className="stroke-[2.5]" />
            <span>Place New Order</span>
          </button>
        </Link>
      </div>

      {/* ── 2. SUMMARY METRIC CARDS (2 Columns on Mobile, 4 on Desktop) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4.5">
        {/* Total Orders */}
        <Link
          href="/orders"
          className="bg-white rounded-2xl border border-[#F1E6E1] p-3 sm:p-4.5 flex items-center justify-between shadow-[0_4px_20px_rgba(122,16,56,0.04)] hover:shadow-[0_8px_24px_rgba(122,16,56,0.08)] hover:-translate-y-0.5 transition-all duration-200 group cursor-pointer min-h-[88px] sm:h-[100px] outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7A1038]/40"
        >
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#FBE3E8] text-[#7A1038] flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105">
              <ShoppingBag className="w-4.5 h-4.5 sm:w-5 sm:h-5 stroke-[2]" />
            </div>
            <div className="min-w-0">
              <p className="text-[18px] sm:text-[22px] font-bold text-[#1A1A2E] leading-none font-mono tracking-tight">
                {orders.length}
              </p>
              <p className="text-xs sm:text-[13px] font-medium text-[#1A1A2E] mt-1 leading-tight truncate">
                Total Orders
              </p>
              <p className="text-[11px] sm:text-xs text-[#A0A0AD] mt-0.5 leading-tight truncate">
                Lifetime
              </p>
            </div>
          </div>
          <ChevronRight
            size={16}
            className="text-[#A0A0AD] group-hover:text-[#7A1038] group-hover:translate-x-0.5 transition-all shrink-0 ml-1.5 hidden sm:block"
          />
        </Link>

        {/* Active Orders */}
        <Link
          href="/orders"
          className="bg-white rounded-2xl border border-[#F1E6E1] p-3 sm:p-4.5 flex items-center justify-between shadow-[0_4px_20px_rgba(122,16,56,0.04)] hover:shadow-[0_8px_24px_rgba(122,16,56,0.08)] hover:-translate-y-0.5 transition-all duration-200 group cursor-pointer min-h-[88px] sm:h-[100px] outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7A1038]/40"
        >
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#FDEBDD] text-[#E8863A] flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105">
              <Clock className="w-4.5 h-4.5 sm:w-5 sm:h-5 stroke-[2]" />
            </div>
            <div className="min-w-0">
              <p className="text-[18px] sm:text-[22px] font-bold text-[#1A1A2E] leading-none font-mono tracking-tight">
                {activeOrders.length}
              </p>
              <p className="text-xs sm:text-[13px] font-medium text-[#1A1A2E] mt-1 leading-tight truncate">
                Active Orders
              </p>
              <p className="text-[11px] sm:text-xs text-[#A0A0AD] mt-0.5 leading-tight truncate">
                In production
              </p>
            </div>
          </div>
          <ChevronRight
            size={16}
            className="text-[#A0A0AD] group-hover:text-[#7A1038] group-hover:translate-x-0.5 transition-all shrink-0 ml-1.5 hidden sm:block"
          />
        </Link>

        {/* Saved Profiles */}
        <Link
          href="/measurements"
          className="bg-white rounded-2xl border border-[#F1E6E1] p-3 sm:p-4.5 flex items-center justify-between shadow-[0_4px_20px_rgba(122,16,56,0.04)] hover:shadow-[0_8px_24px_rgba(122,16,56,0.08)] hover:-translate-y-0.5 transition-all duration-200 group cursor-pointer min-h-[88px] sm:h-[100px] outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7A1038]/40"
        >
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#EDE6F8] text-[#6B4FB3] flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105">
              <Tag className="w-4.5 h-4.5 sm:w-5 sm:h-5 stroke-[2]" />
            </div>
            <div className="min-w-0">
              <p className="text-[18px] sm:text-[22px] font-bold text-[#1A1A2E] leading-none font-mono tracking-tight">
                {measurementProfiles.length}
              </p>
              <p className="text-xs sm:text-[13px] font-medium text-[#1A1A2E] mt-1 leading-tight truncate">
                Saved Profiles
              </p>
              <p className="text-[11px] sm:text-xs text-[#A0A0AD] mt-0.5 leading-tight truncate">
                {defaultMeasurement
                  ? defaultMeasurement.label
                  : 'No profiles saved'}
              </p>
            </div>
          </div>
          <ChevronRight
            size={16}
            className="text-[#A0A0AD] group-hover:text-[#7A1038] group-hover:translate-x-0.5 transition-all shrink-0 ml-1.5 hidden sm:block"
          />
        </Link>

        {/* Referral Credit */}
        <Link
          href="/referral"
          className="bg-white rounded-2xl border border-[#F1E6E1] p-3 sm:p-4.5 flex items-center justify-between shadow-[0_4px_20px_rgba(122,16,56,0.04)] hover:shadow-[0_8px_24px_rgba(122,16,56,0.08)] hover:-translate-y-0.5 transition-all duration-200 group cursor-pointer min-h-[88px] sm:h-[100px] outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7A1038]/40"
        >
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#DFF3E8] text-[#2E9E6A] flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105">
              <Wallet className="w-4.5 h-4.5 sm:w-5 sm:h-5 stroke-[2]" />
            </div>
            <div className="min-w-0">
              <p className="text-[18px] sm:text-[22px] font-bold text-[#1A1A2E] leading-none font-mono tracking-tight">
                PKR {Number(referralCredit).toLocaleString()}
              </p>
              <p className="text-xs sm:text-[13px] font-medium text-[#1A1A2E] mt-1 leading-tight truncate">
                Referral Credit
              </p>
              <p className="text-[11px] sm:text-xs text-[#A0A0AD] mt-0.5 leading-tight whitespace-nowrap truncate">
                Available to redeem
              </p>
            </div>
          </div>
          <ChevronRight
            size={16}
            className="text-[#A0A0AD] group-hover:text-[#7A1038] group-hover:translate-x-0.5 transition-all shrink-0 ml-1.5 hidden sm:block"
          />
        </Link>
      </div>

      {/* ── 3. MAIN DASHBOARD SPLIT ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Active Orders & Popular Categories */}
        <div className="lg:col-span-8 space-y-7 min-w-0">
          {/* Active Orders Section */}
          <section>
            <div className="flex items-center justify-between mb-3.5">
              <div>
                <h2 className="text-sm sm:text-base font-bold text-gray-900">
                  Active Orders
                </h2>
                <div className="h-0.5 w-6 bg-[#7E153A] mt-1 rounded-full" />
              </div>
              {activeOrders.length > 0 && (
                <Link
                  href="/orders"
                  className="text-xs text-[#7E153A] font-semibold hover:underline flex items-center gap-1"
                >
                  View All <ChevronRight size={14} />
                </Link>
              )}
            </div>

            {activeOrders.length === 0 ? (
              /* Empty State Card matching reference */
              <div className="bg-white rounded-3xl border border-[#F2EAE5] p-8 sm:p-12 text-center relative overflow-hidden shadow-xs">
                {/* Decorative botanical branch in bottom-left */}
                <div className="absolute -bottom-2 -left-2 pointer-events-none opacity-40">
                  <svg width="90" height="90" viewBox="0 0 100 100" fill="none">
                    <path
                      d="M10 90C30 70 50 60 70 50"
                      stroke="#C8A59B"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M25 75C28 65 38 68 35 78C32 88 22 85 25 75Z"
                      fill="#E8D2CC"
                    />
                    <path
                      d="M45 65C48 55 58 58 55 68C52 78 42 75 45 65Z"
                      fill="#E8D2CC"
                    />
                    <path
                      d="M35 70C45 68 50 78 40 82"
                      stroke="#C8A59B"
                      strokeWidth="1.5"
                    />
                  </svg>
                </div>

                <div className="w-14 h-14 rounded-full bg-[#FDF0F3] text-[#7E153A] flex items-center justify-center mx-auto mb-3">
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 2a3 3 0 0 0-3 3c0 1.3.8 2.4 2 2.8V9L2.8 16.2A2 2 0 0 0 4.2 19h15.6a2 2 0 0 0 1.4-2.8L13 9V7.8A3 3 0 0 0 12 2z" />
                  </svg>
                </div>

                <h3 className="text-base font-bold text-gray-900 mb-1">
                  No Active Orders
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto mb-5 leading-relaxed">
                  You don&apos;t have any orders in progress right now. Link
                  your favourite unstitched suit and get it custom stitched with
                  doorstep delivery.
                </p>
                <Link href="/new-order">
                  <button className="inline-flex items-center gap-2 bg-[#7E153A] hover:bg-[#68102f] text-white text-xs sm:text-sm font-semibold px-6 py-2.5 rounded-xl transition-all shadow-sm shadow-[#7E153A]/20 active:scale-95 cursor-pointer">
                    <Plus size={15} /> Place Your First Order
                  </button>
                </Link>
              </div>
            ) : (
              /* Active Orders List */
              <div className="space-y-4">
                {activeOrders.map((order) => {
                  const statusCfg =
                    STATUS_CONFIG[order.status] || STATUS_CONFIG.in_stitching;
                  const StatusIcon = statusCfg.icon;
                  const timeline = getTimelineForStatus(order.status);
                  const progress = statusCfg.progress;
                  const brand =
                    order.product?.brand ||
                    order.productSnapshot?.brand ||
                    'Designer Brand';
                  const title =
                    order.product?.name ||
                    order.productSnapshot?.name ||
                    `${order.garmentType?.replace(/_/g, ' ').toUpperCase()} Custom Stitch`;
                  const imageUrl =
                    order.product?.images?.[0] ||
                    order.productSnapshot?.images?.[0] ||
                    '/login_bg.jpg';
                  const placedDate = new Date(
                    order.createdAt
                  ).toLocaleDateString('en-PK', {
                    month: 'short',
                    day: 'numeric',
                  });

                  return (
                    <div
                      key={order.id}
                      className="bg-white rounded-2xl border border-[#F2EAE5] shadow-xs p-4 sm:p-5 hover:shadow-md transition-shadow"
                    >
                      {/* Order Header */}
                      <div className="flex gap-3 sm:gap-4 mb-4">
                        <div className="w-16 h-20 sm:w-20 sm:h-24 rounded-xl overflow-hidden shrink-0 bg-gray-100 border border-gray-100">
                          <img
                            src={imageUrl}
                            alt={title}
                            className="object-cover w-full h-full"
                            onError={(e: any) => {
                              e.currentTarget.src =
                                'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=300&auto=format&fit=crop&q=60';
                            }}
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1.5 sm:gap-2 mb-1">
                            <div className="min-w-0">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-[#7E153A]">
                                {brand}
                              </p>
                              <h3 className="font-bold text-gray-900 text-sm leading-snug truncate">
                                {title}
                              </h3>
                            </div>
                            <span
                              className={`w-fit shrink-0 flex items-center gap-1 px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] font-bold ${statusCfg.bg} ${statusCfg.color}`}
                            >
                              <StatusIcon size={11} />
                              {statusCfg.label}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-gray-500 mt-1">
                            <span className="font-mono font-semibold text-gray-700">
                              {order.orderNumber || order.id.slice(0, 8)}
                            </span>
                            <span>·</span>
                            <span className="capitalize">
                              {order.garmentType?.replace(/_/g, ' ')}
                            </span>
                            <span>·</span>
                            <span className="font-semibold text-gray-900 font-mono">
                              PKR {Number(order.totalAmount).toLocaleString()}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-gray-500 mt-1">
                            <span className="flex items-center gap-1">
                              <Clock size={11} className="shrink-0" />
                              Placed: {placedDate}
                            </span>
                            {order.delivery?.trackingNumber && (
                              <>
                                <span>·</span>
                                <span className="flex items-center gap-1 text-[#7E153A] font-semibold">
                                  <Truck size={11} className="shrink-0" />
                                  TCS: {order.delivery.trackingNumber}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Progress */}
                      <div className="mb-2">
                        <div className="flex items-center justify-between text-[11px] text-gray-500 mb-1.5">
                          <span className="font-semibold">
                            Tailoring Progression
                          </span>
                          <span className="font-bold text-[#7E153A]">
                            {progress}%
                          </span>
                        </div>
                        <OrderProgressBar progress={progress} />
                      </div>

                      {/* Step Timeline */}
                      <OrderTimeline timeline={timeline} />

                      {/* Actions */}
                      <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-gray-100">
                        <Link href={`/orders/${order.id}`}>
                          <button className="flex items-center gap-1.5 text-xs font-semibold text-[#7E153A] bg-[#FDF0F3] hover:bg-[#FCE6EA] px-3.5 py-2 rounded-xl transition-colors cursor-pointer">
                            <Eye size={14} /> Track Order
                          </button>
                        </Link>

                        <a
                          href={`https://wa.me/923000000000?text=Hi%2C%20inquiry%20regarding%20order%20${order.orderNumber || order.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-medium text-gray-500 hover:text-gray-900"
                        >
                          Help with order
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* ── Popular Categories ── */}
          <section>
            <div className="flex items-center justify-between mb-3.5">
              <h2 className="text-sm sm:text-base font-bold text-gray-900">
                Popular Categories
              </h2>
              <Link
                href="/stock"
                className="text-xs text-[#7E153A] font-semibold hover:underline flex items-center gap-1"
              >
                View All <ChevronRight size={13} />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              {/* Men's Wear */}
              <Link
                href="/new-order?category=men"
                className="bg-[#FDF3F3] border border-[#FBE6E6] rounded-2xl p-4 flex flex-col justify-between hover:shadow-xs hover:border-[#F7D2D2] transition-all group"
              >
                <div className="w-10 h-10 mb-3 text-[#7E153A] group-hover:scale-105 transition-transform">
                  <svg
                    viewBox="0 0 40 40"
                    fill="none"
                    className="w-full h-full"
                  >
                    <path
                      d="M14 6L20 10L26 6L29 11L25 13V34H15V13L11 11L14 6Z"
                      stroke="#7E153A"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M20 10V22"
                      stroke="#7E153A"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M17 14H23"
                      stroke="#7E153A"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-xs sm:text-sm">
                    Men&apos;s Wear
                  </h3>
                  <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">
                    Kurtas, Shalwar Kameez, Waistcoats
                  </p>
                </div>
              </Link>

              {/* Women's Wear */}
              <Link
                href="/new-order?category=women"
                className="bg-[#FDF5F7] border border-[#FCECF0] rounded-2xl p-4 flex flex-col justify-between hover:shadow-xs hover:border-[#F8D9E1] transition-all group"
              >
                <div className="w-10 h-10 mb-3 text-[#7E153A] group-hover:scale-105 transition-transform">
                  <svg
                    viewBox="0 0 40 40"
                    fill="none"
                    className="w-full h-full"
                  >
                    <path
                      d="M16 8C17.5 10 22.5 10 24 8L27 15L23 18L28 34H12L17 18L13 15L16 8Z"
                      stroke="#7E153A"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M20 10V18"
                      stroke="#7E153A"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-xs sm:text-sm">
                    Women&apos;s Wear
                  </h3>
                  <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">
                    Kurtis, Frocks, Dupattas
                  </p>
                </div>
              </Link>

              {/* Fabric Collection */}
              <Link
                href="/stock"
                className="bg-[#F4F9F6] border border-[#E7F3EC] rounded-2xl p-4 flex flex-col justify-between hover:shadow-xs hover:border-[#D0EADB] transition-all group"
              >
                <div className="w-10 h-10 mb-3 text-[#2E9B63] group-hover:scale-105 transition-transform">
                  <svg
                    viewBox="0 0 40 40"
                    fill="none"
                    className="w-full h-full"
                  >
                    <path
                      d="M10 14C10 11.8 11.8 10 14 10H26C28.2 10 30 11.8 30 14V26C30 28.2 28.2 30 26 30H14C11.8 30 10 28.2 10 26V14Z"
                      stroke="#2E9B63"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M10 20C15 18 25 22 30 20"
                      stroke="#2E9B63"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M14 10L26 30"
                      stroke="#2E9B63"
                      strokeWidth="1.3"
                      strokeDasharray="2 2"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-xs sm:text-sm">
                    Fabric Collection
                  </h3>
                  <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">
                    Premium & Everyday
                  </p>
                </div>
              </Link>

              {/* Custom Designs */}
              <Link
                href="/new-order"
                className="bg-[#FAF5FB] border border-[#F4EBF7] rounded-2xl p-4 flex flex-col justify-between hover:shadow-xs hover:border-[#E8D4EC] transition-all group"
              >
                <div className="w-10 h-10 mb-3 text-[#7E153A] group-hover:scale-105 transition-transform">
                  <svg
                    viewBox="0 0 40 40"
                    fill="none"
                    className="w-full h-full"
                  >
                    <path
                      d="M12 28L28 12"
                      stroke="#7E153A"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                    <path
                      d="M12 12L19 19L16 22L12 18L8 22L5 19L9 15L12 12Z"
                      stroke="#7E153A"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle cx="28" cy="12" r="1.5" fill="#7E153A" />
                    <path
                      d="M26 14C23 18 20 25 24 29"
                      stroke="#7E153A"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                      strokeDasharray="2 2"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-xs sm:text-sm">
                    Custom Designs
                  </h3>
                  <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">
                    Your style, your way
                  </p>
                </div>
              </Link>
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: My Measurements & Quick Actions */}
        <div className="lg:col-span-4 space-y-6 min-w-0">
          {/* My Measurements Widget */}
          <section className="bg-white rounded-3xl border border-[#F2EAE5] p-5 relative overflow-hidden shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Ruler size={16} className="text-[#7E153A]" />
                My Measurements
              </h2>
              <Link
                href="/measurements"
                className="text-xs text-[#7E153A] font-semibold hover:underline flex items-center gap-1"
              >
                View All <ChevronRight size={13} />
              </Link>
            </div>

            {defaultMeasurement ? (
              <>
                <p className="text-xs font-semibold text-gray-700 mb-3">
                  Default Fit:{' '}
                  <span className="text-[#7E153A] font-bold">
                    {defaultMeasurement.label}
                  </span>
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    {
                      label: 'Chest',
                      val: defaultMeasurement.chest
                        ? `${defaultMeasurement.chest}"`
                        : '-',
                    },
                    {
                      label: 'Waist',
                      val: defaultMeasurement.waist
                        ? `${defaultMeasurement.waist}"`
                        : '-',
                    },
                    {
                      label: 'Hips',
                      val: defaultMeasurement.hips
                        ? `${defaultMeasurement.hips}"`
                        : '-',
                    },
                    {
                      label: 'Shoulder',
                      val: defaultMeasurement.shoulderWidth
                        ? `${defaultMeasurement.shoulderWidth}"`
                        : '-',
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="bg-[#FAF7F5] rounded-xl p-2.5 text-center border border-[#F2EAE5]"
                    >
                      <p className="text-sm font-extrabold text-gray-900 font-mono">
                        {item.val}
                      </p>
                      <p className="text-[10px] text-gray-500 capitalize mt-0.5">
                        {item.label}
                      </p>
                    </div>
                  ))}
                </div>
                <Link href="/measurements" className="block mt-3 text-right">
                  <span className="text-xs text-[#7E153A] font-semibold hover:underline">
                    Edit Profiles
                  </span>
                </Link>
              </>
            ) : (
              <div className="relative z-10">
                <p className="text-xs text-gray-500 leading-relaxed">
                  No saved measurement profile yet. Save your body dimensions
                  easily for a perfect fit and faster ordering.
                </p>
                <Link href="/measurements">
                  <button className="w-full mt-3.5 py-2.5 rounded-xl border border-[#F2D7DE] bg-[#FDF5F7] text-[#7E153A] font-semibold text-xs hover:bg-[#FCEEF2] transition-colors flex items-center justify-center gap-1.5 cursor-pointer">
                    <Plus size={14} className="stroke-[2.5]" /> Add Measurements
                  </button>
                </Link>
              </div>
            )}

            {/* Decorative measuring tape graphic in bottom-right corner */}
            <div className="absolute -bottom-2 -right-2 pointer-events-none opacity-25">
              <svg width="70" height="70" viewBox="0 0 80 80" fill="none">
                <path
                  d="M10 70C25 40 45 60 70 30"
                  stroke="#C8A59B"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
                <path
                  d="M22 55L24 51M30 52L32 48M38 53L40 49M46 51L48 47M54 45L56 41M62 38L64 34"
                  stroke="#7E153A"
                  strokeWidth="2"
                />
              </svg>
            </div>
          </section>

          {/* Quick Actions Widget */}
          <section className="bg-white rounded-3xl border border-[#F2EAE5] p-5 shadow-xs">
            <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Zap size={16} className="text-[#7E153A]" />
              Quick Actions
            </h2>
            <div className="space-y-2">
              {/* Row 1: Place Custom Order */}
              <Link href="/new-order" className="block">
                <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#FDF0F2] text-[#7E153A] hover:bg-[#FCE6EA] transition-colors cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-lg bg-[#7E153A]/10 flex items-center justify-center">
                      <Shirt size={14} className="text-[#7E153A]" />
                    </div>
                    <span className="text-xs sm:text-sm font-semibold">
                      Place Custom Order
                    </span>
                  </div>
                  <ChevronRight
                    size={15}
                    className="text-[#7E153A]/60 group-hover:translate-x-0.5 transition-transform"
                  />
                </div>
              </Link>

              {/* Row 2: Browse Fabric Stock */}
              <Link href="/stock" className="block">
                <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-gray-700 hover:bg-[#FAF7F5] transition-colors cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-lg bg-orange-50 flex items-center justify-center">
                      <Boxes size={14} className="text-[#C97A3E]" />
                    </div>
                    <span className="text-xs sm:text-sm font-medium">
                      Browse Fabric Stock
                    </span>
                  </div>
                  <ChevronRight
                    size={15}
                    className="text-gray-400 group-hover:translate-x-0.5 transition-transform"
                  />
                </div>
              </Link>

              {/* Row 3: Track All Orders */}
              <Link href="/orders" className="block">
                <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-gray-700 hover:bg-[#FAF7F5] transition-colors cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center">
                      <Package size={14} className="text-blue-600" />
                    </div>
                    <span className="text-xs sm:text-sm font-medium">
                      Track All Orders
                    </span>
                  </div>
                  <ChevronRight
                    size={15}
                    className="text-gray-400 group-hover:translate-x-0.5 transition-transform"
                  />
                </div>
              </Link>

              {/* Row 4: Update Measurements */}
              <Link href="/measurements" className="block">
                <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-gray-700 hover:bg-[#FAF7F5] transition-colors cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-lg bg-purple-50 flex items-center justify-center">
                      <Ruler size={14} className="text-[#7C3AED]" />
                    </div>
                    <span className="text-xs sm:text-sm font-medium">
                      Update Measurements
                    </span>
                  </div>
                  <ChevronRight
                    size={15}
                    className="text-gray-400 group-hover:translate-x-0.5 transition-transform"
                  />
                </div>
              </Link>

              {/* Row 5: Refer & Earn Credits */}
              <Link href="/referral" className="block">
                <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-gray-700 hover:bg-[#FAF7F5] transition-colors cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-lg bg-emerald-50 flex items-center justify-center">
                      <Gift size={14} className="text-emerald-600" />
                    </div>
                    <span className="text-xs sm:text-sm font-medium">
                      Refer & Earn Credits
                    </span>
                  </div>
                  <ChevronRight
                    size={15}
                    className="text-gray-400 group-hover:translate-x-0.5 transition-transform"
                  />
                </div>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
