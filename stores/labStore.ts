import { create } from 'zustand';

export type LabId = 'home' | 'farm' | 'robot';

interface LabStore {
  activeLabId: LabId | null;
  setActiveLab: (id: LabId | null) => void;
}

export const useLabStore = create<LabStore>((set) => ({
  activeLabId: null,
  setActiveLab: (id) => set({ activeLabId: id }),
}));
