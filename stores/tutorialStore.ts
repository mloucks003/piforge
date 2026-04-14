import { create } from 'zustand';
import type { TutorialDefinition } from '@/lib/tutorials/types';

interface TutorialState {
  active: TutorialDefinition | null;
  currentStep: number;
  completed: boolean[];
  start: (tutorial: TutorialDefinition) => void;
  advance: () => void;
  skipStep: () => void;
  stop: () => void;
}

export const useTutorialStore = create<TutorialState>((set, get) => ({
  active: null, currentStep: 0, completed: [],
  start: (tutorial) => set({ active: tutorial, currentStep: 0, completed: new Array(tutorial.steps.length).fill(false) }),
  advance: () => { const s = get(); if (!s.active) return; const c = [...s.completed]; c[s.currentStep] = true; const next = s.currentStep + 1; set({ completed: c, currentStep: Math.min(next, s.active.steps.length - 1) }); },
  skipStep: () => { const s = get(); if (!s.active) return; const c = [...s.completed]; c[s.currentStep] = true; const next = s.currentStep + 1; set({ completed: c, currentStep: Math.min(next, s.active.steps.length - 1) }); },
  stop: () => set({ active: null, currentStep: 0, completed: [] }),
}));
