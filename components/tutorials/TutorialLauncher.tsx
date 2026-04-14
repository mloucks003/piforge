'use client';
import { tutorials } from '@/lib/tutorials/index';
import { useTutorialStore } from '@/stores/tutorialStore';
import { BookOpen, GraduationCap } from 'lucide-react';

export default function TutorialLauncher() {
  const start = useTutorialStore((s) => s.start);
  const active = useTutorialStore((s) => s.active);
  if (active) return null;
  return (
    <div className="p-3 border-b border-border">
      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-2"><GraduationCap className="h-3 w-3" /> Tutorials</div>
      {tutorials.map((t) => (
        <button key={t.id} onClick={() => start(t)} className="w-full text-left rounded-md px-2 py-1.5 text-sm text-foreground hover:bg-accent transition-colors flex items-center gap-2">
          <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
          {t.title}
          <span className={`ml-auto text-[10px] px-1.5 py-0.5 rounded-full ${t.difficulty === 'beginner' ? 'bg-green-500/10 text-green-400' : 'bg-blue-500/10 text-blue-400'}`}>{t.estimatedMinutes}m</span>
        </button>
      ))}
    </div>
  );
}
