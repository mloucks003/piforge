'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AIRole = 'user' | 'assistant' | 'system';
export type AIMode = 'chat' | 'analyze' | 'fix' | 'generate';

export interface AIMessage {
  id: string;
  role: AIRole;
  content: string;
  timestamp: number;
  mode?: AIMode;
}

interface AIState {
  messages: AIMessage[];
  streaming: boolean;
  streamingContent: string;
  serverHasKey: boolean | null;    // null = still checking; true/false after status call
  panelOpen: boolean;
  activeMode: AIMode;
  error: string | null;

  // Actions
  checkServerKey: () => Promise<void>;
  setPanelOpen: (open: boolean) => void;
  setActiveMode: (mode: AIMode) => void;
  addMessage: (role: AIRole, content: string, mode?: AIMode) => AIMessage;
  appendStreamChunk: (chunk: string) => void;
  finalizeStream: () => void;
  setStreaming: (streaming: boolean) => void;
  setError: (error: string | null) => void;
  clearMessages: () => void;
}

export const useAIStore = create<AIState>()(
  persist(
    (set, get) => ({
      messages: [],
      streaming: false,
      streamingContent: '',
      serverHasKey: null,
      panelOpen: false,
      activeMode: 'chat',
      error: null,

      checkServerKey: async () => {
        // Only check once per session
        if (get().serverHasKey !== null) return;
        try {
          const res = await fetch('/api/ai/status');
          const data = await res.json() as { hasServerKey: boolean };
          set({ serverHasKey: data.hasServerKey });
        } catch {
          // If status check fails, assume server key is present and let the API call fail gracefully
          set({ serverHasKey: true });
        }
      },
      setPanelOpen: (open) => set({ panelOpen: open }),
      setActiveMode: (mode) => set({ activeMode: mode }),

      addMessage: (role, content, mode) => {
        const msg: AIMessage = {
          id: `msg_${Date.now()}_${Math.random().toString(36).slice(2)}`,
          role,
          content,
          timestamp: Date.now(),
          mode,
        };
        set((s) => ({ messages: [...s.messages, msg], error: null }));
        return msg;
      },

      appendStreamChunk: (chunk) =>
        set((s) => ({ streamingContent: s.streamingContent + chunk })),

      finalizeStream: () => {
        const { streamingContent } = get();
        if (!streamingContent.trim()) return;
        const msg: AIMessage = {
          id: `msg_${Date.now()}`,
          role: 'assistant',
          content: streamingContent,
          timestamp: Date.now(),
        };
        set((s) => ({
          messages: [...s.messages, msg],
          streamingContent: '',
          streaming: false,
        }));
      },

      setStreaming: (streaming) => set({ streaming }),
      setError: (error) => set({ error, streaming: false, streamingContent: '' }),
      clearMessages: () => set({ messages: [], streamingContent: '', error: null }),
    }),
    {
      name: 'piforge-ai',
      // Only persist recent messages (not streaming state or server key status)
      partialize: (s) => ({ messages: s.messages.slice(-40) }),
    }
  )
);
