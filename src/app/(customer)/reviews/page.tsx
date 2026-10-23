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
  const { user, loading: authLoading } = useAuth();
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
    if (authLoading) return;
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
  }, [user, authLoading]);

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
          title: 'Review Submitted',
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
    <div className="w-full min-w-0 max-w-7xl mx-auto space-y-4 sm:space-y-5 font-sans">
      {/* ── Top Header Banner ── */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#F1E6E1] p-4 sm:p-6 shadow-[0_4px_20px_rgba(122,16,56,0.03)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FDF0F3] text-[#7E153A] flex items-center justify-center shrink-0 border border-[#7E153A]/10">
              <Award size={17} />
            </div>
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold text-[#1A1A2E] tracking-tight">
                Fitting Reviews
              </h1>
              {reviews.length > 0 && (
                <span className="bg-[#FDF0F3] text-[#7E153A] text-[11px] font-bold px-2 py-0.5 rounded-full border border-[#7E153A]/15">
                  {reviews.length}
                </span>
              )}
            </div>
          </div>
          <p className="text-xs text-[#6B6B7B] max-w-md leading-relaxed">
            Verified fit scores and feedback from your delivered orders.
          </p>
        </div>

        {/* Average Fit Score Card - in theme colors */}
        <div className="bg-[#FAF7F5] border border-[#F1E6E1] px-4 py-3 rounded-2xl flex items-center gap-3.5 shrink-0 self-start sm:self-auto">
          <div className="text-2xl font-bold text-[#7E153A] font-mono leading-none tracking-tight">
            {averageScore}
          </div>
          <div className="h-8 w-px bg-[#F1E6E1]" />
          <div>
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={13}
                  className="fill-[#C59A4E] text-[#C59A4E]"
                />
              ))}
            </div>
            <p className="text-[11px] font-bold text-[#1A1A2E] mt-0.5">
              Average Fit Score
            </p>
          </div>
        </div>
      </div>

      {/* ── 3 Separate Master Tailor & QC Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl border border-[#F1E6E1] p-3.5 sm:p-4 flex items-center gap-3.5 shadow-2xs">
          <div className="w-9 h-9 rounded-xl bg-[#FDF0F3] text-[#7E153A] flex items-center justify-center shrink-0 border border-[#7E153A]/10">
            <Scissors size={16} />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-[#1A1A2E] truncate">
              Master Tailor Craft
            </h4>
            <p className="text-[11px] text-[#6B6B7B] truncate mt-0.5">
              10+ years bespoke experience
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#F1E6E1] p-3.5 sm:p-4 flex items-center gap-3.5 shadow-2xs">
          <div className="w-9 h-9 rounded-xl bg-[#FDF0F3] text-[#7E153A] flex items-center justify-center shrink-0 border border-[#7E153A]/10">
            <CheckCircle2 size={16} />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-[#1A1A2E] truncate">
              14-Point QC Check
            </h4>
            <p className="text-[11px] text-[#6B6B7B] truncate mt-0.5">
              Collar, sleeves & paicha inspection
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#F1E6E1] p-3.5 sm:p-4 flex items-center gap-3.5 shadow-2xs">
          <div className="w-9 h-9 rounded-xl bg-[#FDF0F3] text-[#7E153A] flex items-center justify-center shrink-0 border border-[#7E153A]/10">
            <ShieldCheck size={16} />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-[#1A1A2E] truncate">
              7-Day Free Alterations
            </h4>
            <p className="text-[11px] text-[#6B6B7B] truncate mt-0.5">
              100% doorstep fit guarantee
            </p>
          </div>
        </div>
      </div>

      {/* ── Unreviewed Delivered Orders Banner ── */}
      {unreviewedOrders.length > 0 && (
        <div className="bg-[#FAF7F5] border-l-4 border-l-[#7E153A] border border-[#F1E6E1] p-3.5 sm:p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#7E153A] text-white flex items-center justify-center font-bold shrink-0">
              <Sparkles size={15} />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-bold text-[#1A1A2E] truncate">
                Delivered suit ready for review
              </h3>
              <p className="text-[11px] text-[#6B6B7B] truncate">
                Order #{unreviewedOrders[0].orderNumber}
              </p>
            </div>
          </div>

          <button
            onClick={() => setSelectedOrder(unreviewedOrders[0])}
            className="w-full sm:w-auto h-9 px-4 text-xs font-semibold bg-[#7E153A] hover:bg-[#650D2F] text-white rounded-xl shadow-xs shrink-0 cursor-pointer flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
          >
            <Star size={12} className="fill-white" /> Rate Fit
          </button>
        </div>
      )}

      {/* ── Reviews Feed Grid ── */}
      {loading || authLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 min-w-0 w-full animate-in fade-in duration-200">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-[#F1E6E1] p-4 sm:p-6 shadow-xs flex flex-col justify-between space-y-3.5 animate-pulse"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2 border-b border-[#F1E6E1]/60 pb-3">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="h-3.5 w-24 bg-gray-200 rounded" />
                    <div className="h-4 w-36 bg-gray-300 rounded" />
                  </div>
                  <div className="h-6 w-24 bg-[#FDF0F3] rounded-xl" />
                </div>
                <div className="space-y-2 py-1">
                  <div className="h-3 w-full bg-gray-100 rounded" />
                  <div className="h-3 w-4/5 bg-gray-100 rounded" />
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                <div className="h-4 w-28 bg-gray-100 rounded-full" />
                <div className="h-3 w-20 bg-gray-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#F1E6E1] p-8 sm:p-14 flex flex-col items-center justify-center text-center shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#FDF0F3] text-[#7E153A] flex items-center justify-center shadow-xs border border-[#7E153A]/10">
            <Award size={22} />
          </div>

          <div className="space-y-1 max-w-sm">
            <h3 className="text-base font-bold text-[#1A1A2E]">
              No Reviews Yet
            </h3>
            <p className="text-xs text-[#6B6B7B] leading-relaxed">
              Fitting feedback and tailor ratings will appear here once your
              orders are delivered.
            </p>
          </div>

          <div className="pt-2">
            <Link href="/orders">
              <Button className="bg-[#7E153A] hover:bg-[#650D2F] text-white text-xs font-semibold px-6 h-9.5 rounded-xl shadow-xs cursor-pointer">
                View Active Orders
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white rounded-2xl border border-[#F1E6E1] p-4 sm:p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3.5"
            >
              <div className="space-y-3">
                {/* Order & Rating Header */}
                <div className="flex items-start justify-between gap-2 border-b border-[#F1E6E1]/60 pb-3">
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#7E153A] bg-[#FDF0F3] px-2 py-0.5 rounded border border-[#7E153A]/10">
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
                    <h3 className="font-bold text-sm sm:text-base text-[#1A1A2E] truncate pt-1">
                      {rev.suitName}
                    </h3>
                  </div>

                  {/* Refined Gold Stars */}
                  <div className="flex items-center gap-0.5 shrink-0 bg-[#FAF7F5] px-2.5 py-1 rounded-xl border border-[#F1E6E1]">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={13}
                        className={
                          i < rev.rating
                            ? 'fill-[#C59A4E] text-[#C59A4E]'
                            : 'text-[#E8DCD5]'
                        }
                      />
                    ))}
                  </div>
                </div>

                {/* Master Tailor Attribution */}
                <div className="flex items-center gap-2 text-xs text-[#6B6B7B]">
                  <Scissors size={13} className="text-[#7E153A] shrink-0" />
                  <span className="truncate">
                    Tailored by{' '}
                    <strong className="text-[#1A1A2E]">{rev.tailorName}</strong>{' '}
                    ·{' '}
                    {new Date(rev.date).toLocaleDateString(undefined, {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                {/* Review Text */}
                <p className="text-xs text-[#1A1A2E]/80 leading-relaxed font-normal bg-[#FAF7F5] p-3 rounded-xl border border-[#F1E6E1] break-words">
                  &quot;{rev.reviewText}&quot;
                </p>
              </div>

              {/* QC Pass Verified Badge in Theme Color */}
              <div className="pt-1 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#7E153A] bg-[#FDF0F3] px-2.5 py-1 rounded-lg border border-[#7E153A]/15">
                  <CheckCircle2 size={13} className="text-[#7E153A]" />
                  <span>Verified QC Pass</span>
                </div>

                <span className="text-[11px] font-bold text-[#1A1A2E]">
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
          <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-lg w-full p-4 sm:p-6 md:p-8 shadow-2xl space-y-4 sm:space-y-6 max-h-[92vh] flex flex-col justify-between overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200 border border-[#F1E6E1]">
            {/* Mobile Grab Bar */}
            <div className="w-12 h-1 bg-[#F1E6E1] rounded-full mx-auto sm:hidden shrink-0" />

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#F1E6E1] pb-3 sm:pb-4 shrink-0">
              <div className="space-y-0.5 min-w-0 pr-2">
                <h2 className="text-lg sm:text-xl font-bold text-[#1A1A2E] truncate">
                  Review Delivered Suit
                </h2>
                <p className="text-xs text-[#6B6B7B] truncate">
                  Order #{selectedOrder.orderNumber}
                </p>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 rounded-full bg-[#FAF7F5] hover:bg-[#FDF0F3] flex items-center justify-center text-[#6B6B7B] hover:text-[#7E153A] transition-colors cursor-pointer shrink-0 border border-[#F1E6E1]"
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
              <div className="space-y-2 bg-[#FAF7F5] p-3.5 rounded-2xl border border-[#F1E6E1]">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#1A1A2E] block">
                    Overall Tailoring & Craftsmanship
                  </label>
                  <span className="text-[11px] font-bold text-[#7E153A]">
                    {getRatingLabel(overallRating)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setOverallRating(star)}
                      className="p-1 hover:scale-105 transition-transform cursor-pointer"
                    >
                      <Star
                        size={26}
                        className={
                          star <= overallRating
                            ? 'fill-[#C59A4E] text-[#C59A4E]'
                            : 'text-[#E8DCD5] hover:text-[#C59A4E]/60'
                        }
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Fit Accuracy Rating */}
              <div className="space-y-2 bg-[#FAF7F5] p-3.5 rounded-2xl border border-[#F1E6E1]">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#1A1A2E] block">
                    Fitting Accuracy (Chest, Waist, Shoulders)
                  </label>
                  <span className="text-[11px] font-bold text-[#7E153A]">
                    {fitRating === 5 ? '100% Accurate Fit' : `${fitRating} / 5`}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setFitRating(star)}
                      className="p-1 hover:scale-105 transition-transform cursor-pointer"
                    >
                      <Star
                        size={24}
                        className={
                          star <= fitRating
                            ? 'fill-[#C59A4E] text-[#C59A4E]'
                            : 'text-[#E8DCD5] hover:text-[#C59A4E]/60'
                        }
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Feedback Textarea */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1A1A2E] block">
                  Your Review & Fitting Feedback
                </label>
                <textarea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="How was the stitching quality, neckline finishing, and overall fit?"
                  className="w-full bg-[#FAF7F5] border border-[#F1E6E1] rounded-xl p-3 text-xs focus:outline-hidden focus:border-[#7E153A] focus:ring-1 focus:ring-[#7E153A] text-[#1A1A2E] placeholder:text-[#6B6B7B]/70 leading-relaxed"
                />
              </div>
            </form>

            {/* Modal Footer Controls */}
            <div className="border-t border-[#F1E6E1] pt-3 sm:pt-4 flex flex-col-reverse sm:flex-row items-center justify-between gap-2.5 sm:gap-3 shrink-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSelectedOrder(null)}
                className="w-full sm:w-auto h-11 px-6 rounded-xl text-xs font-semibold cursor-pointer border-[#F1E6E1] text-[#6B6B7B] hover:bg-[#FAF7F5]"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                form="reviewForm"
                disabled={submitting}
                className="w-full sm:w-auto h-11 px-8 rounded-xl text-xs font-bold bg-[#7E153A] hover:bg-[#650D2F] text-white shadow-xs cursor-pointer"
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
