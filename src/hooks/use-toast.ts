'use client';

import React, { useState, useEffect, useCallback } from 'react';

export type ToastVariant =
  'default' | 'destructive' | 'success' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

type ToastListener = (toasts: ToastItem[]) => void;

let memoryToasts: ToastItem[] = [];
const listeners = new Set<ToastListener>();

function notify() {
  listeners.forEach((listener) => listener([...memoryToasts]));
}

export function toast({
  title,
  description,
  variant = 'default',
  duration = 4500,
}: {
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}) {
  const id =
    Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
  const newToast: ToastItem = { id, title, description, variant, duration };

  // Keep up to 4 concurrent toasts
  memoryToasts = [newToast, ...memoryToasts].slice(0, 4);
  notify();

  if (duration > 0) {
    setTimeout(() => {
      dismissToast(id);
    }, duration);
  }

  return id;
}

export function dismissToast(id: string) {
  memoryToasts = memoryToasts.filter((t) => t.id !== id);
  notify();
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>(memoryToasts);

  useEffect(() => {
    listeners.add(setToasts);
    return () => {
      listeners.delete(setToasts);
    };
  }, []);

  const triggerToast = useCallback(
    (props: {
      title?: string;
      description?: string;
      variant?: ToastVariant;
      duration?: number;
    }) => {
      return toast(props);
    },
    []
  );

  const dismiss = useCallback((id: string) => {
    dismissToast(id);
  }, []);

  return {
    toast: triggerToast,
    dismiss,
    toasts,
  };
}
