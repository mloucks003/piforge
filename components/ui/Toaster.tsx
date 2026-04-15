'use client';

import { useToastStore, type Toast } from '@/stores/toastStore';
import { X, CheckCircle2, Info, AlertTriangle, XCircle } from 'lucide-react';

const TYPE_STYLES: Record<Toast['type'], { bar: string; icon: string; bg: string; border: string }> = {
  success: {
    bar:    'bg-green-500',
    icon:   'text-green-400',
    bg:     'bg-green-500/8',
    border: 'border-green-500/25',
  },
  info: {
    bar:    'bg-blue-500',
    icon:   'text-blue-400',
    bg:     'bg-blue-500/8',
    border: 'border-blue-500/25',
  },
  warning: {
    bar:    'bg-yellow-500',
    icon:   'text-yellow-400',
    bg:     'bg-yellow-500/8',
    border: 'border-yellow-500/25',
  },
  error: {
    bar:    'bg-red-500',
    icon:   'text-red-400',
    bg:     'bg-red-500/8',
    border: 'border-red-500/25',
  },
};

const TYPE_ICONS = {
  success: CheckCircle2,
  info:    Info,
  warning: AlertTriangle,
  error:   XCircle,
};

function ToastItem({ toast }: { toast: Toast }) {
  const { dismiss } = useToastStore();
  const styles = TYPE_STYLES[toast.type];
  const Icon = TYPE_ICONS[toast.type];

  return (
    <div
      className={`relative flex items-start gap-3 rounded-xl border ${styles.border} ${styles.bg} shadow-2xl px-4 py-3 pr-8 min-w-[280px] max-w-[360px] backdrop-blur-sm overflow-hidden animate-in slide-in-from-right-4 fade-in duration-300`}
    >
      {/* Coloured left bar */}
      <div className={`absolute left-0 inset-y-0 w-1 ${styles.bar} rounded-l-xl`} />

      {/* Icon */}
      {toast.icon ? (
        <span className="text-lg leading-none shrink-0 mt-0.5">{toast.icon}</span>
      ) : (
        <Icon className={`h-4 w-4 shrink-0 mt-0.5 ${styles.icon}`} />
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-foreground leading-snug">{toast.message}</p>
        {toast.action && (
          <button
            onClick={() => { toast.action!.onClick(); dismiss(toast.id); }}
            className={`mt-1.5 text-[10px] font-semibold underline underline-offset-2 ${styles.icon} hover:opacity-80 transition-opacity`}
          >
            {toast.action.label}
          </button>
        )}
      </div>

      {/* Dismiss */}
      <button
        onClick={() => dismiss(toast.id)}
        className="absolute top-2 right-2 p-0.5 rounded hover:bg-white/10 transition-colors"
      >
        <X className="h-3 w-3 text-muted-foreground" />
      </button>
    </div>
  );
}

export default function Toaster() {
  const toasts = useToastStore((s) => s.toasts);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 items-end pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem toast={t} />
        </div>
      ))}
    </div>
  );
}
