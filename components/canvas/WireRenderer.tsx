'use client';

import React, { useCallback } from 'react';
import { Group, Line, Circle } from 'react-konva';
import { useProjectStore } from '@/stores/projectStore';
import { useWiringStore } from '@/stores/wiringStore';
import { wireColorHex } from '@/lib/wiring/color';
import { resolvePinPosition } from '@/lib/wiring/engine';
import type { Wire } from '@/stores/projectStore';

const WIRE_STROKE_WIDTH = 2.8;
const SELECTED_STROKE_WIDTH = 4;
/** Radius of the plug connector shown at each wire endpoint */
const PLUG_R = 3.5;

/* ── Single Wire ── */
const SingleWire = React.memo(function SingleWire({
  wire,
  isSelected,
  onSelect,
}: {
  wire: Wire;
  isSelected: boolean;
  onSelect: (id: string) => void;
}) {
  const handleClick = useCallback(() => {
    onSelect(wire.id);
  }, [wire.id, onSelect]);

  // Recalculate wire path from current pin positions (wires follow when items move)
  const boardModel = useProjectStore((s) => s.boardModel);
  const boardPosition = useProjectStore((s) => s.boardPosition);
  const components = useProjectStore((s) => s.components);
  const breadboards = useProjectStore((s) => s.breadboards);

  const startPos = React.useMemo(
    () => resolvePinPosition(wire.startPinRef, boardModel, boardPosition, components, breadboards),
    [wire.startPinRef, boardModel, boardPosition, components, breadboards]
  );

  const endPos = React.useMemo(
    () => resolvePinPosition(wire.endPinRef, boardModel, boardPosition, components, breadboards),
    [wire.endPinRef, boardModel, boardPosition, components, breadboards]
  );

  if (!startPos || !endPos) return null;

  const dx = endPos.x - startPos.x;
  const dy = endPos.y - startPos.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  // Vertical-biased S-curve that looks natural for breadboard wiring
  const offset = Math.max(20, dist * 0.35);
  const points = [
    startPos.x, startPos.y,
    startPos.x, startPos.y + offset,
    endPos.x,   endPos.y   - offset,
    endPos.x,   endPos.y,
  ];
  const color = wireColorHex(wire.color);

  return (
    <Group>
      {/* Selection halo */}
      {isSelected && (
        <Line points={points} bezier stroke="#ffffff" strokeWidth={SELECTED_STROKE_WIDTH + 4} opacity={0.25} listening={false} />
      )}
      {/* Invisible wide hit area */}
      <Line points={points} bezier stroke="transparent" strokeWidth={14} onClick={handleClick} onTap={handleClick} />
      {/* Wire body */}
      <Line
        points={points}
        bezier
        stroke={color}
        strokeWidth={isSelected ? SELECTED_STROKE_WIDTH : WIRE_STROKE_WIDTH}
        lineCap="round"
        lineJoin="round"
        listening={false}
        shadowColor={isSelected ? '#fff' : color}
        shadowBlur={isSelected ? 6 : 2}
        shadowOpacity={isSelected ? 0.4 : 0.15}
      />
      {/* Pin plug at start — outer dark ring + coloured centre */}
      <Circle x={startPos.x} y={startPos.y} radius={PLUG_R + 1.5} fill="#111" listening={false} />
      <Circle x={startPos.x} y={startPos.y} radius={PLUG_R} fill={color} listening={false} />
      <Circle x={startPos.x - 1} y={startPos.y - 1} radius={1.2} fill="rgba(255,255,255,0.35)" listening={false} />
      {/* Pin plug at end */}
      <Circle x={endPos.x} y={endPos.y} radius={PLUG_R + 1.5} fill="#111" listening={false} />
      <Circle x={endPos.x} y={endPos.y} radius={PLUG_R} fill={color} listening={false} />
      <Circle x={endPos.x - 1} y={endPos.y - 1} radius={1.2} fill="rgba(255,255,255,0.35)" listening={false} />
    </Group>
  );
});

/* ── Wire Preview (during drawing) ── */
function WirePreview() {
  const isDrawing = useWiringStore((s) => s.isDrawing);
  const startPosition = useWiringStore((s) => s.startPosition);
  const mousePosition = useWiringStore((s) => s.mousePosition);

  if (!isDrawing || !startPosition || !mousePosition) return null;

  const dx = mousePosition.x - startPosition.x;
  const dy = mousePosition.y - startPosition.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const offset = Math.max(20, dist * 0.35);

  const points = [
    startPosition.x, startPosition.y,
    startPosition.x, startPosition.y + offset,
    mousePosition.x, mousePosition.y - offset,
    mousePosition.x, mousePosition.y,
  ];

  return (
    <Group listening={false}>
      <Line points={points} bezier stroke="#60a5fa" strokeWidth={2} dash={[6, 4]} lineCap="round" opacity={0.8} />
      {/* Start pin indicator */}
      <Circle x={startPosition.x} y={startPosition.y} radius={5} fill="#60a5fa" opacity={0.5} />
      <Circle x={startPosition.x} y={startPosition.y} radius={3} fill="#93c5fd" />
      {/* Cursor indicator */}
      <Circle x={mousePosition.x} y={mousePosition.y} radius={4} fill="transparent" stroke="#60a5fa" strokeWidth={1.5} dash={[3, 2]} />
    </Group>
  );
}

/* ══════════════════════════════════════════════════════════
   Main Wire Renderer — renders all wires + preview
   ══════════════════════════════════════════════════════════ */
export default function WireRenderer() {
  const wires = useProjectStore((s) => s.wires);
  const selectedWireId = useWiringStore((s) => s.selectedWireId);
  const selectWire = useWiringStore((s) => s.selectWire);

  const handleSelect = useCallback(
    (id: string) => {
      selectWire(selectedWireId === id ? null : id);
    },
    [selectedWireId, selectWire]
  );

  const wireList = Object.values(wires);

  return (
    <>
      {wireList.map((wire) => (
        <SingleWire
          key={wire.id}
          wire={wire}
          isSelected={wire.id === selectedWireId}
          onSelect={handleSelect}
        />
      ))}
      <WirePreview />
    </>
  );
}
