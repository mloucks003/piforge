'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AIRole = 'user' | 'assistant' | 'system';
export type AIMode = 'chat' | 'analyze' | 'fix';

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
  apiKey: string;           // user-supplied OpenAI key (persisted)
  panelOpen: boolean;
  activeMode: AIMode;
  error: string | null;

  // Actions
  setApiKey: (key: string) => void;
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
      apiKey: '',
      panelOpen: false,
      activeMode: 'chat',
      error: null,

      setApiKey: (key) => set({ apiKey: key }),
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
      // Only persist apiKey and messages (not streaming state)
      partialize: (s) => ({ apiKey: s.apiKey, messages: s.messages.slice(-40) }),
    }
  )
);
