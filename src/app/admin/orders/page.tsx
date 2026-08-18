'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  Scissors,
  Truck,
  Sparkles,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
  UserCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const ALL_ADMIN_ORDERS = [
  {
    id: 'ORD-20240805-012',
    customerName: 'Ayesha Malik',
    phone: '+92 300 9876543',
    brand: 'Maria.B Lawn 3pc',
    tier: 'Luxury Stitching',
    totalPrice: 9500,
    status: 'unassigned',
    statusLabel: 'Pending Tailor',
    placedDate: 'Aug 05, 2026',
    tailor: 'Unassigned',
  },
  {
    id: 'ORD-20240801-001',
    customerName: 'Sarah Khan',
    phone: '+92 300 1234567',
    brand: 'Sana Safinaz Mahay',
    tier: 'Premium Stitching',
    totalPrice: 7850,
    status: 'in_stitching',
    statusLabel: 'In Stitching',
    placedDate: 'Aug 01, 2026',
    tailor: 'Master Zubair Ahmad',
  },
  {
    id: 'ORD-20240729-003',
    customerName: 'Fatima Ali',
    phone: '+92 321 4455667',
    brand: 'Sapphire Chiffon 2pc',
    tier: 'Luxury Stitching',
    totalPrice: 9200,
    status: 'quality_check',
    statusLabel: 'QC Inspection',
    placedDate: 'Jul 29, 2026',
    tailor: 'Master Rashid',
  },
  {
    id: 'ORD-20240728-005',
    customerName: 'Zainab Ahmed',
    phone: '+92 333 8899001',
    brand: 'Khaadi Summer Lawn',
    tier: 'Standard Stitching',
    totalPrice: 6500,
    status: 'dispatched',
    statusLabel: 'Dispatched via TCS',
    placedDate: 'Jul 28, 2026',
    tailor: 'Master Farhan',
  },
];

export default function AdminOrdersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredOrders = ALL_ADMIN_ORDERS.filter((o) => {
    const matchesSearch =
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.brand.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterStatus === 'all') return matchesSearch;
    return matchesSearch && o.status === filterStatus;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl border border-gray-100 p-6 shadow-xs">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Orders Management
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Full central control over customer custom tailoring orders
          </p>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search by Order ID, Customer, or Brand..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-10 pr-4 rounded-xl bg-white border border-gray-200 text-xs text-gray-900 focus:outline-none focus:border-[#7E153A]"
          />
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={16}
          />
        </div>

        <div className="flex bg-gray-100 p-1 rounded-xl w-max overflow-x-auto">
          {[
            { key: 'all', label: 'All Orders' },
            { key: 'unassigned', label: 'Pending Tailor' },
            { key: 'in_stitching', label: 'In Stitching' },
            { key: 'quality_check', label: 'QC Inspection' },
            { key: 'dispatched', label: 'Dispatched' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilterStatus(tab.key)}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                filterStatus === tab.key
                  ? 'bg-white text-[#7E153A] shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/80 text-gray-700 font-semibold border-b border-gray-200">
              <tr>
                <th className="p-4">Order ID & Date</th>
                <th className="p-4">Customer Details</th>
                <th className="p-4">Suit & Stitching Tier</th>
                <th className="p-4">Assigned Tailor</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {filteredOrders.map((o) => (
                <tr key={o.id} className="hover:bg-red-50/20 transition-colors">
                  <td className="p-4">
                    <span className="font-extrabold text-gray-900 block">
                      {o.id}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {o.placedDate}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="font-bold text-gray-900 block">
                      {o.customerName}
                    </span>
                    <span className="text-[10px] text-gray-400">{o.phone}</span>
                  </td>
                  <td className="p-4">
                    <span className="font-bold text-gray-900 block">
                      {o.brand}
                    </span>
                    <span className="text-[10px] text-[#7E153A] font-semibold">
                      {o.tier} · PKR {o.totalPrice.toLocaleString()}
                    </span>
                  </td>
                  <td className="p-4 font-semibold text-gray-800">
                    {o.tailor}
                  </td>
                  <td className="p-4">
                    <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-red-50 text-[#7E153A]">
                      {o.statusLabel}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <Link href={`/orders/${o.id}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs font-semibold"
                      >
                        <Eye size={13} className="mr-1" /> View Details
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
