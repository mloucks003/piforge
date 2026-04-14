'use client';

import { useRef, useCallback, useEffect, useState } from 'react';
import { Stage, Layer, Line, Rect, Text } from 'react-konva';
import type Konva from 'konva';
import { useProjectStore } from '@/stores/projectStore';
import { useCanvasStore } from '@/stores/canvasStore';
import BoardRenderer from './BoardRenderer';
import BreadboardRenderer from './BreadboardRenderer';
import ComponentRenderer from './ComponentRenderer';
import WireRenderer from './WireRenderer';
import TouchscreenDisplay from './TouchscreenDisplay';
import WiringInteractionLayer from './WiringInteractionLayer';

const MIN_SCALE = 0.1;
const MAX_SCALE = 5;

function TouchscreenDisplayWrapper() {
  const components = useProjectStore((s) => s.components);
  const updateComponentPosition = useProjectStore((s) => s.updateComponentPosition);
  const screenComp = Object.values(components).find(c => c.definitionId === 'touchscreen-7');
  if (!screenComp) return null;
  return (
    <TouchscreenDisplay
      x={screenComp.position.x}
      y={screenComp.position.y}
      onDragEnd={(pos) => updateComponentPosition(screenComp.id, pos)}
    />
  );
}

export default function KonvaCanvas() {
  const stageRef = useRef<Konva.Stage>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [mounted, setMounted] = useState(false);

  const viewport = useCanvasStore((s) => s.viewport);
  const setViewport = useCanvasStore((s) => s.setViewport);
  const gridSize = useCanvasStore((s) => s.gridSize);

  // Mark as mounted
  useEffect(() => {
    setMounted(true);
  }, []);

  // Resize observer
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Get initial size
    const rect = el.getBoundingClientRect();
    setSize({ width: rect.width, height: rect.height });

    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Zoom via scroll wheel
  const handleWheel = useCallback(
    (e: Konva.KonvaEventObject<WheelEvent>) => {
      e.evt.preventDefault();
      const stage = stageRef.current;
      if (!stage) return;

      const oldScale = viewport.scale;
      const pointer = stage.getPointerPosition();
      if (!pointer) return;

      const scaleBy = 1.08;
      const newScale =
        e.evt.deltaY < 0
          ? Math.min(oldScale * scaleBy, MAX_SCALE)
          : Math.max(oldScale / scaleBy, MIN_SCALE);

      const mousePointTo = {
        x: (pointer.x - viewport.x) / oldScale,
        y: (pointer.y - viewport.y) / oldScale,
      };

      setViewport({
        scale: newScale,
        x: pointer.x - mousePointTo.x * newScale,
        y: pointer.y - mousePointTo.y * newScale,
      });
    },
    [viewport, setViewport]
  );

  // Pan via drag
  const handleDragEnd = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>) => {
      if (e.target !== stageRef.current) return;
      setViewport({ x: e.target.x(), y: e.target.y() });
    },
    [setViewport]
  );

  // Stage click for wiring (Shift+click starts/completes wire)
  const handleStageClick = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (!e.evt.shiftKey) return;
      const stage = stageRef.current;
      if (!stage) return;
      const pointer = stage.getPointerPosition();
      if (!pointer) return;
      const transform = stage.getAbsoluteTransform().copy().invert();
      const pos = transform.point(pointer);
      const wiringEngine = require('@/lib/wiring/engine');
      const wiringStore = require('@/stores/wiringStore');
      const projStore = require('@/stores/projectStore');
      const ws = wiringStore.useWiringStore.getState();
      const ps = projStore.useProjectStore.getState();
      const snap = wiringEngine.snapToPin(pos, ps.boardModel, ps.boardPosition, ps.components, ps.breadboards);
      if (!snap) return;
      if (!ws.isDrawing) {
        ws.startWire(snap.ref, snap.position);
      } else {
        const wire = wiringEngine.createWire(ws.startPinRef, snap.ref, ps.boardModel, ps.boardPosition, ps.components, ps.breadboards);
        if (wire) ps.addWire(wire);
        ws.completeWire();
      }
    },
    []
  );

  const handleStageMouseMove = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      const wiringStore = require('@/stores/wiringStore');
      const ws = wiringStore.useWiringStore.getState();
      if (!ws.isDrawing) return;
      const stage = stageRef.current;
      if (!stage) return;
      const pointer = stage.getPointerPosition();
      if (!pointer) return;
      const transform = stage.getAbsoluteTransform().copy().invert();
      ws.updateMousePosition(transform.point(pointer));
    },
    []
  );

  // Draw grid lines
  const gridLines: { points: number[] }[] = [];
  if (size.width > 0 && size.height > 0) {
    const step = gridSize * viewport.scale;
    if (step > 4) {
      const startX = Math.floor(-viewport.x / step) * gridSize - gridSize;
      const endX = startX + Math.ceil(size.width / step) * gridSize + gridSize * 2;
      const startY = Math.floor(-viewport.y / step) * gridSize - gridSize;
      const endY = startY + Math.ceil(size.height / step) * gridSize + gridSize * 2;

      for (let x = startX; x <= endX; x += gridSize) {
        gridLines.push({ points: [x, startY, x, endY] });
      }
      for (let y = startY; y <= endY; y += gridSize) {
        gridLines.push({ points: [startX, y, endX, y] });
      }
    }
  }

  if (!mounted || size.width === 0 || size.height === 0) {
    return (
      <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#888', fontSize: 14 }}>
          Initializing canvas…
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}>
      <Stage
        ref={stageRef}
        width={size.width}
        height={size.height}
        x={viewport.x}
        y={viewport.y}
        scaleX={viewport.scale}
        scaleY={viewport.scale}
        onWheel={handleWheel}
        onDragEnd={handleDragEnd}
        onClick={handleStageClick}
        onMouseMove={handleStageMouseMove}
      >
        {/* Layer 1: Static background — grid (non-listening for perf) */}
        <Layer listening={false}>
          {gridLines.map((line, i) => (
            <Line
              key={i}
              points={line.points}
              stroke="rgba(255,255,255,0.05)"
              strokeWidth={1 / viewport.scale}
            />
          ))}
        </Layer>

        {/* Layer 2: Circuit scene — board, breadboards, components, wires, display */}
        <Layer>
          <BoardRenderer />
          <BreadboardRenderer />
          <WireRenderer />
          <ComponentRenderer />
          <TouchscreenDisplayWrapper />
        </Layer>

        {/* Layer 3: Interaction overlay — wiring clicks (topmost) */}
        <Layer>
          <WiringInteractionLayer width={size.width} height={size.height} />
        </Layer>
      </Stage>
    </div>
  );
}
