'use client';

import { useState, useCallback } from 'react';

export type ToastVariant = 'default' | 'destructive' | 'success';

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
}

let toastListeners: ((toast: Toast) => void)[] = [];

export function toast({ title, description, variant = 'default' }: Omit<Toast, 'id'>) {
  const id = Math.random().toString(36).slice(2);
  const newToast = { id, title, description, variant };
  toastListeners.forEach((listener) => listener(newToast));
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Toast) => {
    setToasts((prev) => [...prev, toast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== toast.id));
    }, 5000);
  }, []);

  // Register listener
  useState(() => {
    toastListeners.push(addToast);
    return () => {
      toastListeners = toastListeners.filter((l) => l !== addToast);
    };
  });

  return {
    toasts,
    toast: (props: Omit<Toast, 'id'>) =>
      addToast({ id: Math.random().toString(36).slice(2), ...props }),
  };
}
