'use client';

import React, { useState, useEffect } from 'react';
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
import SimHub from '@/components/sim/SimHub';
import SceneView from '@/components/sim/SceneView';

import { PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen, ChevronDown, ChevronUp, X, Cpu, Zap, Code, Cable, Sparkles, ArrowRight, LayoutDashboard, Terminal, Bot } from 'lucide-react';
import { useFeedbackStore } from '@/stores/feedbackStore';
import { useAuthStore } from '@/stores/authStore';

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

function SignUpWall() {
  const { openModal } = useAuthStore();
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-background text-foreground px-4">
      <div className="w-full max-w-md space-y-8 text-center">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-500/10 border border-green-500/30">
            <Cpu className="h-8 w-8 text-green-500" />
          </div>
          <h1 className="text-3xl font-black tracking-tight">PiForge</h1>
          <p className="text-muted-foreground text-sm">Virtual Raspberry Pi &amp; Arduino Laboratory</p>
        </div>

        {/* Value props */}
        <div className="grid grid-cols-2 gap-3 text-left">
          {(
            [
              { Icon: Zap,      title: 'Run Real Python',    desc: 'Executes in your browser via Pyodide — no server, no latency' },
              { Icon: Cable,    title: 'Wire Circuits',       desc: 'Drag-and-drop components, breadboards, and GPIO wires' },
              { Icon: Code,     title: '11 Guided Tutorials', desc: 'Step-by-step from Blink LED to Smart Home Hub' },
              { Icon: Sparkles, title: 'AI Assistant',        desc: 'Ask for help, fix errors, or generate full projects' },
            ] as { Icon: React.ElementType; title: string; desc: string }[]
          ).map(({ Icon, title, desc }) => (
            <div key={title} className="rounded-xl border border-border bg-muted/30 p-3 space-y-1">
              <div className="flex items-center gap-1.5">
                <Icon className="h-4 w-4 text-green-400 shrink-0" />
                <span className="text-xs font-semibold text-foreground">{title}</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-snug">{desc}</p>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="space-y-3">
          <button
            onClick={() => openModal('signup')}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-green-600 py-3 text-sm font-bold text-white hover:bg-green-500 transition-colors"
          >
            Create Free Account <ArrowRight className="h-4 w-4" />
          </button>
          <button
            onClick={() => openModal('signin')}
            className="w-full rounded-xl border border-border py-3 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            Already have an account? Sign In
          </button>
        </div>

        <p className="text-[11px] text-muted-foreground">
          🚧 Public beta — everything is <strong className="text-foreground">free</strong> right now.{' '}
          Use code <span className="font-mono text-green-400 font-bold">TESTDEV</span> after signing up for Pro access.
        </p>
      </div>
    </div>
  );
}

type MobileTab = 'canvas' | 'code' | 'ai' | 'console';

export default function LabPage() {
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [consoleOpen, setConsoleOpen] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileTab, setMobileTab] = useState<MobileTab>('canvas');
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    setMounted(true);
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  if (!mounted) return null;
  if (!user) return <SignUpWall />;

  /* ── Mobile layout ── */
  if (isMobile) {
    return (
      <div className="flex h-[100dvh] flex-col bg-background text-foreground overflow-hidden">
        <AutoLoader />
        <WelcomeModal />
        <GuidedTour />
        <TutorialOverlay />
        <ContextualPrompt />
        <Toaster />
        <SimHub />
        <TopBar />
        <BetaBanner />

        {/* Main content area */}
        <div className="flex-1 overflow-hidden relative">
          {/* Canvas tab */}
          <div className={`absolute inset-0 flex flex-col ${mobileTab === 'canvas' ? 'flex' : 'hidden'}`}>
            <CanvasArea />
            <SceneView />
          </div>

          {/* Code tab */}
          <div className={`absolute inset-0 ${mobileTab === 'code' ? 'flex' : 'hidden'}`}>
            <RightPanel defaultTab="editor" />
          </div>

          {/* AI tab */}
          <div className={`absolute inset-0 ${mobileTab === 'ai' ? 'flex' : 'hidden'}`}>
            <RightPanel defaultTab="ai" />
          </div>

          {/* Console tab */}
          <div className={`absolute inset-0 ${mobileTab === 'console' ? 'flex' : 'hidden'}`}>
            <Console />
          </div>
        </div>

        {/* Bottom tab bar */}
        <nav className="shrink-0 flex border-t border-border bg-background">
          {([
            { tab: 'canvas',  icon: LayoutDashboard, label: 'Canvas'  },
            { tab: 'code',    icon: Code,            label: 'Code'    },
            { tab: 'ai',      icon: Bot,             label: 'AI'      },
            { tab: 'console', icon: Terminal,        label: 'Console' },
          ] as { tab: MobileTab; icon: React.ElementType; label: string }[]).map(({ tab, icon: Icon, label }) => (
            <button
              key={tab}
              onClick={() => setMobileTab(tab)}
              className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors ${
                mobileTab === tab
                  ? 'text-green-400 border-t-2 border-green-400 -mt-px'
                  : 'text-muted-foreground hover:text-foreground border-t-2 border-transparent -mt-px'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </nav>
      </div>
    );
  }

  /* ── Desktop layout ── */
  return (
    <div className="flex h-screen flex-col">
      <AutoLoader />
      <WelcomeModal />
      <GuidedTour />
      <TutorialOverlay />
      <ContextualPrompt />
      <Toaster />
      <SimHub />
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
          <SceneView />
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
