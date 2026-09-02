'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Scissors,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Star,
  Eye,
  Loader2,
  Sparkles,
  ArrowRight,
  Package,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useTailorRealtime } from '@/hooks/useTailorRealtime';

export default function TailorDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [dashboardData, setDashboardData] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Hook into live Supabase Realtime for tailor assignment notifications
  useTailorRealtime(user?.id);

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const [statsRes, ordersRes] = await Promise.all([
        fetch('/api/tailor/dashboard'),
        fetch('/api/tailor/orders?limit=30'),
      ]);

      if (statsRes.ok) {
        const statsJson = await statsRes.json();
        setDashboardData(statsJson.data || statsJson);
      }

      if (ordersRes.ok) {
        const ordersJson = await ordersRes.json();
        const list = Array.isArray(ordersJson.data?.orders)
          ? ordersJson.data.orders
          : Array.isArray(ordersJson.data)
            ? ordersJson.data
            : Array.isArray(ordersJson.orders)
              ? ordersJson.orders
              : [];
        setOrders(list);
      }
    } catch (err) {
      console.error('Failed to load tailor dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // Status transition handler
  const handleUpdateStatus = async (
    orderId: string,
    newStatus: 'in_stitching' | 'stitching_complete'
  ) => {
    const actionLabel =
      newStatus === 'in_stitching' ? 'Start Stitching' : 'Complete Stitching';
    if (
      !confirm(
        `Are you sure you want to ${actionLabel.toLowerCase()} on this order?`
      )
    )
      return;

    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/tailor/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        toast({
          title: 'Status Updated',
          description: `Order is now marked as ${newStatus.replace(/_/g, ' ')}.`,
        });
        loadDashboard();
      } else {
        const json = await res.json();
        toast({
          title: 'Update Failed',
          description:
            json.error?.message || 'Could not update workshop order status.',
          variant: 'destructive',
        });
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to communicate with workshop service.',
        variant: 'destructive',
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const [currentTimestamp, setCurrentTimestamp] = useState<number>(0);

  useEffect(() => {
    setCurrentTimestamp(Date.now());
  }, []);

  // Helper for SLA Countdown calculation
  const getDeadlineInfo = (deadlineStr?: string) => {
    if (!deadlineStr || !currentTimestamp)
      return { text: 'Active SLA', color: 'text-gray-500', isUrgent: false };
    const deadline = new Date(deadlineStr).getTime();
    const diffHours = (deadline - currentTimestamp) / (1000 * 60 * 60);

    if (diffHours < 0) {
      return {
        text: 'OVERDUE SLA',
        color: 'text-red-700 bg-red-100 border-red-200',
        isUrgent: true,
      };
    }
    if (diffHours < 3) {
      return {
        text: `${Math.round(diffHours * 60)} mins remaining`,
        color: 'text-red-700 bg-red-50 border-red-200',
        isUrgent: true,
      };
    }
    if (diffHours < 24) {
      return {
        text: `${Math.round(diffHours)} hours remaining`,
        color: 'text-amber-700 bg-amber-50 border-amber-200',
        isUrgent: false,
      };
    }
    return {
      text: `${Math.round(diffHours / 24)} days left`,
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      isUrgent: false,
    };
  };

  if (loading || authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500">
        <Loader2 size={36} className="animate-spin text-[#7E153A] mb-3" />
        <p className="text-sm font-semibold">
          Connecting to workshop station...
        </p>
      </div>
    );
  }

  const activeAssignments = orders.filter(
    (o) => o.status === 'assigned' || o.status === 'in_stitching'
  );
  const completedToday = orders.filter(
    (o) =>
      o.status === 'stitching_complete' ||
      o.status === 'qc_pending' ||
      o.status === 'qc_approved' ||
      o.status === 'delivered'
  );

  return (
    <div className="space-y-8">
      {/* Workshop Header & Quality Rating */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-[#7E153A] text-xs font-bold uppercase tracking-wider mb-2">
            <Scissors size={14} /> Master Craftsmanship Station
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Workshop Floor
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Real-time assignment queue, precision measurements, and production
            tracking.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-gradient-to-r from-red-50 to-[#7E153A]/10 p-4 rounded-2xl border border-red-100">
          <div className="w-12 h-12 rounded-xl bg-[#7E153A] text-white flex items-center justify-center font-extrabold text-lg shadow-sm">
            <Star size={24} className="fill-white" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
              Master Quality Score
            </p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-gray-900">
                {dashboardData?.rating || '4.9'}
              </span>
              <span className="text-xs text-gray-400 font-semibold">/ 5.0</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-3">
            <Clock size={20} />
          </div>
          <p className="text-2xl font-black text-gray-900">
            {activeAssignments.length}
          </p>
          <p className="text-xs font-bold text-gray-700 mt-1">
            Active Stitching Queue
          </p>
          <p className="text-[10px] text-gray-400">Underway at table</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-red-50 text-[#7E153A] flex items-center justify-center mb-3">
            <Scissors size={20} />
          </div>
          <p className="text-2xl font-black text-gray-900">
            {orders.filter((o) => o.status === 'in_stitching').length}
          </p>
          <p className="text-xs font-bold text-gray-700 mt-1">On the Machine</p>
          <p className="text-[10px] text-gray-400">Currently cutting/sewing</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
            <CheckCircle2 size={20} />
          </div>
          <p className="text-2xl font-black text-gray-900">
            {completedToday.length}
          </p>
          <p className="text-xs font-bold text-gray-700 mt-1">
            Completed Suits
          </p>
          <p className="text-[10px] text-gray-400">Sent to QC Inspection</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-3">
            <TrendingUp size={20} />
          </div>
          <p className="text-2xl font-black text-gray-900">
            PKR{' '}
            {Number(
              dashboardData?.earnings?.total ||
                completedToday.length * 1500 ||
                0
            ).toLocaleString()}
          </p>
          <p className="text-xs font-bold text-gray-700 mt-1">
            Stitching Earnings
          </p>
          <p className="text-[10px] text-gray-400">This pay cycle</p>
        </div>
      </div>

      {/* Active Production Queue Section */}
      <section id="queue" className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
            <Package size={20} className="text-[#7E153A]" /> Active Production
            Queue ({activeAssignments.length})
          </h2>
          <span className="text-xs text-gray-400 font-semibold">
            Sorted by earliest SLA deadline
          </span>
        </div>

        {activeAssignments.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center shadow-xs">
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 size={28} />
            </div>
            <h3 className="font-extrabold text-base text-gray-900 mb-1">
              Workshop Queue Clear!
            </h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              All assigned garments have been stitched and dispatched to QC. New
              assignments will appear automatically via Realtime.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeAssignments.map((order) => {
              const deadline = getDeadlineInfo(
                order.stitchingDeadline || order.estimatedDeliveryDate
              );
              const isInProgress = order.status === 'in_stitching';
              const product = order.productSnapshot || order.product || {};
              const brand = product.brand || 'Designer Brand';
              const title =
                product.name ||
                `${order.garmentType?.replace(/_/g, ' ').toUpperCase()} Custom Stitch`;
              const imageUrl = product.images?.[0] || '/login_bg.jpg';

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-6"
                >
                  {/* Order Top Bar */}
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div>
                        <span className="font-mono text-xs font-black text-gray-900 block">
                          {order.orderNumber ||
                            order.id.substring(0, 10).toUpperCase()}
                        </span>
                        <span className="text-[10px] font-bold text-[#7E153A] uppercase tracking-wider">
                          {brand}
                        </span>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${deadline.color} flex items-center gap-1 shrink-0`}
                      >
                        <Clock size={11} /> {deadline.text}
                      </span>
                    </div>

                    {/* Garment Preview */}
                    <div className="flex gap-4 items-center bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
                      <div className="w-16 h-20 rounded-xl overflow-hidden bg-gray-200 shrink-0">
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
                      <div className="min-w-0 flex-1">
                        <h4 className="font-extrabold text-sm text-gray-900 leading-snug truncate">
                          {title}
                        </h4>
                        <p className="text-[11px] text-gray-500 capitalize mt-0.5">
                          Type: {order.garmentType?.replace(/_/g, ' ')}
                        </p>
                        <span className="inline-block mt-1 bg-white text-gray-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-gray-200 uppercase">
                          Tier: {order.stitchingTier || 'Standard'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Blueprint & Status Action Buttons */}
                  <div className="border-t border-gray-100 pt-4 flex items-center justify-between gap-3">
                    <Link href={`/tailor/orders/${order.id}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-10 text-xs font-bold border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl cursor-pointer"
                      >
                        <Eye size={14} className="mr-1.5 text-[#7E153A]" /> View
                        Blueprint
                      </Button>
                    </Link>

                    {!isInProgress ? (
                      <Button
                        onClick={() =>
                          handleUpdateStatus(order.id, 'in_stitching')
                        }
                        disabled={updatingId === order.id}
                        className="h-10 text-xs font-bold bg-[#7E153A] hover:bg-[#630f2d] text-white px-5 rounded-xl shadow-md shadow-[#7E153A]/20 cursor-pointer"
                      >
                        {updatingId === order.id ? (
                          <Loader2 size={14} className="animate-spin mr-1.5" />
                        ) : (
                          <Scissors size={14} className="mr-1.5" />
                        )}
                        Start Stitching
                      </Button>
                    ) : (
                      <Button
                        onClick={() =>
                          handleUpdateStatus(order.id, 'stitching_complete')
                        }
                        disabled={updatingId === order.id}
                        className="h-10 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-5 rounded-xl shadow-md shadow-emerald-600/20 cursor-pointer"
                      >
                        {updatingId === order.id ? (
                          <Loader2 size={14} className="animate-spin mr-1.5" />
                        ) : (
                          <CheckCircle2 size={14} className="mr-1.5" />
                        )}
                        Mark Stitched → QC
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
