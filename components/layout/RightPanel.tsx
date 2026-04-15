'use client';

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Code, Cpu, FileCode, CheckCircle, AlertCircle, Circle, Sparkles, Bug, Wrench, BookOpen } from 'lucide-react';
import { useProjectStore } from '@/stores/projectStore';
import { useAIStore } from '@/stores/aiStore';
import { templates } from '@/lib/templates/index';
import { resolveCircuit } from '@/lib/simulation/circuit-resolver';
import { getComponentDefinition } from '@/lib/components';
import AIPanel from '@/components/ai/AIPanel';
import LearnTab from '@/components/tutorials/LearnTab';

// Configure Monaco to load workers from CDN — avoids Next.js/Turbopack worker issues
const MonacoEditor = dynamic(
  async () => {
    const { default: Editor, loader } = await import('@monaco-editor/react');
    loader.config({
      paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs' },
    });
    return Editor;
  },
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 bg-[#1e1e1e] flex items-center justify-center text-xs text-muted-foreground">
        Loading editor…
      </div>
    ),
  }
);

type Tab = 'editor' | 'properties' | 'ai' | 'learn';

function PropertiesTab() {
  const components      = useProjectStore((s) => s.components);
  const wires           = useProjectStore((s) => s.wires);
  const boardModel      = useProjectStore((s) => s.boardModel);
  const simulationState = useProjectStore((s) => s.simulationState);

  const circuit  = resolveCircuit(components, wires, boardModel);
  const compList = Object.values(components);

  if (compList.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
        <Cpu className="h-10 w-10 text-muted-foreground/30" />
        <p className="text-sm font-medium text-foreground">No components placed</p>
        <p className="text-xs text-muted-foreground">Add parts from the Parts tab to inspect their wiring here.</p>
      </div>
    );
  }

  const completeCount = compList.filter(c => circuit.get(c.id)?.isComplete).length;
  const isRunning = simulationState === 'running';

  // Pin type → color
  const PIN_TYPE_COLOR: Record<string, string> = {
    signal: 'text-blue-400',
    data:   'text-purple-400',
    power:  'text-red-400',
    ground: 'text-gray-400',
  };
  const PIN_TYPE_DOT: Record<string, string> = {
    signal: 'bg-blue-400',
    data:   'bg-purple-400',
    power:  'bg-red-400',
    ground: 'bg-gray-500',
  };

  return (
    <div className="flex-1 overflow-y-auto min-h-0">
      {/* ── Health summary ─────────────────────────────────────── */}
      <div className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur px-3 py-2">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-semibold text-foreground">Circuit Health</span>
          <div className="flex items-center gap-1.5">
            {isRunning && (
              <span className="flex items-center gap-1 text-[9px] text-green-400 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />LIVE
              </span>
            )}
            <span className={`text-[11px] font-semibold ${completeCount === compList.length ? 'text-green-400' : 'text-yellow-400'}`}>
              {completeCount}/{compList.length} ready
            </span>
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${completeCount === compList.length ? 'bg-green-500' : 'bg-yellow-500'}`}
            style={{ width: `${compList.length > 0 ? (completeCount / compList.length) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* ── Per-component cards ─────────────────────────────────── */}
      <div className="p-3 space-y-3">
        {compList.map(comp => {
          const def  = getComponentDefinition(comp.definitionId);
          const conn = circuit.get(comp.id);
          const pinConns = conn?.pinConnections ?? [];
          const status = !conn ? 'unresolved' : conn.isComplete ? 'complete' : pinConns.some(p => p.isWired) ? 'partial' : 'disconnected';

          const statusBadge = {
            complete:     { label: 'Ready',        cls: 'bg-green-500/15 text-green-400 border-green-500/30' },
            partial:      { label: 'Partial',       cls: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' },
            disconnected: { label: 'Not wired',     cls: 'bg-muted text-muted-foreground border-border' },
            unresolved:   { label: 'Unknown def',   cls: 'bg-red-500/15 text-red-400 border-red-500/30' },
          }[status];

          const cardBorder = {
            complete:     'border-green-500/20',
            partial:      'border-yellow-500/20',
            disconnected: 'border-border',
            unresolved:   'border-red-500/20',
          }[status];

          return (
            <div key={comp.id} className={`rounded-lg border bg-muted/10 overflow-hidden ${cardBorder}`}>
              {/* Card header */}
              <div className="flex items-center gap-2 px-3 py-2 bg-muted/20 border-b border-border/50">
                {status === 'complete'
                  ? <CheckCircle className="h-3.5 w-3.5 text-green-400 shrink-0" />
                  : status === 'partial'
                  ? <AlertCircle className="h-3.5 w-3.5 text-yellow-400 shrink-0" />
                  : <Circle className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
                <span className="text-xs font-semibold text-foreground flex-1 truncate">
                  {def?.name ?? comp.definitionId}
                </span>
                <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border ${statusBadge.cls}`}>
                  {statusBadge.label}
                </span>
              </div>

              {/* Per-pin rows */}
              <div className="divide-y divide-border/30">
                {pinConns.map(pc => {
                  const liveState = comp.pinStates?.[pc.pinId];
                  const isHigh = liveState != null && liveState.value !== 0;

                  // Build connection label
                  let connLabel = 'Not connected';
                  if (pc.pinType === 'signal' || pc.pinType === 'data') {
                    connLabel = pc.gpioPin != null ? `GPIO${pc.gpioPin}` : pc.isWired ? 'Wired (no GPIO)' : 'Not connected';
                  } else if (pc.pinType === 'ground') {
                    connLabel = pc.reachesGround ? 'GND ✓' : pc.isWired ? 'Wired (no GND)' : 'Not connected';
                  } else if (pc.pinType === 'power') {
                    connLabel = pc.reachesPower || pc.reachesGround ? 'Power ✓' : pc.isWired ? 'Wired (no power)' : 'Not connected';
                  }

                  const isOk = (pc.pinType === 'signal' || pc.pinType === 'data') ? pc.gpioPin != null
                    : pc.pinType === 'ground' ? pc.reachesGround
                    : pc.pinType === 'power'  ? (pc.reachesPower || pc.reachesGround)
                    : true;

                  return (
                    <div key={pc.pinId} className="flex items-center gap-2 px-3 py-1.5">
                      {/* Pin type dot */}
                      <div className={`w-2 h-2 rounded-full shrink-0 ${PIN_TYPE_DOT[pc.pinType]}`} />
                      {/* Pin label */}
                      <span className="text-[11px] text-foreground w-20 shrink-0 truncate">{pc.pinLabel}</span>
                      {/* Type badge */}
                      <span className={`text-[9px] uppercase tracking-wide font-mono w-12 shrink-0 ${PIN_TYPE_COLOR[pc.pinType]}`}>
                        {pc.pinType}
                      </span>
                      {/* Connection */}
                      <span className={`text-[11px] flex-1 font-mono ${isOk ? 'text-green-400' : pc.isWired ? 'text-yellow-400' : 'text-muted-foreground/50'}`}>
                        {connLabel}
                      </span>
                      {/* Live state badge */}
                      {isRunning && liveState != null && (
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded font-mono ${isHigh ? 'bg-green-500/20 text-green-400' : 'bg-muted text-muted-foreground'}`}>
                          {isHigh ? 'HIGH' : 'LOW'}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Missing connections hint */}
              {conn && conn.missingConnections.length > 0 && (
                <div className="px-3 py-2 bg-yellow-500/5 border-t border-yellow-500/20">
                  <p className="text-[10px] font-semibold text-yellow-400 mb-0.5">Missing connections:</p>
                  {conn.missingConnections.map((m, i) => (
                    <p key={i} className="text-[10px] text-yellow-400/70">→ {m}</p>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Wires summary */}
        <div className="rounded-lg border border-border bg-muted/10 p-3">
          <p className="text-[10px] font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">
            Wires ({Object.keys(wires).length})
          </p>
          {Object.keys(wires).length === 0
            ? <p className="text-[10px] text-muted-foreground/50">No wires drawn yet.</p>
            : (
              <div className="space-y-0.5">
                {Object.values(wires).slice(0, 12).map(w => {
                  const fmt = (r: typeof w.startPinRef) => {
                    if (r.type === 'board') return `GPIO${r.pinNumber}`;
                    if (r.type === 'component') return `${r.componentId.slice(-4)}·${r.pinId}`;
                    if (r.type === 'breadboard') return `bb[${r.row},${r.col}]`;
                    return '?';
                  };
                  return (
                    <div key={w.id} className="flex items-center gap-1.5 text-[10px]">
                      <div className="w-3 h-1.5 rounded-full shrink-0" style={{ background: w.color }} />
                      <span className="font-mono text-muted-foreground">{fmt(w.startPinRef)} → {fmt(w.endPinRef)}</span>
                    </div>
                  );
                })}
                {Object.keys(wires).length > 12 && (
                  <p className="text-[10px] text-muted-foreground/50">…and {Object.keys(wires).length - 12} more</p>
                )}
              </div>
            )
          }
        </div>
      </div>
    </div>
  );
}

export default function RightPanel() {
  const [activeTab, setActiveTab] = useState<Tab>('editor');
  const code     = useProjectStore((s) => s.code);
  const language = useProjectStore((s) => s.language);
  const setCode  = useProjectStore((s) => s.setCode);
  const setLanguage = useProjectStore((s) => s.setLanguage);
  const { setActiveMode, addMessage, appendStreamChunk, finalizeStream, setStreaming, setError } = useAIStore();

  const handleTemplateSelect = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const id = e.target.value;
      if (!id) return;
      const tmpl = templates.find((t) => t.id === id);
      if (tmpl) { setCode(tmpl.code); setLanguage(tmpl.language); }
    },
    [setCode, setLanguage]
  );

  /** Switch to AI tab and trigger a one-click mode immediately */
  const triggerAI = useCallback((mode: 'analyze' | 'fix') => {
    setActiveMode(mode);
    setActiveTab('ai');

    // Auto-fire the prompt after a short tick so the panel is visible
    setTimeout(async () => {
      const prompt = mode === 'analyze'
        ? 'Please analyze my current code and circuit for issues and improvements.'
        : 'Please diagnose the errors in the console output and provide fixed code.';

      const { default: sendHelper } = await import('@/lib/ai/sendMessage');
      sendHelper(prompt, mode, '', addMessage, appendStreamChunk, finalizeStream, setStreaming, setError);
    }, 50);
  }, [setActiveMode, addMessage, appendStreamChunk, finalizeStream, setStreaming, setError]);

  const TABS = [
    ['editor', 'Editor', Code],
    ['properties', 'Circuit', Cpu],
    ['learn', 'Docs', BookOpen],
    ['ai', 'AI', Sparkles],
  ] as const;

  return (
    <aside className="flex w-[420px] shrink-0 flex-col border-l border-border bg-background h-full">
      {/* Tab bar */}
      <div className="flex shrink-0 border-b border-border">
        {TABS.map(([id, label, Icon]) => (
          <button key={id} onClick={() => setActiveTab(id)}
            data-tour={id === 'ai' ? 'ai-tab' : id === 'editor' ? 'code-editor' : undefined}
            className={`flex flex-1 items-center justify-center gap-1.5 py-2 text-xs font-medium transition-colors border-b-2 ${
              activeTab === id
                ? id === 'ai' ? 'border-purple-500 text-foreground' : 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}>
            <Icon className={`h-3.5 w-3.5 ${activeTab === id && id === 'ai' ? 'text-purple-400' : ''}`} />
            {label}
            {id === 'ai' && <span className="ml-0.5 text-[9px] px-1 rounded-full bg-purple-500/20 text-purple-400 font-semibold">AI</span>}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex flex-1 min-h-0 flex-col overflow-hidden">
        {activeTab === 'editor' && (
          <div className="flex flex-1 min-h-0 flex-col overflow-hidden">
            {/* Editor toolbar */}
            <div className="flex shrink-0 items-center gap-2 border-b border-border px-3 py-2">
              <FileCode className="h-4 w-4 text-muted-foreground shrink-0" />
              <select onChange={handleTemplateSelect} defaultValue=""
                className="flex-1 rounded bg-muted px-2 py-1 text-xs text-foreground outline-none">
                <option value="" disabled>Load template…</option>
                {templates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              {/* AI quick actions */}
              <button onClick={() => triggerAI('analyze')} title="AI: Analyze Code"
                className="flex items-center gap-1 rounded bg-blue-600/15 border border-blue-600/30 px-2 py-1 text-[10px] font-medium text-blue-400 hover:bg-blue-600/25 transition-colors">
                <Bug className="h-3 w-3" /> Analyze
              </button>
              <button onClick={() => triggerAI('fix')} title="AI: Fix Errors"
                className="flex items-center gap-1 rounded bg-orange-600/15 border border-orange-600/30 px-2 py-1 text-[10px] font-medium text-orange-400 hover:bg-orange-600/25 transition-colors">
                <Wrench className="h-3 w-3" /> Fix
              </button>
            </div>
            <div className="flex-1 min-h-0 overflow-hidden">
              <MonacoEditor height="100%" language="python" theme="vs-dark" value={code}
                onChange={(val) => setCode(val ?? '')}
                options={{
                  fontSize: 12, minimap: { enabled: false }, scrollBeyondLastLine: false,
                  wordWrap: 'on', lineNumbers: 'on', renderLineHighlight: 'line',
                  folding: true, automaticLayout: true, padding: { top: 8, bottom: 8 },
                  tabSize: 4, insertSpaces: true,
                }}
              />
            </div>
          </div>
        )}

        {activeTab === 'properties' && <PropertiesTab />}

        {activeTab === 'learn' && (
          <div className="flex flex-1 min-h-0 flex-col overflow-hidden">
            <LearnTab />
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="flex flex-1 min-h-0 flex-col overflow-hidden">
            <AIPanel />
          </div>
        )}
      </div>
    </aside>
  );
}
