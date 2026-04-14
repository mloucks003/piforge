'use client';
import { useEffect, useRef } from 'react';
import { useTutorialStore } from '@/stores/tutorialStore';
import { useProjectStore } from '@/stores/projectStore';
import { X, ChevronRight, CheckCircle, SkipForward, Lightbulb } from 'lucide-react';
import type { CompletionCondition } from '@/lib/tutorials/types';

/** Baseline snapshot of canvas state captured when a step first becomes active */
type Baseline = {
  wireCount: number;
  componentCountByDef: Record<string, number>;
  breadboardCount: number;
  code: string;
};

function snapshotBaseline(): Baseline {
  const s = useProjectStore.getState();
  const componentCountByDef: Record<string, number> = {};
  for (const comp of Object.values(s.components)) {
    componentCountByDef[comp.definitionId] = (componentCountByDef[comp.definitionId] ?? 0) + 1;
  }
  return {
    wireCount: Object.keys(s.wires).length,
    componentCountByDef,
    breadboardCount: Object.keys(s.breadboards).length,
    code: s.code,
  };
}

/**
 * Returns true only when the condition is satisfied *relative to the baseline*.
 * This prevents auto-advancing immediately if state already satisfies the condition
 * when the step first loads.
 */
function checkCondition(condition: CompletionCondition, baseline: Baseline): boolean {
  const s = useProjectStore.getState();
  switch (condition.type) {
    case 'component-placed': {
      const cur = Object.values(s.components).filter(c => c.definitionId === condition.definitionId).length;
      const base = baseline.componentCountByDef[condition.definitionId] ?? 0;
      return cur > base;
    }
    case 'wire-created':
      return Object.keys(s.wires).length > baseline.wireCount;
    case 'breadboard-added':
      return Object.keys(s.breadboards).length > baseline.breadboardCount;
    case 'board-selected':
      return s.boardModel === condition.model;
    case 'code-contains':
      // Only counts if the snippet was NOT already present when the step started
      return s.code.includes(condition.snippet) && !baseline.code.includes(condition.snippet);
    case 'simulation-started':
      return s.simulationState === 'running';
    case 'manual':
      return false;
    default:
      return false;
  }
}

export default function TutorialPanel() {
  const active      = useTutorialStore((s) => s.active);
  const currentStep = useTutorialStore((s) => s.currentStep);
  const completed   = useTutorialStore((s) => s.completed);
  const advance     = useTutorialStore((s) => s.advance);
  const skipStep    = useTutorialStore((s) => s.skipStep);
  const stop        = useTutorialStore((s) => s.stop);

  // Snapshot the canvas state each time the active step changes
  const baselineRef = useRef<Baseline>(snapshotBaseline());
  useEffect(() => {
    baselineRef.current = snapshotBaseline();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active?.id, currentStep]);

  // Subscribe to project store and auto-advance when delta from baseline satisfies condition
  useEffect(() => {
    if (!active) return;
    const step = active.steps[currentStep];
    if (!step || completed[currentStep]) return;
    if (step.completionCondition.type === 'manual') return;

    const unsub = useProjectStore.subscribe(() => {
      if (checkCondition(step.completionCondition, baselineRef.current) && !useTutorialStore.getState().completed[currentStep]) {
        useTutorialStore.getState().advance();
      }
    });
    return unsub;
  }, [active, currentStep, completed]);

  if (!active) return null;
  const step   = active.steps[currentStep];
  const isLast = currentStep === active.steps.length - 1;
  const allDone = completed.every(Boolean);

  return (
    <div className="w-[280px] shrink-0 border-l border-border bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-border shrink-0">
        <div className="min-w-0">
          <div className="text-xs font-semibold text-foreground truncate">{active.title}</div>
          <div className="text-[10px] text-muted-foreground">Step {currentStep + 1} / {active.steps.length}</div>
        </div>
        <button onClick={stop} className="p-1 rounded hover:bg-accent transition-colors shrink-0 ml-2">
          <X className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="flex gap-1 px-3 py-2 shrink-0">
        {active.steps.map((_, i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${completed[i] ? 'bg-green-500' : i === currentStep ? 'bg-green-500/50 animate-pulse' : 'bg-muted'}`} />
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-3">
        {allDone && isLast ? (
          <div className="flex flex-col items-center justify-center py-8 text-center gap-3">
            <CheckCircle className="h-12 w-12 text-green-500" />
            <div className="font-semibold text-foreground">Tutorial Complete!</div>
            <p className="text-xs text-muted-foreground">Great work. Try another tutorial or build your own project.</p>
            <button onClick={stop} className="mt-2 rounded-lg bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-500 transition-colors">Done</button>
          </div>
        ) : (
          <>
            <h3 className="text-sm font-semibold text-foreground mb-2">{step.title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed mb-3">{step.content}</p>

            {/* Auto-complete indicator */}
            {step.completionCondition.type !== 'manual' && !completed[currentStep] && (
              <div className="flex items-center gap-1.5 rounded-md bg-blue-500/10 border border-blue-500/20 px-2.5 py-1.5 mb-3">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse shrink-0" />
                <span className="text-[10px] text-blue-400">Auto-detects when done</span>
              </div>
            )}

            {/* Hints */}
            {step.hints && step.hints.length > 0 && (
              <div className="rounded-md bg-muted/40 border border-border px-2.5 py-2 mb-3">
                <div className="flex items-center gap-1 mb-1">
                  <Lightbulb className="h-3 w-3 text-yellow-400" />
                  <span className="text-[10px] font-medium text-yellow-400">Hint</span>
                </div>
                {step.hints.map((h, i) => (
                  <p key={i} className="text-[11px] text-muted-foreground leading-relaxed">{h}</p>
                ))}
              </div>
            )}

            <div className="flex gap-2 mt-2">
              <button onClick={advance}
                className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-green-600 px-3 py-2 text-xs font-medium text-white hover:bg-green-500 transition-colors">
                {isLast ? 'Finish' : 'Next'} <ChevronRight className="h-3.5 w-3.5" />
              </button>
              {!isLast && (
                <button onClick={skipStep}
                  className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
                  <SkipForward className="h-3 w-3" /> Skip
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
