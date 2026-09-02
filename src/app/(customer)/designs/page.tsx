'use client';

import React from 'react';
import Link from 'next/link';
import {
  Palette,
  Sparkles,
  Scissors,
  Plus,
  ArrowRight,
  Sliders,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MyDesignsPage() {
  const customStyles = [
    {
      id: '1',
      name: 'Festive Ban Gala with Bell Sleeves',
      garmentType: '3-Piece Shalwar Kameez',
      neck: 'Ban Collar with Placket',
      sleeve: 'Bell Sleeve (3/4th)',
      trouser: 'Straight Cigarette Pants (Paicha 13")',
      notes: 'Lace inserts along the damaam and sleeve cuffs',
    },
    {
      id: '2',
      name: 'Casual Lawn Daily Cut',
      garmentType: '2-Piece Kurti & Trouser',
      neck: 'Boat Neck / Round',
      sleeve: 'Full Sleeve with Cuffs',
      trouser: 'Comfort Fit Shalwar (Paicha 14")',
      notes: 'Pocket on right side of kameez',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 font-sans">
      <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-[#7E153A] text-xs font-bold uppercase tracking-wider mb-2">
            <Palette size={14} /> Saved Tailoring Styles
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            My Design Presets
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Save your favorite necklines, sleeve cuts, and trouser silhouettes
            to apply to any new unstitched suit order.
          </p>
        </div>

        <Link href="/new-order">
          <Button className="bg-[#7E153A] hover:bg-[#630f2d] text-white text-xs font-bold px-6 h-11 rounded-xl shadow-md shadow-[#7E153A]/20 cursor-pointer">
            <Plus size={16} className="mr-1.5" /> Design New Style
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {customStyles.map((style) => (
          <div
            key={style.id}
            className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-7 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-[#7E153A] uppercase tracking-wider">
                {style.garmentType}
              </span>
              <h3 className="font-extrabold text-base text-gray-900">
                {style.name}
              </h3>

              <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-100 space-y-2 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Neck Style:</span>
                  <span className="font-bold text-gray-900">{style.neck}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Sleeve Style:</span>
                  <span className="font-bold text-gray-900">
                    {style.sleeve}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Trouser Cut:</span>
                  <span className="font-bold text-gray-900">
                    {style.trouser}
                  </span>
                </div>
              </div>

              {style.notes && (
                <p className="text-xs text-gray-500 italic">
                  &quot;{style.notes}&quot;
                </p>
              )}
            </div>

            <div className="border-t border-gray-100 pt-4 flex justify-end">
              <Link href="/new-order">
                <Button className="h-9 text-xs font-bold bg-[#7E153A] hover:bg-[#630f2d] text-white rounded-xl shadow-xs">
                  <Scissors size={14} className="mr-1.5" /> Apply to Order
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
