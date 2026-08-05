'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  Truck,
  Scissors,
  Sparkles,
  ChevronRight,
  Eye,
  Plus,
  Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const ALL_ORDERS = [
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
  },
  {
    id: 'ORD-20240710-007',
    productTitle: 'Zara Shahjahan Coco Vol-3',
    brand: 'Zara Shahjahan',
    stitchingType: 'Standard Stitching',
    totalAmount: 6400,
    status: 'delivered',
    statusLabel: 'Delivered',
    placedOn: 'Jul 10, 2026',
    deliveredOn: 'Jul 18, 2026',
    imageUrl: '/login_bg.jpg',
    progress: 100,
  },
  {
    id: 'ORD-20240701-002',
    productTitle: 'Khaadi Lawn Summer 3pc',
    brand: 'Khaadi',
    stitchingType: 'Premium Stitching',
    totalAmount: 7100,
    status: 'delivered',
    statusLabel: 'Delivered',
    placedOn: 'Jul 01, 2026',
    deliveredOn: 'Jul 08, 2026',
    imageUrl: '/login_bg.jpg',
    progress: 100,
  },
];

export default function MyOrdersPage() {
  const [filterStatus, setFilterStatus] = useState<
    'all' | 'active' | 'delivered'
  >('all');

  const filteredOrders = ALL_ORDERS.filter((o) => {
    if (filterStatus === 'active') return o.status !== 'delivered';
    if (filterStatus === 'delivered') return o.status === 'delivered';
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
            Track active stitching progress & view past orders
          </p>
        </div>

        <Link href="/new-order">
          <Button className="bg-[#7E153A] hover:bg-[#630f2d] text-white text-xs font-bold px-5 h-11 shadow-md">
            <Plus size={16} className="mr-1.5" /> Place New Order
          </Button>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex bg-gray-100 p-1 rounded-xl w-max">
          {[
            { key: 'all', label: 'All Orders' },
            { key: 'active', label: 'Active in Production' },
            { key: 'delivered', label: 'Delivered' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilterStatus(tab.key as any)}
              className={`px-5 py-2 text-xs font-bold rounded-lg transition-all ${
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
          Showing {filteredOrders.length} orders
        </span>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <div
            key={order.id}
            className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <span className="font-extrabold text-sm text-gray-900">
                  {order.id}
                </span>
                <span className="text-xs text-gray-400">·</span>
                <span className="text-xs text-gray-500">
                  Placed on {order.placedOn}
                </span>
              </div>

              <span
                className={`w-max px-3 py-1 rounded-full text-xs font-bold ${
                  order.status === 'delivered'
                    ? 'bg-green-50 text-green-700'
                    : 'bg-red-50 text-[#7E153A]'
                }`}
              >
                {order.statusLabel}
              </span>
            </div>

            <div className="flex gap-4">
              <div className="w-20 h-24 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-100">
                <img
                  src={order.imageUrl}
                  alt={order.productTitle}
                  className="object-cover w-full h-full"
                />
              </div>

              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#7E153A]">
                    {order.brand}
                  </span>
                  <h3 className="font-bold text-gray-900 text-sm">
                    {order.productTitle}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {order.stitchingType}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-base font-extrabold text-[#7E153A]">
                    PKR {order.totalAmount.toLocaleString()}
                  </span>

                  <Link href={`/orders/${order.id}`}>
                    <Button
                      variant="outline"
                      className="h-9 text-xs font-semibold border-red-100 text-[#7E153A] hover:bg-red-50"
                    >
                      <Eye size={14} className="mr-1.5" /> View & Track Order
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
