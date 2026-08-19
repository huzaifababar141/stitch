'use client';

import { useState, useEffect, useCallback } from 'react';
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
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

// ─── Sub-Component: Tailor Assignment Modal ───────────────────────────────────

function AssignTailorModal({
  isOpen,
  orderId,
  tailors,
  onClose,
  onAssign,
}: {
  isOpen: boolean;
  orderId: string | null;
  tailors: any[];
  onClose: () => void;
  onAssign: (orderId: string, tailorId: string) => void;
}) {
  const [selectedTailor, setSelectedTailor] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !orderId) return null;

  const handleSubmit = async () => {
    if (!selectedTailor) return;
    setSubmitting(true);
    await onAssign(orderId, selectedTailor);
    setSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div>
            <h3 className="font-extrabold text-base text-gray-900">
              Assign Master Tailor
            </h3>
            <p className="text-xs text-gray-500 font-mono mt-0.5">{orderId}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tailor Select List */}
        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
          {tailors.map((tailor) => {
            const isSelected = selectedTailor === tailor.id;
            const isFull =
              tailor.currentActiveOrders >= (tailor.maxCapacity || 5);

            return (
              <div
                key={tailor.id}
                onClick={() => !isFull && setSelectedTailor(tailor.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  isFull
                    ? 'bg-gray-50 border-gray-100 opacity-60 cursor-not-allowed'
                    : isSelected
                      ? 'border-[#7E153A] bg-red-50/50 ring-2 ring-[#7E153A]/20'
                      : 'border-gray-100 hover:border-gray-200 bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-gray-900">
                      {tailor.fullName ||
                        tailor.name ||
                        `Tailor #${tailor.id.substring(0, 6)}`}
                    </h4>
                    {tailor.rating && (
                      <span className="text-[10px] bg-amber-50 text-amber-700 font-bold px-1.5 py-0.5 rounded-sm">
                        {tailor.rating} ★
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {tailor.specialization?.join(', ') ||
                      'Custom Stitching Specialist'}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Active Load: {tailor.currentActiveOrders || 0} /{' '}
                    {tailor.maxCapacity || 5} suits
                  </p>
                </div>

                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center border transition-colors ${
                    isSelected
                      ? 'border-[#7E153A] bg-[#7E153A] text-white'
                      : 'border-gray-300'
                  }`}
                >
                  {isSelected && <Check size={12} strokeWidth={3} />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 rounded-xl h-11 text-xs font-semibold"
          >
            Cancel
          </Button>
          <Button
            disabled={!selectedTailor || submitting}
            onClick={handleSubmit}
            className="flex-1 rounded-xl h-11 text-xs font-bold bg-[#7E153A] hover:bg-[#630f2d] text-white shadow-md shadow-[#7E153A]/20"
          >
            {submitting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              'Confirm Assignment'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Admin Dashboard Component ───────────────────────────────────────────

export default function AdminDashboardPage() {
  const { toast } = useToast();

  const [orders, setOrders] = useState<any[]>([]);
  const [tailors, setTailors] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [assignModalOrder, setAssignModalOrder] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [analyticsRes, ordersRes, tailorsRes] = await Promise.all([
        fetch('/api/admin/analytics').catch(() => null),
        fetch('/api/admin/orders?limit=10').catch(() => null),
        fetch('/api/admin/tailors').catch(() => null),
      ]);

      if (analyticsRes && analyticsRes.ok) {
        const aJson = await analyticsRes.json();
        setAnalytics(aJson.data || aJson);
      }

      if (ordersRes && ordersRes.ok) {
        const oJson = await ordersRes.json();
        setOrders(oJson.data?.orders || oJson.data || oJson || []);
      }

      if (tailorsRes && tailorsRes.ok) {
        const tJson = await tailorsRes.json();
        setTailors(tJson.data || tJson || []);
      }
    } catch (err) {
      console.error('Failed to load admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = async () => {
    setLoading(true);
    await loadData();
  };

  const handleAssignTailor = async (orderId: string, tailorId: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/assign`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tailorId }),
      });

      if (res.ok) {
        toast({
          title: 'Tailor Assigned',
          description: `Order successfully allocated to master tailor.`,
        });
        loadData();
      } else {
        const json = await res.json();
        toast({
          title: 'Assignment Failed',
          description: json.error?.message || 'Could not assign tailor.',
          variant: 'destructive',
        });
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to assign tailor.',
        variant: 'destructive',
      });
    }
  };

  const safeOrders = Array.isArray(orders) ? orders : [];
  const safeTailors = Array.isArray(tailors) ? tailors : [];
  const totalRevenue = analytics?.totalRevenue || analytics?.revenue || 0;
  const activeOrdersCount =
    analytics?.activeOrders ??
    safeOrders.filter(
      (o) => o.status !== 'delivered' && o.status !== 'cancelled'
    ).length;
  const unassignedCount =
    analytics?.unassignedOrders ??
    safeOrders.filter(
      (o) =>
        o.status === 'pending_payment' ||
        o.status === 'payment_confirmed' ||
        !o.assignedTailorId
    ).length;

  return (
    <div className="max-w-7xl mx-auto space-y-8 py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl border border-gray-100 p-6 shadow-xs">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Admin Command Center
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Real-time operations, master tailor allocation & quality control
            metrics
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={handleRefresh}
            variant="outline"
            className="h-10 text-xs font-bold border-gray-200 text-gray-700 hover:bg-gray-50 cursor-pointer"
          >
            <RefreshCw
              size={14}
              className={`mr-1.5 ${loading ? 'animate-spin' : ''}`}
            />{' '}
            Refresh Live Data
          </Button>
          <Link href="/admin/orders">
            <Button className="bg-[#7E153A] hover:bg-[#630f2d] text-white text-xs font-bold h-10 px-5 shadow-sm shadow-[#7E153A]/20 cursor-pointer">
              <ShoppingBag size={15} className="mr-1.5" /> All Orders Table
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-50 text-[#7E153A] flex items-center justify-center shrink-0">
            <ShoppingBag size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500">
              Active in Production
            </p>
            <h3 className="text-2xl font-extrabold text-gray-900 font-mono mt-0.5">
              {loading ? '...' : activeOrdersCount}
            </h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <AlertTriangle size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500">
              Pending Assignment
            </p>
            <h3 className="text-2xl font-extrabold text-amber-600 font-mono mt-0.5">
              {loading ? '...' : unassignedCount}
            </h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <TrendingUp size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500">
              Total Platform Revenue
            </p>
            <h3 className="text-xl font-extrabold text-emerald-600 font-mono mt-0.5">
              PKR {Number(totalRevenue).toLocaleString()}
            </h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Users size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500">
              Master Tailors Active
            </p>
            <h3 className="text-2xl font-extrabold text-purple-700 font-mono mt-0.5">
              {loading ? '...' : safeTailors.length}
            </h3>
          </div>
        </div>
      </div>

      {/* Live Recent Orders */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div>
            <h2 className="text-base font-extrabold text-gray-900">
              Live Production Order Queue
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Manage tailor allocations and review order progression
            </p>
          </div>

          <Link href="/admin/orders">
            <Button
              variant="ghost"
              className="text-xs font-bold text-[#7E153A] hover:bg-red-50 cursor-pointer"
            >
              View Full Table <ChevronRight size={14} className="ml-1" />
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <Loader2 size={28} className="animate-spin text-[#7E153A] mb-2" />
            <p className="text-xs text-gray-500">Loading live order queue...</p>
          </div>
        ) : safeOrders.length === 0 ? (
          <div className="py-12 text-center text-gray-500 text-xs">
            No active orders in the platform queue right now.
          </div>
        ) : (
          <div className="space-y-3">
            {safeOrders.map((order) => {
              const placedDate = order.createdAt
                ? new Date(order.createdAt).toLocaleDateString('en-PK', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'Recently';

              const customerName = order.customer?.firstName
                ? `${order.customer.firstName} ${order.customer.lastName || ''}`.trim()
                : order.deliveryAddressSnapshot?.fullName || 'Customer';

              const isAssigned = !!order.assignedTailorId;

              return (
                <div
                  key={order.id}
                  className="p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/50"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center font-bold text-xs text-[#7E153A] font-mono shrink-0">
                      #{order.id?.substring(0, 4)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-gray-900">
                          {order.orderNumber ||
                            order.id?.substring(0, 10)?.toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-300">·</span>
                        <span className="text-xs font-semibold text-gray-700">
                          {customerName}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {order.garmentType?.replace(/_/g, ' ')} · Placed{' '}
                        {placedDate}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-extrabold text-[#7E153A] font-mono">
                      PKR {Number(order.totalAmount || 0).toLocaleString()}
                    </span>

                    {!isAssigned ? (
                      <Button
                        onClick={() => setAssignModalOrder(order.id)}
                        className="h-8 text-xs font-bold bg-[#7E153A] hover:bg-[#630f2d] text-white px-3 shadow-xs cursor-pointer"
                      >
                        <UserCheck size={13} className="mr-1.5" /> Assign Tailor
                      </Button>
                    ) : (
                      <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold px-2.5 py-1 rounded-md">
                        Allocated
                      </span>
                    )}

                    <Link href={`/orders/${order.id}`}>
                      <Button
                        variant="outline"
                        className="h-8 text-xs font-semibold border-gray-200 text-gray-700 hover:bg-white cursor-pointer"
                      >
                        <Eye size={13} />
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Tailor Modal */}
      <AssignTailorModal
        isOpen={!!assignModalOrder}
        orderId={assignModalOrder}
        tailors={safeTailors}
        onClose={() => setAssignModalOrder(null)}
        onAssign={handleAssignTailor}
      />
    </div>
  );
}
