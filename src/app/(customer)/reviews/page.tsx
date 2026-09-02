'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Star,
  Sparkles,
  MessageSquare,
  CheckCircle2,
  ThumbsUp,
  Scissors,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ReviewsPage() {
  const [reviews] = useState([
    {
      id: '1',
      orderNumber: 'TLK-9021',
      suitName: 'Sana Safinaz Mahay Lawn 3-Piece',
      date: 'Aug 14, 2026',
      rating: 5,
      reviewText:
        'Fit is absolutely 100% perfect! The sleeves and chest measurements matched my body profile exactly without any need for alterations. Very impressed by the QC guarantee.',
      tailorName: 'Ustad Ali',
      verified: true,
    },
    {
      id: '2',
      orderNumber: 'TLK-8814',
      suitName: 'Maria.B Luxury Festive Chiffon',
      date: 'Jul 28, 2026',
      rating: 5,
      reviewText:
        'Lace detailing and ban collar finishing was designer-grade. TCS delivered right on time in Karachi.',
      tailorName: 'Ustad Tariq',
      verified: true,
    },
  ]);

  return (
    <div className="max-w-7xl mx-auto space-y-8 font-sans">
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
            Ratings left for workshop master tailors on delivered orders.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-amber-50/60 border border-amber-200/60 p-4 rounded-2xl">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black shadow-xs">
            5.0
          </div>
          <div>
            <p className="text-xs font-bold text-gray-900">Average Fit Score</p>
            <p className="text-[10px] text-gray-500">
              Based on delivered suits
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {reviews.map((rev) => (
          <div
            key={rev.id}
            className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-7 shadow-xs space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-4">
              <div>
                <span className="font-mono text-xs font-bold text-gray-400 block">
                  {rev.orderNumber}
                </span>
                <h3 className="font-extrabold text-base text-gray-900">
                  {rev.suitName}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Tailored by{' '}
                  <span className="font-semibold text-gray-800">
                    {rev.tailorName}
                  </span>{' '}
                  · {rev.date}
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
    </div>
  );
}
