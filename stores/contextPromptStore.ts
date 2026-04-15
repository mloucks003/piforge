import { create } from 'zustand';

export interface ContextPrompt {
  /** Unique key so the same prompt is only shown once per session */
  key: string;
  icon: string;
  title: string;
  body: string;
  primaryLabel: string;
  secondaryLabel?: string;
  onPrimary: () => void;
  onSecondary?: () => void;
}

interface ContextPromptState {
  current: ContextPrompt | null;
  shown: Set<string>;
  show: (prompt: ContextPrompt) => void;
  dismiss: () => void;
}

export const useContextPromptStore = create<ContextPromptState>((set, get) => ({
  current: null,
  shown: new Set(),

  show: (prompt) => {
    // Don't show the same prompt twice in a session
    if (get().shown.has(prompt.key)) return;
    set((s) => ({ current: prompt, shown: new Set([...s.shown, prompt.key]) }));
  },

  dismiss: () => set({ current: null }),
}));
