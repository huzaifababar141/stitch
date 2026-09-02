'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Truck,
  MapPin,
  Phone,
  CheckCircle2,
  Navigation,
  Clock,
  Package,
  Camera,
  Loader2,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export default function DeliveryDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadDeliveries = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(
        '/api/admin/orders?status=dispatched,in_transit,out_for_delivery&limit=25'
      );
      if (res.ok) {
        const json = await res.json();
        const list = Array.isArray(json.data?.orders)
          ? json.data.orders
          : Array.isArray(json.orders)
            ? json.orders
            : [];
        setDeliveries(list);
      }
    } catch (err) {
      console.error('Failed to load delivery runs:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDeliveries();
  }, [loadDeliveries]);

  const handleUpdateDeliveryStatus = async (
    orderId: string,
    status: string
  ) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/delivery/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        toast({
          title: 'Delivery Status Updated',
          description: `Order marked as ${status.replace(/_/g, ' ')}.`,
        });
        loadDeliveries();
      } else {
        const json = await res.json();
        toast({
          title: 'Update Failed',
          description:
            json.error?.message || 'Could not update delivery status.',
          variant: 'destructive',
        });
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to update courier status.',
        variant: 'destructive',
      });
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 size={36} className="animate-spin text-emerald-700 mb-3" />
        <p className="text-sm font-semibold text-gray-600">
          Loading courier delivery runs...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-2">
            <Truck size={14} /> TCS Express & Doorstep Logistics
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Active Delivery Runs
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Doorstep parcel dispatch, customer verification, and Proof of
            Delivery (POD).
          </p>
        </div>

        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-black text-xl shadow-xs">
            {deliveries.length}
          </div>
          <div>
            <p className="text-xs font-bold text-gray-900">Parcels on Route</p>
            <p className="text-[11px] text-gray-500">
              Awaiting doorstep handover
            </p>
          </div>
        </div>
      </div>

      {/* Deliveries List */}
      <section className="space-y-4">
        <h2 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
          <Package size={20} className="text-emerald-700" /> Dispatched Packages
          ({deliveries.length})
        </h2>

        {deliveries.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center shadow-xs">
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 size={28} />
            </div>
            <h3 className="font-extrabold text-base text-gray-900 mb-1">
              All Packages Delivered!
            </h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              No pending deliveries right now. New dispatch consignments will
              appear here automatically.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {deliveries.map((order) => {
              const address = order.deliveryAddressSnapshot || {};
              const customerName =
                address.fullName || order.customer?.firstName || 'Customer';
              const phone =
                address.phone || order.customer?.phone || '0300-0000000';
              const city = address.city || 'Lahore';
              const trackingNumber =
                order.delivery?.trackingNumber ||
                order.trackingNumber ||
                `TCS-${order.id.substring(0, 8).toUpperCase()}`;

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-6"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-mono text-xs font-black text-gray-900 block">
                          {order.orderNumber ||
                            order.id.substring(0, 10).toUpperCase()}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                          TCS Track: {trackingNumber}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
                        {order.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    {/* Address & Contact Box */}
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-2 text-xs">
                      <div className="flex items-center gap-2 text-gray-900 font-bold">
                        <MapPin
                          size={15}
                          className="text-emerald-700 shrink-0"
                        />
                        <span>
                          {customerName} · {city}
                        </span>
                      </div>
                      <p className="text-gray-600 pl-6 leading-relaxed">
                        {address.addressLine1 || 'Main Boulevard, Gulberg III'},{' '}
                        {address.province || 'Punjab'}
                      </p>
                      <div className="pl-6 pt-1 flex items-center gap-3">
                        <a
                          href={`tel:${phone}`}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:underline bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200"
                        >
                          <Phone size={12} /> Call: {phone}
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="border-t border-gray-100 pt-4 flex flex-wrap items-center justify-between gap-3">
                    <Button
                      onClick={() =>
                        handleUpdateDeliveryStatus(order.id, 'out_for_delivery')
                      }
                      disabled={
                        updatingId === order.id ||
                        order.status === 'out_for_delivery'
                      }
                      variant="outline"
                      size="sm"
                      className="h-10 text-xs font-bold border-gray-200 text-gray-700 rounded-xl cursor-pointer"
                    >
                      <Navigation
                        size={14}
                        className="mr-1.5 text-emerald-700"
                      />{' '}
                      Out for Delivery
                    </Button>

                    <Button
                      onClick={() =>
                        handleUpdateDeliveryStatus(order.id, 'delivered')
                      }
                      disabled={updatingId === order.id}
                      className="h-10 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white px-5 rounded-xl shadow-md shadow-emerald-700/20 cursor-pointer"
                    >
                      {updatingId === order.id ? (
                        <Loader2 size={14} className="animate-spin mr-1.5" />
                      ) : (
                        <CheckCircle2 size={14} className="mr-1.5" />
                      )}
                      Mark Handed Over (Delivered)
                    </Button>
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
