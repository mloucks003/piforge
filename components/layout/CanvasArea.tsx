'use client';

import { useState, useEffect } from 'react';
import { GitBranch, Trash2, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import KonvaCanvas from '@/components/canvas/KonvaCanvas';
import { useCanvasStore } from '@/stores/canvasStore';
import { useWiringStore } from '@/stores/wiringStore';
import { useProjectStore } from '@/stores/projectStore';

function CanvasToolbar() {
  const wiringMode = useCanvasStore((s) => s.wiringMode);
  const toggleWiringMode = useCanvasStore((s) => s.toggleWiringMode);
  const cancelWire = useWiringStore((s) => s.cancelWire);
  const isDrawing = useWiringStore((s) => s.isDrawing);
  const selectedWireId = useWiringStore((s) => s.selectedWireId);
  const selectWire = useWiringStore((s) => s.selectWire);
  const removeWire = useProjectStore((s) => s.removeWire);
  const viewport = useCanvasStore((s) => s.viewport);
  const setViewport = useCanvasStore((s) => s.setViewport);

  const handleToggleWire = () => {
    if (isDrawing) cancelWire();
    toggleWiringMode();
  };

  const handleDeleteWire = () => {
    if (selectedWireId) {
      removeWire(selectedWireId);
      selectWire(null);
    }
  };

  const zoom = (factor: number) => {
    const newScale = Math.min(5, Math.max(0.1, viewport.scale * factor));
    setViewport({ scale: newScale });
  };

  const resetZoom = () => setViewport({ x: 0, y: 0, scale: 1 });

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 rounded-xl border border-border bg-background/90 backdrop-blur px-2 py-1.5 shadow-lg">
      {/* Wire mode toggle */}
      <button
        onClick={handleToggleWire}
        title={wiringMode ? 'Exit Wire Mode (click pins to wire)' : 'Wire Mode — click pins to connect them'}
        className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${
          wiringMode
            ? 'bg-blue-500 text-white shadow-inner shadow-blue-700/40'
            : 'text-muted-foreground hover:bg-accent hover:text-foreground'
        }`}
      >
        <GitBranch className="h-3.5 w-3.5" />
        {wiringMode ? (isDrawing ? 'Click a pin…' : 'Wire Mode ON') : 'Wire'}
      </button>

      <div className="h-4 w-px bg-border mx-1" />

      {/* Delete selected wire */}
      <button
        onClick={handleDeleteWire}
        disabled={!selectedWireId}
        title="Delete selected wire (or press Delete key)"
        className={`rounded-lg p-1.5 transition-colors ${
          selectedWireId
            ? 'text-red-400 hover:bg-red-500/10'
            : 'text-muted-foreground/30 cursor-not-allowed'
        }`}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>

      <div className="h-4 w-px bg-border mx-1" />

      {/* Zoom controls */}
      <button onClick={() => zoom(1.25)} title="Zoom in" className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
        <ZoomIn className="h-3.5 w-3.5" />
      </button>
      <button onClick={resetZoom} title="Reset zoom" className="rounded-lg px-2 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors tabular-nums">
        {Math.round(viewport.scale * 100)}%
      </button>
      <button onClick={() => zoom(0.8)} title="Zoom out" className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
        <ZoomOut className="h-3.5 w-3.5" />
      </button>
      <button onClick={resetZoom} title="Fit to view" className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
        <Maximize2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export default function CanvasArea() {
  const [isClient, setIsClient] = useState(false);
  const wiringMode = useCanvasStore((s) => s.wiringMode);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div data-tour="canvas" className={`relative flex-1 overflow-hidden bg-muted ${wiringMode ? 'cursor-crosshair' : ''}`}>
      {isClient ? (
        <>
          <KonvaCanvas />
          <CanvasToolbar />
          {/* Wire mode indicator banner */}
          {wiringMode && (
            <div className="pointer-events-none absolute top-3 left-1/2 -translate-x-1/2 z-20 rounded-full bg-blue-500/90 px-4 py-1 text-xs font-semibold text-white shadow-lg">
              Wire Mode — click a pin to start, click another to connect
            </div>
          )}
        </>
      ) : (
        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
          Loading canvas…
        </div>
      )}
    </div>
  );
}
