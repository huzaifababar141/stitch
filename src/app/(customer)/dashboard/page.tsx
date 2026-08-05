'use client';

import { useState } from 'react';
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
} from 'lucide-react';

// ─── Mock Data ────────────────────────────────────────────────────────────────

const ACTIVE_ORDERS = [
  {
    id: 'ORD-20240801-001',
    productTitle: 'Mahay Lawn 3 Piece Unstitched',
    brand: 'Sana Safinaz',
    stitchingType: 'Premium Stitching',
    totalAmount: 7850,
    status: 'in_stitching',
    statusLabel: 'In Stitching',
    placedOn: 'Aug 01, 2026',
    estimatedDelivery: 'Aug 08, 2026',
    imageUrl: '/login_bg.jpg',
    progress: 60,
    timeline: [
      { label: 'Order Placed', done: true, current: false },
      { label: 'Payment Confirmed', done: true, current: false },
      { label: 'Assigned to Tailor', done: true, current: false },
      { label: 'In Stitching', done: false, current: true },
      { label: 'Quality Check', done: false, current: false },
      { label: 'Dispatched', done: false, current: false },
      { label: 'Delivered', done: false, current: false },
    ],
  },
  {
    id: 'ORD-20240729-003',
    productTitle: 'Embroidered Chiffon 2 Piece',
    brand: 'Sapphire',
    stitchingType: 'Luxury Stitching',
    totalAmount: 9200,
    status: 'quality_check',
    statusLabel: 'Quality Check',
    placedOn: 'Jul 29, 2026',
    estimatedDelivery: 'Aug 05, 2026',
    imageUrl: '/login_bg.jpg',
    progress: 80,
    timeline: [
      { label: 'Order Placed', done: true, current: false },
      { label: 'Payment Confirmed', done: true, current: false },
      { label: 'Assigned to Tailor', done: true, current: false },
      { label: 'In Stitching', done: true, current: false },
      { label: 'Quality Check', done: false, current: true },
      { label: 'Dispatched', done: false, current: false },
      { label: 'Delivered', done: false, current: false },
    ],
  },
];

const RECENT_COMPLETED = [
  {
    id: 'ORD-20240710-007',
    productTitle: 'Zara Shahjahan Coco Vol-3',
    brand: 'Zara Shahjahan',
    stitchingType: 'Standard Stitching',
    totalAmount: 6400,
    deliveredOn: 'Jul 18, 2026',
    rating: 5,
    imageUrl: '/login_bg.jpg',
  },
  {
    id: 'ORD-20240701-002',
    productTitle: 'Khaadi Lawn Summer 3pc',
    brand: 'Khaadi',
    stitchingType: 'Premium Stitching',
    totalAmount: 7100,
    deliveredOn: 'Jul 08, 2026',
    rating: 4,
    imageUrl: '/login_bg.jpg',
  },
];

const SAVED_MEASUREMENTS = {
  shoulder: '14"',
  bust: '38"',
  waist: '32"',
  hip: '40"',
  shirt_length: '44"',
  sleeve_length: '22"',
};

const NOTIFICATIONS = [
  {
    id: 1,
    icon: Scissors,
    text: 'Your "Mahay Lawn" order is being stitched by Master Tailor Zubair.',
    time: '2 hours ago',
    unread: true,
  },
  {
    id: 2,
    icon: CheckCircle2,
    text: 'Your "Chiffon 2 Piece" has passed quality inspection.',
    time: '5 hours ago',
    unread: true,
  },
  {
    id: 3,
    icon: Gift,
    text: 'You earned PKR 200 referral credit. Refer 2 more friends to unlock a discount!',
    time: 'Yesterday',
    unread: false,
  },
];

// ─── Status Helpers ───────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; icon: React.ElementType }
> = {
  pending_payment: {
    label: 'Pending Payment',
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    icon: AlertCircle,
  },
  in_stitching: {
    label: 'In Stitching',
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    icon: Scissors,
  },
  quality_check: {
    label: 'Quality Check',
    color: 'text-purple-700',
    bg: 'bg-purple-50',
    icon: Sparkles,
  },
  dispatched: {
    label: 'Dispatched',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    icon: Truck,
  },
  delivered: {
    label: 'Delivered',
    color: 'text-green-700',
    bg: 'bg-green-50',
    icon: CheckCircle2,
  },
};

// ─── Sub-Components ───────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  value,
  label,
  sublabel,
  color,
}: {
  icon: React.ElementType;
  value: string;
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
    <div className="w-full bg-gray-100 rounded-full h-1.5">
      <div
        className="bg-gradient-to-r from-[#7E153A] to-[#C9A84C] h-1.5 rounded-full transition-all duration-700"
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
  const [showAllNotifications, setShowAllNotifications] = useState(false);

  const unreadCount = NOTIFICATIONS.filter((n) => n.unread).length;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Welcome Banner ───────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#7E153A] via-[#9e1a48] to-[#C9A84C] rounded-2xl p-8 text-white shadow-xl shadow-[#7E153A]/20">
        {/* Background texture circles */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 translate-x-24 -translate-y-24" />
        <div className="absolute bottom-0 right-16 w-32 h-32 rounded-full bg-white/5" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-white/70 mb-1">
              Welcome back,
            </p>
            <h1 className="text-2xl font-extrabold tracking-tight">
              Sarah Khan
            </h1>
            <p className="text-sm text-white/70 mt-1">
              You have{' '}
              <span className="text-[#f5c96e] font-bold">
                {ACTIVE_ORDERS.length} active orders
              </span>{' '}
              in progress.
            </p>
          </div>
          <Link href="/new-order">
            <button className="flex items-center gap-2 bg-white text-[#7E153A] font-bold text-sm px-5 py-3 rounded-xl hover:bg-white/90 transition-colors shadow-lg shadow-black/20">
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
          value="12"
          label="Total Orders"
          sublabel="Lifetime"
          color="bg-red-50 text-[#7E153A]"
        />
        <StatCard
          icon={Clock}
          value="2"
          label="Active Orders"
          sublabel="In production"
          color="bg-blue-50 text-blue-700"
        />
        <StatCard
          icon={Ruler}
          value="1"
          label="Saved Profiles"
          sublabel="Last updated Aug 01"
          color="bg-emerald-50 text-emerald-700"
        />
        <StatCard
          icon={TrendingUp}
          value="PKR 200"
          label="Referral Credit"
          sublabel="Available to redeem"
          color="bg-amber-50 text-amber-700"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT: Active Orders & Recent Orders ─────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Orders */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-900">
                Active Orders
              </h2>
              <Link
                href="/orders"
                className="text-xs text-[#7E153A] font-semibold hover:underline flex items-center gap-1"
              >
                View All <ChevronRight size={14} />
              </Link>
            </div>

            <div className="space-y-4">
              {ACTIVE_ORDERS.map((order) => {
                const statusCfg =
                  STATUS_CONFIG[order.status] || STATUS_CONFIG.in_stitching;
                const StatusIcon = statusCfg.icon;

                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow"
                  >
                    {/* Order Header */}
                    <div className="flex gap-4 mb-4">
                      <div className="w-16 h-20 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                        <img
                          src={order.imageUrl}
                          alt={order.productTitle}
                          className="object-cover w-full h-full"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="min-w-0">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-[#7E153A]">
                              {order.brand}
                            </p>
                            <h3 className="font-bold text-gray-900 text-sm leading-snug truncate">
                              {order.productTitle}
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
                          <span>{order.id}</span>
                          <span>·</span>
                          <span>{order.stitchingType}</span>
                          <span>·</span>
                          <span className="font-semibold text-gray-800">
                            PKR {order.totalAmount.toLocaleString()}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-[11px] text-gray-500 mt-1">
                          <span className="flex items-center gap-1">
                            <Clock size={11} className="shrink-0" />
                            Placed: {order.placedOn}
                          </span>
                          <span>·</span>
                          <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                            <Truck size={11} className="shrink-0" />
                            Est. Delivery: {order.estimatedDelivery}
                          </span>
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
                          {order.progress}%
                        </span>
                      </div>
                      <OrderProgressBar progress={order.progress} />
                    </div>

                    {/* Step Timeline */}
                    <OrderTimeline timeline={order.timeline} />

                    {/* Actions */}
                    <div className="flex gap-2 mt-4 pt-4 border-t border-gray-50">
                      <Link href={`/orders/${order.id}`}>
                        <button className="flex items-center gap-1.5 text-xs font-semibold text-[#7E153A] bg-red-50 hover:bg-red-100 px-3 py-2 rounded-lg transition-colors">
                          <Eye size={14} /> Track Order
                        </button>
                      </Link>
                      <button className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors">
                        <Bell size={14} /> Get Updates
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Completed Orders */}
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
              {RECENT_COMPLETED.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex gap-4 hover:shadow-md transition-shadow"
                >
                  <div className="w-14 h-16 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                    <img
                      src={order.imageUrl}
                      alt={order.productTitle}
                      className="object-cover w-full h-full"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-[#7E153A] uppercase tracking-wider">
                      {order.brand}
                    </p>
                    <h3 className="text-sm font-bold text-gray-900 truncate">
                      {order.productTitle}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-500">
                      <span>Delivered {order.deliveredOn}</span>
                      <span>·</span>
                      <span className="font-semibold text-gray-800">
                        PKR {order.totalAmount.toLocaleString()}
                      </span>
                    </div>
                    {/* Star Rating */}
                    <div className="flex items-center gap-0.5 mt-1.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          className={
                            i < order.rating
                              ? 'text-[#C9A84C] fill-[#C9A84C]'
                              : 'text-gray-200'
                          }
                        />
                      ))}
                      <span className="text-[10px] text-gray-400 ml-1">
                        Your Rating
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end justify-between shrink-0">
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-green-50 text-green-700 flex items-center gap-1">
                      <CheckCircle2 size={11} /> Delivered
                    </span>
                    <button className="text-xs text-[#7E153A] font-semibold hover:underline flex items-center gap-1">
                      Re-Order <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* RIGHT: Sidebar Widgets ────────────────────────────────────────── */}
        <div className="space-y-6">
          {/* Notifications ─────────────────────────────────── */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Bell size={16} className="text-[#7E153A]" />
                Notifications
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-[#7E153A] text-white text-[10px] font-bold">
                    {unreadCount}
                  </span>
                )}
              </h2>
              <button
                onClick={() => setShowAllNotifications(!showAllNotifications)}
                className="text-[11px] text-[#7E153A] font-semibold hover:underline"
              >
                {showAllNotifications ? 'Less' : 'View All'}
              </button>
            </div>

            <div className="space-y-3">
              {(showAllNotifications
                ? NOTIFICATIONS
                : NOTIFICATIONS.slice(0, 2)
              ).map((notif) => {
                const NotifIcon = notif.icon;
                return (
                  <div
                    key={notif.id}
                    className={`flex gap-3 p-3 rounded-xl ${notif.unread ? 'bg-red-50/50' : 'bg-gray-50'}`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${notif.unread ? 'bg-[#7E153A] text-white' : 'bg-gray-200 text-gray-500'}`}
                    >
                      <NotifIcon size={13} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-700 leading-relaxed">
                        {notif.text}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-1">
                        {notif.time}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Saved Measurements ────────────────────────────── */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Ruler size={16} className="text-[#7E153A]" />
                My Measurements
              </h2>
              <Link
                href="/measurements"
                className="text-[11px] text-[#7E153A] font-semibold hover:underline"
              >
                Edit
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {Object.entries(SAVED_MEASUREMENTS).map(([key, val]) => (
                <div
                  key={key}
                  className="bg-gray-50 rounded-xl p-3 text-center"
                >
                  <p className="text-sm font-extrabold text-gray-900">{val}</p>
                  <p className="text-[10px] text-gray-500 capitalize mt-0.5">
                    {key.replace(/_/g, ' ')}
                  </p>
                </div>
              ))}
            </div>

            <Link href="/new-order">
              <button className="w-full mt-4 flex items-center justify-center gap-2 text-xs font-semibold text-[#7E153A] bg-red-50 hover:bg-red-100 py-2.5 rounded-xl transition-colors">
                <Plus size={14} /> Use in New Order
              </button>
            </Link>
          </section>

          {/* Quick Actions ──────────────────────────────────── */}
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
                  color: 'bg-blue-50 text-blue-700',
                },
                {
                  icon: Ruler,
                  label: 'Update Measurements',
                  href: '/measurements',
                  color: 'bg-emerald-50 text-emerald-700',
                },
                {
                  icon: Gift,
                  label: 'Refer a Friend',
                  href: '/referral',
                  color: 'bg-amber-50 text-amber-700',
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

          {/* Referral Box ───────────────────────────────────── */}
          <section className="relative overflow-hidden bg-gradient-to-br from-[#7E153A] to-[#C9A84C] rounded-2xl p-5 text-white">
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-white/10 translate-x-8 -translate-y-8" />
            <Gift
              size={40}
              className="absolute -bottom-2 -right-2 text-white/20"
            />
            <div className="relative z-10">
              <h3 className="font-bold text-sm mb-1">Refer & Earn PKR 500</h3>
              <p className="text-xs text-white/80 mb-4 leading-relaxed">
                Invite friends to TailorLink. Earn PKR 500 credit for each
                successful referral.
              </p>
              <button className="bg-white text-[#7E153A] text-xs font-bold px-4 py-2 rounded-lg hover:bg-white/90 transition-colors">
                Share Referral Link
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
