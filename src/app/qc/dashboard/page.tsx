'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  Scissors,
  ArrowRight,
  ShieldCheck,
  Package,
  Loader2,
  XCircle,
  HelpCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

export default function QCDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [pendingOrders, setPendingOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPending = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/qc/pending');
      if (res.ok) {
        const json = await res.json();
        const list = Array.isArray(json.data)
          ? json.data
          : Array.isArray(json)
            ? json
            : [];
        setPendingOrders(list);
      }
    } catch (err) {
      console.error('Failed to load pending QC list:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPending();
  }, [loadPending]);

  if (loading || authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 size={36} className="animate-spin text-purple-700 mb-3" />
        <p className="text-sm font-semibold text-gray-600">
          Loading QA inspection queue...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles size={14} /> Quality Assurance & Compliance Station
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Inspection Queue
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Perform precision measurement audits and photo verification before
            courier dispatch.
          </p>
        </div>

        <div className="bg-purple-50 border border-purple-100 p-4 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-700 text-white flex items-center justify-center font-black text-xl shadow-xs">
            {pendingOrders.length}
          </div>
          <div>
            <p className="text-xs font-bold text-gray-900">
              Garments Awaiting QC
            </p>
            <p className="text-[11px] text-gray-500">
              Ready for physical audit
            </p>
          </div>
        </div>
      </div>

      {/* Pending Garments List */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
            <ShieldCheck size={20} className="text-purple-700" /> Pending Audits
            ({pendingOrders.length})
          </h2>
          <Button
            onClick={() => loadPending()}
            variant="outline"
            size="sm"
            className="h-8 text-xs font-bold rounded-lg cursor-pointer"
          >
            Refresh Queue
          </Button>
        </div>

        {pendingOrders.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center shadow-xs">
            <div className="w-14 h-14 rounded-full bg-purple-50 text-purple-700 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 size={28} />
            </div>
            <h3 className="font-extrabold text-base text-gray-900 mb-1">
              All QC Inspections Complete!
            </h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              There are currently no garments waiting for audit. As soon as a
              master tailor marks a suit complete, it will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingOrders.map((order) => {
              const tailorName = order.assignedTailor
                ? `${order.assignedTailor.firstName} ${order.assignedTailor.lastName || ''}`.trim()
                : 'Workshop Master';

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-6"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-mono text-xs font-black text-gray-900 block">
                        {order.orderNumber ||
                          order.id.substring(0, 10).toUpperCase()}
                      </span>
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 uppercase tracking-wider">
                        Stitching Complete
                      </span>
                    </div>

                    <h4 className="font-extrabold text-sm text-gray-900 capitalize">
                      {order.garmentType?.replace(/_/g, ' ') ||
                        'Custom Tailored Suit'}
                    </h4>

                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 space-y-1 text-xs">
                      <p className="text-gray-500 flex items-center justify-between">
                        <span>Stitched By:</span>
                        <span className="font-bold text-gray-800">
                          {tailorName}
                        </span>
                      </p>
                      <p className="text-gray-500 flex items-center justify-between">
                        <span>Priority Level:</span>
                        <span className="font-bold text-purple-700 uppercase">
                          {order.priorityLevel || 'Normal'}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-4">
                    <Link href={`/qc/inspect/${order.id}`}>
                      <Button className="w-full h-11 text-xs font-bold bg-purple-700 hover:bg-purple-800 text-white rounded-xl shadow-md shadow-purple-700/20 cursor-pointer">
                        <Sparkles size={14} className="mr-1.5" /> Start Physical
                        Audit
                      </Button>
                    </Link>
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
