import { useState, useCallback } from 'react';

export interface ToastProps {
  id?: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success';
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const toast = useCallback(
    ({ title, description, variant = 'default' }: ToastProps) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast = { id, title, description, variant };

      // Log to console for dev feedback as well
      if (variant === 'destructive') {
        console.error(`[Toast Error] ${title}: ${description}`);
      } else {
        console.log(`[Toast] ${title}: ${description}`);
      }

      setToasts((prev) => [...prev, newToast]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);

      return id;
    },
    []
  );

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return {
    toast,
    dismiss,
    toasts,
  };
}
