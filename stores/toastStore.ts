import { create } from 'zustand';

export type ToastType = 'success' | 'info' | 'warning' | 'error';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  icon?: string;
  action?: { label: string; onClick: () => void };
  duration: number; // ms
}

interface ToastState {
  toasts: Toast[];
  show: (opts: Omit<Toast, 'id'>) => void;
  dismiss: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],

  show: (opts) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    set((s) => ({ toasts: [...s.toasts, { ...opts, id }] }));
    // Auto-dismiss
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, opts.duration ?? 3500);
  },

  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

// ── Convenience helpers ───────────────────────────────────────────────────────
export const toast = {
  success: (message: string, opts?: Partial<Omit<Toast, 'id' | 'type' | 'message'>>) =>
    useToastStore.getState().show({ message, type: 'success', duration: 3000, ...opts }),
  info: (message: string, opts?: Partial<Omit<Toast, 'id' | 'type' | 'message'>>) =>
    useToastStore.getState().show({ message, type: 'info', duration: 3500, ...opts }),
  warning: (message: string, opts?: Partial<Omit<Toast, 'id' | 'type' | 'message'>>) =>
    useToastStore.getState().show({ message, type: 'warning', duration: 4500, ...opts }),
  error: (message: string, opts?: Partial<Omit<Toast, 'id' | 'type' | 'message'>>) =>
    useToastStore.getState().show({ message, type: 'error', duration: 5000, ...opts }),
};
