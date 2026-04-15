'use client';

import { create } from 'zustand';
import { useProjectStore } from './projectStore';
import type { BoardModelId, PlacedComponent, Wire, PlacedBreadboard, CodeLanguage } from './projectStore';

// ── Per-user storage helpers ─────────────────────────────────────────────────
function projectsKey(userId: string | null): string {
  return userId ? `piforge-projects-${userId}` : 'piforge-projects-guest';
}

function readProjects(userId: string | null): Record<string, SavedProject> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(projectsKey(userId));
    return raw ? (JSON.parse(raw) as Record<string, SavedProject>) : {};
  } catch { return {}; }
}

function writeProjects(userId: string | null, projects: Record<string, SavedProject>) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(projectsKey(userId), JSON.stringify(projects));
  } catch { /* quota exceeded — silently skip */ }
}

export interface SavedProject {
  id: string;
  name: string;
  savedAt: number;
  boardModel: BoardModelId;
  componentCount: number;
  wireCount: number;
  // Full serialised circuit + code
  state: {
    components: Record<string, PlacedComponent>;
    wires: Record<string, Wire>;
    breadboards: Record<string, PlacedBreadboard>;
    boardModel: BoardModelId;
    boardPosition: { x: number; y: number };
    code: string;
    language: CodeLanguage;
  };
}

interface ProjectManagerState {
  projects: Record<string, SavedProject>;
  modalOpen: boolean;
  /** Called by AutoLoader when the signed-in user changes */
  loadForUser: (userId: string | null) => void;
  openModal: () => void;
  closeModal: () => void;
  saveProject: (name: string) => void;
  loadProject: (id: string) => void;
  deleteProject: (id: string) => void;
  renameProject: (id: string, name: string) => void;
  duplicateProject: (id: string) => void;
}


// Track the current userId so mutations can write to the right bucket
let _currentUserId: string | null = null;

export const useProjectManagerStore = create<ProjectManagerState>()((set, get) => ({
  projects: {},
  modalOpen: false,

  loadForUser: (userId) => {
    _currentUserId = userId;
    set({ projects: readProjects(userId) });
  },

  openModal:  () => set({ modalOpen: true }),
  closeModal: () => set({ modalOpen: false }),

  saveProject: (name) => {
    const store = useProjectStore.getState();
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
    const projects = { ...get().projects, [id]: project };
    set({ projects });
    writeProjects(_currentUserId, projects);
  },

  loadProject: (id) => {
    const project = get().projects[id];
    if (!project) return;
    useProjectStore.setState({
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

  deleteProject: (id) => {
    const { [id]: _, ...rest } = get().projects;
    set({ projects: rest });
    writeProjects(_currentUserId, rest);
  },

  renameProject: (id, name) => {
    const projects = {
      ...get().projects,
      [id]: { ...get().projects[id], name: name.trim() },
    };
    set({ projects });
    writeProjects(_currentUserId, projects);
  },

  duplicateProject: (id) => {
    const src = get().projects[id];
    if (!src) return;
    const newId = `proj_${Date.now()}`;
    const projects = {
      ...get().projects,
      [newId]: { ...src, id: newId, name: `${src.name} (copy)`, savedAt: Date.now() },
    };
    set({ projects });
    writeProjects(_currentUserId, projects);
  },
}));
