'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Truck,
  Scissors,
  Sparkles,
  ShieldCheck,
  MapPin,
  Phone,
  FileText,
  MessageCircle,
  User,
  Copy,
  ExternalLink,
  Loader2,
  AlertCircle,
  XCircle,
  RotateCcw,
  Star,
  X,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useOrderRealtime } from '@/hooks/useOrderRealtime';
import { useAuth } from '@/hooks/useAuth';

// ─── Status Steps Configuration ──────────────────────────────────────────────

const STATUS_STEPS = [
  {
    id: 'placed',
    label: 'Order Placed',
    desc: 'Suit details & link submitted',
    icon: FileText,
  },
  {
    id: 'payment_confirmed',
    label: 'Payment Confirmed',
    desc: 'Payment received & verified',
    icon: ShieldCheck,
  },
  {
    id: 'assigned',
    label: 'Assigned to Master',
    desc: 'Master tailor allocated',
    icon: User,
  },
  {
    id: 'in_stitching',
    label: 'In Stitching',
    desc: 'Custom cutting & tailoring underway',
    icon: Scissors,
  },
  {
    id: 'quality_check',
    label: 'Quality Inspection',
    desc: 'Final measurement QC pass',
    icon: Sparkles,
  },
  {
    id: 'dispatched',
    label: 'Dispatched via TCS',
    desc: 'Handed over to courier',
    icon: Truck,
  },
  {
    id: 'delivered',
    label: 'Delivered',
    desc: 'Successfully delivered to doorstep',
    icon: CheckCircle2,
  },
];

const ALTERATION_AREAS = [
  { id: 'sleeves', label: 'Sleeves Length / Fitting' },
  { id: 'waist', label: 'Waist Fitting / Chhati (Chest)' },
  { id: 'daman', label: 'Daman / Kameez Total Length' },
  { id: 'neckline', label: 'Gala / Neckline Cut' },
  { id: 'trouser_waist', label: 'Trouser / Shalwar Waist' },
  { id: 'trouser_length', label: 'Trouser Length / Paicha (Ankle)' },
];

export default function OrderTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();

  const orderId = (params?.id as string) || '';

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  // Alteration Modal State
  const [isAlterationModalOpen, setIsAlterationModalOpen] = useState(false);
  const [selectedAlterationItems, setSelectedAlterationItems] = useState<
    string[]
  >([]);
  const [alterationNotes, setAlterationNotes] = useState('');
  const [submittingAlteration, setSubmittingAlteration] = useState(false);

  // Feedback Modal State
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [overallRating, setOverallRating] = useState(5);
  const [fitRating, setFitRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  // Connect to Supabase Realtime for live updates
  const { orderStatus: realtimeStatus } = useOrderRealtime(orderId);

  useEffect(() => {
    async function fetchOrderDetail() {
      if (!orderId) return;
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        if (res.ok) {
          const json = await res.json();
          setOrder(json.data || json);
        } else {
          toast({
            title: 'Order Not Found',
            description: 'Could not find the requested order in the database.',
            variant: 'destructive',
          });
        }
      } catch (err) {
        console.error('Failed to load order:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchOrderDetail();
  }, [orderId, toast]);

  const activeStatus = realtimeStatus || order?.status || 'pending_payment';

  const getStepIndex = (status: string) => {
    switch (status) {
      case 'pending_payment':
        return 0;
      case 'payment_confirmed':
        return 1;
      case 'assigned':
        return 2;
      case 'in_stitching':
        return 3;
      case 'stitching_complete':
      case 'qc_pending':
      case 'qc_approved':
        return 4;
      case 'dispatched':
      case 'in_transit':
      case 'out_for_delivery':
        return 5;
      case 'delivered':
        return 6;
      case 'return_requested':
      case 'returned':
        return 6;
      default:
        return 0;
    }
  };

  const currentStepIdx = getStepIndex(activeStatus);

  const handleCancelOrder = async () => {
    if (
      !confirm(
        'Are you sure you want to cancel this order? This action cannot be undone.'
      )
    ) {
      return;
    }

    try {
      setCancelling(true);
      const res = await fetch(`/api/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Customer cancelled from portal' }),
      });

      if (res.ok) {
        toast({
          title: 'Order Cancelled',
          description: 'Your order has been cancelled successfully.',
        });
        setOrder((prev: any) => ({ ...prev, status: 'cancelled' }));
      } else {
        const err = await res.json();
        toast({
          title: 'Cancellation Failed',
          description: err.error?.message || 'Could not cancel the order.',
          variant: 'destructive',
        });
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to reach server.',
        variant: 'destructive',
      });
    } finally {
      setCancelling(false);
    }
  };

  const handleToggleAlterationItem = (item: string) => {
    setSelectedAlterationItems((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleSubmitAlteration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alterationNotes.trim()) {
      toast({
        title: 'Instructions Required',
        description: 'Please describe the alterations needed for your suit.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSubmittingAlteration(true);
      const res = await fetch(`/api/orders/${orderId}/alteration`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: selectedAlterationItems,
          notes: alterationNotes,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        toast({
          title: 'Alteration Request Submitted',
          description:
            'Our rider will arrive for doorstep suit pickup. Free of charge under 7-Day Guarantee!',
        });
        setIsAlterationModalOpen(false);
        setOrder((prev: any) => ({
          ...prev,
          status: 'return_requested',
          metadata: {
            ...prev.metadata,
            alterationRequest: json.data?.alteration,
          },
        }));
      } else {
        const err = await res.json();
        toast({
          title: 'Request Failed',
          description:
            err.error?.message || 'Could not submit alteration request.',
          variant: 'destructive',
        });
      }
    } catch (err) {
      toast({
        title: 'Network Error',
        description: 'Failed to submit alteration request.',
        variant: 'destructive',
      });
    } finally {
      setSubmittingAlteration(false);
    }
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmittingFeedback(true);
      const res = await fetch(`/api/orders/${orderId}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          overallRating,
          fitRating,
          qualityRating: overallRating,
          deliveryRating: 5,
          comment: feedbackComment,
        }),
      });

      if (res.ok) {
        toast({
          title: 'Review Submitted!',
          description: 'Thank you for rating your custom tailored suit.',
        });
        setIsFeedbackModalOpen(false);
      } else {
        const err = await res.json();
        toast({
          title: 'Submission Failed',
          description: err.error?.message || 'Could not submit feedback.',
          variant: 'destructive',
        });
      }
    } catch (err) {
      toast({
        title: 'Network Error',
        description: 'Failed to submit feedback.',
        variant: 'destructive',
      });
    } finally {
      setSubmittingFeedback(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="max-w-5xl mx-auto flex flex-col items-center justify-center min-h-[400px] text-gray-500">
        <Loader2 size={36} className="animate-spin text-[#7E153A] mb-3" />
        <p className="text-sm font-medium">
          Loading real-time order progression...
        </p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-5xl mx-auto bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
        <AlertCircle size={40} className="text-gray-300 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-gray-900 mb-1">
          Order Not Found
        </h2>
        <p className="text-xs text-gray-500 mb-6">
          The order #{orderId} could not be located in our records.
        </p>
        <Link href="/orders">
          <Button className="bg-[#7E153A] text-white text-xs font-bold px-6">
            <ArrowLeft size={16} className="mr-2" /> Back to My Orders
          </Button>
        </Link>
      </div>
    );
  }

  const delivery = order.deliveries?.[0];
  const productSnapshot = order.productSnapshot || {};
  const measurementSnapshot = order.measurementSnapshot || {};
  const styleSnapshot = order.styleSnapshot || {};
  const addressSnapshot = order.deliveryAddressSnapshot || {};
  const alterationData = order.metadata?.alterationRequest;

  const placedDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString('en-PK', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Recently';

  const estDeliveryDate = order.estimatedDeliveryDate
    ? new Date(order.estimatedDeliveryDate).toLocaleDateString('en-PK', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '5 - 7 Business Days';

  return (
    <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6 py-1 sm:py-2 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-xs">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <Link
              href="/orders"
              className="text-gray-400 hover:text-gray-900 transition-colors mr-1 p-1 -ml-1"
              aria-label="Back to orders"
            >
              <ArrowLeft size={18} />
            </Link>
            <h1 className="text-base sm:text-xl font-extrabold text-gray-900 font-mono tracking-tight">
              {order.orderNumber || order.id.substring(0, 12).toUpperCase()}
            </h1>
            <span className="bg-red-50 text-[#7E153A] text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              {activeStatus.replace(/_/g, ' ')}
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-gray-500 pl-0 sm:pl-7">
            Placed on {placedDate} · Est. Delivery:{' '}
            <span className="font-semibold text-gray-800">
              {estDeliveryDate}
            </span>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
          {activeStatus === 'pending_payment' && (
            <Button
              onClick={handleCancelOrder}
              disabled={cancelling}
              variant="outline"
              className="w-full sm:w-auto h-9 sm:h-10 text-xs font-semibold text-red-600 border-red-200 hover:bg-red-50 cursor-pointer"
            >
              {cancelling ? (
                <Loader2 size={14} className="animate-spin mr-1" />
              ) : (
                <XCircle size={14} className="mr-1" />
              )}
              Cancel Order
            </Button>
          )}

          {activeStatus === 'delivered' && (
            <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full sm:w-auto">
              <Button
                onClick={() => setIsAlterationModalOpen(true)}
                variant="outline"
                className="h-9 sm:h-10 text-xs font-bold text-[#7E153A] border-[#7E153A]/30 hover:bg-red-50 cursor-pointer"
              >
                <RotateCcw size={14} className="mr-1.5" /> 7-Day Alteration
              </Button>
              <Button
                onClick={() => setIsFeedbackModalOpen(true)}
                className="h-9 sm:h-10 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white cursor-pointer"
              >
                <Star size={14} className="mr-1.5 fill-current" /> Rate Fit
              </Button>
            </div>
          )}

          <a
            href={`https://wa.me/923000000000?text=Hi%2C%20I%20have%20an%20inquiry%20regarding%20my%20TailorLink%20Order%20${order.orderNumber || order.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto"
          >
            <Button className="w-full sm:w-auto bg-[#7E153A] hover:bg-[#630f2d] text-white text-xs font-bold h-9 sm:h-10 px-3.5 sm:px-4 shadow-sm shadow-[#7E153A]/20 cursor-pointer">
              <MessageCircle size={15} className="mr-1.5" /> WhatsApp Support
            </Button>
          </a>
        </div>
      </div>

      {/* Alteration in progress banner if status is return_requested */}
      {activeStatus === 'return_requested' && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <RotateCcw size={18} className="sm:w-5 sm:h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="font-extrabold text-amber-900 text-xs sm:text-sm">
              7-Day Free Alteration in Progress
            </h3>
            <p className="text-xs text-amber-700 leading-relaxed">
              Our courier rider is scheduled to pick up your suit from your
              registered address. Once adjusted by our master tailor, it will be
              re-delivered back to your doorstep free of charge.
            </p>
            {alterationData?.notes && (
              <p className="text-xs text-amber-800 font-medium italic mt-2">
                Requested Adjustments: &quot;{alterationData.notes}&quot;
              </p>
            )}
          </div>
        </div>
      )}

      {/* Real-time Order Timeline */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 lg:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3 sm:pb-4 mb-5 sm:mb-8">
          <div>
            <h2 className="text-sm sm:text-base font-extrabold text-gray-900">
              Live Tailoring & Delivery Progression
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Connected to real-time workshop & courier tracking
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] sm:text-xs font-bold text-emerald-600">
              Live Realtime Active
            </span>
          </div>
        </div>

        {/* Stepper */}
        <div className="relative">
          {/* Desktop Horizontal Stepper */}
          <div className="hidden lg:flex items-start justify-between relative">
            <div className="absolute top-5 left-8 right-8 h-1 bg-gray-100 -z-0">
              <div
                className="h-full bg-[#7E153A] transition-all duration-700 rounded-full"
                style={{
                  width: `${(currentStepIdx / (STATUS_STEPS.length - 1)) * 100}%`,
                }}
              />
            </div>

            {STATUS_STEPS.map((step, idx) => {
              const isCompleted = idx < currentStepIdx;
              const isCurrent = idx === currentStepIdx;
              const StepIcon = step.icon;

              return (
                <div
                  key={step.id}
                  className="flex flex-col items-center text-center relative z-10 w-32"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-sm ${
                      isCompleted
                        ? 'bg-[#7E153A] text-white'
                        : isCurrent
                          ? 'bg-white border-2 border-[#7E153A] text-[#7E153A] ring-4 ring-red-50'
                          : 'bg-white border border-gray-200 text-gray-400'
                    }`}
                  >
                    <StepIcon size={18} />
                  </div>

                  <span
                    className={`text-xs font-bold mt-3 leading-tight ${
                      isCurrent
                        ? 'text-[#7E153A]'
                        : isCompleted
                          ? 'text-gray-900'
                          : 'text-gray-400'
                    }`}
                  >
                    {step.label}
                  </span>
                  <span className="text-[10px] text-gray-400 mt-1 max-w-[110px] leading-relaxed">
                    {step.desc}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Mobile Vertical Connected Stepper */}
          <div className="lg:hidden flex flex-col relative pl-2">
            {STATUS_STEPS.map((step, idx) => {
              const isCompleted = idx < currentStepIdx;
              const isCurrent = idx === currentStepIdx;
              const StepIcon = step.icon;
              const isLast = idx === STATUS_STEPS.length - 1;

              return (
                <div
                  key={step.id}
                  className="flex gap-3.5 items-start relative pb-5"
                >
                  {/* Vertical connecting line */}
                  {!isLast && (
                    <div
                      className={`absolute left-4 top-8 bottom-0 w-0.5 -translate-x-1/2 ${
                        isCompleted ? 'bg-[#7E153A]' : 'bg-gray-200'
                      }`}
                    />
                  )}

                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold z-10 shadow-xs ${
                      isCompleted
                        ? 'bg-[#7E153A] text-white'
                        : isCurrent
                          ? 'bg-white border-2 border-[#7E153A] text-[#7E153A] ring-3 ring-red-50'
                          : 'bg-white border border-gray-200 text-gray-400'
                    }`}
                  >
                    <StepIcon size={14} />
                  </div>

                  <div className="flex-1 min-w-0 pt-0.5">
                    <h4
                      className={`text-xs font-bold ${
                        isCurrent
                          ? 'text-[#7E153A]'
                          : isCompleted
                            ? 'text-gray-900'
                            : 'text-gray-400'
                      }`}
                    >
                      {step.label}
                    </h4>
                    <p className="text-[11px] text-gray-500 mt-0.5 leading-tight">
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grid: Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left 2 Cols: Product & Tailoring Specs */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Suit Spec Card */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-xs">
            <h3 className="font-extrabold text-sm text-gray-900 mb-3 sm:mb-4">
              Garment & Product Details
            </h3>

            <div className="flex flex-col sm:flex-row gap-3.5 sm:gap-4 items-start">
              <div className="w-20 h-28 sm:w-24 sm:h-32 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-100 relative">
                <img
                  src={productSnapshot.images?.[0] || '/login_bg.jpg'}
                  alt={productSnapshot.name || 'Suit'}
                  className="object-cover w-full h-full"
                  onError={(e: any) => {
                    e.currentTarget.src =
                      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=300&auto=format&fit=crop&q=60';
                  }}
                />
              </div>

              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#7E153A]">
                  {productSnapshot.brand || 'Designer Brand'}
                </span>
                <h4 className="font-bold text-gray-900 text-sm sm:text-base leading-tight mt-0.5">
                  {productSnapshot.name ||
                    `${order.garmentType?.replace(/_/g, ' ') || 'Custom'} Tailored Suit`}
                </h4>
                <p className="text-xs text-gray-500 mt-1 capitalize">
                  Garment Type: {order.garmentType?.replace(/_/g, ' ')}
                </p>

                {styleSnapshot?.galaStyle && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <span className="text-[10px] font-semibold bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md">
                      Neck: {styleSnapshot.galaStyle}
                    </span>
                    {styleSnapshot.sleeveStyle && (
                      <span className="text-[10px] font-semibold bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md">
                        Sleeves: {styleSnapshot.sleeveStyle}
                      </span>
                    )}
                    {styleSnapshot.trouserStyle && (
                      <span className="text-[10px] font-semibold bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md">
                        Bottom: {styleSnapshot.trouserStyle}
                      </span>
                    )}
                  </div>
                )}

                {productSnapshot.source_url && (
                  <a
                    href={productSnapshot.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-[#7E153A] font-semibold mt-3 hover:underline"
                  >
                    <ExternalLink size={13} /> View Original Brand Link
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Measurements Snapshot Card */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="font-extrabold text-sm text-gray-900">
                Measurement Snapshot (Inches)
              </h3>
              <span className="text-[11px] text-gray-400 font-medium">
                Locked for Production
              </span>
            </div>

            {Object.keys(measurementSnapshot).length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 text-xs">
                {Object.entries(measurementSnapshot)
                  .filter(
                    ([key, val]) =>
                      (typeof val === 'number' || typeof val === 'string') &&
                      ![
                        'id',
                        'userId',
                        'createdAt',
                        'updatedAt',
                        'deletedAt',
                        'label',
                        'isDefault',
                      ].includes(key)
                  )
                  .slice(0, 8)
                  .map(([key, val]) => (
                    <div
                      key={key}
                      className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 flex flex-col justify-between"
                    >
                      <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider truncate">
                        {key.replace(/_/g, ' ')}
                      </span>
                      <span className="font-extrabold text-gray-900 text-sm mt-1 font-mono">
                        {String(val)}&quot;
                      </span>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500">
                Sample suit pickup or standard profile applied.
              </p>
            )}
          </div>
        </div>

        {/* Right Col: Price Breakdown & Delivery Address */}
        <div className="space-y-4 sm:space-y-6">
          {/* Price Summary */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-xs">
            <h3 className="font-extrabold text-sm text-gray-900 mb-3 sm:mb-4">
              Payment & Price Breakdown
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Custom Stitching Fee</span>
                <span className="font-semibold text-gray-900 font-mono">
                  PKR {Number(order.stitchingFee || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Doorstep Courier Delivery</span>
                <span className="font-semibold text-gray-900 font-mono">
                  PKR {Number(order.deliveryFee || 0).toLocaleString()}
                </span>
              </div>
              {Number(order.discountAmount || 0) > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Referral / Coupon Discount</span>
                  <span className="font-mono">
                    - PKR {Number(order.discountAmount).toLocaleString()}
                  </span>
                </div>
              )}
              <div className="border-t border-gray-100 pt-3 flex justify-between text-sm font-extrabold text-[#7E153A]">
                <span>Total Amount</span>
                <span className="font-mono">
                  PKR {Number(order.totalAmount || 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Doorstep Delivery Address */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-xs">
            <h3 className="font-extrabold text-sm text-gray-900 mb-3 flex items-center gap-2">
              <MapPin size={16} className="text-[#7E153A]" /> Delivery Address
            </h3>

            {addressSnapshot.addressLine1 ? (
              <div className="text-xs text-gray-600 space-y-1">
                <p className="font-bold text-gray-900">
                  {addressSnapshot.fullName || user?.user_metadata?.full_name}
                </p>
                <p>{addressSnapshot.addressLine1}</p>
                {addressSnapshot.addressLine2 && (
                  <p>{addressSnapshot.addressLine2}</p>
                )}
                <p>
                  {addressSnapshot.city}, {addressSnapshot.province}
                </p>
                <p className="text-gray-500 pt-1">
                  Phone: {addressSnapshot.phone || user?.phone || 'N/A'}
                </p>
              </div>
            ) : (
              <p className="text-xs text-gray-500">
                Doorstep delivery to your default address on file.
              </p>
            )}

            {delivery && (
              <div className="mt-3.5 pt-3.5 border-t border-gray-100 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Courier Tracking
                </span>
                <p className="font-bold text-gray-900 mt-0.5">
                  {delivery.courierName || 'TCS Express'}:{' '}
                  <span className="text-[#7E153A] font-mono">
                    {delivery.trackingNumber || 'Pending pickup'}
                  </span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── 7-Day Alteration Modal ── */}
      {isAlterationModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-8 shadow-2xl space-y-4 sm:space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-red-50 text-[#7E153A] flex items-center justify-center">
                  <RotateCcw size={16} />
                </div>
                <h3 className="font-extrabold text-gray-900 text-sm sm:text-base">
                  7-Day Free Alteration Request
                </h3>
              </div>
              <button
                onClick={() => setIsAlterationModalOpen(false)}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            <p className="text-xs text-gray-500 leading-relaxed">
              TailorLink guarantees 100% fitting satisfaction. Select the areas
              that need adjustment and our courier rider will collect your suit
              for complimentary alteration.
            </p>

            <form onSubmit={handleSubmitAlteration} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-2">
                  Select Areas Needing Adjustment:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {ALTERATION_AREAS.map((area) => {
                    const isChecked = selectedAlterationItems.includes(area.id);
                    return (
                      <button
                        key={area.id}
                        type="button"
                        onClick={() => handleToggleAlterationItem(area.id)}
                        className={`p-2.5 rounded-xl border text-left text-xs font-medium transition-all flex items-center gap-2 cursor-pointer ${
                          isChecked
                            ? 'bg-red-50 border-[#7E153A] text-[#7E153A] font-bold'
                            : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-md border flex items-center justify-center text-white text-[10px] shrink-0 ${
                            isChecked
                              ? 'bg-[#7E153A] border-[#7E153A]'
                              : 'border-gray-300 bg-white'
                          }`}
                        >
                          {isChecked && <Check size={12} strokeWidth={3} />}
                        </div>
                        <span className="truncate">{area.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1.5">
                  Detailed Alteration Instructions:
                </label>
                <Textarea
                  value={alterationNotes}
                  onChange={(e) => setAlterationNotes(e.target.value)}
                  placeholder="e.g., Please loosen chest by 1 inch and shorten sleeves by 1.5 inches."
                  rows={3}
                  className="text-xs rounded-xl"
                  required
                />
              </div>

              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-[11px] text-gray-600 flex items-center gap-2">
                <Truck size={16} className="text-[#7E153A] shrink-0" />
                <span>
                  Complimentary rider pickup from your registered doorstep.
                </span>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAlterationModalOpen(false)}
                  className="flex-1 text-xs h-10 cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submittingAlteration}
                  className="flex-1 bg-[#7E153A] hover:bg-[#630f2d] text-white text-xs font-bold h-10 cursor-pointer"
                >
                  {submittingAlteration ? (
                    <Loader2 size={14} className="animate-spin mr-1.5" />
                  ) : null}
                  Schedule Free Pickup
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Rate Fit / Feedback Modal ── */}
      {isFeedbackModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-4 sm:space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Star size={16} className="fill-current" />
                </div>
                <h3 className="font-extrabold text-gray-900 text-sm sm:text-base">
                  Rate Tailoring Quality & Fit
                </h3>
              </div>
              <button
                onClick={() => setIsFeedbackModalOpen(false)}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleSubmitFeedback} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-2">
                  Overall Experience:
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setOverallRating(star)}
                      className="p-1 text-amber-400 hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Star
                        size={24}
                        className={
                          star <= overallRating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-gray-200'
                        }
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-2">
                  Fitting & Accuracy Rating:
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFitRating(star)}
                      className="p-1 text-amber-400 hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Star
                        size={24}
                        className={
                          star <= fitRating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-gray-200'
                        }
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1.5">
                  Review & Comments (Optional):
                </label>
                <Textarea
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  placeholder="How did the suit fit? How was the stitching finishing and piping?"
                  rows={3}
                  className="text-xs rounded-xl"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsFeedbackModalOpen(false)}
                  className="flex-1 text-xs h-10 cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submittingFeedback}
                  className="flex-1 bg-[#7E153A] hover:bg-[#630f2d] text-white text-xs font-bold h-10 cursor-pointer"
                >
                  {submittingFeedback ? (
                    <Loader2 size={14} className="animate-spin mr-1.5" />
                  ) : null}
                  Submit Review
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
