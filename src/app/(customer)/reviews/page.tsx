'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Star,
  Sparkles,
  MessageSquare,
  CheckCircle2,
  ThumbsUp,
  Scissors,
  ShieldCheck,
  Loader2,
  ExternalLink,
  Plus,
  X,
  Award,
  UserCheck,
  Heart,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export default function ReviewsPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<any[]>([]);
  const [averageScore, setAverageScore] = useState('5.0');
  const [unreviewedOrders, setUnreviewedOrders] = useState<any[]>([]);

  // Modal review state
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [overallRating, setOverallRating] = useState(5);
  const [fitRating, setFitRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadReviews = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/reviews');
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setReviews(json.data.reviews || []);
          setAverageScore(json.data.averageFitScore || '5.0');
          setUnreviewedOrders(json.data.unreviewedOrders || []);
        }
      }
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/orders/${selectedOrder.id}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          overallRating,
          fitRating,
          comment: comment.trim() || undefined,
        }),
      });

      if (res.ok) {
        toast({
          title: 'Review Submitted 🎉',
          description: 'Thank you for rating your master tailor!',
        });
        setSelectedOrder(null);
        setComment('');
        loadReviews();
      } else {
        const json = await res.json();
        toast({
          title: 'Error Submitting Review',
          description: json.error?.message || 'Could not submit feedback.',
          variant: 'destructive',
        });
      }
    } catch (err) {
      toast({
        title: 'Error Submitting Review',
        description: 'Network error. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getRatingLabel = (score: number) => {
    switch (score) {
      case 5:
        return 'Perfect Fit (5/5)';
      case 4:
        return 'Great Fit (4/5)';
      case 3:
        return 'Satisfactory (3/5)';
      case 2:
        return 'Needs Minor Alteration (2/5)';
      case 1:
        return 'Poor Fit (1/5)';
      default:
        return '5 Stars';
    }
  };

  return (
    <div className="w-full min-w-0 max-w-7xl mx-auto space-y-5 sm:space-y-8 font-sans">
      {/* ── Top Header Banner ── */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 p-4 sm:p-6 md:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
        <div className="space-y-1 sm:space-y-1.5 min-w-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold shrink-0">
              <Star size={20} className="fill-amber-500 text-amber-500" />
            </div>
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
                Fitting Reviews & Ratings
              </h1>
              {reviews.length > 0 && (
                <span className="bg-amber-50 text-amber-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-amber-200/60">
                  {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
                </span>
              )}
            </div>
          </div>
          <p className="text-xs text-gray-500 max-w-xl leading-relaxed">
            Verified fitting ratings and feedback left for workshop master
            tailors on delivered unstitched and festive suits.
          </p>
        </div>

        {/* Average Fit Score Card */}
        <div className="bg-gradient-to-br from-amber-50/90 to-amber-100/50 border border-amber-200/80 p-3.5 sm:p-4 rounded-2xl flex items-center gap-3.5 shrink-0">
          <div className="w-11 h-11 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black text-base shadow-xs shrink-0">
            {averageScore}
          </div>
          <div>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className="fill-amber-400 text-amber-400"
                />
              ))}
            </div>
            <p className="text-xs font-bold text-gray-900 mt-0.5">
              Average Fit Score
            </p>
            <p className="text-[10px] text-gray-500">
              Based on delivered orders
            </p>
          </div>
        </div>
      </div>

      {/* ── Master Tailor Craftsmanship & QC Guarantee Strip ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl border border-gray-100 p-3.5 sm:p-4 flex items-center gap-3 shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-red-50 text-[#7E153A] flex items-center justify-center shrink-0">
            <Scissors size={18} />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-extrabold text-gray-900 truncate">
              Master Tailor Craft
            </h4>
            <p className="text-[11px] text-gray-500 truncate">
              10+ years bespoke experience
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-3.5 sm:p-4 flex items-center gap-3 shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 size={18} />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-extrabold text-gray-900 truncate">
              14-Point QC Check
            </h4>
            <p className="text-[11px] text-gray-500 truncate">
              Collar, sleeves & paicha inspection
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-3.5 sm:p-4 flex items-center gap-3 shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <ShieldCheck size={18} />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-extrabold text-gray-900 truncate">
              7-Day Free Alterations
            </h4>
            <p className="text-[11px] text-gray-500 truncate">
              100% doorstep fit guarantee
            </p>
          </div>
        </div>
      </div>

      {/* ── Unreviewed Delivered Orders Banner ── */}
      {unreviewedOrders.length > 0 && (
        <div className="bg-gradient-to-r from-red-50 via-white to-red-50/60 border border-[#7E153A]/20 p-4 sm:p-5 rounded-2xl sm:rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-xl sm:rounded-2xl bg-[#7E153A] text-white flex items-center justify-center font-bold shadow-xs shrink-0">
              <Sparkles size={18} />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-extrabold text-gray-900 truncate">
                You have {unreviewedOrders.length} delivered suit
                {unreviewedOrders.length > 1 ? 's' : ''} ready to review
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed truncate">
                Share your fit experience to help our master tailors keep your
                silhouette perfected.
              </p>
            </div>
          </div>

          <Button
            onClick={() => setSelectedOrder(unreviewedOrders[0])}
            className="w-full sm:w-auto h-10 px-5 text-xs font-bold bg-[#7E153A] hover:bg-[#630f2d] text-white rounded-xl shadow-xs shrink-0 cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Star size={14} className="fill-white" /> Rate Order #
            {unreviewedOrders[0].orderNumber}
          </Button>
        </div>
      )}

      {/* ── Reviews Feed Grid ── */}
      {loading ? (
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 p-12 sm:p-16 flex flex-col items-center justify-center text-center shadow-xs">
          <Loader2 size={32} className="animate-spin text-[#7E153A] mb-3" />
          <p className="text-xs font-semibold text-gray-600">
            Loading your review history...
          </p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 p-8 sm:p-14 flex flex-col items-center justify-center text-center shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center shadow-inner">
            <Star size={32} className="fill-amber-400" />
          </div>
          <div className="space-y-1.5 max-w-md">
            <h3 className="text-base font-extrabold text-gray-900">
              No Fitting Reviews Yet
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Once your first tailored suit is delivered to your doorstep, you
              can leave a verified fitting rating and note for your workshop
              master tailor here.
            </p>
          </div>
          <Link href="/orders" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto bg-[#7E153A] hover:bg-[#630f2d] text-white text-xs font-bold px-6 h-11 rounded-xl shadow-md shadow-[#7E153A]/20 cursor-pointer">
              View Active Orders
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 p-4 sm:p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3.5"
            >
              <div className="space-y-3">
                {/* Order & Rating Header */}
                <div className="flex items-start justify-between gap-2 border-b border-gray-100 pb-3">
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-extrabold text-gray-900">
                        {rev.orderNumber}
                      </span>
                      {rev.orderId && (
                        <Link
                          href={`/orders/${rev.orderId}`}
                          className="text-[#7E153A] hover:underline flex items-center gap-0.5 text-[11px] font-semibold"
                        >
                          Order Details <ExternalLink size={10} />
                        </Link>
                      )}
                    </div>
                    <h3 className="font-extrabold text-sm sm:text-base text-gray-900 truncate">
                      {rev.suitName}
                    </h3>
                  </div>

                  {/* Golden Stars */}
                  <div className="flex items-center gap-0.5 shrink-0 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-100">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={13}
                        className={
                          i < rev.rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-gray-200'
                        }
                      />
                    ))}
                  </div>
                </div>

                {/* Master Tailor Attribution */}
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <UserCheck size={14} className="text-[#7E153A] shrink-0" />
                  <span className="truncate">
                    Tailored by{' '}
                    <strong className="text-gray-800">{rev.tailorName}</strong>{' '}
                    ·{' '}
                    {new Date(rev.date).toLocaleDateString(undefined, {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                {/* Review Text */}
                <p className="text-xs text-gray-700 leading-relaxed font-normal bg-gray-50/70 p-3 rounded-xl border border-gray-100 break-words">
                  &quot;{rev.reviewText}&quot;
                </p>
              </div>

              {/* QC Pass Verified Badge */}
              <div className="pt-1 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                  <CheckCircle2 size={13} />
                  <span>Verified QC Inspection Pass</span>
                </div>

                <span className="text-[10px] font-extrabold text-amber-700 uppercase">
                  {getRatingLabel(rev.rating)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Review Submission Modal (Bottom Sheet on Mobile) ── */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-lg w-full p-4 sm:p-6 md:p-8 shadow-2xl space-y-4 sm:space-y-6 max-h-[92vh] flex flex-col justify-between overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
            {/* Mobile Grab Bar */}
            <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto sm:hidden shrink-0" />

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 sm:pb-4 shrink-0">
              <div className="space-y-0.5 min-w-0 pr-2">
                <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 truncate">
                  Review Delivered Suit
                </h2>
                <p className="text-xs text-gray-500 truncate">
                  Order #{selectedOrder.orderNumber}
                </p>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors cursor-pointer shrink-0"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Scrollable Form */}
            <form
              id="reviewForm"
              onSubmit={handleSubmitFeedback}
              className="flex-1 overflow-y-auto px-1 py-1 pr-2 space-y-4 sm:space-y-5"
            >
              {/* Overall Rating Stars */}
              <div className="space-y-2 bg-gray-50/80 p-3.5 rounded-2xl border border-gray-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-700 block">
                    Overall Tailoring & Craftsmanship
                  </label>
                  <span className="text-[11px] font-bold text-amber-700">
                    {getRatingLabel(overallRating)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setOverallRating(star)}
                      className="p-1.5 hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Star
                        size={28}
                        className={
                          star <= overallRating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-gray-200 hover:text-amber-200'
                        }
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Fit Accuracy Rating */}
              <div className="space-y-2 bg-gray-50/80 p-3.5 rounded-2xl border border-gray-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-700 block">
                    Fitting Accuracy (Chest, Waist, Shoulders)
                  </label>
                  <span className="text-[11px] font-bold text-emerald-700">
                    {fitRating === 5 ? '100% Accurate' : `${fitRating} / 5`}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setFitRating(star)}
                      className="p-1.5 hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Star
                        size={24}
                        className={
                          star <= fitRating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-gray-200 hover:text-amber-200'
                        }
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Feedback Textarea */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 block">
                  Your Review & Fitting Feedback
                </label>
                <textarea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="How was the stitching quality, neckline finishing, and overall fit?"
                  className="w-full bg-gray-50/80 border border-gray-200 rounded-xl p-3 text-xs focus:outline-hidden focus:border-[#7E153A] focus:ring-1 focus:ring-[#7E153A] leading-relaxed"
                />
              </div>
            </form>

            {/* Modal Footer Controls */}
            <div className="border-t border-gray-100 pt-3 sm:pt-4 flex flex-col-reverse sm:flex-row items-center justify-between gap-2.5 sm:gap-3 shrink-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSelectedOrder(null)}
                className="w-full sm:w-auto h-11 px-6 rounded-xl text-xs font-semibold cursor-pointer border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                form="reviewForm"
                disabled={submitting}
                className="w-full sm:w-auto h-11 px-8 rounded-xl text-xs font-bold bg-[#7E153A] hover:bg-[#630f2d] text-white shadow-md shadow-[#7E153A]/20 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin mr-1.5" />{' '}
                    Submitting...
                  </>
                ) : (
                  'Submit Review'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
