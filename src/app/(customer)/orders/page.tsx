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
    <div className="max-w-6xl mx-auto space-y-8 py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            My Tailoring Orders
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Track active stitching progress, courier milestones, and past
            completed suits
          </p>
        </div>

        <Link href="/new-order">
          <Button className="bg-[#7E153A] hover:bg-[#630f2d] text-white text-xs font-bold px-5 h-11 shadow-md shadow-[#7E153A]/20">
            <Plus size={16} className="mr-1.5" /> Place New Order
          </Button>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex bg-gray-100 p-1 rounded-xl w-max overflow-x-auto">
          {[
            { key: 'all', label: 'All Orders' },
            { key: 'active', label: 'In Production' },
            { key: 'delivered', label: 'Delivered' },
            { key: 'cancelled', label: 'Cancelled' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilterStatus(tab.key as any)}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                filterStatus === tab.key
                  ? 'bg-white text-[#7E153A] shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <span className="text-xs text-gray-400 font-semibold">
          Showing {filteredOrders.length}{' '}
          {filteredOrders.length === 1 ? 'order' : 'orders'}
        </span>
      </div>

      {/* Content Area */}
      {loading || authLoading ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 flex flex-col items-center justify-center text-center shadow-sm">
          <Loader2 size={32} className="animate-spin text-[#7E153A] mb-3" />
          <p className="text-sm font-medium text-gray-600">
            Loading your orders from database...
          </p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-red-50 text-[#7E153A] flex items-center justify-center mb-4">
            <Package size={32} />
          </div>
          <h3 className="text-base font-bold text-gray-900 mb-1">
            {filterStatus === 'all'
              ? 'No orders placed yet'
              : `No ${filterStatus} orders found`}
          </h3>
          <p className="text-xs text-gray-500 max-w-sm mb-6">
            Paste any unstitched suit product link from your favourite brand and
            get it custom-tailored with doorstep delivery.
          </p>
          <Link href="/new-order">
            <Button className="bg-[#7E153A] hover:bg-[#630f2d] text-white text-xs font-bold px-6 h-10 shadow-sm">
              <Plus size={16} className="mr-1.5" /> Place Your First Order
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
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
              order.garmentType?.replace(/_/g, ' ') ||
              'Custom Tailored Suit';

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
                className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4 mb-4">
                  <div className="flex items-center gap-3">
                    <span className="font-extrabold text-sm text-gray-900 font-mono">
                      {order.orderNumber ||
                        order.id?.substring(0, 12)?.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-300">·</span>
                    <span className="text-xs text-gray-500">
                      Placed on {placedDate}
                    </span>
                  </div>

                  <span
                    className={`w-max px-3 py-1 rounded-full text-xs font-bold border ${statusInfo.color}`}
                  >
                    {statusInfo.label}
                  </span>
                </div>

                <div className="flex gap-4">
                  <div className="w-20 h-24 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-100 relative">
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
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#7E153A]">
                        {brand}
                      </span>
                      <h3 className="font-bold text-gray-900 text-sm truncate">
                        {productTitle}
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5 capitalize">
                        {order.garmentType?.replace(/_/g, ' ') ||
                          'Custom Stitching'}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-base font-extrabold text-[#7E153A]">
                        PKR {Number(order.totalAmount || 0).toLocaleString()}
                      </span>

                      <Link href={`/orders/${order.id}`}>
                        <Button
                          variant="outline"
                          className="h-9 text-xs font-semibold border-red-100 text-[#7E153A] hover:bg-red-50 cursor-pointer"
                        >
                          <Eye size={14} className="mr-1.5" /> View & Track
                          Order
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
