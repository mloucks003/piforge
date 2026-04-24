'use client';
import { useCallback } from 'react';
import { CheckCircle2, Circle, FlaskConical, Zap, ChevronRight, Info } from 'lucide-react';
import { useProjectStore } from '@/stores/projectStore';
import { useCanvasStore } from '@/stores/canvasStore';
import { useLabStore, type LabId } from '@/stores/labStore';
import { labs, type LabDefinition } from '@/lib/labs';
import { toast } from '@/stores/toastStore';

const DIFF_COLOR: Record<string, string> = {
  beginner:     'text-green-400 bg-green-500/10 border-green-500/20',
  intermediate: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  advanced:     'text-red-400 bg-red-500/10 border-red-500/20',
};

// ── Schematic diagram ─────────────────────────────────────────────────────────
function Schematic({ lab }: { lab: LabDefinition }) {
  const PIN_LABELS: Record<number, string> = {
    1:'3V3', 2:'5V', 6:'GND', 7:'GPIO4', 9:'GND', 11:'GPIO17',
    13:'GPIO27', 14:'GND', 15:'GPIO22', 16:'GPIO23', 18:'GPIO24',
    20:'GND', 25:'GND', 38:'GPIO20', 40:'GPIO21',
  };
  const usedPins = [...new Set(lab.steps.map(s => {
    const m = s.label.match(/Pin (\d+)/);
    return m ? parseInt(m[1]) : 0;
  }).filter(Boolean))];

  return (
    <svg viewBox="0 0 340 160" className="w-full rounded-lg bg-slate-900/60 border border-border">
      {/* Pi board */}
      <rect x="8" y="20" width="90" height={Math.max(120, usedPins.length * 18 + 10)} rx="4" fill="#1e293b" stroke="#334155" strokeWidth="1.5"/>
      <text x="53" y="15" textAnchor="middle" fill="#94a3b8" fontSize="8" fontWeight="bold">Raspberry Pi</text>
      {usedPins.map((pin, i) => (
        <g key={pin}>
          <circle cx="98" cy={30 + i * 18} r="3.5" fill="#22c55e" />
          <text x="88" y={34 + i * 18} textAnchor="end" fill="#94a3b8" fontSize="7">
            Pin {pin} {PIN_LABELS[pin] ?? ''}
          </text>
        </g>
      ))}
      {/* Components */}
      {lab.components.map((comp, ci) => {
        const cx = 220; const cy = 30 + ci * 50;
        return (
          <g key={ci}>
            <rect x={cx} y={cy - 12} width="110" height="26" rx="4" fill="#1e293b" stroke="#475569" strokeWidth="1"/>
            <text x={cx + 55} y={cy + 5} textAnchor="middle" fill="#e2e8f0" fontSize="8">{comp.label}</text>
          </g>
        );
      })}
      {/* Wires */}
      {lab.steps.slice(0, usedPins.length).map((step, i) => {
        const compIdx = lab.components.findIndex(c => step.label.toLowerCase().includes(c.definitionId.replace('-', ' ').split(' ')[0]));
        const cy = 30 + (compIdx >= 0 ? compIdx : i) * 50;
        return (
          <line key={step.id} x1="98" y1={30 + i * 18} x2="220" y2={cy}
            stroke={step.wireColor} strokeWidth="1.5" strokeOpacity="0.7" strokeDasharray="4 2"/>
        );
      })}
    </svg>
  );
}

// ── Main panel ────────────────────────────────────────────────────────────────
export default function LabPanel() {
  const { activeLabId, setActiveLab } = useLabStore();
  const setWiringMode = useCanvasStore((s) => s.setWiringMode);
  const setCode       = useProjectStore((s) => s.setCode);
  const wires         = useProjectStore((s) => s.wires);
  const components    = useProjectStore((s) => s.components);

  const activeLab = labs.find(l => l.id === activeLabId) ?? null;

  const allDone = activeLab
    ? activeLab.steps.every(s => s.validate(wires as never, components as Record<string, { definitionId: string }>))
    : false;

  const startLab = useCallback((lab: LabDefinition) => {
    lab.placeComponents();
    setActiveLab(lab.id as LabId);
    setWiringMode(true);
    toast.info(`🔌 ${lab.title} started — drag wires on the canvas to connect each pin!`);
  }, [setActiveLab, setWiringMode]);

  const loadCode = useCallback(() => {
    if (!activeLab) return;
    setCode(activeLab.code);
    setWiringMode(false);
    toast.success('✅ All wired up! Code loaded — hit ▶ Play to run.');
  }, [activeLab, setCode, setWiringMode]);

  if (!activeLab) {
    return (
      <div className="flex flex-col h-full overflow-hidden">
        <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-muted/20 shrink-0">
          <FlaskConical className="h-4 w-4 text-blue-400" />
          <span className="text-xs font-semibold text-foreground">Wiring Labs</span>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          <p className="text-[10px] text-muted-foreground pb-1">
            Pick a lab. Components are placed for you — connect the wires yourself and get ✅ live feedback on every connection.
          </p>
          {labs.map(lab => (
            <button key={lab.id} onClick={() => startLab(lab)}
              className="w-full text-left rounded-xl border border-border bg-muted/10 hover:bg-muted/30 p-3 transition-colors group">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-base">{lab.emoji}</span>
                    <span className="text-xs font-semibold text-foreground">{lab.title}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">{lab.description}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1 group-hover:text-foreground transition-colors" />
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className={`text-[9px] font-semibold border rounded-full px-2 py-0.5 ${DIFF_COLOR[lab.difficulty]}`}>
                  {lab.difficulty}
                </span>
                <span className="text-[9px] text-muted-foreground">⏱ {lab.estimatedMinutes} min</span>
                <span className="text-[9px] text-muted-foreground">🔌 {lab.steps.length} connections</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-muted/20 shrink-0">
        <FlaskConical className="h-4 w-4 text-blue-400" />
        <span className="text-xs font-semibold text-foreground flex-1">{activeLab.emoji} {activeLab.title}</span>
        <button onClick={() => { setActiveLab(null); setWiringMode(false); }}
          className="text-[9px] text-muted-foreground hover:text-foreground border border-border rounded px-1.5 py-0.5 transition-colors">
          ← Labs
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
        {/* Schematic */}
        <Schematic lab={activeLab} />

        {/* Components list */}
        <div className="rounded-lg border border-border bg-muted/10 px-3 py-2">
          <p className="text-[10px] font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Components (pre-placed)</p>
          {activeLab.components.map((c, i) => (
            <div key={i} className="flex items-center gap-1.5 text-[11px] text-foreground py-0.5">
              <Info className="h-3 w-3 text-blue-400 shrink-0" />
              {c.label}
            </div>
          ))}
        </div>

        {/* Wiring steps */}
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">
            Wiring Steps — {activeLab.steps.filter(s => s.validate(wires as never, components as Record<string, { definitionId: string }>)).length}/{activeLab.steps.length} done
          </p>
          <StepList lab={activeLab} />
        </div>
      </div>

      {/* Footer */}
      <div className="shrink-0 border-t border-border p-3">
        {allDone ? (
          <button onClick={loadCode}
            className="w-full flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-bold bg-green-600 hover:bg-green-500 text-white transition-colors shadow-lg shadow-green-900/30">
            <Zap className="h-3.5 w-3.5" /> All wired! Load Code & Run ▶
          </button>
        ) : (
          <p className="text-[10px] text-muted-foreground text-center">
            🔌 Drag wires on the canvas to connect each pin — steps check automatically
          </p>
        )}
      </div>
    </div>
  );
}

// ── Step list ─────────────────────────────────────────────────────────────────
function StepList({ lab }: { lab: LabDefinition }) {
  const wires      = useProjectStore((s) => s.wires);
  const components = useProjectStore((s) => s.components);

  return (
    <div className="space-y-1.5">
      {lab.steps.map((step, idx) => {
        const done = step.validate(
          wires as never,
          components as Record<string, { definitionId: string }>,
        );
        return (
          <div key={step.id}
            className={`flex items-start gap-2 rounded-lg px-2.5 py-2 border transition-colors ${done ? 'border-green-500/30 bg-green-500/5' : 'border-border bg-muted/10'}`}>
            <span className="mt-0.5 shrink-0">
              {done
                ? <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
                : <Circle className="h-3.5 w-3.5 text-muted-foreground/40" />}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: step.wireColor }} />
                <span className={`text-[11px] font-medium leading-tight ${done ? 'text-green-300' : 'text-foreground'}`}>
                  {idx + 1}. {step.label}
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">{step.detail}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
