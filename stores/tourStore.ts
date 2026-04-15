'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface TourStep {
  target: string;        // data-tour attribute value
  title: string;
  body: string;
  placement: 'top' | 'bottom' | 'left' | 'right';
}

export const TOUR_STEPS: TourStep[] = [
  {
    target: 'logo',
    title: '👋 Welcome to PiForge!',
    body: "This is the Virtual Hardware Lab — build real circuits with Raspberry Pi, Arduino, and Pico without any physical hardware. Let's take a 60-second tour.",
    placement: 'bottom',
  },
  {
    target: 'board-selector',
    title: '🖥️ Choose Your Board',
    body: 'Switch between Raspberry Pi 4/5, Pi Zero 2W, Arduino Uno, and Pi Pico W. The code language (Python, C++, MicroPython) updates automatically.',
    placement: 'bottom',
  },
  {
    target: 'sidebar',
    title: '🧩 Drag & Drop Parts',
    body: 'Browse 22+ components across 6 categories. Click a category header to expand it, then drag any part onto the canvas to place it.',
    placement: 'right',
  },
  {
    target: 'canvas',
    title: '⚡ Wire Your Circuit',
    body: "Drag parts to position them. Click a component's pin, then click another pin to draw a wire. Hover over any wire to delete it.",
    placement: 'top',
  },
  {
    target: 'code-editor',
    title: '✏️ Write Your Code',
    body: 'The editor is pre-loaded with starter code that matches your board and project. Edit it freely — it supports Python, MicroPython, and C++.',
    placement: 'left',
  },
  {
    target: 'run-btn',
    title: '▶️ Run & Simulate',
    body: 'Hit Run to execute your code. Watch the console output and see LEDs, displays, and sensors respond in real-time on the canvas.',
    placement: 'bottom',
  },
  {
    target: 'ai-tab',
    title: '🤖 AI Assistant',
    body: 'Open the AI tab to chat, analyze your circuit for errors, auto-fix broken code, or generate new code from a plain-English description.',
    placement: 'left',
  },
  {
    target: 'projects-tab',
    title: '📂 Start a Project',
    body: 'Pick from 20+ guided projects — beginner blink to advanced Smart Home & IoT networking systems — each with wiring diagrams and full code.',
    placement: 'right',
  },
];

interface TourState {
  isActive: boolean;
  step: number;
  hasSeenTour: boolean;
  start: () => void;
  next: () => void;
  back: () => void;
  skip: () => void;
}

export const useTourStore = create<TourState>()(
  persist(
    (set, get) => ({
      isActive: false,
      step: 0,
      hasSeenTour: false,
      start: () => set({ isActive: true, step: 0 }),
      next: () => {
        const { step } = get();
        if (step >= TOUR_STEPS.length - 1) {
          set({ isActive: false, hasSeenTour: true });
        } else {
          set({ step: step + 1 });
        }
      },
      back: () => {
        const { step } = get();
        if (step > 0) set({ step: step - 1 });
      },
      skip: () => set({ isActive: false, hasSeenTour: true }),
    }),
    { name: 'piforge-tour' }
  )
);
