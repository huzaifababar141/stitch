'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  Users,
  ShieldCheck,
  Truck,
  TrendingUp,
  Clock,
  AlertTriangle,
  Scissors,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  Filter,
  Search,
  UserCheck,
  ArrowUpRight,
  RefreshCw,
  X,
  Check,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

// ─── Mock Data ────────────────────────────────────────────────────────────────

const INITIAL_ORDERS = [
  {
    id: 'ORD-20240805-012',
    customerName: 'Ayesha Malik',
    customerPhone: '+92 300 9876543',
    brand: 'Maria.B Lawn 3pc',
    stitchingTier: 'Luxury Stitching',
    totalPrice: 9500,
    status: 'unassigned',
    statusLabel: 'Pending Tailor',
    deadline: '22 Hours Left',
    isUrgent: true,
    placedDate: 'Today, 10:30 AM',
    tailorName: null,
    imageUrl: '/login_bg.jpg',
  },
  {
    id: 'ORD-20240801-001',
    customerName: 'Sarah Khan',
    customerPhone: '+92 300 1234567',
    brand: 'Sana Safinaz Mahay',
    stitchingTier: 'Premium Stitching',
    totalPrice: 7850,
    status: 'in_stitching',
    statusLabel: 'In Stitching',
    deadline: '2 Days Left',
    isUrgent: false,
    placedDate: 'Aug 01, 2026',
    tailorName: 'Master Zubair Ahmad',
    imageUrl: '/login_bg.jpg',
  },
  {
    id: 'ORD-20240729-003',
    customerName: 'Fatima Ali',
    customerPhone: '+92 321 4455667',
    brand: 'Sapphire Chiffon 2pc',
    stitchingTier: 'Luxury Stitching',
    totalPrice: 9200,
    status: 'quality_check',
    statusLabel: 'QC Inspection',
    deadline: '1 Day Left',
    isUrgent: true,
    placedDate: 'Jul 29, 2026',
    tailorName: 'Master Rashid',
    imageUrl: '/login_bg.jpg',
  },
  {
    id: 'ORD-20240728-005',
    customerName: 'Zainab Ahmed',
    customerPhone: '+92 333 8899001',
    brand: 'Khaadi Summer Lawn',
    stitchingTier: 'Standard Stitching',
    totalPrice: 6500,
    status: 'dispatched',
    statusLabel: 'Dispatched via TCS',
    deadline: 'Delivered Soon',
    isUrgent: false,
    placedDate: 'Jul 28, 2026',
    tailorName: 'Master Farhan',
    imageUrl: '/login_bg.jpg',
  },
];

const TAILORS_LIST = [
  {
    id: 'T-101',
    name: 'Master Zubair Ahmad',
    specialty: 'Luxury Suits & Embroidered',
    activeSuits: 3,
    maxCapacity: 5,
    rating: '4.9 ★',
    isAvailable: true,
  },
  {
    id: 'T-102',
    name: 'Master Rashid',
    specialty: 'Chiffon & Velvet Specialist',
    activeSuits: 2,
    maxCapacity: 5,
    rating: '4.8 ★',
    isAvailable: true,
  },
  {
    id: 'T-103',
    name: 'Master Farhan',
    specialty: 'Standard Everyday Lawn',
    activeSuits: 4,
    maxCapacity: 5,
    rating: '4.9 ★',
    isAvailable: true,
  },
  {
    id: 'T-104',
    name: 'Master Tariq',
    specialty: 'Gowns & Frocks',
    activeSuits: 1,
    maxCapacity: 5,
    rating: '4.7 ★',
    isAvailable: true,
  },
];

// ─── Sub-Component: Tailor Assignment Modal ───────────────────────────────────

function AssignTailorModal({
  isOpen,
  orderId,
  onClose,
  onAssign,
}: {
  isOpen: boolean;
  orderId: string;
  onClose: () => void;
  onAssign: (tailorName: string) => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div>
            <h3 className="text-base font-bold text-gray-900">
              Assign Master Tailor
            </h3>
            <p className="text-xs text-gray-500">
              Order: <strong className="text-[#7E153A]">{orderId}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-200/60 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tailors List */}
        <div className="p-6 overflow-y-auto space-y-3">
          <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
            Available Master Tailors
          </p>
          {TAILORS_LIST.map((t) => {
            const loadPercentage = Math.round(
              (t.activeSuits / t.maxCapacity) * 100
            );
            return (
              <div
                key={t.id}
                className="p-4 rounded-xl border border-gray-200 hover:border-[#7E153A] bg-white transition-all flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#7E153A] text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                    {t.name.split(' ').pop()?.[0] || 'T'}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-gray-900 leading-snug">
                      {t.name}
                    </h4>
                    <p className="text-[11px] text-gray-500">{t.specialty}</p>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-600 mt-1">
                      <span className="text-[#7E153A]">{t.rating}</span>
                      <span>·</span>
                      <span>
                        Workload: {t.activeSuits}/{t.maxCapacity} suits (
                        {loadPercentage}%)
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => onAssign(t.name)}
                  size="sm"
                  className="bg-[#7E153A] hover:bg-[#630f2d] text-white text-xs font-bold px-4 shrink-0"
                >
                  Assign Suit
                </Button>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <Button
            variant="outline"
            onClick={onClose}
            className="h-9 text-xs font-semibold"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Admin Dashboard Page ────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const { toast } = useToast();

  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [filterTab, setFilterTab] = useState<
    'all' | 'unassigned' | 'in_stitching' | 'quality_check' | 'dispatched'
  >('all');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);

  // Handlers
  const handleOpenAssignModal = (orderId: string) => {
    setSelectedOrderId(orderId);
    setShowAssignModal(true);
  };

  const handleConfirmAssignment = (tailorName: string) => {
    if (!selectedOrderId) return;

    setOrders((prev) =>
      prev.map((o) =>
        o.id === selectedOrderId
          ? {
              ...o,
              status: 'in_stitching',
              statusLabel: 'In Stitching',
              tailorName: tailorName,
              isUrgent: false,
            }
          : o
      )
    );

    toast({
      title: 'Tailor Assigned 🎉',
      description: `Order ${selectedOrderId} assigned to ${tailorName}.`,
    });

    setShowAssignModal(false);
    setSelectedOrderId(null);
  };

  const filteredOrders = orders.filter((o) => {
    if (filterTab === 'unassigned') return o.status === 'unassigned';
    if (filterTab === 'in_stitching') return o.status === 'in_stitching';
    if (filterTab === 'quality_check') return o.status === 'quality_check';
    if (filterTab === 'dispatched') return o.status === 'dispatched';
    return true;
  });

  // Calculations
  const unassignedCount = orders.filter(
    (o) => o.status === 'unassigned'
  ).length;
  const stitchingCount = orders.filter(
    (o) => o.status === 'in_stitching'
  ).length;
  const qcCount = orders.filter((o) => o.status === 'quality_check').length;
  const dispatchedCount = orders.filter(
    (o) => o.status === 'dispatched'
  ).length;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header Overview Banner ───────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl border border-gray-100 p-6 shadow-xs">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#7E153A] bg-red-50 px-2.5 py-1 rounded-full">
            Live Operations Control
          </span>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight mt-1.5">
            Admin Command Center
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Real-time tailor assignments, quality control inspection & delivery
            tracking
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-10 text-xs font-semibold">
            <RefreshCw size={14} className="mr-1.5" /> Refresh Data
          </Button>
          <Link href="/admin/orders">
            <Button className="h-10 bg-[#7E153A] hover:bg-[#630f2d] text-white text-xs font-bold px-5 shadow-md">
              <ShoppingBag size={14} className="mr-1.5" /> All Orders List
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats Row ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
            Total Revenue
          </span>
          <p className="text-2xl font-extrabold text-gray-900 mt-1">
            PKR 1.48M
          </p>
          <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-0.5 mt-1">
            <ArrowUpRight size={12} /> +14% this week
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
            Active Pipeline
          </span>
          <p className="text-2xl font-extrabold text-gray-900 mt-1">
            {orders.length} Suits
          </p>
          <span className="text-[11px] font-semibold text-[#7E153A] mt-1 block">
            In production
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
            Pending Assignment
          </span>
          <p className="text-2xl font-extrabold text-[#7E153A] mt-1">
            {unassignedCount}
          </p>
          <span className="text-[11px] font-semibold text-amber-600 mt-1 block">
            Needs tailor allocation
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
            Pending QC
          </span>
          <p className="text-2xl font-extrabold text-purple-700 mt-1">
            {qcCount}
          </p>
          <span className="text-[11px] font-semibold text-purple-600 mt-1 block">
            Awaiting inspection
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
            On-Time Delivery Rate
          </span>
          <p className="text-2xl font-extrabold text-emerald-700 mt-1">98.4%</p>
          <span className="text-[11px] font-semibold text-emerald-600 mt-1 block">
            TCS Air Express
          </span>
        </div>
      </div>

      {/* Production Pipeline Phase Cards ─────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Unassigned Suits',
            count: unassignedCount,
            color: 'bg-amber-500',
            desc: 'Awaiting tailor match',
          },
          {
            label: 'In Stitching',
            count: stitchingCount,
            color: 'bg-[#7E153A]',
            desc: 'Custom tailoring in progress',
          },
          {
            label: 'Quality Control',
            count: qcCount,
            color: 'bg-purple-600',
            desc: 'Final measurement check',
          },
          {
            label: 'Dispatched via TCS',
            count: dispatchedCount,
            color: 'bg-emerald-600',
            desc: 'In transit to customer',
          },
        ].map((phase) => (
          <div
            key={phase.label}
            className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-bold text-gray-900">{phase.label}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">{phase.desc}</p>
            </div>
            <div
              className={`w-10 h-10 rounded-xl ${phase.color} text-white font-extrabold text-base flex items-center justify-center shrink-0 shadow-sm`}
            >
              {phase.count}
            </div>
          </div>
        ))}
      </div>

      {/* Main Orders Command Table Section ──────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        {/* Table Controls Header */}
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-gray-900">
              Master Orders Pipeline
            </h2>
            <p className="text-xs text-gray-500">
              Assign tailors, monitor deadlines & track garment progress
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex bg-gray-100 p-1 rounded-xl w-max overflow-x-auto">
            {[
              { key: 'all', label: `All (${orders.length})` },
              {
                key: 'unassigned',
                label: `Pending Tailor (${unassignedCount})`,
              },
              { key: 'in_stitching', label: `Stitching (${stitchingCount})` },
              { key: 'quality_check', label: `QC (${qcCount})` },
              { key: 'dispatched', label: `Dispatched (${dispatchedCount})` },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilterTab(tab.key as any)}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  filterTab === tab.key
                    ? 'bg-white text-[#7E153A] shadow-xs'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/80 text-gray-700 font-semibold border-b border-gray-200">
              <tr>
                <th className="p-4">Order ID & Date</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Garment & Tier</th>
                <th className="p-4">Assigned Master Tailor</th>
                <th className="p-4">Deadline Status</th>
                <th className="p-4">Current Phase</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {filteredOrders.map((o) => (
                <tr key={o.id} className="hover:bg-red-50/20 transition-colors">
                  {/* Order ID & Date */}
                  <td className="p-4">
                    <span className="font-extrabold text-gray-900 block">
                      {o.id}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {o.placedDate}
                    </span>
                  </td>

                  {/* Customer Info */}
                  <td className="p-4">
                    <span className="font-bold text-gray-900 block">
                      {o.customerName}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {o.customerPhone}
                    </span>
                  </td>

                  {/* Garment Details */}
                  <td className="p-4">
                    <span className="font-bold text-gray-900 block">
                      {o.brand}
                    </span>
                    <span className="text-[10px] text-[#7E153A] font-semibold">
                      {o.stitchingTier} · PKR {o.totalPrice.toLocaleString()}
                    </span>
                  </td>

                  {/* Tailor Assignment */}
                  <td className="p-4">
                    {o.tailorName ? (
                      <span className="font-bold text-gray-900 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-600" />
                        {o.tailorName}
                      </span>
                    ) : (
                      <span className="font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full text-[10px] border border-amber-200">
                        ⚠️ Unassigned
                      </span>
                    )}
                  </td>

                  {/* Deadline Indicator */}
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        o.isUrgent
                          ? 'bg-red-100 text-red-800 animate-pulse'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      <Clock size={11} /> {o.deadline}
                    </span>
                  </td>

                  {/* Current Status Badge */}
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-extrabold ${
                        o.status === 'unassigned'
                          ? 'bg-amber-50 text-amber-800'
                          : o.status === 'in_stitching'
                            ? 'bg-red-50 text-[#7E153A]'
                            : o.status === 'quality_check'
                              ? 'bg-purple-50 text-purple-700'
                              : 'bg-emerald-50 text-emerald-700'
                      }`}
                    >
                      {o.statusLabel}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {o.status === 'unassigned' ? (
                        <Button
                          onClick={() => handleOpenAssignModal(o.id)}
                          size="sm"
                          className="bg-[#7E153A] hover:bg-[#630f2d] text-white text-xs font-bold h-8 px-3"
                        >
                          <UserCheck size={13} className="mr-1" /> Assign Tailor
                        </Button>
                      ) : (
                        <Link href={`/orders/${o.id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs font-semibold"
                          >
                            <Eye size={13} className="mr-1" /> Inspect
                          </Button>
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tailor Capacity & Active Workload Monitor ──────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-gray-900">
                Tailor Capacity & Workload Monitor
              </h2>
              <p className="text-xs text-gray-500">
                Live active suits assigned per master tailor
              </p>
            </div>
            <Link
              href="/admin/tailors"
              className="text-xs text-[#7E153A] font-semibold hover:underline"
            >
              Manage Tailors →
            </Link>
          </div>

          <div className="space-y-4">
            {TAILORS_LIST.map((tailor) => {
              const loadPct = Math.round(
                (tailor.activeSuits / tailor.maxCapacity) * 100
              );

              return (
                <div
                  key={tailor.id}
                  className="p-4 rounded-xl bg-gray-50/60 border border-gray-100 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-gray-900">
                        {tailor.name}
                      </span>
                      <span className="text-gray-400 ml-2">
                        ({tailor.specialty})
                      </span>
                    </div>
                    <span className="font-bold text-[#7E153A]">
                      {tailor.activeSuits} / {tailor.maxCapacity} suits
                    </span>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-[#7E153A] h-2 rounded-full transition-all duration-500"
                      style={{ width: `${loadPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Operational Audit Feed */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs">
          <h2 className="text-base font-bold text-gray-900 mb-4">
            Live Activity Feed
          </h2>
          <div className="space-y-3">
            {[
              {
                text: 'Master Zubair assigned to ORD-20240805-012',
                time: '5 mins ago',
                color: 'bg-[#7E153A]',
              },
              {
                text: 'QC Passed for ORD-20240729-003 by Inspector Hamza',
                time: '20 mins ago',
                color: 'bg-purple-600',
              },
              {
                text: 'TCS Tracking #TCS-9842104928 generated',
                time: '1 hour ago',
                color: 'bg-emerald-600',
              },
              {
                text: 'Payment confirmed for ORD-20240805-012 via JazzCash',
                time: '2 hours ago',
                color: 'bg-blue-600',
              },
            ].map((feed, i) => (
              <div
                key={i}
                className="flex gap-3 text-xs p-3 rounded-xl bg-gray-50 border border-gray-100"
              >
                <div
                  className={`w-2 h-2 rounded-full ${feed.color} mt-1 shrink-0`}
                />
                <div>
                  <p className="text-gray-800 font-semibold leading-relaxed">
                    {feed.text}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {feed.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tailor Assignment Modal */}
      <AssignTailorModal
        isOpen={showAssignModal}
        orderId={selectedOrderId || ''}
        onClose={() => setShowAssignModal(false)}
        onAssign={handleConfirmAssignment}
      />
    </div>
  );
}
