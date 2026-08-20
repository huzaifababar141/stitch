'use client';

import React from 'react';
import { useToast, dismissToast, ToastItem } from '@/hooks/use-toast';
import {
  AlertCircle,
  CheckCircle2,
  Info,
  AlertTriangle,
  X,
} from 'lucide-react';

export function Toaster() {
  const { toasts } = useToast();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 max-w-md w-[calc(100vw-2.5rem)] pointer-events-none font-sans"
    >
      {toasts.map((t) => (
        <ToastCard key={t.id} toast={t} />
      ))}
    </div>
  );
}

function ToastCard({ toast }: { toast: ToastItem }) {
  const isDestructive = toast.variant === 'destructive';
  const isSuccess = toast.variant === 'success';
  const isWarning = toast.variant === 'warning';

  return (
    <div
      role="alert"
      className={`pointer-events-auto relative flex items-start gap-3.5 p-4 rounded-2xl bg-white/98 backdrop-blur-md shadow-xl shadow-gray-300/40 border border-gray-200/90 border-l-4 border-l-[#7E153A] transition-all duration-300 transform translate-y-0 animate-in fade-in slide-in-from-top-4`}
    >
      {/* Left Icon Badge */}
      <div className="shrink-0 pt-0.5">
        {isDestructive && (
          <div className="w-8 h-8 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-[#7E153A]">
            <AlertCircle size={18} strokeWidth={2.5} />
          </div>
        )}
        {isSuccess && (
          <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700">
            <CheckCircle2 size={18} strokeWidth={2.5} />
          </div>
        )}
        {isWarning && (
          <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700">
            <AlertTriangle size={18} strokeWidth={2.5} />
          </div>
        )}
        {!isDestructive && !isSuccess && !isWarning && (
          <div className="w-8 h-8 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-[#7E153A]">
            <Info size={18} strokeWidth={2.5} />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pr-2 space-y-0.5">
        {toast.title && (
          <h4
            className={`text-xs font-extrabold tracking-tight ${
              isDestructive
                ? 'text-[#7E153A]'
                : isSuccess
                  ? 'text-emerald-900'
                  : isWarning
                    ? 'text-amber-900'
                    : 'text-gray-900'
            }`}
          >
            {toast.title}
          </h4>
        )}
        {toast.description && (
          <p className="text-xs text-gray-600 font-medium leading-relaxed">
            {toast.description}
          </p>
        )}
      </div>

      {/* Dismiss Button */}
      <button
        type="button"
        onClick={() => dismissToast(toast.id)}
        aria-label="Dismiss notification"
        className="shrink-0 p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
      >
        <X size={15} />
      </button>
    </div>
  );
}
