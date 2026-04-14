import { create } from 'zustand';
import type { PinRef, Point } from '@/stores/projectStore';

export interface WiringState {
  isDrawing: boolean;
  startPinRef: PinRef | null;
  startPosition: Point | null;
  mousePosition: Point | null;
  selectedWireId: string | null;

  // Actions
  startWire: (ref: PinRef, position: Point) => void;
  updateMousePosition: (pos: Point) => void;
  cancelWire: () => void;
  completeWire: () => void;
  selectWire: (id: string | null) => void;
}

export const useWiringStore = create<WiringState>((set) => ({
  isDrawing: false,
  startPinRef: null,
  startPosition: null,
  mousePosition: null,
  selectedWireId: null,

  startWire: (ref, position) =>
    set({
      isDrawing: true,
      startPinRef: ref,
      startPosition: position,
      mousePosition: position,
    }),

  updateMousePosition: (pos) =>
    set({ mousePosition: pos }),

  cancelWire: () =>
    set({
      isDrawing: false,
      startPinRef: null,
      startPosition: null,
      mousePosition: null,
    }),

  completeWire: () =>
    set({
      isDrawing: false,
      startPinRef: null,
      startPosition: null,
      mousePosition: null,
    }),

  selectWire: (id) =>
    set({ selectedWireId: id }),
}));
