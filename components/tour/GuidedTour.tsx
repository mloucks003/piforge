'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTourStore, TOUR_STEPS } from '@/stores/tourStore';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface Rect { top: number; left: number; width: number; height: number }

const PAD = 10;

function getTargetRect(target: string): Rect | null {
  const el = document.querySelector(`[data-tour="${target}"]`) as HTMLElement | null;
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { top: r.top - PAD, left: r.left - PAD, width: r.width + PAD * 2, height: r.height + PAD * 2 };
}

export default function GuidedTour() {
  const { isActive, step, next, back, skip, hasSeenTour, hasSeenWelcome, start } = useTourStore();
  const [rect, setRect] = useState<Rect | null>(null);
  const current = TOUR_STEPS[step];

  // Only auto-start after the welcome modal has been dismissed
  useEffect(() => {
    if (!hasSeenTour && hasSeenWelcome) {
      const t = setTimeout(() => start(), 600);
      return () => clearTimeout(t);
    }
  }, [hasSeenTour, hasSeenWelcome, start]);

  const measure = useCallback(() => {
    if (!isActive || !current) return;
    setRect(getTargetRect(current.target));
  }, [isActive, current]);

  useEffect(() => {
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [measure]);

  if (!isActive || !current) return null;

  // Tooltip position
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1280;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
  const TW = 320, TH = 180;

  let tipStyle: React.CSSProperties = { position: 'fixed', zIndex: 10001, width: TW };

  if (rect) {
    const placement = current.placement;
    if (placement === 'bottom') {
      tipStyle.top = Math.min(rect.top + rect.height + 12, vh - TH - 8);
      tipStyle.left = Math.max(8, Math.min(rect.left, vw - TW - 8));
    } else if (placement === 'top') {
      tipStyle.top = Math.max(8, rect.top - TH - 12);
      tipStyle.left = Math.max(8, Math.min(rect.left, vw - TW - 8));
    } else if (placement === 'right') {
      tipStyle.top = Math.max(8, rect.top);
      tipStyle.left = Math.min(rect.left + rect.width + 12, vw - TW - 8);
    } else {
      tipStyle.top = Math.max(8, rect.top);
      tipStyle.left = Math.max(8, rect.left - TW - 12);
    }
  } else {
    tipStyle = { position: 'fixed', zIndex: 10001, width: TW, top: '50%', left: '50%', transform: 'translate(-50%,-50%)' };
  }

  return (
    <>
      {/* Dimmed overlay with hole for target */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 10000, pointerEvents: 'none' }}>
        {rect ? (
          <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
            <defs>
              <mask id="tour-mask">
                <rect width="100%" height="100%" fill="white" />
                <rect
                  x={rect.left} y={rect.top}
                  width={rect.width} height={rect.height}
                  rx={6} fill="black"
                />
              </mask>
            </defs>
            <rect width="100%" height="100%" fill="rgba(0,0,0,0.65)" mask="url(#tour-mask)" />
            {/* Highlight ring */}
            <rect
              x={rect.left} y={rect.top}
              width={rect.width} height={rect.height}
              rx={6} fill="none"
              stroke="#22c55e" strokeWidth={2}
            />
          </svg>
        ) : (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.65)' }} />
        )}
      </div>

      {/* Tooltip card */}
      <div style={tipStyle} className="rounded-xl border border-border bg-background shadow-2xl p-4 flex flex-col gap-3" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="text-sm font-bold text-foreground">{current.title}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">
              Step {step + 1} of {TOUR_STEPS.length}
            </div>
          </div>
          <button onClick={skip} className="p-1 rounded hover:bg-accent transition-colors shrink-0" title="Skip tour">
            <X className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-1 rounded-full bg-muted overflow-hidden">
          <div className="h-full bg-green-500 transition-all duration-300" style={{ width: `${((step + 1) / TOUR_STEPS.length) * 100}%` }} />
        </div>

        {/* Body */}
        <p className="text-xs text-muted-foreground leading-relaxed">{current.body}</p>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button onClick={skip} className="text-[10px] text-muted-foreground hover:text-foreground transition-colors">
            Skip tour
          </button>
          <div className="flex gap-2">
            {step > 0 && (
              <button onClick={back} className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs border border-border hover:bg-accent transition-colors">
                <ChevronLeft className="h-3 w-3" /> Back
              </button>
            )}
            <button onClick={next} className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs bg-green-600 text-white hover:bg-green-500 transition-colors font-semibold">
              {step === TOUR_STEPS.length - 1 ? 'Finish 🎉' : 'Next'} {step < TOUR_STEPS.length - 1 && <ChevronRight className="h-3 w-3" />}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
