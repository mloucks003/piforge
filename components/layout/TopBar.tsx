'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import {
  Play, Pause, Square, Download,
  Cpu, Loader2, Image, FileText, RefreshCw,
  Undo2, Redo2, FolderOpen, ChevronDown,
} from 'lucide-react';
import { BOARD_CATALOG } from '@/lib/boards';
import { useProjectStore } from '@/stores/projectStore';
import { useAuthStore } from '@/stores/authStore';
import { useProjectManagerStore } from '@/stores/projectManagerStore';
import { useCanvasStore } from '@/stores/canvasStore';
import { SimulationEngine } from '@/lib/simulation/engine';
import { loadFromLocalStorage } from '@/lib/serialization/serializer';
import { GPIOMock } from '@/lib/simulation/gpio-mock';
import { resolveCircuit } from '@/lib/simulation/circuit-resolver';
import { generateBuildGuide, downloadBuildGuide } from '@/lib/export/build-guide';

/** Singleton GPIO mock + engine, created once on first render. */
let _gpio: GPIOMock | null = null;
let _engine: SimulationEngine | null = null;

function getGpio(): GPIOMock {
  if (!_gpio) _gpio = new GPIOMock();
  return _gpio;
}

export function getSimulationGpio(): GPIOMock | null {
  return _gpio;
}

export function getSimulationEngine(): SimulationEngine | null {
  return _engine;
}

const PLAN_COLORS: Record<string, string> = {
  free:      'bg-muted text-muted-foreground',
  pro:       'bg-blue-600 text-white',
  education: 'bg-purple-600 text-white',
};

export default function TopBar() {
  const boardModel = useProjectStore((s) => s.boardModel);
  const setBoardModel = useProjectStore((s) => s.setBoardModel);
  const simulationState = useProjectStore((s) => s.simulationState);
  const engineRef = useRef<SimulationEngine | null>(null);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [boardMenuOpen, setBoardMenuOpen] = useState(false);
  const user      = useAuthStore((s) => s.user);
  const openModal = useAuthStore((s) => s.openModal);
  const undo      = useProjectStore((s) => s.undo);
  const redo      = useProjectStore((s) => s.redo);
  const past      = useProjectStore((s) => s.past);
  const future    = useProjectStore((s) => s.future);
  const openProjectManager = useProjectManagerStore((s) => s.openModal);
  const saveProject        = useProjectManagerStore((s) => s.saveProject);

  // Keyboard shortcuts: Ctrl+Z, Ctrl+Y/Shift+Z, Ctrl+S
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
      if ((e.metaKey || e.ctrlKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); redo(); }
      if ((e.metaKey || e.ctrlKey) && e.key === 's') { e.preventDefault(); saveProject('Quick Save'); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo, saveProject]);

  // Load saved project from localStorage on mount
  useEffect(() => {
    const loaded = loadFromLocalStorage();
    if (loaded) {
      useProjectStore.getState().addConsoleEntry('system', 'Restored project from browser storage.');
    }
  }, []);

  const ensureEngine = useCallback(() => {
    if (engineRef.current) return engineRef.current;

    const gpio = getGpio();
    const store = useProjectStore.getState;

    // Wire GPIO pin changes → component visual updates
    gpio.setChangeCallback((gpioNumber, state) => {
      const s = store();
      s.setPinState(gpioNumber, state);

      // Update only LEDs that are properly wired to this GPIO pin
      if (state.value !== undefined) {
        const circuit = resolveCircuit(s.components, s.wires, s.boardModel);
        for (const [compId, conn] of circuit) {
          if (conn.gpioPin === gpioNumber && conn.isComplete) {
            s.setComponentPinState(compId, 'anode', { value: state.value as 0 | 1 });
          }
        }
      }
    });

    const engine = new SimulationEngine(gpio, {
      onStdout: (text) => {
        useProjectStore.getState().addConsoleEntry('stdout', text);
      },
      onStderr: (text) => {
        useProjectStore.getState().addConsoleEntry('stderr', text);
      },
      onStateChange: (state) => {
        useProjectStore.getState().setSimulationState(state);
      },
      onPinChange: (gpioNumber, value) => {
        const s = useProjectStore.getState();
        const circuit = resolveCircuit(s.components, s.wires, s.boardModel);
        for (const [compId, conn] of circuit) {
          if (conn.gpioPin === gpioNumber && conn.isComplete) {
            s.setComponentPinState(compId, 'anode', { value: value as 0 | 1 });
          }
        }
      },
    });

    engineRef.current = engine;
    _engine = engine;
    return engine;
  }, []);

  const handlePlay = useCallback(() => {
    const engine = ensureEngine();
    const currentCode = useProjectStore.getState().code;
    if (!currentCode.trim()) {
      useProjectStore.getState().addConsoleEntry('system', 'No code to run. Write some code in the editor first.');
      return;
    }
    useProjectStore.getState().clearConsole();
    engine.start(currentCode);
  }, [ensureEngine]);

  const handlePause = useCallback(() => {
    engineRef.current?.pause();
  }, []);

  const handleReset = useCallback(() => {
    engineRef.current?.reset();
    // Reset all component pin states
    const s = useProjectStore.getState();
    for (const comp of Object.values(s.components)) {
      if (comp.definitionId.startsWith('led-')) {
        s.setComponentPinState(comp.id, 'anode', { value: 0 });
      }
    }
    s.clearConsole();
    s.addConsoleEntry('system', 'Simulation reset.');
  }, []);

  const handleExportPng = useCallback(() => {
    const stage = useCanvasStore.getState().konvaStage;
    if (!stage) {
      useProjectStore.getState().addConsoleEntry('system', 'Export failed — canvas not ready.');
      return;
    }
    try {
      const dataUrl = stage.toDataURL({ mimeType: 'image/png', quality: 1 });
      const link = document.createElement('a');
      link.download = 'piforge-circuit.png';
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      useProjectStore.getState().addConsoleEntry('system', 'PNG exported.');
    } catch (err) {
      console.error('PNG export failed:', err);
      useProjectStore.getState().addConsoleEntry('system', 'PNG export failed.');
    }
    setExportMenuOpen(false);
  }, []);

  const handleExportBuildGuide = useCallback(() => {
    const s = useProjectStore.getState();
    const md = generateBuildGuide({
      boardModel: s.boardModel,
      components: s.components,
      breadboards: s.breadboards,
      wires: s.wires,
      code: s.code,
      language: s.language,
    });
    downloadBuildGuide(md);
    s.addConsoleEntry('system', 'Build guide exported.');
    setExportMenuOpen(false);
  }, []);

  const isRunning = simulationState === 'running';
  const isPaused = simulationState === 'paused';

  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-border bg-background px-4">
      {/* Left: branding + board switcher */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 font-semibold text-foreground">
          <Cpu className="h-5 w-5 text-green-500" />
          <span>PiForge</span>
        </div>

        {/* Board selector dropdown */}
        <div className="relative">
          <button
            onClick={() => setBoardMenuOpen(o => !o)}
            className="flex items-center gap-1.5 rounded-md border border-border bg-muted/60 px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors"
          >
            <Cpu className="h-3.5 w-3.5 text-green-500" />
            <span>{BOARD_CATALOG.find(b => b.id === boardModel)?.name ?? boardModel}</span>
            <ChevronDown className={`h-3 w-3 text-muted-foreground transition-transform duration-150 ${boardMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {boardMenuOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setBoardMenuOpen(false)} />
              <div className="absolute left-0 top-full mt-1.5 z-40 w-56 rounded-xl border border-border shadow-2xl overflow-hidden"
                style={{ background: 'hsl(var(--background))', borderColor: 'hsl(var(--border))' }}>

                {/* Header */}
                <div className="px-3 py-2 border-b border-border/60 bg-muted/40">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Select Board</p>
                </div>

                {[
                  { family: 'raspberry-pi', label: 'Raspberry Pi', color: 'text-green-400' },
                  { family: 'arduino',      label: 'Arduino',       color: 'text-blue-400'  },
                  { family: 'pico',         label: 'Microcontroller', color: 'text-purple-400' },
                ].map(({ family, label, color }) => {
                  const groupBoards = BOARD_CATALOG.filter(b => b.family === family);
                  return (
                    <div key={family} className="py-1">
                      <div className={`px-3 py-1 text-[9px] font-bold uppercase tracking-widest ${color}`}>{label}</div>
                      {groupBoards.map(b => (
                        <button key={b.id}
                          onClick={() => { setBoardModel(b.id); setBoardMenuOpen(false); }}
                          className={`w-full flex items-center justify-between px-3 py-2 text-sm transition-colors
                            ${boardModel === b.id
                              ? 'bg-green-500/10 text-green-400 font-semibold'
                              : 'text-foreground hover:bg-muted/60'}`}
                        >
                          <div className="flex items-center gap-2">
                            {boardModel === b.id && <span className="text-green-400">✓</span>}
                            {boardModel !== b.id && <span className="text-transparent">✓</span>}
                            <span>{b.name}</span>
                          </div>
                          <span className="text-[10px] text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded">
                            {b.lang === 'cpp' ? 'C++' : b.lang === 'micropython' ? 'µPy' : 'Py'}
                          </span>
                        </button>
                      ))}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Center: simulation controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={handlePlay}
          disabled={isRunning}
          className={`rounded-md p-1.5 transition-colors ${
            isRunning
              ? 'text-green-400 bg-green-500/10 cursor-not-allowed'
              : 'text-muted-foreground hover:bg-green-500/20 hover:text-green-400'
          }`}
          aria-label="Play"
        >
          {isRunning ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </button>
        <button
          onClick={handlePause}
          disabled={!isRunning}
          className={`rounded-md p-1.5 transition-colors ${
            !isRunning
              ? 'text-muted-foreground/40 cursor-not-allowed'
              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
          }`}
          aria-label="Pause"
        >
          <Pause className="h-4 w-4" />
        </button>
        <button
          onClick={handleReset}
          disabled={simulationState === 'idle'}
          className={`rounded-md p-1.5 transition-colors ${
            simulationState === 'idle'
              ? 'text-muted-foreground/40 cursor-not-allowed'
              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
          }`}
          aria-label="Reset"
        >
          <Square className="h-4 w-4" />
        </button>
        {simulationState !== 'idle' && (
          <span
            className={`ml-1 text-xs capitalize ${
              isRunning
                ? 'text-green-400'
                : isPaused
                ? 'text-yellow-400'
                : 'text-red-400'
            }`}
          >
            {simulationState}
          </span>
        )}
      </div>

      {/* Right: undo/redo · projects · export · new · user */}
      <div className="flex items-center gap-1">
        {/* ── Undo / Redo ── */}
        <div className="flex items-center border-r border-border pr-1 mr-1">
          <button onClick={undo} disabled={past.length === 0} title="Undo (Ctrl+Z)"
            className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-30">
            <Undo2 className="h-4 w-4" />
          </button>
          <button onClick={redo} disabled={future.length === 0} title="Redo (Ctrl+Y)"
            className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-30">
            <Redo2 className="h-4 w-4" />
          </button>
        </div>
        {/* ── Project Manager ── */}
        <button onClick={openProjectManager} title="Projects (Ctrl+S to save)"
          className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
          <FolderOpen className="h-4 w-4" />
          <span className="text-[11px] font-medium hidden lg:block">Projects</span>
        </button>
        <div className="relative">
          <button
            onClick={() => setExportMenuOpen((v) => !v)}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            aria-label="Export"
            aria-expanded={exportMenuOpen}
          >
            <Download className="h-4 w-4" />
          </button>
          {exportMenuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setExportMenuOpen(false)} />
              <div className="absolute right-0 top-full mt-1 z-50 w-48 rounded-md border border-border bg-background shadow-lg py-1">
                <button
                  onClick={handleExportPng}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                >
                  <Image className="h-4 w-4" />
                  Export as PNG
                </button>
                <button
                  onClick={handleExportBuildGuide}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                >
                  <FileText className="h-4 w-4" />
                  Export Build Guide
                </button>
              </div>
            </>
          )}
        </div>
        <button
          onClick={() => { if (confirm('Clear everything and start fresh?')) { useProjectStore.setState({ components: {}, breadboards: {}, wires: {}, pinStates: {}, code: '', consoleOutput: [], simulationState: 'idle' }); } }}
          className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          aria-label="New Project"
        >
          <RefreshCw className="h-4 w-4" />
        </button>

        {/* ── User / Auth ── */}
        <div className="ml-1 pl-2 border-l border-border flex items-center gap-2">
          {user ? (
            <button
              onClick={() => openModal('signin')}
              className="flex items-center gap-1.5 rounded-lg px-2 py-1 hover:bg-accent transition-colors"
              title={`${user.name} — ${user.plan}`}
            >
              <div className="w-6 h-6 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center text-[11px] font-bold text-green-400">
                {user.name[0].toUpperCase()}
              </div>
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${PLAN_COLORS[user.plan]}`}>
                {user.plan.charAt(0).toUpperCase() + user.plan.slice(1)}
              </span>
            </button>
          ) : (
            <button
              onClick={() => openModal('signup')}
              className="rounded-lg bg-green-600 px-3 py-1 text-xs font-semibold text-white hover:bg-green-500 transition-colors"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
