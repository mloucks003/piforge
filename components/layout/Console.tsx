'use client';

import { useRef, useEffect } from 'react';
import { Terminal } from 'lucide-react';
import { useProjectStore } from '@/stores/projectStore';

export default function Console() {
  const consoleOutput = useProjectStore((s) => s.consoleOutput);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new output arrives
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [consoleOutput.length]);

  return (
    <div className="flex h-[200px] shrink-0 flex-col border-t border-border bg-background">
      <div className="flex items-center gap-2 border-b border-border px-4 py-1.5">
        <Terminal className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground">
          Console
        </span>
      </div>
      <div className="flex-1 overflow-y-auto p-3 font-mono text-xs">
        {consoleOutput.length === 0 ? (
          <p className="text-muted-foreground">
            Console output will appear here…
          </p>
        ) : (
          consoleOutput.map((entry) => (
            <div
              key={entry.id}
              className={
                entry.stream === 'stderr'
                  ? 'text-destructive'
                  : entry.stream === 'system'
                  ? 'text-muted-foreground italic'
                  : 'text-foreground'
              }
            >
              {entry.text}
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
