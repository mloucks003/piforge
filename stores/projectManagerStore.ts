'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { BoardModelId } from './projectStore';

export interface SavedProject {
  id: string;
  name: string;
  savedAt: number;
  boardModel: BoardModelId;
  componentCount: number;
  wireCount: number;
  // Full serialised circuit + code
  state: {
    components: Record<string, unknown>;
    wires: Record<string, unknown>;
    breadboards: Record<string, unknown>;
    boardModel: BoardModelId;
    boardPosition: { x: number; y: number };
    code: string;
    language: string;
  };
}

interface ProjectManagerState {
  projects: Record<string, SavedProject>;
  modalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  saveProject: (name: string) => void;
  loadProject: (id: string) => void;
  deleteProject: (id: string) => void;
  renameProject: (id: string, name: string) => void;
  duplicateProject: (id: string) => void;
}

// Lazy import to avoid circular dependency
function getProjectStore() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require('./projectStore').useProjectStore;
}

export const useProjectManagerStore = create<ProjectManagerState>()(
  persist(
    (set, get) => ({
      projects: {},
      modalOpen: false,

      openModal: () => set({ modalOpen: true }),
      closeModal: () => set({ modalOpen: false }),

      saveProject: (name) => {
        const store = getProjectStore().getState();
        const id = `proj_${Date.now()}`;
        const project: SavedProject = {
          id,
          name: name.trim() || `Project ${Object.keys(get().projects).length + 1}`,
          savedAt: Date.now(),
          boardModel: store.boardModel,
          componentCount: Object.keys(store.components).length,
          wireCount: Object.keys(store.wires).length,
          state: {
            components: store.components,
            wires: store.wires,
            breadboards: store.breadboards,
            boardModel: store.boardModel,
            boardPosition: store.boardPosition,
            code: store.code,
            language: store.language,
          },
        };
        set((s) => ({ projects: { ...s.projects, [id]: project } }));
        return id;
      },

      loadProject: (id) => {
        const { projects } = get();
        const project = projects[id];
        if (!project) return;
        const store = getProjectStore();
        store.setState({
          components: project.state.components,
          wires: project.state.wires,
          breadboards: project.state.breadboards,
          boardModel: project.state.boardModel,
          boardPosition: project.state.boardPosition,
          code: project.state.code,
          language: project.state.language,
          past: [],
          future: [],
        });
        set({ modalOpen: false });
      },

      deleteProject: (id) =>
        set((s) => {
          const { [id]: _, ...rest } = s.projects;
          return { projects: rest };
        }),

      renameProject: (id, name) =>
        set((s) => ({
          projects: {
            ...s.projects,
            [id]: { ...s.projects[id], name: name.trim() },
          },
        })),

      duplicateProject: (id) => {
        const { projects } = get();
        const src = projects[id];
        if (!src) return;
        const newId = `proj_${Date.now()}`;
        const copy: SavedProject = {
          ...src,
          id: newId,
          name: `${src.name} (copy)`,
          savedAt: Date.now(),
        };
        set((s) => ({ projects: { ...s.projects, [newId]: copy } }));
      },
    }),
    { name: 'piforge-projects', partialize: (s) => ({ projects: s.projects }) }
  )
);
