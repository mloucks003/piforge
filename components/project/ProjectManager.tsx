'use client';

import { useState } from 'react';
import { X, FolderOpen, Save, Trash2, Copy, Pencil, Cpu, GitBranch, Clock } from 'lucide-react';
import { useProjectManagerStore } from '@/stores/projectManagerStore';

function timeAgo(ts: number) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default function ProjectManager() {
  const { projects, modalOpen, closeModal, saveProject, loadProject, deleteProject, renameProject, duplicateProject } =
    useProjectManagerStore();

  const [saveName, setSaveName] = useState('');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameVal, setRenameVal] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  if (!modalOpen) return null;

  const projectList = Object.values(projects).sort((a, b) => b.savedAt - a.savedAt);

  const handleSave = () => {
    if (!saveName.trim()) return;
    saveProject(saveName);
    setSaveName('');
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal} />
      <div className="relative z-10 w-full max-w-2xl mx-4 rounded-2xl border border-border bg-background shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-border bg-muted/30 shrink-0">
          <FolderOpen className="h-5 w-5 text-green-400" />
          <h2 className="text-base font-bold flex-1">Project Manager</h2>
          <button onClick={closeModal} className="p-1.5 rounded-lg hover:bg-accent transition-colors">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* Save current project */}
        <div className="px-6 py-4 border-b border-border bg-green-500/5 shrink-0">
          <p className="text-xs font-semibold text-muted-foreground mb-2">Save current project</p>
          <div className="flex gap-2">
            <input
              value={saveName} onChange={e => setSaveName(e.target.value)}
              placeholder="Project name…"
              className="flex-1 rounded-xl border border-border bg-muted px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              onKeyDown={e => e.key === 'Enter' && handleSave()}
            />
            <button onClick={handleSave} disabled={!saveName.trim()}
              className="flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-500 transition-colors disabled:opacity-40">
              <Save className="h-4 w-4" /> Save
            </button>
          </div>
        </div>

        {/* Project list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 min-h-0">
          {projectList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
              <FolderOpen className="h-10 w-10 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">No saved projects yet.</p>
              <p className="text-xs text-muted-foreground/60">Save your current circuit above to get started.</p>
            </div>
          ) : (
            projectList.map(p => (
              <div key={p.id} className="rounded-xl border border-border bg-muted/20 overflow-hidden">
                <div className="flex items-start gap-3 px-4 py-3">
                  <div className="flex-1 min-w-0">
                    {renamingId === p.id ? (
                      <input autoFocus value={renameVal}
                        onChange={e => setRenameVal(e.target.value)}
                        onBlur={() => { renameProject(p.id, renameVal); setRenamingId(null); }}
                        onKeyDown={e => { if (e.key === 'Enter') { renameProject(p.id, renameVal); setRenamingId(null); } }}
                        className="w-full rounded-lg border border-green-500 bg-background px-2 py-0.5 text-sm font-semibold focus:outline-none"
                      />
                    ) : (
                      <p className="text-sm font-semibold text-foreground truncate">{p.name}</p>
                    )}
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Clock className="h-3 w-3" />{timeAgo(p.savedAt)}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Cpu className="h-3 w-3" />{p.componentCount} components
                      </span>
                      <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <GitBranch className="h-3 w-3" />{p.wireCount} wires
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-mono">{p.boardModel}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => loadProject(p.id)}
                      className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-500 transition-colors">
                      Load
                    </button>
                    <button onClick={() => { setRenamingId(p.id); setRenameVal(p.name); }}
                      className="p-1.5 rounded-lg hover:bg-accent transition-colors" title="Rename">
                      <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                    <button onClick={() => duplicateProject(p.id)}
                      className="p-1.5 rounded-lg hover:bg-accent transition-colors" title="Duplicate">
                      <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                    {confirmDelete === p.id ? (
                      <button onClick={() => { deleteProject(p.id); setConfirmDelete(null); }}
                        className="rounded-lg bg-red-600 px-2 py-1.5 text-[10px] font-semibold text-white hover:bg-red-500 transition-colors">
                        Confirm
                      </button>
                    ) : (
                      <button onClick={() => setConfirmDelete(p.id)}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors" title="Delete">
                        <Trash2 className="h-3.5 w-3.5 text-red-400" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="px-6 py-3 border-t border-border shrink-0 text-center">
          <p className="text-[10px] text-muted-foreground">{projectList.length} project{projectList.length !== 1 ? 's' : ''} saved · Ctrl+S to quick-save</p>
        </div>
      </div>
    </div>
  );
}
