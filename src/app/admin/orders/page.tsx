'use client';

import { useState, useEffect, useCallback } from 'react';
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
  Loader2,
  RefreshCw,
  X,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function AdminOrdersPage() {
  const { toast } = useToast();

  const [orders, setOrders] = useState<any[]>([]);
  const [tailors, setTailors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [assigningOrderId, setAssigningOrderId] = useState<string | null>(null);
  const [selectedTailorId, setSelectedTailorId] = useState('');
  const [submittingAssign, setSubmittingAssign] = useState(false);

  const loadOrders = useCallback(async () => {
    try {
      const [ordersRes, tailorsRes] = await Promise.all([
        fetch('/api/admin/orders?limit=50').catch(() => null),
        fetch('/api/admin/tailors').catch(() => null),
      ]);

      if (ordersRes && ordersRes.ok) {
        const oJson = await ordersRes.json();
        setOrders(oJson.data?.orders || oJson.data || oJson || []);
      }

      if (tailorsRes && tailorsRes.ok) {
        const tJson = await tailorsRes.json();
        setTailors(tJson.data || tJson || []);
      }
    } catch (err) {
      console.error('Failed to load admin orders:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleRefresh = async () => {
    setLoading(true);
    await loadOrders();
  };

  const handleAssign = async () => {
    if (!assigningOrderId || !selectedTailorId) return;
    setSubmittingAssign(true);
    try {
      const res = await fetch(`/api/admin/orders/${assigningOrderId}/assign`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tailorId: selectedTailorId }),
      });

      if (res.ok) {
        toast({
          title: 'Tailor Assigned',
          description: 'Order allocated to master tailor successfully.',
        });
        setAssigningOrderId(null);
        setSelectedTailorId('');
        loadOrders();
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
    } finally {
      setSubmittingAssign(false);
    }
  };

  const safeOrders = Array.isArray(orders) ? orders : [];
  const safeTailors = Array.isArray(tailors) ? tailors : [];

  const filteredOrders = safeOrders.filter((o) => {
    const orderNum = o.orderNumber || o.id || '';
    const custName = o.customer?.firstName
      ? `${o.customer.firstName} ${o.customer.lastName || ''}`
      : o.deliveryAddressSnapshot?.fullName || '';
    const brand = o.productSnapshot?.brand || o.product?.brand || '';

    const matchesSearch =
      orderNum.toLowerCase().includes(searchQuery.toLowerCase()) ||
      custName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      brand.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterStatus === 'all') return matchesSearch;
    return matchesSearch && o.status === filterStatus;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl border border-gray-100 p-6 shadow-xs">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Orders Management
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Central live command over custom tailoring orders, tailoring
            allocation & courier dispatch
          </p>
        </div>

        <Button
          onClick={handleRefresh}
          variant="outline"
          className="h-10 text-xs font-bold border-gray-200 text-gray-700 hover:bg-gray-50 cursor-pointer"
        >
          <RefreshCw
            size={14}
            className={`mr-1.5 ${loading ? 'animate-spin' : ''}`}
          />{' '}
          Refresh Orders
        </Button>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search by order ID, customer name, brand..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-hidden focus:border-[#7E153A] shadow-xs"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex bg-gray-100 p-1 rounded-xl w-max overflow-x-auto">
          {[
            { key: 'all', label: 'All Orders' },
            { key: 'pending_payment', label: 'Payment Pending' },
            { key: 'assigned', label: 'Assigned' },
            { key: 'in_stitching', label: 'In Stitching' },
            { key: 'qc_pending', label: 'QC Pending' },
            { key: 'delivered', label: 'Delivered' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilterStatus(tab.key)}
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
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center text-center">
            <Loader2 size={32} className="animate-spin text-[#7E153A] mb-3" />
            <p className="text-xs text-gray-500">Loading database records...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-16 text-center text-gray-500 text-xs">
            No orders found matching the selected filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/75 border-b border-gray-100 text-gray-500 font-extrabold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-4 px-6">Order ID</th>
                  <th className="py-4 px-6">Customer</th>
                  <th className="py-4 px-6">Garment & Brand</th>
                  <th className="py-4 px-6">Total Amount</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Assigned Tailor</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {filteredOrders.map((order) => {
                  const customerName = order.customer?.firstName
                    ? `${order.customer.firstName} ${order.customer.lastName || ''}`.trim()
                    : order.deliveryAddressSnapshot?.fullName || 'Customer';

                  const brand =
                    order.productSnapshot?.brand ||
                    order.product?.brand ||
                    'Designer Brand';

                  const isAssigned = !!order.assignedTailorId;

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="py-4 px-6 font-mono font-bold text-gray-900">
                        {order.orderNumber ||
                          order.id?.substring(0, 10)?.toUpperCase()}
                      </td>

                      <td className="py-4 px-6 font-semibold text-gray-900">
                        {customerName}
                      </td>

                      <td className="py-4 px-6">
                        <span className="font-bold text-gray-900 block capitalize">
                          {order.garmentType?.replace(/_/g, ' ') ||
                            'Custom Suit'}
                        </span>
                        <span className="text-[10px] text-[#7E153A] font-bold uppercase tracking-wider">
                          {brand}
                        </span>
                      </td>

                      <td className="py-4 px-6 font-bold text-gray-900 font-mono">
                        PKR {Number(order.totalAmount || 0).toLocaleString()}
                      </td>

                      <td className="py-4 px-6">
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-gray-100 text-gray-800 border border-gray-200">
                          {order.status?.replace(/_/g, ' ')}
                        </span>
                      </td>

                      <td className="py-4 px-6">
                        {isAssigned ? (
                          <span className="text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-sm text-[11px]">
                            Allocated
                          </span>
                        ) : (
                          <Button
                            onClick={() => setAssigningOrderId(order.id)}
                            size="sm"
                            className="h-7 text-[10px] font-bold bg-[#7E153A] hover:bg-[#630f2d] text-white px-2.5 cursor-pointer"
                          >
                            <UserCheck size={11} className="mr-1" /> Assign
                          </Button>
                        )}
                      </td>

                      <td className="py-4 px-6 text-right">
                        <Link href={`/orders/${order.id}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-xs font-semibold text-[#7E153A] hover:bg-red-50 cursor-pointer"
                          >
                            <Eye size={14} className="mr-1" /> View
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Tailor Assignment Modal */}
      {assigningOrderId && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="font-extrabold text-base text-gray-900">
                  Assign Master Tailor
                </h3>
                <p className="text-xs text-gray-500 font-mono mt-0.5">
                  {assigningOrderId}
                </p>
              </div>
              <button
                onClick={() => setAssigningOrderId(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {safeTailors.map((tailor) => {
                const isSelected = selectedTailorId === tailor.id;
                const isFull =
                  tailor.currentActiveOrders >= (tailor.maxCapacity || 5);

                return (
                  <div
                    key={tailor.id}
                    onClick={() => !isFull && setSelectedTailorId(tailor.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isFull
                        ? 'bg-gray-50 border-gray-100 opacity-60 cursor-not-allowed'
                        : isSelected
                          ? 'border-[#7E153A] bg-red-50/50 ring-2 ring-[#7E153A]/20'
                          : 'border-gray-100 hover:border-gray-200 bg-white'
                    }`}
                  >
                    <div>
                      <h4 className="font-bold text-sm text-gray-900">
                        {tailor.fullName ||
                          tailor.name ||
                          `Tailor #${tailor.id.substring(0, 6)}`}
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {tailor.specialization?.join(', ') ||
                          'Custom Stitching Specialist'}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-1">
                        Active: {tailor.currentActiveOrders || 0} /{' '}
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

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setAssigningOrderId(null)}
                className="flex-1 rounded-xl h-11 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                disabled={!selectedTailorId || submittingAssign}
                onClick={handleAssign}
                className="flex-1 rounded-xl h-11 text-xs font-bold bg-[#7E153A] hover:bg-[#630f2d] text-white shadow-md shadow-[#7E153A]/20 cursor-pointer"
              >
                {submittingAssign ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  'Confirm Assignment'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
