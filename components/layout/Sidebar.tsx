'use client';

import { useState, useCallback } from 'react';
import { Search, Plus, Package, FolderOpen, GraduationCap, ChevronRight, Clock, Lock } from 'lucide-react';
import SensorControls from './SensorControls';
import { useProjectStore } from '@/stores/projectStore';
import { useAuthStore, isPro } from '@/stores/authStore';
import { getComponentDefinition } from '@/lib/components';
import { projects } from '@/lib/projects';
import { tutorials } from '@/lib/tutorials';
import { useTutorialStore } from '@/stores/tutorialStore';

type Tab = 'parts' | 'projects' | 'learn';

const COMPONENT_ENTRIES = [
  // ── Output ──────────────────────────────────────────────────────
  { id: 'led-red',       name: 'Red LED',           icon: '🔴', category: 'Output',   pro: false },
  { id: 'led-green',     name: 'Green LED',         icon: '🟢', category: 'Output',   pro: false },
  { id: 'led-blue',      name: 'Blue LED',          icon: '🔵', category: 'Output',   pro: false },
  { id: 'rgb-led',       name: 'RGB LED',           icon: '🌈', category: 'Output',   pro: true  },
  { id: 'buzzer',        name: 'Piezo Buzzer',      icon: '🔔', category: 'Output',   pro: false },
  // ── Input ───────────────────────────────────────────────────────
  { id: 'button',        name: 'Push Button',       icon: '⏺',  category: 'Input',    pro: false },
  { id: 'potentiometer', name: 'Potentiometer',     icon: '🎛️', category: 'Input',    pro: true  },
  // ── Sensors ─────────────────────────────────────────────────────
  { id: 'hc-sr04',       name: 'HC-SR04 Ultrasonic',icon: '📡', category: 'Sensors',  pro: true  },
  { id: 'dht22',         name: 'DHT22 Temp/Humidity',icon:'🌡️', category: 'Sensors',  pro: true  },
  { id: 'pir-sensor',    name: 'PIR Motion Sensor', icon: '👁️', category: 'Sensors',  pro: true  },
  // ── Motors & Robotics ───────────────────────────────────────────
  { id: 'servo',         name: 'Servo Motor (SG90)',icon: '⚙️', category: 'Robotics', pro: true  },
  { id: 'dc-motor',      name: 'DC Motor',          icon: '🔄', category: 'Robotics', pro: true  },
  // ── Passive ─────────────────────────────────────────────────────
  { id: 'resistor',      name: 'Resistor 330Ω',    icon: '〰️', category: 'Passive',  pro: false },
  // ── Display ─────────────────────────────────────────────────────
  { id: 'touchscreen-7', name: '7" Touchscreen',   icon: '📺', category: 'Display',  pro: true  },
];

// Projects free users can access
const FREE_PROJECT_IDS = new Set(['blink-led', 'button-led', 'traffic-light']);
// Tutorials free users can access
const FREE_TUTORIAL_IDS = new Set(['blink', 'button']);

const DIFF_STYLES: Record<string, string> = {
  beginner:     'bg-green-500/10 text-green-400',
  intermediate: 'bg-yellow-500/10 text-yellow-400',
  advanced:     'bg-red-500/10 text-red-400',
};

export default function Sidebar() {
  const [tab, setTab]   = useState<Tab>('parts');
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const addComponent  = useProjectStore((s) => s.addComponent);
  const addBreadboard = useProjectStore((s) => s.addBreadboard);
  const setCode       = useProjectStore((s) => s.setCode);
  const startTutorial = useTutorialStore((s) => s.start);
  const activeTutorial = useTutorialStore((s) => s.active);
  const user      = useAuthStore((s) => s.user);
  const openModal = useAuthStore((s) => s.openModal);
  const userIsPro = isPro(user);

  const handleAddPart = useCallback((entry: typeof COMPONENT_ENTRIES[number]) => {
    if (entry.pro && !userIsPro) {
      openModal('promo');
      return;
    }
    const def = getComponentDefinition(entry.id);
    if (!def) return;
    const bp = useProjectStore.getState().boardPosition;
    addComponent({ id: def.id, name: def.name, category: def.category, pins: def.pins }, { x: bp.x + 200, y: bp.y + 150 });
  }, [addComponent, userIsPro, openModal]);

  const handleLoadProject = useCallback((projectId: string) => {
    const p = projects.find(x => x.id === projectId);
    if (!p) return;
    setCode(p.code);
    setExpanded(null);
  }, [setCode]);

  // ── Parts tab ─────────────────────────────────────────────────────────────
  const q = query.toLowerCase();
  const filtered = COMPONENT_ENTRIES.filter(c => !q || c.name.toLowerCase().includes(q));
  const grouped  = filtered.reduce<Record<string, typeof COMPONENT_ENTRIES>>((a, c) => {
    (a[c.category] ??= []).push(c); return a;
  }, {});

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Tab bar */}
      <div className="flex shrink-0 border-b border-border">
        {([['parts','Parts',Package],['projects','Projects',FolderOpen],['learn','Learn',GraduationCap]] as const).map(([id, label, Icon]) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex flex-1 items-center justify-center gap-1 py-2 text-xs font-medium transition-colors border-b-2 ${tab===id ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
            <Icon className="h-3.5 w-3.5" />{label}
          </button>
        ))}
      </div>

      {/* ── PARTS ── */}
      {tab === 'parts' && (
        <div className="flex flex-col flex-1 min-h-0">
          <div className="shrink-0 p-2 border-b border-border">
            <button onClick={() => addBreadboard({ x: useProjectStore.getState().boardPosition.x, y: useProjectStore.getState().boardPosition.y + 350 })}
              className="w-full flex items-center justify-center gap-2 rounded-md border border-dashed border-border bg-muted/50 px-3 py-2 text-xs text-foreground hover:bg-accent transition-colors">
              <Plus className="h-3.5 w-3.5" /> Add Breadboard
            </button>
          </div>
          <div className="shrink-0 px-2 pt-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search parts…"
                className="w-full rounded-md border border-border bg-muted pl-7 pr-2 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {!userIsPro && (
              <button onClick={() => openModal('promo')}
                className="w-full mb-3 flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-500/5 px-3 py-2 text-left hover:bg-blue-500/10 transition-colors">
                <Lock className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-semibold text-blue-400">Upgrade to Pro</p>
                  <p className="text-[9px] text-muted-foreground">Unlock sensors, robotics, touchscreen &amp; more. Use code <span className="text-green-400 font-mono">testdev</span>.</p>
                </div>
              </button>
            )}
            {Object.entries(grouped).map(([cat, comps]) => (
              <div key={cat} className="mb-3">
                <div className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{cat}</div>
                <ul className="space-y-0.5">
                  {comps.map(c => {
                    const locked = c.pro && !userIsPro;
                    return (
                      <li key={c.id} onClick={() => handleAddPart(c)}
                        className={`flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors select-none ${locked ? 'opacity-60 hover:bg-blue-500/10' : 'text-foreground hover:bg-accent'}`}>
                        <span className="text-sm leading-none">{c.icon}</span>
                        <span className={locked ? 'text-muted-foreground' : 'text-foreground'}>{c.name}</span>
                        {locked
                          ? <Lock className="ml-auto h-3 w-3 text-blue-400/70" />
                          : <Plus className="ml-auto h-3 w-3 text-muted-foreground/60" />
                        }
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
            {/* Sensor Controls — Pro only */}
            {userIsPro && (
              <div className="mt-2 pt-2 border-t border-border">
                <SensorControls />
              </div>
            )}
            {!userIsPro && (
              <div className="mt-2 pt-2 border-t border-border">
                <div className="flex items-center gap-1.5 px-1 mb-1">
                  <Lock className="h-3 w-3 text-blue-400" />
                  <span className="text-[10px] font-semibold text-blue-400">Sensor Controls</span>
                  <span className="text-[9px] text-muted-foreground ml-auto">Pro</span>
                </div>
                <p className="text-[9px] text-muted-foreground px-1">Live sliders for distance, temperature, humidity &amp; more.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── PROJECTS ── */}
      {tab === 'projects' && (
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          <p className="px-1 py-1 text-[10px] text-muted-foreground">Click a project to see wiring steps + load its code into the editor.</p>
          {!userIsPro && (
            <button onClick={() => openModal('promo')}
              className="w-full flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-500/5 px-3 py-2 text-left hover:bg-blue-500/10 transition-colors">
              <Lock className="h-3.5 w-3.5 text-blue-400 shrink-0" />
              <div>
                <p className="text-[10px] font-semibold text-blue-400">Pro unlocks 18+ projects</p>
                <p className="text-[9px] text-muted-foreground">Free plan includes 3 beginner projects.</p>
              </div>
            </button>
          )}
          {projects.map(p => {
            const locked = !userIsPro && !FREE_PROJECT_IDS.has(p.id);
            return (
            <div key={p.id} className={`rounded-lg border bg-muted/20 overflow-hidden ${locked ? 'border-border/40 opacity-60' : 'border-border'}`}>
              <button onClick={() => locked ? openModal('promo') : setExpanded(expanded === p.id ? null : p.id)}
                className="w-full flex items-start gap-2 px-3 py-2.5 text-left hover:bg-accent transition-colors">
                <span className="text-lg leading-none shrink-0 mt-0.5">{p.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-semibold text-foreground">{p.title}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${DIFF_STYLES[p.difficulty]}`}>{p.difficulty}</span>
                    {locked && <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium bg-blue-500/10 text-blue-400">Pro</span>}
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Clock className="h-2.5 w-2.5 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground">{p.estimatedMinutes} min</span>
                  </div>
                </div>
                {locked
                  ? <Lock className="h-3.5 w-3.5 text-blue-400/70 shrink-0 mt-1" />
                  : <ChevronRight className={`h-3.5 w-3.5 text-muted-foreground shrink-0 mt-1 transition-transform ${expanded === p.id ? 'rotate-90' : ''}`} />
                }
              </button>
              {expanded === p.id && !locked && (
                <div className="px-3 pb-3 border-t border-border/50">
                  <p className="text-[11px] text-muted-foreground mt-2 mb-2 leading-relaxed">{p.description}</p>
                  <div className="mb-2">
                    <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">You need</div>
                    <ul className="space-y-0.5">
                      {p.components.map(c => (
                        <li key={c.definitionId} className="text-[11px] text-foreground flex items-center gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-primary/60 shrink-0" />
                          {c.quantity > 1 && <span className="font-medium">{c.quantity}×</span>}
                          {c.label}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="mb-3">
                    <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Wiring</div>
                    <ul className="space-y-1">
                      {p.wiring.map((w, i) => (
                        <li key={i} className="text-[10px] text-muted-foreground leading-relaxed">
                          <span className="font-mono text-foreground/80">{w.from}</span>
                          <span className="mx-1">→</span>
                          <span className="font-mono text-foreground/80">{w.to}</span>
                          {w.note && <span className="text-muted-foreground/60 ml-1">({w.note})</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <button onClick={() => handleLoadProject(p.id)}
                    className="w-full rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
                    Load Code into Editor
                  </button>
                </div>
              )}
            </div>
            );
          })}
        </div>
      )}

      {/* ── LEARN ── */}
      {tab === 'learn' && (
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          <p className="px-1 py-1 text-[10px] text-muted-foreground">Step-by-step guided projects that walk you through wiring and code.</p>
          {!userIsPro && (
            <button onClick={() => openModal('promo')}
              className="w-full flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-500/5 px-3 py-2 text-left hover:bg-blue-500/10 transition-colors">
              <Lock className="h-3.5 w-3.5 text-blue-400 shrink-0" />
              <div>
                <p className="text-[10px] font-semibold text-blue-400">Pro unlocks all tutorials</p>
                <p className="text-[9px] text-muted-foreground">Free plan includes 2 beginner tutorials.</p>
              </div>
            </button>
          )}
          {tutorials.map(t => {
            const locked = !userIsPro && !FREE_TUTORIAL_IDS.has(t.id);
            return (
              <button key={t.id}
                onClick={() => locked ? openModal('promo') : (!activeTutorial && startTutorial(t))}
                disabled={!locked && !!activeTutorial}
                className={`w-full rounded-lg border bg-muted/20 px-3 py-2.5 text-left transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${locked ? 'border-border/40 opacity-60 hover:bg-blue-500/10' : 'border-border hover:bg-accent'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${DIFF_STYLES[t.difficulty]}`}>{t.difficulty}</span>
                  <span className="text-[10px] text-muted-foreground">{t.estimatedMinutes} min · {t.steps.length} steps</span>
                  {locked && <Lock className="h-3 w-3 text-blue-400 ml-auto" />}
                </div>
                <div className="text-xs font-semibold text-foreground">{t.title}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">{t.description}</div>
              </button>
            );
          })}
          {activeTutorial && (
            <p className="text-[10px] text-yellow-400 text-center px-2">Tutorial in progress — finish or stop it first.</p>
          )}
        </div>
      )}
    </div>
  );
}
