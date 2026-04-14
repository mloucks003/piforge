import { useProjectStore } from '@/stores/projectStore';
import type { ProjectState } from '@/stores/projectStore';

const STORAGE_KEY = 'piforge-project';
const SCHEMA_VERSION = 1;

export interface ProjectFile {
  version: number;
  metadata: { id: string; name: string; createdAt: string; updatedAt: string };
  board: { model: string; position: { x: number; y: number } };
  components: unknown[];
  breadboards: unknown[];
  wires: unknown[];
  code: { content: string; language: string };
  settings: Record<string, unknown>;
}

function uid() { return `pf-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`; }

export function serializeProject(): ProjectFile {
  const s = useProjectStore.getState();
  return {
    version: SCHEMA_VERSION,
    metadata: { id: uid(), name: 'Untitled Project', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    board: { model: s.boardModel, position: s.boardPosition },
    components: Object.values(s.components),
    breadboards: Object.values(s.breadboards),
    wires: Object.values(s.wires),
    code: { content: s.code, language: s.language },
    settings: {},
  };
}

export function deserializeProject(file: ProjectFile) {
  const s = useProjectStore.getState();
  if (file.board) {
    s.setBoardModel(file.board.model as 'pi4' | 'pi5');
  }
  if (file.code) {
    s.setCode(file.code.content || '');
    s.setLanguage((file.code.language as 'python' | 'micropython' | 'cpp') || 'python');
  }
  // Restore components, breadboards, wires by setting state directly
  useProjectStore.setState({
    components: Object.fromEntries((file.components as { id: string }[]).map(c => [c.id, c]) as [string, ProjectState['components'][string]][]),
    breadboards: Object.fromEntries((file.breadboards as { id: string }[]).map(b => [b.id, b]) as [string, ProjectState['breadboards'][string]][]),
    wires: Object.fromEntries((file.wires as { id: string }[]).map(w => [w.id, w]) as [string, ProjectState['wires'][string]][]),
  });
}

export function saveToLocalStorage() {
  try {
    const file = serializeProject();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(file));
    return true;
  } catch (e) {
    console.error('Failed to save:', e);
    return false;
  }
}

export function loadFromLocalStorage(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const file = JSON.parse(raw) as ProjectFile;
    deserializeProject(file);
    return true;
  } catch (e) {
    console.error('Failed to load:', e);
    return false;
  }
}

export function exportAsPNG(stageRef: { toDataURL: (opts: { pixelRatio: number }) => string }) {
  const dataUrl = stageRef.toDataURL({ pixelRatio: 2 });
  const link = document.createElement('a');
  link.download = 'piforge-circuit.png';
  link.href = dataUrl;
  link.click();
}
