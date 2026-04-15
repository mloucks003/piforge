'use client';

/**
 * ContextualPrompt — a non-blocking, bottom-right prompt card that appears
 * when users click environment buttons or load advanced projects.
 * Dismisses automatically after 12 s if untouched.
 */

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { useContextPromptStore } from '@/stores/contextPromptStore';

export default function ContextualPrompt() {
  const { current, dismiss } = useContextPromptStore();

  // Auto-dismiss after 12 s
  useEffect(() => {
    if (!current) return;
    const t = setTimeout(dismiss, 12000);
    return () => clearTimeout(t);
  }, [current, dismiss]);

  if (!current) return null;

  return (
    <div
      className="fixed bottom-24 right-6 z-[9990] w-80 rounded-2xl border border-border bg-background shadow-2xl overflow-hidden animate-in slide-in-from-right-4 fade-in duration-300"
    >
      {/* Coloured top stripe */}
      <div className="h-1 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500" />

      {/* Header */}
      <div className="flex items-start gap-3 px-4 pt-4 pb-2">
        <span className="text-2xl leading-none shrink-0">{current.icon}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-foreground leading-snug">{current.title}</p>
        </div>
        <button
          onClick={dismiss}
          className="shrink-0 p-0.5 rounded hover:bg-accent transition-colors"
          title="Dismiss"
        >
          <X className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </div>

      {/* Body */}
      <p className="px-4 pb-4 text-[11px] text-muted-foreground leading-relaxed">
        {current.body}
      </p>

      {/* Actions */}
      <div className="flex gap-2 px-4 pb-4">
        <button
          onClick={() => { current.onPrimary(); dismiss(); }}
          className="flex-1 rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white hover:bg-green-500 transition-colors"
        >
          {current.primaryLabel}
        </button>
        {current.secondaryLabel && (
          <button
            onClick={() => { current.onSecondary?.(); dismiss(); }}
            className="rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-accent transition-colors"
          >
            {current.secondaryLabel}
          </button>
        )}
        <button
          onClick={dismiss}
          className="rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-accent transition-colors"
        >
          Not now
        </button>
      </div>
    </div>
  );
}
