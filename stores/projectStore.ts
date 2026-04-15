import { create } from 'zustand';

// ---- Shared types ----

export interface Point {
  x: number;
  y: number;
}

export type BoardModelId = 'pi4' | 'pi5' | 'pi-zero-2w' | 'arduino-uno' | 'pico';

export interface PinState {
  mode: 'input' | 'output' | 'pwm' | 'alt';
  value: 0 | 1;
  pwmDuty: number;
  pullMode: 'up' | 'down' | 'none';
  edgeDetect: 'none' | 'rising' | 'falling' | 'both';
}

export type WireColor =
  | 'red'
  | 'black'
  | 'blue'
  | 'green'
  | 'yellow'
  | 'white'
  | 'orange';

export type PinRef =
  | { type: 'component'; componentId: string; pinId: string }
  | { type: 'board'; boardId: string; pinNumber: number }
  | {
      type: 'breadboard';
      breadboardId: string;
      row: number;
      col: number;
      rail?: 'positive' | 'negative';
    };

export interface PlacedComponent {
  id: string;
  definitionId: string;
  position: Point;
  rotation: number;
  properties: Record<string, number | string | boolean>;
  pinStates: Record<string, PinState>;
  breadboardId?: string;
  breadboardRow?: number;
}

export interface PlacedBreadboard {
  id: string;
  position: Point;
  type: '830-point' | '400-point';
}

export interface Wire {
  id: string;
  startPinRef: PinRef;
  endPinRef: PinRef;
  color: WireColor;
  path: Point[];
  validated: boolean;
  warnings: WireWarning[];
}

export interface WireWarning {
  type: 'short-circuit' | 'over-voltage' | 'over-current' | 'unconnected';
  message: string;
  severity: 'error' | 'warning';
}

export interface ConsoleEntry {
  id: string;
  timestamp: number;
  stream: 'stdout' | 'stderr' | 'system';
  text: string;
}

export type SimulationState = 'idle' | 'running' | 'paused' | 'error';
export type CodeLanguage = 'python' | 'micropython' | 'cpp';

// ---- Component definition (for addComponent) ----

export interface ComponentPinDef {
  id: string;
  label: string;
  type: 'power' | 'ground' | 'signal' | 'data';
  position: Point;
  direction: 'in' | 'out' | 'bidirectional';
}

export interface ComponentDefinition {
  id: string;
  name: string;
  category: string;
  pins: ComponentPinDef[];
}

// ---- Undo/redo snapshot ----
export interface CircuitSnapshot {
  components: Record<string, PlacedComponent>;
  wires: Record<string, Wire>;
  breadboards: Record<string, PlacedBreadboard>;
}

// ---- Store interface ----

export interface ProjectState {
  // Board
  boardModel: BoardModelId;
  boardPosition: Point;

  // Circuit
  components: Record<string, PlacedComponent>;
  breadboards: Record<string, PlacedBreadboard>;
  wires: Record<string, Wire>;

  // Pin state (simulation)
  pinStates: Record<number, PinState>;

  // Editor
  code: string;
  language: CodeLanguage;

  // Simulation
  simulationState: SimulationState;
  consoleOutput: ConsoleEntry[];

  // Actions
  addComponent: (def: ComponentDefinition, position: Point) => string;
  removeComponent: (id: string) => void;
  updateComponentPosition: (id: string, position: Point) => void;
  addBreadboard: (position: Point, type?: '830-point' | '400-point') => string;
  removeBreadboard: (id: string) => void;
  updateBreadboardPosition: (id: string, position: Point) => void;
  addWire: (wire: Wire) => string;
  removeWire: (id: string) => void;
  setPinState: (pin: number, state: Partial<PinState>) => void;
  setCode: (code: string) => void;
  setLanguage: (language: CodeLanguage) => void;
  setBoardModel: (model: BoardModelId) => void;
  setBoardPosition: (pos: Point) => void;
  setComponentPinState: (componentId: string, pinId: string, state: Partial<PinState>) => void;
  setSimulationState: (state: SimulationState) => void;
  addConsoleEntry: (stream: ConsoleEntry['stream'], text: string) => void;
  clearConsole: () => void;

  // ── Undo / Redo ──
  past: CircuitSnapshot[];
  future: CircuitSnapshot[];
  undo: () => void;
  redo: () => void;
}

const defaultPinState: PinState = {
  mode: 'input',
  value: 0,
  pwmDuty: 0,
  pullMode: 'none',
  edgeDetect: 'none',
};

let nextId = 1;
function uid(): string {
  return `id-${nextId++}-${Date.now().toString(36)}`;
}

/** Take a snapshot of circuit topology for undo/redo */
function snap(s: ProjectState): CircuitSnapshot {
  return { components: s.components, wires: s.wires, breadboards: s.breadboards };
}
/** Prepend snapshot to past stack (max 60), clear future */
function pushPast(s: ProjectState): Partial<ProjectState> {
  return { past: [...s.past.slice(-59), snap(s)], future: [] };
}

export const useProjectStore = create<ProjectState>((set) => ({
  boardModel: 'pi4',
  boardPosition: { x: 100, y: 100 },

  components: {},
  breadboards: {},
  wires: {},

  pinStates: {},

  code: '',
  language: 'python',

  simulationState: 'idle',
  consoleOutput: [],

  past: [],
  future: [],

  undo: () => set((s) => {
    if (s.past.length === 0) return s;
    const previous = s.past[s.past.length - 1];
    return { ...previous, past: s.past.slice(0, -1), future: [snap(s), ...s.future.slice(0, 59)] };
  }),

  redo: () => set((s) => {
    if (s.future.length === 0) return s;
    const next = s.future[0];
    return { ...next, past: [...s.past.slice(-59), snap(s)], future: s.future.slice(1) };
  }),

  addComponent: (def, position) => {
    const id = uid();
    const placed: PlacedComponent = {
      id,
      definitionId: def.id,
      position,
      rotation: 0,
      properties: {},
      pinStates: Object.fromEntries(
        def.pins.map((p) => [p.id, { ...defaultPinState }])
      ),
    };
    set((s) => ({ ...pushPast(s), components: { ...s.components, [id]: placed } }));
    return id;
  },

  removeComponent: (id) =>
    set((s) => {
      const { [id]: _, ...restComponents } = s.components;
      const restWires = Object.fromEntries(
        Object.entries(s.wires).filter(([, w]) => {
          const touchesComp = (ref: typeof w.startPinRef) =>
            ref.type === 'component' && ref.componentId === id;
          return !touchesComp(w.startPinRef) && !touchesComp(w.endPinRef);
        })
      );
      return { ...pushPast(s), components: restComponents, wires: restWires };
    }),

  updateComponentPosition: (id, position) =>
    set((s) => {
      const comp = s.components[id];
      if (!comp) return s;
      return {
        components: {
          ...s.components,
          [id]: { ...comp, position },
        },
      };
    }),

  addBreadboard: (position, type = '830-point') => {
    const id = uid();
    const bb: PlacedBreadboard = { id, position, type };
    set((s) => ({ ...pushPast(s), breadboards: { ...s.breadboards, [id]: bb } }));
    return id;
  },

  removeBreadboard: (id) =>
    set((s) => {
      const { [id]: _, ...rest } = s.breadboards;
      return { ...pushPast(s), breadboards: rest };
    }),

  updateBreadboardPosition: (id, position) =>
    set((s) => {
      const bb = s.breadboards[id];
      if (!bb) return s;
      return {
        breadboards: {
          ...s.breadboards,
          [id]: { ...bb, position },
        },
      };
    }),

  addWire: (wire) => {
    set((s) => ({ ...pushPast(s), wires: { ...s.wires, [wire.id]: wire } }));
    return wire.id;
  },

  removeWire: (id) =>
    set((s) => {
      const { [id]: _, ...rest } = s.wires;
      return { ...pushPast(s), wires: rest };
    }),

  setPinState: (pin, partial) =>
    set((s) => ({
      pinStates: {
        ...s.pinStates,
        [pin]: { ...(s.pinStates[pin] ?? defaultPinState), ...partial },
      },
    })),

  setCode: (code) => set({ code }),

  setLanguage: (language) => set({ language }),

  setBoardModel: (model) => set({
    boardModel: model,
    language: model === 'arduino-uno' ? 'cpp' : model === 'pico' ? 'micropython' : 'python',
  }),

  setBoardPosition: (pos) => set({ boardPosition: pos }),
  setComponentPinState: (componentId, pinId, partial) =>
    set((s) => {
      const comp = s.components[componentId];
      if (!comp) return s;
      return {
        components: {
          ...s.components,
          [componentId]: {
            ...comp,
            pinStates: {
              ...comp.pinStates,
              [pinId]: { ...(comp.pinStates[pinId] ?? defaultPinState), ...partial },
            },
          },
        },
      };
    }),

  setSimulationState: (state) => set({ simulationState: state }),

  addConsoleEntry: (stream, text) =>
    set((s) => ({
      consoleOutput: [
        ...s.consoleOutput,
        {
          id: uid(),
          timestamp: Date.now(),
          stream,
          text,
        },
      ],
    })),

  clearConsole: () => set({ consoleOutput: [] }),
}));
