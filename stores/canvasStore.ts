import { create } from 'zustand';

export interface CanvasState {
  viewport: { x: number; y: number; scale: number };
  selectedIds: string[];
  snapToGrid: boolean;
  gridSize: number;
  /** When true, clicking on a pin starts/completes a wire (no Shift required) */
  wiringMode: boolean;

  // Actions
  setViewport: (viewport: Partial<CanvasState['viewport']>) => void;
  setSelectedIds: (ids: string[]) => void;
  toggleSnapToGrid: () => void;
  setGridSize: (size: number) => void;
  toggleWiringMode: () => void;
  setWiringMode: (on: boolean) => void;
}

export const useCanvasStore = create<CanvasState>((set) => ({
  viewport: { x: 0, y: 0, scale: 1 },
  selectedIds: [],
  snapToGrid: true,
  gridSize: 10,
  wiringMode: false,

  setViewport: (partial) =>
    set((s) => ({ viewport: { ...s.viewport, ...partial } })),

  setSelectedIds: (ids) => set({ selectedIds: ids }),

  toggleSnapToGrid: () => set((s) => ({ snapToGrid: !s.snapToGrid })),

  setGridSize: (size) => set({ gridSize: size }),

  toggleWiringMode: () => set((s) => ({ wiringMode: !s.wiringMode })),

  setWiringMode: (on) => set({ wiringMode: on }),
}));
