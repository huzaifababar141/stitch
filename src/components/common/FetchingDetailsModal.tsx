'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Scissors,
  CheckCircle2,
  Globe,
  Loader2,
  X,
} from 'lucide-react';

interface FetchingDetailsModalProps {
  isOpen: boolean;
  url?: string;
  onCancel?: () => void;
  isSuccess?: boolean;
}

const SCAN_STEPS = [
  {
    label: 'Connecting to online brand store...',
    sub: 'Establishing secure connection',
  },
  {
    label: 'Extracting dress specifications & price...',
    sub: 'Parsing fabric material & metadata',
  },
  {
    label: 'Downloading high-resolution photos...',
    sub: 'Rendering complete catalog gallery',
  },
  {
    label: 'Synchronizing custom tailoring profile...',
    sub: 'Matching garment silhouette',
  },
];

export function FetchingDetailsModal({
  isOpen,
  url = '',
  onCancel,
  isSuccess = false,
}: FetchingDetailsModalProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [progress, setProgress] = useState(15);

  // Extract clean domain for presentation
  const domain = React.useMemo(() => {
    try {
      if (!url) return '';
      const u = new URL(url.startsWith('http') ? url : `https://${url}`);
      return u.hostname.replace(/^www\./, '');
    } catch {
      return '';
    }
  }, [url]);

  useEffect(() => {
    if (!isOpen) {
      setStepIndex(0);
      setProgress(15);
      return;
    }

    if (isSuccess) {
      setProgress(100);
      return;
    }

    // Progress bar animation timer
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 92) return 92;
        return prev + Math.floor(Math.random() * 8) + 4;
      });
    }, 400);

    // Step ticker timer
    const stepInterval = setInterval(() => {
      setStepIndex((prev) => (prev < SCAN_STEPS.length - 1 ? prev + 1 : prev));
    }, 1200);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stepInterval);
    };
  }, [isOpen, isSuccess]);

  if (!isOpen) return null;

  const currentStep = SCAN_STEPS[stepIndex] || SCAN_STEPS[0];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200 font-sans select-none"
    >
      <div className="relative w-full max-w-sm sm:max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 sm:p-8 text-center space-y-5 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Top burgundy brand accent strip */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#7E153A] via-[#A01B4C] to-[#5a0f2a]" />

        {/* Optional top close / cancel button */}
        {onCancel && !isSuccess && (
          <button
            type="button"
            onClick={onCancel}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Cancel fetching"
          >
            <X size={16} />
          </button>
        )}

        {/* Central Animated Tailoring Radar Graphic */}
        <div className="pt-2">
          <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
            {/* Outer pulsating radar rings */}
            <div
              className={`absolute inset-0 rounded-full bg-[#7E153A]/10 transition-transform duration-1000 ${
                isSuccess ? 'scale-110' : 'animate-ping'
              }`}
            />
            <div
              className={`absolute inset-2 rounded-full bg-[#7E153A]/15 transition-transform duration-700 ${
                isSuccess ? 'scale-105' : 'animate-pulse'
              }`}
            />

            {/* Inner Core Circle */}
            <div
              className={`relative z-10 w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 ${
                isSuccess
                  ? 'bg-emerald-600 text-white shadow-emerald-600/30 rotate-0'
                  : 'bg-gradient-to-br from-[#7E153A] to-[#5a0f2a] text-white shadow-[#7E153A]/30'
              }`}
            >
              {isSuccess ? (
                <CheckCircle2
                  size={32}
                  className="animate-in zoom-in duration-200"
                />
              ) : (
                <div className="relative">
                  <Scissors size={26} className="text-white animate-pulse" />
                  <Sparkles
                    size={14}
                    className="absolute -top-2 -right-2 text-amber-300 animate-spin"
                    style={{ animationDuration: '3s' }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Status Text & Domain Badge */}
        <div className="space-y-2">
          {domain && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-[#7E153A] border border-red-100 text-[11px] font-bold">
              <Globe size={12} className="shrink-0" />
              <span className="truncate max-w-[200px]">{domain}</span>
            </div>
          )}

          <h3 className="text-base sm:text-lg font-black text-gray-900 tracking-tight">
            {isSuccess
              ? 'Details Fetched Successfully!'
              : 'Fetching Suit Details...'}
          </h3>

          <p className="text-xs text-gray-500 font-medium transition-all duration-300 min-h-[36px] flex flex-col justify-center">
            {isSuccess ? (
              <span className="text-emerald-700 font-bold">
                Suit details and high-resolution photos loaded.
              </span>
            ) : (
              <>
                <span className="font-semibold text-gray-700">
                  {currentStep.label}
                </span>
                <span className="text-[11px] text-gray-400 mt-0.5">
                  {currentStep.sub}
                </span>
              </>
            )}
          </p>
        </div>

        {/* Smooth Animated Progress Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-500 ease-out ${
                isSuccess
                  ? 'bg-emerald-500 w-full'
                  : 'bg-gradient-to-r from-[#7E153A] via-[#A01B4C] to-[#7E153A]'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] text-gray-400 font-medium px-1">
            <span className="flex items-center gap-1">
              {!isSuccess && (
                <Loader2 size={10} className="animate-spin text-[#7E153A]" />
              )}
              {isSuccess ? 'Ready' : 'Analyzing link'}
            </span>
            <span className="font-mono font-bold">{progress}%</span>
          </div>
        </div>

        {/* Footer cancel prompt */}
        {onCancel && !isSuccess && (
          <div className="pt-1">
            <button
              type="button"
              onClick={onCancel}
              className="text-xs font-semibold text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            >
              Cancel Fetch
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
