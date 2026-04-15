import { create } from 'zustand';
import type Konva from 'konva';

export interface ComponentContextMenu {
  /** Screen-space position inside the canvas container */
  x: number;
  y: number;
  componentId: string;
}

export interface CanvasState {
  viewport: { x: number; y: number; scale: number };
  selectedIds: string[];
  /** The single component currently selected (click-to-select) */
  selectedComponentId: string | null;
  /** Right-click context menu state */
  contextMenu: ComponentContextMenu | null;
  snapToGrid: boolean;
  gridSize: number;
  /** When true, clicking on a pin starts/completes a wire (no Shift required) */
  wiringMode: boolean;
  /** Live reference to the Konva Stage — used for PNG export */
  konvaStage: Konva.Stage | null;

  // Actions
  setViewport: (viewport: Partial<CanvasState['viewport']>) => void;
  setSelectedIds: (ids: string[]) => void;
  setSelectedComponentId: (id: string | null) => void;
  setContextMenu: (menu: ComponentContextMenu | null) => void;
  toggleSnapToGrid: () => void;
  setGridSize: (size: number) => void;
  toggleWiringMode: () => void;
  setWiringMode: (on: boolean) => void;
  setKonvaStage: (stage: Konva.Stage | null) => void;
}

export const useCanvasStore = create<CanvasState>((set) => ({
  viewport: { x: 0, y: 0, scale: 1 },
  selectedIds: [],
  selectedComponentId: null,
  contextMenu: null,
  snapToGrid: true,
  gridSize: 10,
  wiringMode: false,
  konvaStage: null,

  setViewport: (partial) =>
    set((s) => ({ viewport: { ...s.viewport, ...partial } })),

  setSelectedIds: (ids) => set({ selectedIds: ids }),
  setSelectedComponentId: (id) => set({ selectedComponentId: id }),
  setContextMenu: (menu) => set({ contextMenu: menu }),

  toggleSnapToGrid: () => set((s) => ({ snapToGrid: !s.snapToGrid })),

  setGridSize: (size) => set({ gridSize: size }),

  toggleWiringMode: () => set((s) => ({ wiringMode: !s.wiringMode })),

  setWiringMode: (on) => set({ wiringMode: on }),

  setKonvaStage: (stage) => set({ konvaStage: stage }),
}));
