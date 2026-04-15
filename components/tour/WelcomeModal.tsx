'use client';

import { useEffect, useState } from 'react';
import { GraduationCap, FolderOpen, Compass, X } from 'lucide-react';
import { useTourStore } from '@/stores/tourStore';
import { useTutorialStore } from '@/stores/tutorialStore';
import { tutorials } from '@/lib/tutorials';
import { toast } from '@/stores/toastStore';

const CHOICES = [
  {
    id: 'tutorial',
    icon: GraduationCap,
    accent: 'border-green-500/40 hover:border-green-400/70 hover:bg-green-500/6',
    badge: 'bg-green-500/15 text-green-400',
    badgeText: 'Recommended',
    title: 'Walk me through it',
    body: "Start the Blink LED tutorial — the overlay spotlights exactly what to click at each step. Takes about 5 minutes.",
  },
  {
    id: 'projects',
    icon: FolderOpen,
    accent: 'border-blue-500/40 hover:border-blue-400/70 hover:bg-blue-500/6',
    badge: 'bg-blue-500/15 text-blue-400',
    badgeText: '20+ projects',
    title: 'Show me the projects',
    body: "Browse beginner to advanced circuits — Smart Home, IoT, Arduino, Pico. Load code instantly.",
  },
  {
    id: 'explore',
    icon: Compass,
    accent: 'border-purple-500/40 hover:border-purple-400/70 hover:bg-purple-500/6',
    badge: 'bg-purple-500/15 text-purple-400',
    badgeText: 'Quick 8-step tour',
    title: 'Let me explore',
    body: "Jump straight in. A quick 8-step spotlight tour shows you where everything lives.",
  },
] as const;

export default function WelcomeModal() {
  const { hasSeenWelcome, hasSeenTour, dismissWelcome, start: startTour } = useTourStore();
  const { start: startTutorial } = useTutorialStore();
  const [mounted, setMounted] = useState(false);

  // Avoid SSR mismatch
  useEffect(() => setMounted(true), []);

  if (!mounted || hasSeenWelcome || hasSeenTour) return null;

  function handleChoice(id: (typeof CHOICES)[number]['id']) {
    dismissWelcome();
    if (id === 'tutorial') {
      const blinkTut = tutorials.find((t) => t.id === 'blink-led') ?? tutorials[0];
      startTutorial(blinkTut);
    } else if (id === 'projects') {
      toast.info('Open the left sidebar → Projects tab to browse all 20+ projects', {
        icon: '📂', duration: 5000,
      });
    } else {
      setTimeout(startTour, 300);
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[10100] bg-black/70 backdrop-blur-sm" />

      {/* Panel */}
      <div className="fixed inset-0 z-[10101] flex items-center justify-center p-4">
        <div className="relative bg-background border border-border rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">

          {/* Dismiss */}
          <button
            onClick={() => dismissWelcome()}
            className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-accent transition-colors z-10"
            title="Skip intro"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>

          {/* Header */}
          <div className="px-8 pt-8 pb-5 text-center border-b border-border">
            <div className="text-4xl mb-3">⚡</div>
            <h2 className="text-xl font-bold text-foreground mb-1">Welcome to PiForge!</h2>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              The browser-based Virtual Hardware Lab. Build circuits, run code,
              no hardware needed. How do you want to start?
            </p>
          </div>

          {/* Choices */}
          <div className="p-6 space-y-3">
            {CHOICES.map(({ id, icon: Icon, accent, badge, badgeText, title, body }) => (
              <button
                key={id}
                onClick={() => handleChoice(id)}
                className={`w-full flex items-start gap-4 rounded-xl border bg-background px-5 py-4 text-left transition-all duration-150 ${accent}`}
              >
                <div className="shrink-0 w-9 h-9 rounded-lg bg-muted/60 flex items-center justify-center mt-0.5">
                  <Icon className="h-4.5 w-4.5 text-foreground/70" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-foreground">{title}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold ${badge}`}>{badgeText}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{body}</p>
                </div>
              </button>
            ))}
          </div>

          <p className="px-8 pb-5 text-[10px] text-muted-foreground text-center">
            You can revisit this any time — press <kbd className="px-1 py-0.5 rounded bg-muted border border-border text-[9px]">?</kbd> in the top bar for the tour.
          </p>
        </div>
      </div>
    </>
  );
}
