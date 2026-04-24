import { create } from 'zustand';

interface SimHubStore {
  open: boolean;
  show: () => void;
  hide: () => void;
}

export const useSimHubStore = create<SimHubStore>((set) => ({
  open: false,
  show: () => set({ open: true }),
  hide: () => set({ open: false }),
}));
