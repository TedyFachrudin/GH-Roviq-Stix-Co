'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Alert02Icon,
  Cancel01Icon,
  CheckmarkCircle02Icon,
  InformationCircleIcon,
  Loading03Icon,
  MultiplicationSignCircleIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

export interface ToastItem {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  type?: 'success' | 'info' | 'warning' | 'error' | 'loading';
  duration?: number;
  actionProps?: {
    children: React.ReactNode;
    onClick?: () => void;
  };
}

type ToastListener = () => void;

class ToastManager {
  private toasts: ToastItem[] = [];
  private listeners: Set<ToastListener> = new Set();
  private nextId = 0;

  subscribe(listener: ToastListener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  notify() {
    this.listeners.forEach((listener) => listener());
  }

  getToasts() {
    return this.toasts;
  }

  add(toast: Omit<ToastItem, 'id'>): string {
    const id = `toast-${++this.nextId}-${Date.now()}`;
    const newToast: ToastItem = { ...toast, id };
    this.toasts = [newToast, ...this.toasts].slice(0, 4);
    this.notify();

    const duration = toast.duration ?? (toast.type === 'loading' ? 0 : 4000);
    if (duration > 0) {
      setTimeout(() => {
        this.close(id);
      }, duration);
    }

    return id;
  }

  close(id: string) {
    this.toasts = this.toasts.filter((t) => t.id !== id);
    this.notify();
  }
}

export const toast = new ToastManager();

export function useToastManager() {
  const [toasts, setToasts] = React.useState<ToastItem[]>(() => toast.getToasts());

  React.useEffect(() => {
    return toast.subscribe(() => {
      setToasts([...toast.getToasts()]);
    });
  }, []);

  return {
    toasts,
    close: (id: string) => toast.close(id),
  };
}

function ToastIcon({ type }: { type: string | undefined }) {
  let icon: React.ReactNode = null;

  if (type === 'success') {
    icon = (
      <HugeiconsIcon
        icon={CheckmarkCircle02Icon}
        strokeWidth={2}
        className="text-[#7E4124]"
        aria-hidden="true"
      />
    );
  } else if (type === 'info') {
    icon = (
      <HugeiconsIcon
        icon={InformationCircleIcon}
        strokeWidth={2}
        className="text-[#AC6D36]"
        aria-hidden="true"
      />
    );
  } else if (type === 'warning') {
    icon = (
      <HugeiconsIcon
        icon={Alert02Icon}
        strokeWidth={2}
        className="text-[#DD9F57]"
        aria-hidden="true"
      />
    );
  } else if (type === 'error') {
    icon = (
      <HugeiconsIcon
        icon={MultiplicationSignCircleIcon}
        strokeWidth={2}
        className="text-red-600"
        aria-hidden="true"
      />
    );
  } else if (type === 'loading') {
    icon = (
      <HugeiconsIcon
        icon={Loading03Icon}
        strokeWidth={2}
        className="animate-spin text-[#7E4124]"
        aria-hidden="true"
      />
    );
  }

  if (!icon) return null;

  return (
    <span
      data-slot="toast-icon"
      className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-[#EAE4DA] text-[#7E4124] [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4.5"
    >
      {icon}
    </span>
  );
}

export function Toaster({ className }: { className?: string }) {
  const { toasts, close } = useToastManager();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div
      aria-live="polite"
      className={cn(
        'pointer-events-none fixed inset-x-4 bottom-4 z-[9999] mx-auto flex flex-col gap-2.5 max-w-sm sm:right-6 sm:bottom-6 sm:left-auto sm:mx-0 sm:w-full',
        className
      )}
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((item) => (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            className="pointer-events-auto rounded-2xl border border-[#D8D0C8] bg-[#F3EFEA]/95 backdrop-blur-md text-[#010101] p-4 shadow-2xl flex items-center gap-3 select-none"
          >
            <ToastIcon type={item.type} />
            <div className="flex-1 min-w-0 flex flex-col gap-0.5">
              {item.title && (
                <h4 className="text-sm font-bold tracking-tight text-[#010101] line-clamp-1">
                  {item.title}
                </h4>
              )}
              {item.description && (
                <p className="text-xs text-[#7A7269] leading-snug line-clamp-2">
                  {item.description}
                </p>
              )}
            </div>
            {item.actionProps && (
              <Button
                variant="outline"
                size="sm"
                onClick={item.actionProps.onClick}
                className="shrink-0 text-xs font-semibold py-1 px-2.5 h-7"
              >
                {item.actionProps.children}
              </Button>
            )}
            <button
              type="button"
              onClick={() => close(item.id)}
              className="shrink-0 p-1 rounded-full text-[#7A7269] hover:text-[#010101] transition-colors"
              aria-label="Tutup notifikasi"
            >
              <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
