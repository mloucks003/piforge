'use client';
import { useSimHubStore } from '@/stores/simHubStore';
import { useTutorialStore } from '@/stores/tutorialStore';
import { getTutorial } from '@/lib/tutorials';
import { useCanvasStore } from '@/stores/canvasStore';
import { useProjectStore } from '@/stores/projectStore';
import { X } from 'lucide-react';

// ── Emit a tab-switch request that RightPanel listens for ──────────────────────
function switchTab(tab: string) {
  window.dispatchEvent(new CustomEvent('piforge:tab', { detail: tab }));
}

// ── Scenario definitions ──────────────────────────────────────────────────────
interface Scenario {
  id: string;
  emoji: string;
  title: string;
  subtitle: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'free';
  difficultyColor: string;
  gradient: string;
  tutorialId?: string;
  isNetworkLab?: boolean;
  isFreeBuild?: boolean;
}

const SCENARIOS: Scenario[] = [
  {
    id: 'free',
    emoji: '🔬',
    title: 'Pi Lab',
    subtitle: 'Build anything from scratch. Drag components, wire GPIO pins, write Python — total freedom.',
    tags: ['GPIO', 'Python', 'Breadboard'],
    difficulty: 'free',
    difficultyColor: 'text-muted-foreground border-muted-foreground/30',
    gradient: 'from-green-500/10 to-emerald-500/5 hover:from-green-500/20',
    isFreeBuild: true,
  },
  {
    id: 'smart-home',
    emoji: '🏠',
    title: 'Smart Home',
    subtitle: 'Pi controls lights, motion detection, climate monitoring, and MQTT home automation.',
    tags: ['PIR', 'DHT22', 'MQTT', 'Relay'],
    difficulty: 'beginner',
    difficultyColor: 'text-green-400 border-green-500/30',
    gradient: 'from-green-500/10 to-teal-500/5 hover:from-green-500/20',
    tutorialId: 'smart-home-tutorial',
  },
  {
    id: 'smart-office',
    emoji: '🏢',
    title: 'Smart Office',
    subtitle: 'Occupancy detection, HVAC control, climate logging, and energy-aware lighting.',
    tags: ['PIR', 'DHT22', 'Relay', 'HVAC'],
    difficulty: 'advanced',
    difficultyColor: 'text-orange-400 border-orange-500/30',
    gradient: 'from-blue-500/10 to-cyan-500/5 hover:from-blue-500/20',
    tutorialId: 'smart-office-tutorial',
  },
  {
    id: 'robot',
    emoji: '🤖',
    title: 'Robot',
    subtitle: 'Build an obstacle-avoiding robot using HC-SR04 sonar + dual DC motors. Simulate walls live.',
    tags: ['HC-SR04', 'DC Motors', 'gpiozero Robot'],
    difficulty: 'advanced',
    difficultyColor: 'text-orange-400 border-orange-500/30',
    gradient: 'from-purple-500/10 to-violet-500/5 hover:from-purple-500/20',
    tutorialId: 'obstacle-robot-tutorial',
  },
  {
    id: 'smart-farm',
    emoji: '🌱',
    title: 'Smart Farm',
    subtitle: 'Automate irrigation: monitor soil moisture, trigger a water pump relay, track climate.',
    tags: ['DHT22', 'Relay', 'LED', 'Soil Sensor'],
    difficulty: 'intermediate',
    difficultyColor: 'text-yellow-400 border-yellow-500/30',
    gradient: 'from-lime-500/10 to-green-500/5 hover:from-lime-500/20',
    tutorialId: 'smart-farm-tutorial',
  },
  {
    id: 'network',
    emoji: '🌐',
    title: 'Network Lab',
    subtitle: 'Set up home or office networks. Configure IPs, ping devices, trace routes — Cisco-style.',
    tags: ['Router', 'Switch', 'ping', 'traceroute'],
    difficulty: 'intermediate',
    difficultyColor: 'text-blue-400 border-blue-500/30',
    gradient: 'from-blue-500/10 to-sky-500/5 hover:from-blue-500/20',
    isNetworkLab: true,
  },
];

const DIFF_LABELS: Record<string, string> = {
  free: 'Free Build', beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced',
};

export default function SimHub() {
  const { open, hide } = useSimHubStore();
  if (!open) return null;

  function launch(scenario: Scenario) {
    hide();
    if (scenario.isFreeBuild) {
      useProjectStore.setState({ components: {}, wires: {}, breadboards: {}, past: [], future: [] });
      useCanvasStore.getState().setActiveEnvironment(null);
      useCanvasStore.getState().setActiveScene(null);
      switchTab('editor');
      return;
    }
    if (scenario.isNetworkLab) {
      useCanvasStore.getState().setActiveScene(null);
      switchTab('network');
      return;
    }
    if (scenario.tutorialId) {
      const tutorial = getTutorial(scenario.tutorialId);
      if (!tutorial) return;
      tutorial.onStart?.();
      useTutorialStore.getState().start(tutorial);
      // Set the live scene view
      const sceneMap: Record<string, 'farm' | 'home' | 'office' | 'robot'> = {
        'smart-home-tutorial':     'home',
        'smart-office-tutorial':   'office',
        'obstacle-robot-tutorial': 'robot',
        'smart-farm-tutorial':     'farm',
      };
      useCanvasStore.getState().setActiveScene(sceneMap[scenario.tutorialId] ?? null);
      switchTab('tutorials');
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-4xl rounded-2xl border border-border bg-background shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/20">
          <div>
            <h2 className="text-lg font-bold text-foreground">🚀 Choose Your Simulation World</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Pick a scenario — Pi auto-wires, code loads, and a guided tutorial starts.</p>
          </div>
          <button onClick={hide} className="p-2 rounded-lg hover:bg-accent transition-colors">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* Scenario grid */}
        <div className="grid grid-cols-3 gap-4 p-6">
          {SCENARIOS.map(s => (
            <button key={s.id} onClick={() => launch(s)}
              className={`group relative flex flex-col gap-3 rounded-xl border border-border bg-gradient-to-br ${s.gradient} p-4 text-left transition-all duration-200 hover:border-foreground/30 hover:shadow-lg hover:-translate-y-0.5`}>
              {/* Difficulty badge */}
              <span className={`absolute top-3 right-3 text-[9px] font-bold px-1.5 py-0.5 rounded border ${s.difficultyColor} bg-background/50`}>
                {DIFF_LABELS[s.difficulty]}
              </span>
              {/* Icon + title */}
              <div>
                <div className="text-3xl mb-2">{s.emoji}</div>
                <div className="font-bold text-sm text-foreground">{s.title}</div>
                <p className="text-[11px] text-muted-foreground mt-1 leading-snug">{s.subtitle}</p>
              </div>
              {/* Component tags */}
              <div className="flex flex-wrap gap-1 mt-auto">
                {s.tags.map(t => (
                  <span key={t} className="text-[9px] bg-muted/50 text-muted-foreground px-1.5 py-0.5 rounded font-mono">{t}</span>
                ))}
              </div>
              {/* Launch CTA */}
              <div className="text-[11px] font-semibold text-foreground/60 group-hover:text-foreground transition-colors">
                Launch → 
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
