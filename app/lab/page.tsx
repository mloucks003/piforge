'use client';

import { useState, useEffect } from 'react';
import TopBar from '@/components/layout/TopBar';
import AutoLoader from '@/components/layout/AutoLoader';
import Sidebar from '@/components/layout/Sidebar';
import CanvasArea from '@/components/layout/CanvasArea';
import RightPanel from '@/components/layout/RightPanel';
import Console from '@/components/layout/Console';
import GuidedTour from '@/components/tour/GuidedTour';
import TutorialOverlay from '@/components/tour/TutorialOverlay';
import WelcomeModal from '@/components/tour/WelcomeModal';
import ContextualPrompt from '@/components/tour/ContextualPrompt';
import Toaster from '@/components/ui/Toaster';

import { PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen, ChevronDown, ChevronUp, X } from 'lucide-react';
import { useFeedbackStore } from '@/stores/feedbackStore';

const BETA_DISMISSED_KEY = 'piforge-beta-banner-dismissed';

function BetaBanner() {
  const [visible, setVisible] = useState(false);
  const openFeedback = useFeedbackStore((s) => s.openModal);
  useEffect(() => {
    setVisible(!localStorage.getItem(BETA_DISMISSED_KEY));
  }, []);
  if (!visible) return null;
  function dismiss() { localStorage.setItem(BETA_DISMISSED_KEY, '1'); setVisible(false); }
  return (
    <div className="shrink-0 flex items-center justify-between gap-3 bg-yellow-500/10 border-b border-yellow-500/20 px-4 py-1.5">
      <p className="text-[11px] text-yellow-300 leading-snug">
        🚧 <strong>PiForge is in public beta</strong> — features may change and bugs may exist.
        Everything is <strong>free</strong> during beta! Use code{' '}
        <span className="font-mono font-bold text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded">TESTDEV</span>{' '}
        for Pro access. Found a bug or have feedback?{' '}
        <button onClick={openFeedback} className="underline text-yellow-200 hover:text-white transition-colors font-semibold">
          Tell us and earn a lifetime license →
        </button>
      </p>
      <button onClick={dismiss} className="shrink-0 p-1 rounded hover:bg-yellow-500/20 transition-colors" title="Dismiss">
        <X className="h-3.5 w-3.5 text-yellow-400" />
      </button>
    </div>
  );
}

export default function LabPage() {
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);   // editor open by default
  const [consoleOpen, setConsoleOpen] = useState(true); // console open by default

  return (
    <div className="flex h-screen min-w-[1024px] flex-col">
      <AutoLoader />
      <WelcomeModal />
      <GuidedTour />
      <TutorialOverlay />
      <ContextualPrompt />
      <Toaster />
      <TopBar />
      <BetaBanner />
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar */}
        {leftOpen ? (
          <div className="flex w-[250px] shrink-0 flex-col border-r border-border bg-background overflow-y-auto relative">
            <button onClick={() => setLeftOpen(false)} className="absolute top-2 right-2 z-10 p-1 rounded hover:bg-accent transition-colors" aria-label="Collapse sidebar">
              <PanelLeftClose className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
            <Sidebar />
          </div>
        ) : (
          <button onClick={() => setLeftOpen(true)} className="shrink-0 border-r border-border bg-background px-1.5 py-2 hover:bg-accent transition-colors" aria-label="Expand sidebar">
            <PanelLeftOpen className="h-4 w-4 text-muted-foreground" />
          </button>
        )}

        {/* Center */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <CanvasArea />
          {/* Console */}
          {consoleOpen ? (
            <div className="relative">
              <button onClick={() => setConsoleOpen(false)} className="absolute top-1 right-2 z-10 p-1 rounded hover:bg-accent transition-colors" aria-label="Collapse console">
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
              <Console />
            </div>
          ) : (
            <button onClick={() => setConsoleOpen(true)} className="shrink-0 border-t border-border bg-background px-4 py-1.5 text-xs text-muted-foreground hover:bg-accent transition-colors flex items-center gap-1.5">
              <ChevronUp className="h-3 w-3" /> Console
            </button>
          )}
        </div>

        {/* Right panel */}
        {rightOpen ? (
          <div className="relative h-full flex">
            <button onClick={() => setRightOpen(false)} className="absolute top-2 left-2 z-10 p-1 rounded hover:bg-accent transition-colors" aria-label="Collapse editor">
              <PanelRightClose className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
            <RightPanel />
          </div>
        ) : (
          <button onClick={() => setRightOpen(true)} className="shrink-0 border-l border-border bg-background px-1.5 py-2 hover:bg-accent transition-colors" aria-label="Expand editor">
            <PanelRightOpen className="h-4 w-4 text-muted-foreground" />
          </button>
        )}

      </div>
    </div>
  );
}
