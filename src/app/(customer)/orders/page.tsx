'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  Truck,
  Scissors,
  Sparkles,
  Eye,
  Plus,
  Loader2,
  AlertCircle,
  Package,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

export default function MyOrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<
    'all' | 'active' | 'delivered' | 'cancelled'
  >('all');

  useEffect(() => {
    async function fetchOrders() {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch('/api/orders?limit=50');
        if (res.ok) {
          const json = await res.json();
          const list = Array.isArray(json.data?.orders)
            ? json.data.orders
            : Array.isArray(json.data)
              ? json.data
              : Array.isArray(json.orders)
                ? json.orders
                : [];
          setOrders(list);
        }
      } catch (err) {
        console.error('Failed to fetch customer orders:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [user]);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending_payment':
        return {
          label: 'Payment Pending',
          color: 'bg-amber-50 text-amber-700 border-amber-200',
        };
      case 'payment_confirmed':
        return {
          label: 'Payment Confirmed',
          color: 'bg-blue-50 text-blue-700 border-blue-200',
        };
      case 'assigned':
        return {
          label: 'Assigned to Tailor',
          color: 'bg-purple-50 text-purple-700 border-purple-200',
        };
      case 'in_stitching':
        return {
          label: 'In Stitching',
          color: 'bg-red-50 text-[#7E153A] border-red-200',
        };
      case 'stitching_complete':
        return {
          label: 'Stitching Complete',
          color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        };
      case 'qc_pending':
        return {
          label: 'QC Inspection',
          color: 'bg-orange-50 text-orange-700 border-orange-200',
        };
      case 'qc_approved':
        return {
          label: 'QC Approved',
          color: 'bg-teal-50 text-teal-700 border-teal-200',
        };
      case 'dispatched':
      case 'in_transit':
      case 'out_for_delivery':
        return {
          label: 'Out for Delivery',
          color: 'bg-sky-50 text-sky-700 border-sky-200',
        };
      case 'delivered':
        return {
          label: 'Delivered',
          color: 'bg-green-50 text-green-700 border-green-200',
        };
      case 'cancelled':
      case 'refunded':
        return {
          label: 'Cancelled',
          color: 'bg-gray-100 text-gray-600 border-gray-200',
        };
      default:
        return {
          label: status?.replace(/_/g, ' ') || 'Processing',
          color: 'bg-gray-50 text-gray-700 border-gray-200',
        };
    }
  };

  const safeOrders = Array.isArray(orders) ? orders : [];

  const counts = {
    all: safeOrders.length,
    active: safeOrders.filter(
      (o) =>
        o.status !== 'delivered' &&
        o.status !== 'cancelled' &&
        o.status !== 'refunded'
    ).length,
    delivered: safeOrders.filter((o) => o.status === 'delivered').length,
    cancelled: safeOrders.filter(
      (o) => o.status === 'cancelled' || o.status === 'refunded'
    ).length,
  };

  const filteredOrders = safeOrders.filter((o) => {
    if (filterStatus === 'active') {
      return (
        o.status !== 'delivered' &&
        o.status !== 'cancelled' &&
        o.status !== 'refunded'
      );
    }
    if (filterStatus === 'delivered') {
      return o.status === 'delivered';
    }
    if (filterStatus === 'cancelled') {
      return o.status === 'cancelled' || o.status === 'refunded';
    }
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-3.5 sm:space-y-6 py-1 sm:py-2 min-w-0 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-xs min-w-0 w-full">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
            My Tailoring Orders
          </h1>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
            Track active stitching progress, courier milestones, and past
            completed suits
          </p>
        </div>

        <Link href="/new-order" className="w-full sm:w-auto shrink-0">
          <Button className="w-full sm:w-auto bg-[#7E153A] hover:bg-[#630f2d] text-white text-xs font-bold px-5 h-10 sm:h-11 shadow-md shadow-[#7E153A]/20 cursor-pointer">
            <Plus size={16} className="mr-1.5" /> Place New Order
          </Button>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 min-w-0 w-full">
        <div className="min-w-0 w-full sm:w-auto overflow-x-auto scrollbar-none pb-1">
          <div className="inline-flex bg-gray-100 p-1 rounded-xl gap-1 shrink-0">
            {[
              { key: 'all', label: 'All Orders', count: counts.all },
              { key: 'active', label: 'In Production', count: counts.active },
              { key: 'delivered', label: 'Delivered', count: counts.delivered },
              { key: 'cancelled', label: 'Cancelled', count: counts.cancelled },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilterStatus(tab.key as any)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  filterStatus === tab.key
                    ? 'bg-white text-[#7E153A] shadow-xs'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    filterStatus === tab.key
                      ? 'bg-red-50 text-[#7E153A]'
                      : 'bg-gray-200/70 text-gray-500'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        <span className="text-[11px] sm:text-xs text-gray-400 font-semibold px-1 shrink-0">
          Showing {filteredOrders.length}{' '}
          {filteredOrders.length === 1 ? 'order' : 'orders'}
        </span>
      </div>

      {/* Content Area */}
      {loading || authLoading ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 sm:p-16 flex flex-col items-center justify-center text-center shadow-xs min-w-0 w-full">
          <Loader2 size={32} className="animate-spin text-[#7E153A] mb-3" />
          <p className="text-xs sm:text-sm font-medium text-gray-600">
            Loading your orders from database...
          </p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 sm:p-12 flex flex-col items-center justify-center text-center shadow-xs min-w-0 w-full">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-red-50 text-[#7E153A] flex items-center justify-center mb-3 sm:mb-4">
            <Package size={28} className="sm:w-8 sm:h-8" />
          </div>
          <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-1">
            {filterStatus === 'all'
              ? 'No orders placed yet'
              : `No ${filterStatus} orders found`}
          </h3>
          <p className="text-xs text-gray-500 max-w-sm mb-5 leading-relaxed">
            Paste any unstitched suit product link from your favourite brand and
            get it custom-tailored with doorstep delivery.
          </p>
          <Link href="/new-order" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto bg-[#7E153A] hover:bg-[#630f2d] text-white text-xs font-bold px-6 h-10 shadow-xs cursor-pointer">
              <Plus size={16} className="mr-1.5" /> Place Your First Order
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4 min-w-0 w-full">
          {filteredOrders.map((order) => {
            const statusInfo = getStatusInfo(order.status);
            const placedDate = order.createdAt
              ? new Date(order.createdAt).toLocaleDateString('en-PK', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })
              : 'Recently';

            const productTitle =
              order.productSnapshot?.name ||
              order.product?.name ||
              `${order.garmentType?.replace(/_/g, ' ') || 'Custom'} Tailored Suit`;

            const brand =
              order.productSnapshot?.brand ||
              order.product?.brand ||
              'Designer Suit';

            const imageUrl =
              order.productSnapshot?.images?.[0] ||
              order.product?.images?.[0] ||
              '/login_bg.jpg';

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-gray-100 p-3.5 sm:p-5 shadow-xs hover:shadow-md transition-shadow min-w-0 w-full"
              >
                {/* Order Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3 mb-3 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 text-xs min-w-0">
                    <span className="font-extrabold text-gray-900 font-mono text-[11px] sm:text-xs">
                      {order.orderNumber ||
                        order.id?.substring(0, 12)?.toUpperCase()}
                    </span>
                    <span className="text-gray-300">·</span>
                    <span className="text-gray-500 text-[10px] sm:text-xs">
                      Placed on {placedDate}
                    </span>
                  </div>

                  <span
                    className={`w-fit px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold border shrink-0 ${statusInfo.color}`}
                  >
                    {statusInfo.label}
                  </span>
                </div>

                {/* Main Card Content */}
                <div className="flex gap-3 sm:gap-4 min-w-0">
                  <div className="w-16 h-20 sm:w-20 sm:h-24 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-100 relative">
                    <img
                      src={imageUrl}
                      alt={productTitle}
                      className="object-cover w-full h-full"
                      onError={(e: any) => {
                        e.currentTarget.src =
                          'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=300&auto=format&fit=crop&q=60';
                      }}
                    />
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#7E153A] block truncate">
                        {brand}
                      </span>
                      <h3 className="font-bold text-gray-900 text-xs sm:text-sm truncate">
                        {productTitle}
                      </h3>
                      <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5 capitalize truncate">
                        {order.garmentType?.replace(/_/g, ' ') ||
                          'Custom Stitching'}
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t sm:border-t-0 border-gray-50 mt-2 sm:mt-0 min-w-0">
                      <span className="text-xs sm:text-base font-extrabold text-[#7E153A] font-mono shrink-0">
                        PKR {Number(order.totalAmount || 0).toLocaleString()}
                      </span>

                      <Link
                        href={`/orders/${order.id}`}
                        className="w-full sm:w-auto shrink-0"
                      >
                        <Button
                          variant="outline"
                          className="w-full sm:w-auto h-8 sm:h-9 text-xs font-semibold border-red-100 text-[#7E153A] hover:bg-red-50 cursor-pointer"
                        >
                          <Eye size={14} className="mr-1.5" /> View & Track
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
