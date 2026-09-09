'use client';

import React from 'react';
import { X, PlayCircle, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HowToMeasureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MEASUREMENT_GUIDES = [
  {
    title: '1. Shoulder Width',
    desc: 'Measure horizontally from the edge of one shoulder bone across the back to the edge of the opposite shoulder bone.',
  },
  {
    title: '2. Bust / Chest',
    desc: 'Wrap the tape measure around the fullest part of your bust/chest, keeping the tape parallel to the floor.',
  },
  {
    title: '3. Natural Waist',
    desc: 'Measure around the narrowest part of your waistline, usually right above the belly button.',
  },
  {
    title: '4. Hip Measurement',
    desc: 'Stand with feet together and measure around the fullest part of your hips/seat.',
  },
  {
    title: '5. Sleeve Length',
    desc: 'Measure from shoulder tip down over the arm to the desired cuff length (wrist).',
  },
  {
    title: '6. Shirt / Kameez Length',
    desc: 'Measure vertically from top shoulder neck point straight down to your preferred hemline.',
  },
];

export function HowToMeasureModal({ isOpen, onClose }: HowToMeasureModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2 min-w-0">
            <PlayCircle className="text-[#7E153A] shrink-0" size={20} />
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-gray-900 truncate">
                How to Measure at Home
              </h3>
              <p className="text-[11px] sm:text-xs text-gray-500 truncate">
                Simple step-by-step measurement instructions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-200/60 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors shrink-0 cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        {/* Video / Visual Hero Banner */}
        <div className="bg-gray-900 text-white p-4 sm:p-6 relative flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#7E153A] flex items-center justify-center shadow-lg shadow-[#7E153A]/50 mb-2.5 sm:mb-3 animate-pulse">
            <PlayCircle size={24} className="sm:w-7 sm:h-7" />
          </div>
          <h4 className="font-bold text-sm sm:text-base">
            Watch 1-Minute Measurement Video Guide
          </h4>
          <p className="text-[11px] sm:text-xs text-gray-300 max-w-md mt-1 leading-relaxed">
            Follow our tailor master video to record accurate measurements in
            under 2 minutes.
          </p>
        </div>

        {/* Guides List */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3 sm:space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4">
            {MEASUREMENT_GUIDES.map((guide) => (
              <div
                key={guide.title}
                className="p-3 sm:p-4 rounded-xl bg-gray-50 border border-gray-100"
              >
                <h5 className="font-bold text-xs sm:text-sm text-[#7E153A] mb-0.5 sm:mb-1">
                  {guide.title}
                </h5>
                <p className="text-[11px] sm:text-xs text-gray-600 leading-relaxed">
                  {guide.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="p-3 sm:p-4 rounded-xl bg-red-50/50 border border-red-100 flex items-center gap-2.5 text-[11px] sm:text-xs text-gray-700">
            <ShieldCheck className="text-[#7E153A] shrink-0" size={18} />
            <p className="leading-relaxed">
              <strong className="text-gray-900">
                Free Alteration Guarantee:
              </strong>{' '}
              Don&apos;t worry about minor errors! Our master tailors inspect
              all measurements, and we provide 7 days of free alterations.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-100 bg-gray-50/50">
          <Button
            onClick={onClose}
            className="w-full sm:w-auto bg-[#7E153A] hover:bg-[#630f2d] text-white h-10 sm:h-9 text-xs font-semibold px-6 cursor-pointer"
          >
            Got It! Return to Measurements
          </Button>
        </div>
      </div>
    </div>
  );
}
