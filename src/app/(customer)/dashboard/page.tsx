'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  Ruler,
  Clock,
  CheckCircle2,
  Truck,
  Package,
  ChevronRight,
  Plus,
  Star,
  TrendingUp,
  AlertCircle,
  Scissors,
  Sparkles,
  Gift,
  Bell,
  ArrowRight,
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
    ],
  },
  {
    key: 'assigned',
    label: 'Assigned to Tailor',
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
    ],
  },
  {
    key: 'dispatched',
    label: 'Dispatched',
    statuses: ['dispatched', 'in_transit', 'out_for_delivery', 'delivered'],
  },
  { key: 'delivered', label: 'Delivered', statuses: ['delivered'] },
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

// ─── Sub-Components ───────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  value,
  label,
  sublabel,
  color,
}: {
  icon: React.ElementType;
  value: string | number;
  label: string;
  sublabel?: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-start gap-4 hover:shadow-md transition-shadow">
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${color}`}
      >
        <Icon size={22} />
      </div>
      <div>
        <p className="text-2xl font-extrabold text-gray-900 leading-none">
          {value}
        </p>
        <p className="text-sm font-semibold text-gray-700 mt-1">{label}</p>
        {sublabel && <p className="text-xs text-gray-400 mt-0.5">{sublabel}</p>}
      </div>
    </div>
  );
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
    <div className="flex items-center gap-1 flex-wrap mt-3">
      {timeline.map((step, i) => (
        <div key={i} className="flex items-center gap-1">
          <div
            className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
              step.current
                ? 'bg-[#7E153A] text-white'
                : step.done
                  ? 'bg-gray-200 text-gray-600'
                  : 'bg-gray-50 text-gray-400 border border-gray-200'
            }`}
          >
            {step.done && !step.current && (
              <CheckCircle2 size={9} className="shrink-0" />
            )}
            {step.current && (
              <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse shrink-0" />
            )}
            {step.label}
          </div>
          {i < timeline.length - 1 && (
            <div
              className={`w-3 h-px ${step.done ? 'bg-gray-300' : 'bg-gray-100'}`}
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
  const [showAllNotifications, setShowAllNotifications] = useState(false);

  useEffect(() => {
    async function fetchDashboardData() {
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
  }, [user]);

  // Derived user details
  const displayName = profile?.firstName
    ? `${profile.firstName} ${profile.lastName || ''}`.trim()
    : user?.user_metadata?.first_name
      ? `${user.user_metadata.first_name} ${user.user_metadata.last_name || ''}`.trim()
      : user?.email?.split('@')[0] || 'Valued Customer';

  // Derived Stats
  const activeOrders = orders.filter(
    (o) =>
      o.status !== 'delivered' &&
      o.status !== 'cancelled' &&
      o.status !== 'refunded'
  );
  const completedOrders = orders.filter((o) => o.status === 'delivered');
  const defaultMeasurement =
    measurementProfiles.find((m) => m.isDefault) || measurementProfiles[0];
  const referralCredit = profile?.metadata?.referralCredit || 0;

  if (authLoading || loadingData) {
    return (
      <div className="max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[400px] text-gray-500">
        <Loader2 size={32} className="animate-spin text-[#7E153A] mb-3" />
        <p className="text-sm font-medium">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Welcome Banner ───────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-[#7E153A] rounded-2xl p-8 text-white shadow-xl shadow-[#7E153A]/15 z-0">
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 translate-x-24 -translate-y-24 pointer-events-none" />
        <div className="absolute bottom-0 right-16 w-32 h-32 rounded-full bg-white/5 pointer-events-none" />

        <div className="relative z-[1] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-white/80 mb-1">
              Welcome back,
            </p>
            <h1 className="text-2xl font-extrabold tracking-tight">
              {displayName}
            </h1>
            <p className="text-sm text-white/90 mt-1">
              You have{' '}
              <span className="font-bold underline underline-offset-4 decoration-white/40">
                {activeOrders.length}{' '}
                {activeOrders.length === 1 ? 'active order' : 'active orders'}
              </span>{' '}
              in progress.
            </p>
          </div>
          <Link href="/new-order">
            <button className="flex items-center gap-2 bg-white text-[#7E153A] font-bold text-sm px-5 py-3 rounded-xl hover:bg-red-50 transition-colors shadow-md">
              <Plus size={18} />
              Place New Order
            </button>
          </Link>
        </div>
      </div>

      {/* Stats Row ─────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={ShoppingBag}
          value={orders.length}
          label="Total Orders"
          sublabel="Lifetime"
          color="bg-red-50 text-[#7E153A]"
        />
        <StatCard
          icon={Clock}
          value={activeOrders.length}
          label="Active Orders"
          sublabel="In production"
          color="bg-red-50 text-[#7E153A]"
        />
        <StatCard
          icon={Ruler}
          value={measurementProfiles.length}
          label="Saved Profiles"
          sublabel={
            defaultMeasurement
              ? `Default: ${defaultMeasurement.label}`
              : 'No profiles saved'
          }
          color="bg-[#7E153A]/10 text-[#7E153A]"
        />
        <StatCard
          icon={TrendingUp}
          value={`PKR ${referralCredit}`}
          label="Referral Credit"
          sublabel="Available to redeem"
          color="bg-red-50 text-[#7E153A]"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT: Active Orders & Recent Orders ─────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Orders Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-900">
                Active Orders
              </h2>
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
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
                <div className="w-12 h-12 rounded-full bg-red-50 text-[#7E153A] flex items-center justify-center mx-auto mb-3">
                  <Package size={24} />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-1">
                  No Active Orders
                </h3>
                <p className="text-sm text-gray-500 max-w-md mx-auto mb-5">
                  You don't have any orders in progress right now. Link your
                  favourite unstitched suit and get it custom stitched with
                  doorstep pickup & delivery.
                </p>
                <Link href="/new-order">
                  <button className="inline-flex items-center gap-2 bg-[#7E153A] text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-[#630F2D] transition-colors shadow-sm">
                    <Plus size={16} /> Place Your First Order
                  </button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {activeOrders.map((order) => {
                  const statusCfg =
                    STATUS_CONFIG[order.status] || STATUS_CONFIG.in_stitching;
                  const StatusIcon = statusCfg.icon;
                  const timeline = getTimelineForStatus(order.status);
                  const progress = statusCfg.progress;
                  const brand = order.product?.brand || 'Custom Stitch';
                  const title =
                    order.product?.name ||
                    `${order.garmentType?.replace(/_/g, ' ').toUpperCase()} Custom Stitch`;
                  const imageUrl =
                    order.product?.images?.[0] || '/login_bg.jpg';
                  const placedDate = new Date(
                    order.createdAt
                  ).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  });

                  return (
                    <div
                      key={order.id}
                      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow"
                    >
                      {/* Order Header */}
                      <div className="flex gap-4 mb-4">
                        <div className="w-16 h-20 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                          <img
                            src={imageUrl}
                            alt={title}
                            className="object-cover w-full h-full"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div className="min-w-0">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-[#7E153A]">
                                {brand}
                              </p>
                              <h3 className="font-bold text-gray-900 text-sm leading-snug truncate">
                                {title}
                              </h3>
                            </div>
                            <span
                              className={`shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${statusCfg.bg} ${statusCfg.color}`}
                            >
                              <StatusIcon size={11} />
                              {statusCfg.label}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-[11px] text-gray-500 mt-1">
                            <span className="font-mono font-semibold text-gray-700">
                              {order.orderNumber}
                            </span>
                            <span>·</span>
                            <span className="capitalize">
                              {order.garmentType?.replace(/_/g, ' ')}
                            </span>
                            <span>·</span>
                            <span className="font-semibold text-gray-800">
                              PKR {Number(order.totalAmount).toLocaleString()}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-[11px] text-gray-500 mt-1">
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
                            Production Progress
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
                      <div className="flex gap-2 mt-4 pt-4 border-t border-gray-50">
                        <Link href={`/orders/${order.id}`}>
                          <button className="flex items-center gap-1.5 text-xs font-semibold text-[#7E153A] bg-red-50 hover:bg-red-100 px-3 py-2 rounded-lg transition-colors">
                            <Eye size={14} /> Track Order
                          </button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Completed Orders Section */}
          {completedOrders.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-gray-900">
                  Recently Delivered
                </h2>
                <Link
                  href="/orders"
                  className="text-xs text-[#7E153A] font-semibold hover:underline flex items-center gap-1"
                >
                  All Orders <ChevronRight size={14} />
                </Link>
              </div>

              <div className="space-y-3">
                {completedOrders.map((order) => {
                  const brand = order.product?.brand || 'Custom Stitch';
                  const title =
                    order.product?.name ||
                    `${order.garmentType?.replace(/_/g, ' ').toUpperCase()} Custom Stitch`;
                  const imageUrl =
                    order.product?.images?.[0] || '/login_bg.jpg';
                  const deliveredDate = new Date(
                    order.updatedAt
                  ).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  });

                  return (
                    <div
                      key={order.id}
                      className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex gap-4 hover:shadow-md transition-shadow"
                    >
                      <div className="w-14 h-16 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                        <img
                          src={imageUrl}
                          alt={title}
                          className="object-cover w-full h-full"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold text-[#7E153A] uppercase tracking-wider">
                          {brand}
                        </p>
                        <h3 className="text-sm font-bold text-gray-900 truncate">
                          {title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-500">
                          <span>Delivered {deliveredDate}</span>
                          <span>·</span>
                          <span className="font-semibold text-gray-800">
                            PKR {Number(order.totalAmount).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end justify-between shrink-0">
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-green-50 text-green-700 flex items-center gap-1">
                          <CheckCircle2 size={11} /> Delivered
                        </span>
                        <Link href="/new-order">
                          <button className="text-xs text-[#7E153A] font-semibold hover:underline flex items-center gap-1">
                            Re-Order <ArrowRight size={12} />
                          </button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>

        {/* RIGHT: Sidebar Widgets ────────────────────────────────────────── */}
        <div className="space-y-6">
          {/* Saved Measurements Widget */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Ruler size={16} className="text-[#7E153A]" />
                My Measurements
              </h2>
              {defaultMeasurement && (
                <Link
                  href="/measurements"
                  className="text-[11px] text-[#7E153A] font-semibold hover:underline"
                >
                  Edit
                </Link>
              )}
            </div>

            {defaultMeasurement ? (
              <>
                <p className="text-xs font-semibold text-gray-700 mb-3">
                  Profile:{' '}
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
                    {
                      label: 'Kameez Length',
                      val: defaultMeasurement.kameezLength
                        ? `${defaultMeasurement.kameezLength}"`
                        : '-',
                    },
                    {
                      label: 'Sleeve',
                      val: defaultMeasurement.sleeveLength
                        ? `${defaultMeasurement.sleeveLength}"`
                        : '-',
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="bg-gray-50 rounded-xl p-3 text-center"
                    >
                      <p className="text-sm font-extrabold text-gray-900">
                        {item.val}
                      </p>
                      <p className="text-[10px] text-gray-500 capitalize mt-0.5">
                        {item.label}
                      </p>
                    </div>
                  ))}
                </div>

                <Link href="/new-order">
                  <button className="w-full mt-4 flex items-center justify-center gap-2 text-xs font-semibold text-[#7E153A] bg-red-50 hover:bg-red-100 py-2.5 rounded-xl transition-colors">
                    <Plus size={14} /> Use in New Order
                  </button>
                </Link>
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-xs text-gray-500 mb-3">
                  No saved measurement profile yet. Save your body measurements
                  once to use across all orders.
                </p>
                <Link href="/new-order">
                  <button className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-white bg-[#7E153A] hover:bg-[#630F2D] py-2.5 rounded-xl transition-colors shadow-sm">
                    <Plus size={14} /> Add Measurements
                  </button>
                </Link>
              </div>
            )}
          </section>

          {/* Quick Actions Widget */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-sm font-bold text-gray-900 mb-4">
              Quick Actions
            </h2>
            <div className="space-y-2">
              {[
                {
                  icon: Plus,
                  label: 'Place Custom Order',
                  href: '/new-order',
                  color: 'bg-[#7E153A] text-white',
                },
                {
                  icon: Package,
                  label: 'Track All Orders',
                  href: '/orders',
                  color: 'bg-red-50 text-[#7E153A]',
                },
                {
                  icon: Ruler,
                  label: 'Update Measurements',
                  href: '/measurements',
                  color: 'bg-red-50 text-[#7E153A]',
                },
                {
                  icon: Gift,
                  label: 'Refer a Friend',
                  href: '/referral',
                  color: 'bg-red-50 text-[#7E153A]',
                },
              ].map((action) => (
                <Link key={action.label} href={action.href}>
                  <button
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90 ${action.color}`}
                  >
                    <action.icon size={16} />
                    {action.label}
                    <ChevronRight size={14} className="ml-auto opacity-60" />
                  </button>
                </Link>
              ))}
            </div>
          </section>

          {/* Referral Box Widget */}
          <section className="relative overflow-hidden bg-[#7E153A] rounded-2xl p-5 text-white z-0">
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-white/10 translate-x-8 -translate-y-8 pointer-events-none" />
            <Gift
              size={40}
              className="absolute -bottom-2 -right-2 text-white/20 pointer-events-none"
            />
            <div className="relative z-[1]">
              <h3 className="font-bold text-sm mb-1">Refer & Earn PKR 500</h3>
              <p className="text-xs text-white/80 mb-4 leading-relaxed">
                Invite friends to TailorLink. Earn PKR 500 credit for each
                successful referral.
              </p>
              <button
                onClick={() => {
                  if (typeof navigator !== 'undefined' && navigator.clipboard) {
                    navigator.clipboard.writeText(
                      window.location.origin +
                        '/register?ref=' +
                        (user?.id || 'stitch')
                    );
                    alert('Referral link copied to clipboard!');
                  }
                }}
                className="bg-white text-[#7E153A] text-xs font-bold px-4 py-2 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
              >
                Share Referral Link
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
