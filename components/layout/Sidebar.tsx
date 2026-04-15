'use client';

import { useState, useCallback, useMemo } from 'react';
import { Search, Plus, Package, FolderOpen, ChevronDown, Clock, Lock, Cpu } from 'lucide-react';
import SensorControls from './SensorControls';
import { useProjectStore } from '@/stores/projectStore';
import { useAuthStore, isPro } from '@/stores/authStore';
import { getComponentDefinition } from '@/lib/components';
import { projects } from '@/lib/projects';

type Tab = 'parts' | 'projects';

// ─── Component catalogue ────────────────────────────────────────────────────
const COMPONENT_ENTRIES = [
  { id: 'led-red',        name: 'Red LED',              icon: '🔴', category: 'Output',   pro: false },
  { id: 'led-green',      name: 'Green LED',            icon: '🟢', category: 'Output',   pro: false },
  { id: 'led-blue',       name: 'Blue LED',             icon: '🔵', category: 'Output',   pro: false },
  { id: 'rgb-led',        name: 'RGB LED',              icon: '🌈', category: 'Output',   pro: true  },
  { id: 'neopixel-8',     name: 'NeoPixel Strip (8)',   icon: '🌟', category: 'Output',   pro: true  },
  { id: 'buzzer',         name: 'Piezo Buzzer',         icon: '🔔', category: 'Output',   pro: false },
  { id: 'button',         name: 'Push Button',          icon: '🔘', category: 'Input',    pro: false },
  { id: 'potentiometer',  name: 'Potentiometer',        icon: '🎛️', category: 'Input',    pro: true  },
  { id: 'joystick',       name: 'Analog Joystick',      icon: '🕹',  category: 'Input',    pro: true  },
  { id: 'hc-sr04',        name: 'HC-SR04 Ultrasonic',  icon: '📡', category: 'Sensors',  pro: true  },
  { id: 'dht22',          name: 'DHT22 Temp/Humidity',  icon: '🌡️', category: 'Sensors',  pro: true  },
  { id: 'pir-sensor',     name: 'PIR Motion Sensor',    icon: '👁️', category: 'Sensors',  pro: true  },
  { id: 'relay',          name: '5V Relay Module',      icon: '🔌', category: 'Sensors',  pro: true  },
  { id: 'seven-segment',  name: '7-Segment Display',    icon: '🔢', category: 'Display',  pro: false },
  { id: 'lcd-16x2',       name: 'LCD 16×2 (I2C)',       icon: '🖥️', category: 'Display',  pro: true  },
  { id: 'oled-ssd1306',   name: 'OLED 128×64',          icon: '⬛', category: 'Display',  pro: true  },
  { id: 'touchscreen-7',  name: '7" Touchscreen',       icon: '📺', category: 'Display',  pro: true  },
  { id: 'servo',          name: 'Servo Motor (SG90)',   icon: '⚙️', category: 'Robotics', pro: true  },
  { id: 'dc-motor',       name: 'DC Motor',             icon: '🔄', category: 'Robotics', pro: true  },
  { id: 'stepper-uln',    name: 'Stepper + ULN2003',   icon: '🔩', category: 'Robotics', pro: true  },
  { id: 'resistor',       name: 'Resistor 330Ω',       icon: '〰️', category: 'Passive',  pro: false },
  { id: 'capacitor',      name: 'Capacitor 100μF',      icon: '⚡', category: 'Passive',  pro: false },
] as const;

type ComponentEntry = typeof COMPONENT_ENTRIES[number];

// Category display order & colours
const CATEGORY_CONFIG: Record<string, { color: string; bg: string; defaultOpen: boolean }> = {
  Output:   { color: 'text-green-400',  bg: 'bg-green-500/10',  defaultOpen: true  },
  Input:    { color: 'text-blue-400',   bg: 'bg-blue-500/10',   defaultOpen: true  },
  Sensors:  { color: 'text-yellow-400', bg: 'bg-yellow-500/10', defaultOpen: false },
  Display:  { color: 'text-purple-400', bg: 'bg-purple-500/10', defaultOpen: false },
  Robotics: { color: 'text-orange-400', bg: 'bg-orange-500/10', defaultOpen: false },
  Passive:  { color: 'text-gray-400',   bg: 'bg-gray-500/10',   defaultOpen: false },
};
const CATEGORY_ORDER = ['Output', 'Input', 'Sensors', 'Display', 'Robotics', 'Passive'];

const FREE_PROJECT_IDS = new Set(['blink-led', 'button-led', 'traffic-light']);
const DIFF_STYLES: Record<string, string> = {
  beginner:     'bg-green-500/10 text-green-400',
  intermediate: 'bg-yellow-500/10 text-yellow-400',
  advanced:     'bg-red-500/10 text-red-400',
};

export default function Sidebar() {
  const [tab, setTab]       = useState<Tab>('parts');
  const [query, setQuery]   = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  // Which categories are open — default from config, all open when searching
  const defaultClosed = useMemo(() =>
    new Set(CATEGORY_ORDER.filter(c => !CATEGORY_CONFIG[c]?.defaultOpen)), []);
  const [closedCats, setClosedCats] = useState<Set<string>>(defaultClosed);

  const addComponent  = useProjectStore((s) => s.addComponent);
  const addBreadboard = useProjectStore((s) => s.addBreadboard);
  const setCode       = useProjectStore((s) => s.setCode);
  const user          = useAuthStore((s) => s.user);
  const openModal     = useAuthStore((s) => s.openModal);
  const userIsPro     = isPro(user);

  const toggleCat = useCallback((cat: string) => {
    setClosedCats(prev => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  }, []);

  const handleAddPart = useCallback((entry: ComponentEntry) => {
    if (entry.pro && !userIsPro) { openModal('promo'); return; }
    const def = getComponentDefinition(entry.id);
    if (!def) return;
    const bp = useProjectStore.getState().boardPosition;
    addComponent({ id: def.id, name: def.name, category: def.category, pins: def.pins }, { x: bp.x + 220, y: bp.y + 160 });
  }, [addComponent, userIsPro, openModal]);

  const handleLoadProject = useCallback((projectId: string) => {
    const p = projects.find(x => x.id === projectId);
    if (!p) return;
    setCode(p.code);
    setExpanded(null);
  }, [setCode]);

  // Filtered + grouped component list
  const q = query.toLowerCase().trim();
  const isSearching = q.length > 0;
  const filtered = COMPONENT_ENTRIES.filter(c => !q || c.name.toLowerCase().includes(q) || c.category.toLowerCase().includes(q));
  const grouped = CATEGORY_ORDER.reduce<Record<string, ComponentEntry[]>>((acc, cat) => {
    const items = filtered.filter(c => c.category === cat);
    if (items.length) acc[cat] = items;
    return acc;
  }, {});

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-background">
      {/* Tab bar */}
      <div className="flex shrink-0 border-b border-border">
        {([['parts', 'Parts', Package], ['projects', 'Projects', FolderOpen]] as const).map(([id, label, Icon]) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors border-b-2 ${tab === id ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
            <Icon className="h-3.5 w-3.5" />{label}
          </button>
        ))}
      </div>

      {/* ── PARTS ── */}
      {tab === 'parts' && (
        <div className="flex flex-col flex-1 min-h-0">
          {/* Toolbar */}
          <div className="shrink-0 p-2 space-y-2 border-b border-border">
            <button onClick={() => addBreadboard({ x: useProjectStore.getState().boardPosition.x + 20, y: useProjectStore.getState().boardPosition.y + 380 })}
              className="w-full flex items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/40 px-3 py-2 text-xs font-medium text-foreground hover:bg-accent hover:border-primary/50 transition-colors">
              <Cpu className="h-3.5 w-3.5 text-muted-foreground" /> Add Breadboard
            </button>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search components…"
                className="w-full rounded-lg border border-border bg-muted/60 pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:bg-muted" />
            </div>
          </div>

          {/* Component list */}
          <div className="flex-1 overflow-y-auto">
            {/* Pro upsell — only if not pro and not searching */}
            {!userIsPro && !isSearching && (
              <button onClick={() => openModal('promo')}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 border-b border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 transition-colors text-left">
                <Lock className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-semibold text-blue-400">Upgrade to Pro — unlock everything</p>
                  <p className="text-[9px] text-muted-foreground mt-0.5">Use code <span className="text-green-400 font-mono font-bold">testdev</span> for free access</p>
                </div>
              </button>
            )}

            {/* Collapsible category groups */}
            {Object.entries(grouped).map(([cat, comps]) => {
              const cfg = CATEGORY_CONFIG[cat] ?? { color: 'text-muted-foreground', bg: 'bg-muted/10', defaultOpen: true };
              const isOpen = isSearching || !closedCats.has(cat);
              const allPro = comps.every(c => c.pro);
              const freeCount = comps.filter(c => !c.pro).length;

              return (
                <div key={cat} className="border-b border-border/50 last:border-0">
                  {/* Category header */}
                  <button onClick={() => toggleCat(cat)}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-accent/50 transition-colors group">
                    <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ${isOpen ? '' : '-rotate-90'}`} />
                    <span className={`text-[10px] font-bold uppercase tracking-widest flex-1 text-left ${cfg.color}`}>{cat}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${cfg.bg} ${cfg.color}`}>
                      {comps.length}
                    </span>
                    {allPro && !userIsPro && (
                      <span className="text-[8px] px-1 py-0.5 rounded bg-blue-500/15 text-blue-400 font-semibold ml-1">PRO</span>
                    )}
                    {!allPro && freeCount > 0 && !userIsPro && (
                      <span className="text-[8px] px-1 py-0.5 rounded bg-green-500/15 text-green-400 font-semibold ml-1">{freeCount} free</span>
                    )}
                  </button>

                  {/* Component rows */}
                  {isOpen && (
                    <div className="pb-1">
                      {comps.map(c => {
                        const locked = c.pro && !userIsPro;
                        return (
                          <button key={c.id} onClick={() => handleAddPart(c)}
                            title={locked ? `${c.name} — Pro only` : `Add ${c.name} to canvas`}
                            className={`w-full flex items-center gap-2.5 px-4 py-2 text-left transition-colors group/item ${locked ? 'hover:bg-blue-500/5' : 'hover:bg-accent'}`}>
                            <span className="text-base leading-none w-5 text-center shrink-0">{c.icon}</span>
                            <span className={`flex-1 text-xs ${locked ? 'text-muted-foreground' : 'text-foreground'}`}>{c.name}</span>
                            {locked
                              ? <Lock className="h-3 w-3 text-blue-400/60 shrink-0" />
                              : <Plus className="h-3 w-3 text-muted-foreground/0 group-hover/item:text-muted-foreground/70 transition-opacity shrink-0" />
                            }
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {/* No results */}
            {isSearching && Object.keys(grouped).length === 0 && (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-muted-foreground">No components match "{query}"</p>
              </div>
            )}

            {/* Sensor Controls */}
            <div className="border-t border-border mt-1">
              {userIsPro ? (
                <SensorControls />
              ) : (
                <button onClick={() => openModal('promo')}
                  className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-blue-500/5 transition-colors text-left">
                  <Lock className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                  <div>
                    <p className="text-[10px] font-semibold text-blue-400">Sensor Controls</p>
                    <p className="text-[9px] text-muted-foreground">Live sliders for distance, temp & more</p>
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── PROJECTS ── */}
      {tab === 'projects' && (
        <div className="flex-1 overflow-y-auto">
          {/* Pro upsell */}
          {!userIsPro && (
            <button onClick={() => openModal('promo')}
              className="w-full flex items-center gap-2.5 px-3 py-3 border-b border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 transition-colors text-left">
              <Lock className="h-3.5 w-3.5 text-blue-400 shrink-0" />
              <div>
                <p className="text-[10px] font-semibold text-blue-400">Pro unlocks 18+ projects</p>
                <p className="text-[9px] text-muted-foreground mt-0.5">Free plan includes 3 beginner projects. Code <span className="text-green-400 font-mono">testdev</span> = free Pro.</p>
              </div>
            </button>
          )}

          <div className="p-2 space-y-2">
            {projects.map(p => {
              const locked = !userIsPro && !FREE_PROJECT_IDS.has(p.id);
              return (
                <div key={p.id} className={`rounded-xl border overflow-hidden transition-colors ${locked ? 'border-border/40 opacity-70' : 'border-border hover:border-border/80'}`}>
                  <button onClick={() => locked ? openModal('promo') : setExpanded(expanded === p.id ? null : p.id)}
                    className="w-full flex items-start gap-2.5 px-3 py-3 text-left hover:bg-accent/50 transition-colors">
                    <span className="text-xl leading-none shrink-0 mt-0.5">{p.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground leading-snug">{p.title}</p>
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold ${DIFF_STYLES[p.difficulty]}`}>{p.difficulty}</span>
                        <span className="text-[9px] text-muted-foreground flex items-center gap-0.5">
                          <Clock className="h-2.5 w-2.5" />{p.estimatedMinutes}m
                        </span>
                        {locked && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 font-semibold">Pro</span>}
                      </div>
                    </div>
                    {locked
                      ? <Lock className="h-3.5 w-3.5 text-blue-400/70 shrink-0 mt-1" />
                      : <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground shrink-0 mt-1 transition-transform duration-200 ${expanded === p.id ? '' : '-rotate-90'}`} />
                    }
                  </button>

                  {expanded === p.id && !locked && (
                    <div className="border-t border-border/50 bg-muted/10">
                      <div className="px-3 pt-2 pb-1">
                        <p className="text-[11px] text-muted-foreground leading-relaxed mb-2">{p.description}</p>
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Components</div>
                        <ul className="mb-3 space-y-0.5">
                          {p.components.map(c => (
                            <li key={c.definitionId} className="text-[11px] text-foreground flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary/50 shrink-0" />
                              {c.quantity > 1 && <span className="font-bold">{c.quantity}×</span>} {c.label}
                            </li>
                          ))}
                        </ul>
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Wiring</div>
                        <ul className="mb-3 space-y-1">
                          {p.wiring.map((w, i) => (
                            <li key={i} className="text-[10px] text-muted-foreground leading-relaxed">
                              <span className="font-mono text-foreground/80">{w.from}</span>
                              <span className="mx-1 text-muted-foreground/50">→</span>
                              <span className="font-mono text-foreground/80">{w.to}</span>
                              {w.note && <span className="text-muted-foreground/50 ml-1">({w.note})</span>}
                            </li>
                          ))}
                        </ul>
                        <button onClick={() => handleLoadProject(p.id)}
                          className="w-full rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
                          Load Code into Editor →
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
