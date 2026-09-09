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
          description: 'Thank you for rating your tailoring master!',
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
        description: 'Network error.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 font-sans">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold uppercase tracking-wider mb-2">
            <Star size={14} className="fill-amber-500 text-amber-500" />{' '}
            Tailoring Feedback & Ratings
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            My Reviews & Fitting Ratings
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Verified fitting ratings and feedback left for workshop master
            tailors on delivered suits.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-amber-50/60 border border-amber-200/60 p-4 rounded-2xl">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black shadow-xs text-base">
            {averageScore}
          </div>
          <div>
            <p className="text-xs font-bold text-gray-900">Average Fit Score</p>
            <p className="text-[10px] text-gray-500">
              Based on your delivered suits
            </p>
          </div>
        </div>
      </div>

      {/* Unreviewed Delivered Orders Banner */}
      {unreviewedOrders.length > 0 && (
        <div className="bg-gradient-to-r from-[#7E153A]/10 to-red-50/50 border border-[#7E153A]/20 p-5 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#7E153A] text-white flex items-center justify-center shrink-0">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-gray-900">
                You have {unreviewedOrders.length} delivered suit
                {unreviewedOrders.length > 1 ? 's' : ''} ready to review
              </h3>
              <p className="text-xs text-gray-500">
                Share your fit feedback to help our master tailors keep your
                silhouette perfected.
              </p>
            </div>
          </div>

          <Button
            onClick={() => setSelectedOrder(unreviewedOrders[0])}
            className="h-10 px-5 text-xs font-bold bg-[#7E153A] hover:bg-[#630f2d] text-white rounded-xl shadow-xs shrink-0 cursor-pointer"
          >
            <Star size={14} className="mr-1.5 fill-white" /> Rate Order #
            {unreviewedOrders[0].orderNumber}
          </Button>
        </div>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="bg-white rounded-3xl border border-gray-100 p-16 text-center shadow-xs">
          <Loader2
            size={36}
            className="animate-spin text-[#7E153A] mx-auto mb-3"
          />
          <p className="text-xs font-semibold text-gray-600">
            Loading your feedback history...
          </p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 p-16 text-center shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <Star size={32} />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-gray-900">
              No Fitting Reviews Yet
            </h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
              Once your first tailored suit is delivered to your doorstep, you
              can leave a fitting rating here for your master tailor.
            </p>
          </div>
          <Link href="/orders">
            <Button className="bg-[#7E153A] text-white text-xs font-bold px-6 rounded-xl cursor-pointer">
              View Active Orders
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-7 shadow-xs space-y-4 hover:shadow-md transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-gray-400 block">
                      {rev.orderNumber}
                    </span>
                    {rev.orderId && (
                      <Link
                        href={`/orders/${rev.orderId}`}
                        className="text-[#7E153A] hover:underline flex items-center gap-0.5 text-[11px] font-semibold"
                      >
                        View Order <ExternalLink size={10} />
                      </Link>
                    )}
                  </div>
                  <h3 className="font-extrabold text-base text-gray-900 mt-0.5">
                    {rev.suitName}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Tailored by{' '}
                    <span className="font-semibold text-gray-800">
                      {rev.tailorName}
                    </span>{' '}
                    · {new Date(rev.date).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={
                        i < rev.rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-gray-200'
                      }
                    />
                  ))}
                </div>
              </div>

              <p className="text-xs text-gray-600 leading-relaxed font-normal">
                &quot;{rev.reviewText}&quot;
              </p>

              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl w-max">
                <CheckCircle2 size={14} /> Verified Fitting QC Pass
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Submission Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-lg font-extrabold text-gray-900">
                  Review Delivered Suit
                </h3>
                <p className="text-xs text-gray-500">
                  Order #{selectedOrder.orderNumber}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitFeedback} className="space-y-5">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-2">
                  Overall Tailoring Rating
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setOverallRating(star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        size={28}
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
                  Fitting Accuracy (Chest, Waist, Shoulders)
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setFitRating(star)}
                      className="p-1 hover:scale-110 transition-transform"
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
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Your Review & Fitting Feedback
                </label>
                <textarea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="How was the stitching quality, neckline finishing, and overall fit?"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#7E153A]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setSelectedOrder(null)}
                  className="h-10 text-xs font-bold text-gray-600 rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="h-10 bg-[#7E153A] hover:bg-[#630f2d] text-white text-xs font-bold px-6 rounded-xl shadow-xs"
                >
                  {submitting ? (
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
