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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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

export default function OrderTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();

  const orderId = (params?.id as string) || '';

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

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
      default:
        return 0;
    }
  };

  const currentStepIdx = getStepIndex(activeStatus);

  const handleCancelOrder = async () => {
    if (!confirm('Are you sure you want to cancel this stitching order?'))
      return;
    setCancelling(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Customer requested cancellation' }),
      });
      if (res.ok) {
        toast({
          title: 'Order Cancelled',
          description: 'Your order has been cancelled successfully.',
        });
        setOrder((prev: any) => ({ ...prev, status: 'cancelled' }));
      } else {
        const json = await res.json();
        toast({
          title: 'Cannot Cancel',
          description:
            json.error?.message || 'Order cannot be cancelled at this stage.',
          variant: 'destructive',
        });
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to cancel order.',
        variant: 'destructive',
      });
    } finally {
      setCancelling(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="max-w-5xl mx-auto py-16 flex flex-col items-center justify-center text-center">
        <Loader2 size={36} className="animate-spin text-[#7E153A] mb-3" />
        <p className="text-sm font-medium text-gray-600">
          Loading order details...
        </p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-5xl mx-auto py-16 text-center bg-white rounded-2xl border border-gray-100 p-8">
        <AlertCircle size={40} className="text-red-500 mx-auto mb-3" />
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
    <div className="max-w-5xl mx-auto space-y-8 py-2">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/orders"
              className="text-gray-400 hover:text-gray-900 transition-colors mr-1"
            >
              <ArrowLeft size={18} />
            </Link>
            <h1 className="text-xl font-extrabold text-gray-900 font-mono tracking-tight">
              {order.orderNumber || order.id.substring(0, 12).toUpperCase()}
            </h1>
            <span className="bg-red-50 text-[#7E153A] text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              {activeStatus.replace(/_/g, ' ')}
            </span>
          </div>
          <p className="text-xs text-gray-500 pl-6">
            Placed on {placedDate} · Est. Doorstep Delivery:{' '}
            <span className="font-semibold text-gray-800">
              {estDeliveryDate}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          {activeStatus === 'pending_payment' && (
            <Button
              onClick={handleCancelOrder}
              disabled={cancelling}
              variant="outline"
              className="h-10 text-xs font-semibold text-red-600 border-red-200 hover:bg-red-50"
            >
              {cancelling ? (
                <Loader2 size={14} className="animate-spin mr-1" />
              ) : (
                <XCircle size={14} className="mr-1" />
              )}
              Cancel Order
            </Button>
          )}

          <a
            href={`https://wa.me/923000000000?text=Hi%2C%20I%20have%20an%20inquiry%20regarding%20my%20TailorLink%20Order%20${order.orderNumber || order.id}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button className="bg-[#7E153A] hover:bg-[#630f2d] text-white text-xs font-bold h-10 px-4 shadow-sm shadow-[#7E153A]/20">
              <MessageCircle size={15} className="mr-1.5" /> WhatsApp Support
            </Button>
          </a>
        </div>
      </div>

      {/* Real-time Order Timeline */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-8">
          <div>
            <h2 className="text-base font-extrabold text-gray-900">
              Live Tailoring & Delivery Progression
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Connected to real-time workshop & courier tracking
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-emerald-600">
              Live Realtime Active
            </span>
          </div>
        </div>

        {/* Stepper */}
        <div className="relative">
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

          {/* Mobile Vertical Stepper */}
          <div className="flex lg:hidden flex-col gap-6">
            {STATUS_STEPS.map((step, idx) => {
              const isCompleted = idx < currentStepIdx;
              const isCurrent = idx === currentStepIdx;
              const StepIcon = step.icon;

              return (
                <div key={step.id} className="flex gap-4 items-start">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                      isCompleted
                        ? 'bg-[#7E153A] text-white'
                        : isCurrent
                          ? 'bg-white border-2 border-[#7E153A] text-[#7E153A] ring-4 ring-red-50'
                          : 'bg-white border border-gray-200 text-gray-400'
                    }`}
                  >
                    <StepIcon size={14} />
                  </div>
                  <div>
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
                    <p className="text-[11px] text-gray-500 mt-0.5">
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Product & Tailoring Specs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Suit Spec Card */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h3 className="font-extrabold text-sm text-gray-900 mb-4">
              Garment & Product Details
            </h3>

            <div className="flex gap-4 items-start">
              <div className="w-24 h-32 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-100 relative">
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
                <h4 className="font-bold text-gray-900 text-base leading-tight mt-0.5">
                  {productSnapshot.name ||
                    order.garmentType?.replace(/_/g, ' ') ||
                    'Custom Tailored Suit'}
                </h4>
                <p className="text-xs text-gray-500 mt-1 capitalize">
                  Garment Type: {order.garmentType?.replace(/_/g, ' ')}
                </p>

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
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-sm text-gray-900">
                Measurement Snapshot (Inches)
              </h3>
              <span className="text-xs text-gray-400 font-medium">
                Locked for Production
              </span>
            </div>

            {Object.keys(measurementSnapshot).length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                {Object.entries(measurementSnapshot)
                  .filter(
                    ([key, val]) =>
                      typeof val === 'number' || typeof val === 'string'
                  )
                  .slice(0, 8)
                  .map(([key, val]) => (
                    <div
                      key={key}
                      className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex flex-col justify-between"
                    >
                      <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">
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
                Standard fit profile applied to this order.
              </p>
            )}
          </div>
        </div>

        {/* Right Col: Price Breakdown & Delivery Address */}
        <div className="space-y-6">
          {/* Price Summary */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h3 className="font-extrabold text-sm text-gray-900 mb-4">
              Payment & Price Breakdown
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Custom Stitching Fee</span>
                <span className="font-semibold text-gray-900">
                  PKR {Number(order.stitchingFee || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Doorstep Courier Delivery</span>
                <span className="font-semibold text-gray-900">
                  PKR {Number(order.deliveryFee || 0).toLocaleString()}
                </span>
              </div>
              {Number(order.discountAmount || 0) > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Referral / Coupon Discount</span>
                  <span>
                    - PKR {Number(order.discountAmount).toLocaleString()}
                  </span>
                </div>
              )}
              <div className="border-t border-gray-100 pt-3 flex justify-between text-sm font-extrabold text-[#7E153A]">
                <span>Total Amount</span>
                <span>
                  PKR {Number(order.totalAmount || 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Doorstep Delivery Address */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
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
              <div className="mt-4 pt-4 border-t border-gray-100 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Courier Tracking
                </span>
                <p className="font-bold text-gray-900 mt-0.5">
                  {delivery.courierName || 'TCS Express'}:{' '}
                  {delivery.trackingNumber || 'Pending pickup'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
