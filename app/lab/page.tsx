'use client';

import { useState } from 'react';
import TopBar from '@/components/layout/TopBar';
import AutoLoader from '@/components/layout/AutoLoader';
import Sidebar from '@/components/layout/Sidebar';
import CanvasArea from '@/components/layout/CanvasArea';
import RightPanel from '@/components/layout/RightPanel';
import Console from '@/components/layout/Console';
import TutorialPanel from '@/components/tutorials/TutorialPanel';
import TutorialLauncher from '@/components/tutorials/TutorialLauncher';
import { PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen, ChevronDown, ChevronUp } from 'lucide-react';

export default function LabPage() {
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);   // editor open by default
  const [consoleOpen, setConsoleOpen] = useState(true); // console open by default

  return (
    <div className="flex h-screen min-w-[1024px] flex-col">
      <AutoLoader />
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar */}
        {leftOpen ? (
          <div className="flex w-[250px] shrink-0 flex-col border-r border-border bg-background overflow-y-auto relative">
            <button onClick={() => setLeftOpen(false)} className="absolute top-2 right-2 z-10 p-1 rounded hover:bg-accent transition-colors" aria-label="Collapse sidebar">
              <PanelLeftClose className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
            <TutorialLauncher />
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

        <TutorialPanel />
      </div>
    </div>
  );
}
