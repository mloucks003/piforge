'use client';
import { useState } from 'react';
import { useCanvasStore } from '@/stores/canvasStore';
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import dynamic from 'next/dynamic';

const FarmScene   = dynamic(() => import('./scenes/FarmScene'),   { ssr: false });
const HomeScene   = dynamic(() => import('./scenes/HomeScene'),   { ssr: false });
const OfficeScene = dynamic(() => import('./scenes/OfficeScene'), { ssr: false });
const RobotScene  = dynamic(() => import('./scenes/RobotScene'),  { ssr: false });

const SCENE_META: Record<string, { label: string; emoji: string }> = {
  farm:   { label: 'Smart Farm',   emoji: '🌱' },
  home:   { label: 'Smart Home',   emoji: '🏠' },
  office: { label: 'Smart Office', emoji: '🏢' },
  robot:  { label: 'Robot',        emoji: '🤖' },
};

export default function SceneView() {
  const activeScene    = useCanvasStore((s) => s.activeScene);
  const setActiveScene = useCanvasStore((s) => s.setActiveScene);
  const [collapsed, setCollapsed] = useState(false);

  if (!activeScene) return null;

  const meta = SCENE_META[activeScene];

  return (
    <div className="shrink-0 border-t border-border bg-background flex flex-col"
      style={{ height: collapsed ? 36 : 230 }}>
      {/* Header bar */}
      <div className="flex shrink-0 items-center gap-2 px-3 h-9 border-b border-border bg-muted/20">
        <span className="text-sm">{meta.emoji}</span>
        <span className="text-[11px] font-semibold text-foreground">{meta.label} — Live Scene</span>
        <span className="text-[9px] text-muted-foreground ml-1">Reacts to simulation in real time</span>
        <div className="ml-auto flex items-center gap-1">
          <button onClick={() => setCollapsed(c => !c)}
            className="p-1 rounded hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
            title={collapsed ? 'Expand scene' : 'Collapse scene'}>
            {collapsed ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
          <button onClick={() => setActiveScene(null)}
            className="p-1 rounded hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
            title="Close scene view">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Scene content */}
      {!collapsed && (
        <div className="flex-1 overflow-hidden">
          {activeScene === 'farm'   && <FarmScene />}
          {activeScene === 'home'   && <HomeScene />}
          {activeScene === 'office' && <OfficeScene />}
          {activeScene === 'robot'  && <RobotScene />}
        </div>
      )}
    </div>
  );
}
