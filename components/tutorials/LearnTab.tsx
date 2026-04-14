'use client';

import { Lock, ChevronRight, Clock, CheckCircle2, Circle, PlayCircle, XCircle, SkipForward } from 'lucide-react';
import { useTutorialStore } from '@/stores/tutorialStore';
import { useAuthStore, isPro } from '@/stores/authStore';
import { tutorials } from '@/lib/tutorials';

const DIFF_STYLES: Record<string, string> = {
  beginner:     'bg-green-500/10 text-green-400',
  intermediate: 'bg-yellow-500/10 text-yellow-400',
  advanced:     'bg-red-500/10 text-red-400',
};

const FREE_TUTORIAL_IDS = new Set(['blink', 'button']);

export default function LearnTab() {
  const { active, currentStep, completed, start, advance, skipStep, stop } = useTutorialStore();
  const user      = useAuthStore((s) => s.user);
  const openModal = useAuthStore((s) => s.openModal);
  const userIsPro = isPro(user);

  // ── Active tutorial view ──────────────────────────────────────────
  if (active) {
    const step     = active.steps[currentStep];
    const total    = active.steps.length;
    const progress = Math.round(((completed.filter(Boolean).length) / total) * 100);
    const isLast   = currentStep === total - 1;
    const allDone  = completed.every(Boolean);

    return (
      <div className="flex flex-col h-full overflow-hidden">
        {/* Tutorial header */}
        <div className="shrink-0 border-b border-border px-4 py-3 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Tutorial in progress</p>
              <h3 className="text-sm font-bold text-foreground leading-tight">{active.title}</h3>
            </div>
            <button onClick={stop} className="shrink-0 p-1.5 rounded-lg hover:bg-accent transition-colors" title="Stop tutorial">
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
          {/* Progress bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>Step {currentStep + 1} of {total}</span>
              <span>{progress}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full bg-green-500 transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>

        {/* Step list + current step */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {/* All steps overview */}
          <div className="border-b border-border px-4 py-3 space-y-1">
            {active.steps.map((s, i) => (
              <div key={i} className={`flex items-center gap-2 py-1 text-xs rounded px-1 ${i === currentStep ? 'bg-green-500/10' : ''}`}>
                {completed[i]
                  ? <CheckCircle2 className="h-3.5 w-3.5 text-green-400 shrink-0" />
                  : i === currentStep
                  ? <PlayCircle className="h-3.5 w-3.5 text-green-400 shrink-0" />
                  : <Circle className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />}
                <span className={`truncate ${i === currentStep ? 'text-foreground font-medium' : completed[i] ? 'text-muted-foreground line-through' : 'text-muted-foreground'}`}>
                  {s.title}
                </span>
              </div>
            ))}
          </div>

          {/* Current step detail */}
          {!allDone ? (
            <div className="px-4 py-4 space-y-4">
              <div>
                <p className="text-[10px] text-green-400 font-semibold uppercase tracking-wider mb-1">
                  Step {currentStep + 1} — {step.title}
                </p>
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{step.content}</p>
              </div>

              {step.hints && step.hints.length > 0 && (
                <div className="rounded-lg bg-blue-500/5 border border-blue-500/20 px-3 py-2.5 space-y-1">
                  <p className="text-[10px] font-semibold text-blue-400">💡 {step.hints.length > 1 ? 'Hints' : 'Hint'}</p>
                  {step.hints.map((h, i) => (
                    <p key={i} className="text-xs text-muted-foreground leading-relaxed">{h}</p>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="px-4 py-8 flex flex-col items-center text-center gap-3">
              <CheckCircle2 className="h-12 w-12 text-green-400" />
              <h4 className="text-base font-bold text-foreground">Tutorial Complete! 🎉</h4>
              <p className="text-xs text-muted-foreground">You finished <strong>{active.title}</strong>. Great work!</p>
              <button onClick={stop} className="mt-2 rounded-lg bg-green-600 px-5 py-2 text-sm font-semibold text-white hover:bg-green-500 transition-colors">
                Back to Tutorials
              </button>
            </div>
          )}
        </div>

        {/* Action buttons */}
        {!allDone && (
          <div className="shrink-0 border-t border-border px-4 py-3 flex gap-2">
            <button onClick={skipStep}
              className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
              <SkipForward className="h-3.5 w-3.5" /> Skip
            </button>
            <button onClick={advance}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white hover:bg-green-500 transition-colors">
              {isLast ? 'Finish' : 'Mark Done & Continue'}
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    );
  }

  // ── Tutorial list view ────────────────────────────────────────────
  return (
    <div className="flex-1 overflow-y-auto min-h-0 p-4 space-y-3">
      <p className="text-xs text-muted-foreground leading-relaxed">
        Step-by-step guided projects that walk you through wiring and Python code together.
      </p>

      {!userIsPro && (
        <button onClick={() => openModal('promo')}
          className="w-full flex items-center gap-3 rounded-xl border border-blue-500/30 bg-blue-500/5 px-4 py-3 text-left hover:bg-blue-500/10 transition-colors">
          <Lock className="h-4 w-4 text-blue-400 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-blue-400">Pro unlocks all 9 tutorials</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Free plan includes 2 beginner tutorials. Use code <span className="text-green-400 font-mono">testdev</span> for free access.</p>
          </div>
        </button>
      )}

      {tutorials.map(t => {
        const locked = !userIsPro && !FREE_TUTORIAL_IDS.has(t.id);
        return (
          <button key={t.id} onClick={() => locked ? openModal('promo') : start(t)}
            className={`w-full rounded-xl border text-left transition-all group ${locked ? 'border-border/40 opacity-60 hover:opacity-80' : 'border-border hover:border-green-500/40 hover:bg-accent'}`}>
            <div className="px-4 py-3">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-semibold ${DIFF_STYLES[t.difficulty]}`}>{t.difficulty}</span>
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Clock className="h-3 w-3" />{t.estimatedMinutes} min
                  </span>
                  <span className="text-[10px] text-muted-foreground">· {t.steps.length} steps</span>
                </div>
                {locked
                  ? <Lock className="h-3.5 w-3.5 text-blue-400 shrink-0 mt-0.5" />
                  : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5 group-hover:text-green-400 transition-colors" />}
              </div>
              <p className="text-sm font-semibold text-foreground mb-1">{t.title}</p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">{t.description}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
