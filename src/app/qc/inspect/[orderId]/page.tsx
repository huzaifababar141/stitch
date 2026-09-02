'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Ruler,
  Camera,
  Loader2,
  AlertCircle,
  FileText,
  Upload,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function QCInspectPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const orderId = (params?.orderId as string) || '';
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [notes, setNotes] = useState('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([
    '/login_bg.jpg',
  ]);

  useEffect(() => {
    async function fetchDetail() {
      if (!orderId) return;
      try {
        const res = await fetch(`/api/qc/${orderId}`);
        if (res.ok) {
          const json = await res.json();
          setOrder(json.data || json);
        } else {
          toast({
            title: 'Order Not Found',
            description: 'Could not load order for inspection.',
            variant: 'destructive',
          });
        }
      } catch (err) {
        console.error('Failed to load QC order detail:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchDetail();
  }, [orderId, toast]);

  const handleSubmitAudit = async (
    result: 'approved' | 'rejected' | 'needs_minor_fix'
  ) => {
    const actionDescriptions = {
      approved:
        'APPROVE this garment for courier delivery dispatch? (TCS Consignment will be generated)',
      needs_minor_fix:
        'return this garment to the master tailor with minor alteration notes?',
      rejected: 'REJECT this garment and issue a complete re-stitch order?',
    };

    if (!confirm(`Are you sure you want to ${actionDescriptions[result]}`))
      return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/qc/${orderId}/inspect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          result,
          notes: notes.trim() || undefined,
          images: uploadedImages,
        }),
      });

      if (res.ok) {
        toast({
          title: 'Inspection Logged',
          description: `Garment successfully marked as ${result.replace(/_/g, ' ')}.`,
        });
        router.push('/qc/dashboard');
      } else {
        const json = await res.json();
        toast({
          title: 'Submission Failed',
          description: json.error?.message || 'Could not submit inspection.',
          variant: 'destructive',
        });
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to submit inspection.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 size={36} className="animate-spin text-purple-700 mb-3" />
        <p className="text-sm font-semibold text-gray-600">
          Loading QA audit suite...
        </p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center">
        <AlertCircle size={36} className="text-red-500 mx-auto mb-3" />
        <h2 className="text-base font-extrabold text-gray-900">
          Audit File Not Found
        </h2>
        <p className="text-xs text-gray-500 mb-6">
          Could not locate order #{orderId} in QC queue.
        </p>
        <Link href="/qc/dashboard">
          <Button className="bg-purple-700 text-white text-xs font-bold px-6 rounded-xl">
            <ArrowLeft size={14} className="mr-1.5" /> Back to Queue
          </Button>
        </Link>
      </div>
    );
  }

  const measurements = order.measurementSnapshot || {};
  const style = order.styleSnapshot || {};
  const product = order.productSnapshot || order.product || {};
  const tailorName = order.assignedTailor
    ? `${order.assignedTailor.firstName} ${order.assignedTailor.lastName || ''}`.trim()
    : 'Workshop Master';

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Top Bar Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl border border-gray-100 p-6 shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href="/qc/dashboard"
            className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-gray-900 font-mono">
                Audit:{' '}
                {order.orderNumber || order.id.substring(0, 10).toUpperCase()}
              </h1>
              <span className="bg-purple-50 text-purple-700 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                QC Inspection Station
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Stitched by:{' '}
              <span className="font-bold text-gray-800">{tailorName}</span> ·
              Garment:{' '}
              <span className="capitalize">
                {order.garmentType?.replace(/_/g, ' ')}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Split Screen: Expected Specs (Left) vs Physical Audit (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* LEFT PANE: Expected Specs & Customer Blueprint */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <Ruler size={16} className="text-purple-700" /> Expected
              Measurement Target (Inches)
            </h3>
            <p className="text-xs text-gray-500">
              Verify each dimension on the actual garment against this target.
              Standard tolerance is{' '}
              <span className="font-bold text-gray-800">± 0.5 inches</span>.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: 'Kameez Length', val: measurements.kameezLength },
                { label: 'Chest / Bust', val: measurements.chest },
                { label: 'Waist', val: measurements.waist },
                { label: 'Hips', val: measurements.hips },
                { label: 'Shoulder Width', val: measurements.shoulderWidth },
                { label: 'Sleeve Length', val: measurements.sleeveLength },
                { label: 'Armhole', val: measurements.armhole },
                { label: 'Gala Depth', val: measurements.galaDepth },
                { label: 'Trouser Length', val: measurements.trouserLength },
                { label: 'Ankle (Paicha)', val: measurements.ankle },
              ].map((item) => (
                <div
                  key={item.label}
                  className="bg-gray-50 p-3 rounded-2xl border border-gray-100 flex flex-col justify-between"
                >
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    {item.label}
                  </span>
                  <span className="text-sm font-black text-gray-900 font-mono mt-1">
                    {item.val !== undefined && item.val !== null
                      ? `${item.val}"`
                      : '—'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs space-y-3">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <Sparkles size={16} className="text-purple-700" /> Style
              Directives Audit
            </h3>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                <span className="text-[9px] font-bold text-gray-400 uppercase block">
                  Neck Style
                </span>
                <span className="font-bold text-gray-900 mt-0.5 block">
                  {style.neckStyle || 'Round'}
                </span>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                <span className="text-[9px] font-bold text-gray-400 uppercase block">
                  Sleeve
                </span>
                <span className="font-bold text-gray-900 mt-0.5 block">
                  {style.sleeveStyle || 'Full'}
                </span>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                <span className="text-[9px] font-bold text-gray-400 uppercase block">
                  Fit
                </span>
                <span className="font-bold text-gray-900 mt-0.5 block">
                  {style.fit || 'Regular'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANE: Verification Photos & Decision Disposition */}
        <div className="space-y-6">
          {/* Garment Photos Verification */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <Camera size={16} className="text-purple-700" /> Stitched Garment
              Photos
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {uploadedImages.map((img, i) => (
                <div
                  key={i}
                  className="aspect-[4/5] rounded-2xl overflow-hidden bg-gray-100 border border-gray-100 relative"
                >
                  <img
                    src={img}
                    alt="QC Verification Photo"
                    className="object-cover w-full h-full"
                  />
                </div>
              ))}
              <div className="aspect-[4/5] rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-center p-4 hover:border-purple-300 transition-colors cursor-pointer bg-gray-50/50">
                <Upload size={24} className="text-gray-400 mb-2" />
                <span className="text-xs font-bold text-purple-700">
                  Add Audit Photo
                </span>
                <span className="text-[10px] text-gray-400 mt-0.5">
                  High-res detail
                </span>
              </div>
            </div>
          </div>

          {/* Inspector Audit Notes */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs space-y-3">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
              Inspector Compliance Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Sleeves, chest, and neckline matched customer target within ±0.2 inches. Stitching seams and finishing clean."
              className="w-full h-24 p-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs focus:ring-2 focus:ring-purple-700 focus:outline-none resize-none"
            />
          </div>

          {/* Three-Way Disposition Action Buttons */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Official Quality Verdict
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Button
                onClick={() => handleSubmitAudit('approved')}
                disabled={submitting}
                className="h-12 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl shadow-md shadow-emerald-600/20 cursor-pointer flex items-center justify-center gap-1.5"
              >
                {submitting ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <CheckCircle2 size={16} />
                )}
                Approve for Dispatch
              </Button>

              <Button
                onClick={() => handleSubmitAudit('needs_minor_fix')}
                disabled={submitting}
                variant="outline"
                className="h-12 text-xs font-bold border-amber-300 text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-2xl cursor-pointer flex items-center justify-center gap-1.5"
              >
                <AlertTriangle size={16} className="text-amber-600" />
                Minor Fix Needed
              </Button>

              <Button
                onClick={() => handleSubmitAudit('rejected')}
                disabled={submitting}
                variant="outline"
                className="h-12 text-xs font-bold border-red-300 text-red-800 bg-red-50 hover:bg-red-100 rounded-2xl cursor-pointer flex items-center justify-center gap-1.5"
              >
                <XCircle size={16} className="text-red-600" />
                Reject & Re-Stitch
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
