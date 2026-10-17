'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, Trash2, HelpCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface ConfirmDialogOptions {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'destructive' | 'default' | 'warning';
  icon?: 'trash' | 'alert' | 'help';
}

interface ActiveConfirm extends ConfirmDialogOptions {
  id: string;
  resolve: (value: boolean) => void;
}

let activeConfirm: ActiveConfirm | null = null;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

/**
 * Open a custom theme-based confirmation dialog.
 * Returns a Promise that resolves to true if confirmed, false if cancelled.
 */
export function confirmDialog(
  options: ConfirmDialogOptions | string
): Promise<boolean> {
  return new Promise((resolve) => {
    const opts: ConfirmDialogOptions =
      typeof options === 'string' ? { message: options } : options;

    activeConfirm = {
      ...opts,
      id: Math.random().toString(36).substring(2, 9),
      resolve,
    };
    notify();
  });
}

/** Hook alias for confirmDialog */
export function useConfirm() {
  return confirmDialog;
}

/**
 * Global host component for rendering confirmation dialogs.
 * Mount this once in the root layout (e.g. layout.tsx).
 */
export function ConfirmDialogHost() {
  const [current, setCurrent] = useState<ActiveConfirm | null>(activeConfirm);
  const [mounted, setMounted] = useState(false);

  const handleConfirm = useCallback(() => {
    if (!current) return;
    const resolve = current.resolve;
    activeConfirm = null;
    setCurrent(null);
    notify();
    resolve(true);
  }, [current]);

  const handleCancel = useCallback(() => {
    if (!current) return;
    const resolve = current.resolve;
    activeConfirm = null;
    setCurrent(null);
    notify();
    resolve(false);
  }, [current]);

  useEffect(() => {
    setMounted(true);
    const listener = () => setCurrent(activeConfirm);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  useEffect(() => {
    if (!current) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCancel();
      } else if (e.key === 'Enter') {
        handleConfirm();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [current, handleCancel, handleConfirm]);

  if (!mounted || !current) return null;

  const isDestructive =
    current.variant === 'destructive' || current.icon === 'trash';
  const isWarning = current.variant === 'warning';

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={handleCancel}
      />

      {/* Dialog Card */}
      <div className="relative z-10 w-full max-w-sm bg-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-gray-100 animate-in zoom-in-95 fade-in duration-200 space-y-4 font-sans text-center">
        {/* Close Button */}
        <button
          onClick={handleCancel}
          className="absolute right-3.5 top-3.5 p-1 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X size={15} />
        </button>

        {/* Minimal Icon Badge */}
        <div
          className={`w-11 h-11 rounded-2xl flex items-center justify-center mx-auto border ${
            isDestructive
              ? 'bg-red-50 text-[#7E153A] border-red-100'
              : isWarning
                ? 'bg-amber-50 text-amber-700 border-amber-100'
                : 'bg-red-50 text-[#7E153A] border-red-100'
          }`}
        >
          {isDestructive ? (
            <Trash2 size={20} strokeWidth={2.2} />
          ) : isWarning ? (
            <AlertTriangle size={20} strokeWidth={2.2} />
          ) : (
            <HelpCircle size={20} strokeWidth={2.2} />
          )}
        </div>

        {/* Minimal Text Content */}
        <div className="space-y-1">
          <h3 className="text-base font-extrabold text-gray-900 tracking-tight">
            {current.title || current.message}
          </h3>
          {current.title &&
            current.message &&
            current.title !== current.message && (
              <p className="text-xs text-gray-500 font-medium px-2 leading-relaxed">
                {current.message}
              </p>
            )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 pt-1">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            className="flex-1 h-10 text-xs font-bold rounded-xl border-gray-200 text-gray-700 hover:bg-gray-50 cursor-pointer"
          >
            {current.cancelText || 'Cancel'}
          </Button>

          <Button
            type="button"
            onClick={handleConfirm}
            className={`flex-1 h-10 text-xs font-bold rounded-xl text-white shadow-xs cursor-pointer transition-all ${
              isDestructive
                ? 'bg-[#7E153A] hover:bg-[#630f2d]'
                : isWarning
                  ? 'bg-amber-600 hover:bg-amber-700'
                  : 'bg-[#7E153A] hover:bg-[#630f2d]'
            }`}
          >
            {current.confirmText || (isDestructive ? 'Delete' : 'Confirm')}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
