'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import {
  Play,
  Pause,
  Square,
  Save,
  Share2,
  Download,
  Cpu,
  Loader2,
  Image,
  FileText,
  RefreshCw,
} from 'lucide-react';
import { useProjectStore } from '@/stores/projectStore';
import { useAuthStore } from '@/stores/authStore';
import { SimulationEngine } from '@/lib/simulation/engine';
import { saveToLocalStorage, loadFromLocalStorage } from '@/lib/serialization/serializer';
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
  const user = useAuthStore((s) => s.user);
  const openModal = useAuthStore((s) => s.openModal);

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

  const handleSave = useCallback(() => {
    const ok = saveToLocalStorage();
    const s = useProjectStore.getState();
    if (ok) {
      s.addConsoleEntry('system', 'Project saved to browser storage.');
    } else {
      s.addConsoleEntry('system', 'Failed to save project — storage may be full.');
    }
  }, []);

  const handleExportPng = useCallback(() => {
    const stageCanvas = document.querySelector('.konvajs-content canvas') as HTMLCanvasElement | null;
    if (!stageCanvas) {
      useProjectStore.getState().addConsoleEntry('system', 'Export failed — canvas not found.');
      return;
    }
    try {
      const dataUrl = stageCanvas.toDataURL('image/png');
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

        <div className="flex items-center rounded-md border border-border text-sm">
          <button
            onClick={() => setBoardModel('pi4')}
            className={`px-3 py-1 rounded-l-md transition-colors ${
              boardModel === 'pi4'
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground hover:bg-accent/50'
            }`}
            aria-pressed={boardModel === 'pi4'}
          >
            Pi 4
          </button>
          <button
            onClick={() => setBoardModel('pi5')}
            className={`px-3 py-1 rounded-r-md transition-colors ${
              boardModel === 'pi5'
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground hover:bg-accent/50'
            }`}
            aria-pressed={boardModel === 'pi5'}
          >
            Pi 5
          </button>
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

      {/* Right: save / share / export / user */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleSave}
          className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          aria-label="Save"
        >
          <Save className="h-4 w-4" />
        </button>
        <button
          className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          aria-label="Share"
        >
          <Share2 className="h-4 w-4" />
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
