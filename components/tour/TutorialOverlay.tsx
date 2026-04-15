'use client';

/**
 * TutorialOverlay — spotlight-style overlay driven by the active tutorialStore state.
 * Works exactly like GuidedTour but tied to step-by-step tutorials with completion conditions.
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { useTutorialStore } from '@/stores/tutorialStore';
import { X, ChevronRight, SkipForward, CheckCircle2 } from 'lucide-react';

interface Rect { top: number; left: number; width: number; height: number }
const PAD = 10;

function getTargetRect(target: string): Rect | null {
  const el = document.querySelector(`[data-tour="${target}"]`) as HTMLElement | null;
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { top: r.top - PAD, left: r.left - PAD, width: r.width + PAD * 2, height: r.height + PAD * 2 };
}

export default function TutorialOverlay() {
  const { active, currentStep, completed, advance, skipStep, stop } = useTutorialStore();
  const [rect, setRect] = useState<Rect | null>(null);
  // Fire onStart exactly once when a new tutorial becomes active
  const lastActiveIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (active && active.id !== lastActiveIdRef.current) {
      lastActiveIdRef.current = active.id;
      active.onStart?.();
    }
    if (!active) {
      lastActiveIdRef.current = null;
    }
  }, [active]);

  const step = active?.steps[currentStep];
  const total = active?.steps.length ?? 0;
  const allDone = active ? completed.every(Boolean) : false;
  const progress = active ? Math.round((completed.filter(Boolean).length / total) * 100) : 0;

  const measure = useCallback(() => {
    if (!active || !step?.tourTarget) { setRect(null); return; }
    setRect(getTargetRect(step.tourTarget));
  }, [active, step]);

  useEffect(() => {
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [measure]);

  if (!active || !step) return null;

  // Tooltip positioning
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1280;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
  const TW = 340, TH = 230;

  let tipStyle: React.CSSProperties = { position: 'fixed', zIndex: 10001, width: TW };
  if (rect) {
    const { placement } = (step as { tourTarget?: string; placement?: string });
    // Default: if target is on the left half, show tip to the right; else to the left
    const midX = rect.left + rect.width / 2;
    if (midX < vw / 2) {
      tipStyle.top  = Math.max(8, Math.min(rect.top, vh - TH - 8));
      tipStyle.left = Math.min(rect.left + rect.width + 16, vw - TW - 8);
    } else {
      tipStyle.top  = Math.max(8, Math.min(rect.top, vh - TH - 8));
      tipStyle.left = Math.max(8, rect.left - TW - 16);
    }
  } else {
    tipStyle = { position: 'fixed', zIndex: 10001, width: TW, bottom: 24, right: 24 };
  }

  return (
    <>
      {/* Dim overlay + spotlight hole */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 10000, pointerEvents: 'none' }}>
        {rect ? (
          <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
            <defs>
              <mask id="tut-mask">
                <rect width="100%" height="100%" fill="white" />
                <rect x={rect.left} y={rect.top} width={rect.width} height={rect.height} rx={8} fill="black" />
              </mask>
            </defs>
            <rect width="100%" height="100%" fill="rgba(0,0,0,0.6)" mask="url(#tut-mask)" />
            <rect x={rect.left} y={rect.top} width={rect.width} height={rect.height} rx={8}
              fill="none" stroke="#22c55e" strokeWidth={2.5} strokeDasharray="6 3" />
          </svg>
        ) : (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)' }} />
        )}
      </div>

      {/* Tooltip card */}
      <div style={tipStyle} className="rounded-xl border border-border bg-background shadow-2xl flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header stripe */}
        <div className="flex items-center justify-between gap-2 px-4 py-2.5 border-b border-border bg-muted/40">
          <div className="flex items-center gap-2 min-w-0">
            <CheckCircle2 className="h-3.5 w-3.5 text-green-400 shrink-0" />
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider truncate">{active.title}</span>
          </div>
          <button onClick={stop} className="shrink-0 p-1 rounded hover:bg-accent transition-colors" title="Exit tutorial">
            <X className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </div>

        {/* Progress */}
        <div className="h-1 bg-muted">
          <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>

        {/* Step content */}
        <div className="px-4 py-3 flex-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-green-400 font-semibold uppercase tracking-wide">
              Step {currentStep + 1} of {total}
            </span>
            <span className="text-[10px] text-muted-foreground">{progress}% done</span>
          </div>
          <p className="text-sm font-semibold text-foreground mb-1.5">{step.title}</p>
          <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">{step.content}</p>

          {step.hints && step.hints.length > 0 && (
            <div className="mt-2.5 rounded-lg bg-blue-500/8 border border-blue-500/20 px-2.5 py-2">
              <p className="text-[10px] font-semibold text-blue-400 mb-0.5">💡 Hint</p>
              {step.hints.map((h, i) => (
                <p key={i} className="text-[10px] text-muted-foreground">{h}</p>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        {!allDone ? (
          <div className="flex gap-2 px-4 py-3 border-t border-border">
            <button onClick={skipStep}
              className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-accent transition-colors">
              <SkipForward className="h-3 w-3" /> Skip
            </button>
            <button onClick={advance}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-500 transition-colors">
              {currentStep === total - 1 ? 'Finish 🎉' : 'Done — Next'}
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <div className="px-4 py-3 border-t border-border">
            <button onClick={stop}
              className="w-full rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white hover:bg-green-500 transition-colors">
              🎉 Tutorial Complete — Back to Tutorials
            </button>
          </div>
        )}
      </div>
    </>
  );
}
