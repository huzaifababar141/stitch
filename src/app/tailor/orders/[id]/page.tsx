'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Scissors,
  Ruler,
  CheckCircle2,
  Clock,
  ExternalLink,
  Loader2,
  AlertCircle,
  Sparkles,
  FileText,
  User,
  ShieldCheck,
  Printer,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function TailorOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const orderId = (params?.id as string) || '';
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    async function fetchDetail() {
      if (!orderId) return;
      try {
        const res = await fetch(`/api/tailor/orders/${orderId}`);
        if (res.ok) {
          const json = await res.json();
          setOrder(json.data || json);
        } else {
          toast({
            title: 'Order Not Found',
            description: 'Could not load order specifications from workshop.',
            variant: 'destructive',
          });
        }
      } catch (err) {
        console.error('Failed to load tailor order detail:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchDetail();
  }, [orderId, toast]);

  const handleUpdateStatus = async (
    newStatus: 'in_stitching' | 'stitching_complete'
  ) => {
    const actionLabel =
      newStatus === 'in_stitching'
        ? 'Start Stitching'
        : 'Complete & Send to QC';
    if (
      !confirm(
        `Are you sure you want to ${actionLabel.toLowerCase()} for this order?`
      )
    )
      return;

    setUpdating(true);
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
        if (newStatus === 'stitching_complete') {
          router.push('/tailor/dashboard');
        } else {
          setOrder((prev: any) => ({ ...prev, status: newStatus }));
        }
      } else {
        const json = await res.json();
        toast({
          title: 'Update Failed',
          description: json.error?.message || 'Failed to update order status.',
          variant: 'destructive',
        });
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to update status.',
        variant: 'destructive',
      });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 size={36} className="animate-spin text-[#7E153A] mb-3" />
        <p className="text-sm font-semibold text-gray-600">
          Loading measurement blueprint...
        </p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center">
        <AlertCircle size={36} className="text-red-500 mx-auto mb-3" />
        <h2 className="text-base font-extrabold text-gray-900">
          Order Not Found
        </h2>
        <p className="text-xs text-gray-500 mb-6">
          The requested workshop order #{orderId} could not be located.
        </p>
        <Link href="/tailor/dashboard">
          <Button className="bg-[#7E153A] text-white text-xs font-bold px-6 rounded-xl">
            <ArrowLeft size={14} className="mr-1.5" /> Back to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  const measurements = order.measurementSnapshot || {};
  const style = order.styleSnapshot || {};
  const product = order.productSnapshot || order.product || {};
  const isInStitching = order.status === 'in_stitching';
  const isComplete =
    order.status === 'stitching_complete' ||
    order.status === 'qc_pending' ||
    order.status === 'qc_approved';

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Top Bar Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl border border-gray-100 p-6 shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href="/tailor/dashboard"
            className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-gray-900 font-mono">
                {order.orderNumber || order.id.substring(0, 10).toUpperCase()}
              </h1>
              <span className="bg-red-50 text-[#7E153A] text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                {order.status.replace(/_/g, ' ')}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Customer: {order.customer?.firstName || 'Valued Customer'} · Tier:{' '}
              <span className="font-bold text-gray-800 uppercase">
                {order.stitchingTier || 'Standard'}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => window.print()}
            variant="outline"
            className="h-10 text-xs font-bold border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl cursor-pointer"
          >
            <Printer size={15} className="mr-1.5" /> Print Blueprint
          </Button>

          {!isInStitching && !isComplete && (
            <Button
              onClick={() => handleUpdateStatus('in_stitching')}
              disabled={updating}
              className="h-10 text-xs font-bold bg-[#7E153A] hover:bg-[#630f2d] text-white px-6 rounded-xl shadow-md shadow-[#7E153A]/20 cursor-pointer"
            >
              {updating ? (
                <Loader2 size={15} className="animate-spin mr-1.5" />
              ) : (
                <Scissors size={15} className="mr-1.5" />
              )}
              Start Cutting & Sewing
            </Button>
          )}

          {isInStitching && (
            <Button
              onClick={() => handleUpdateStatus('stitching_complete')}
              disabled={updating}
              className="h-10 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-6 rounded-xl shadow-md shadow-emerald-600/20 cursor-pointer"
            >
              {updating ? (
                <Loader2 size={15} className="animate-spin mr-1.5" />
              ) : (
                <CheckCircle2 size={15} className="mr-1.5" />
              )}
              Mark Complete → Send to QC
            </Button>
          )}
        </div>
      </div>

      {/* Grid: Garment Snapshot + Style Preferences */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Garment Details Card */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
            <FileText size={16} className="text-[#7E153A]" /> Suit Reference
          </h3>

          <div className="w-full aspect-[4/5] rounded-2xl overflow-hidden bg-gray-100 border border-gray-100 relative">
            <img
              src={product.images?.[0] || '/login_bg.jpg'}
              alt="Suit Reference"
              className="object-cover w-full h-full"
              onError={(e: any) => {
                e.currentTarget.src =
                  'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500&auto=format&fit=crop&q=60';
              }}
            />
          </div>

          <div>
            <span className="text-[10px] font-bold text-[#7E153A] uppercase tracking-wider block">
              {product.brand || 'Designer Lawn'}
            </span>
            <h4 className="font-extrabold text-sm text-gray-900 leading-snug">
              {product.name ||
                `${order.garmentType?.replace(/_/g, ' ').toUpperCase()} Custom Stitch`}
            </h4>
            <p className="text-xs text-gray-500 mt-1 capitalize">
              Garment: {order.garmentType?.replace(/_/g, ' ')}
            </p>
          </div>
        </div>

        {/* Tailoring & Style Directives */}
        <div className="lg:col-span-2 space-y-6">
          {/* Style Directives */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <Sparkles size={16} className="text-[#7E153A]" /> Tailoring & Cut
              Directives
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Neckline Cut
                </span>
                <span className="font-black text-gray-900 text-sm mt-1 block">
                  {style.neckStyle || 'Round Neck (Standard)'}
                </span>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Sleeve Cut
                </span>
                <span className="font-black text-gray-900 text-sm mt-1 block">
                  {style.sleeveStyle || 'Full Sleeve'}
                </span>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Silhouette / Fit
                </span>
                <span className="font-black text-gray-900 text-sm mt-1 block">
                  {style.fit || 'Regular Fit'}
                </span>
              </div>
            </div>

            {order.specialInstructions && (
              <div className="bg-amber-50/60 border border-amber-200/80 p-4 rounded-2xl">
                <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block mb-1">
                  Customer Special Instruction
                </span>
                <p className="text-xs text-amber-900 font-medium italic leading-relaxed">
                  &quot;{order.specialInstructions}&quot;
                </p>
              </div>
            )}
          </div>

          {/* Master Measurement Matrix */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
                <Ruler size={16} className="text-[#7E153A]" /> Precision
                Blueprint Matrix (Inches)
              </h3>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                AI Verified Fit
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Kameez Length', val: measurements.kameezLength },
                { label: 'Chest / Bust', val: measurements.chest },
                { label: 'Waist', val: measurements.waist },
                { label: 'Hips', val: measurements.hips },
                { label: 'Shoulder Width', val: measurements.shoulderWidth },
                { label: 'Sleeve Length', val: measurements.sleeveLength },
                { label: 'Armhole', val: measurements.armhole },
                {
                  label: 'Neck Circumference',
                  val: measurements.neckCircumference,
                },
                { label: 'Gala Depth', val: measurements.galaDepth },
                { label: 'Trouser Length', val: measurements.trouserLength },
                { label: 'Trouser Waist', val: measurements.trouserWaist },
                { label: 'Thigh', val: measurements.thigh },
                { label: 'Knee', val: measurements.knee },
                { label: 'Ankle (Paicha)', val: measurements.ankle },
              ].map((item) => (
                <div
                  key={item.label}
                  className="bg-gray-50 hover:bg-red-50/40 p-3 rounded-2xl border border-gray-100 transition-colors flex flex-col justify-between"
                >
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    {item.label}
                  </span>
                  <span className="text-base font-black text-gray-900 font-mono mt-1">
                    {item.val !== undefined && item.val !== null
                      ? `${item.val}"`
                      : '—'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
