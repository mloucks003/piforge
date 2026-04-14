'use client';

import React, { useCallback } from 'react';
import { Group, Rect, Circle, Text, Line } from 'react-konva';
import { useProjectStore } from '@/stores/projectStore';
import type Konva from 'konva';

import {
  BB_S as S,
  HOLE_STEP as HS,
  BB_COLS,
  BB_ROWS_PER_BUS,
  BB_WIDTH,
  BB_HEIGHT,
  COL_START_X,
  RAIL_TOP_Y,
  RAIL_BOT_Y,
  ROW_A_Y,
  GAP_Y,
  ROW_F_Y,
  HOLE_RADIUS as HOLE_R_CONST,
} from '@/lib/canvas/breadboard-layout';

// Colors
const BODY = '#f5f0e8';
const BODY_EDGE = '#d4cfc4';
const CENTER_STRIP = '#e8e3d8';
const HOLE_FILL = '#2a2a2a';
const HOLE_STROKE = '#1a1a1a';
const RAIL_POS = '#ef4444';
const RAIL_NEG = '#3b82f6';
const LABEL_COLOR = '#888';
const RAIL_STRIPE_POS = 'rgba(239,68,68,0.15)';
const RAIL_STRIPE_NEG = 'rgba(59,130,246,0.15)';

const HOLE_R = HOLE_R_CONST;
const ROW_LABELS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];

/* ── Power Rail ── */
const PowerRail = React.memo(function PowerRail({ y, colStartX }: { y: number; colStartX: number }) {
  return (
    <Group>
      {/* Positive rail stripe */}
      <Rect x={colStartX - 4} y={y - 3} width={BB_COLS * HS + 4} height={HS + 2} fill={RAIL_STRIPE_POS} cornerRadius={1} />
      {/* Negative rail stripe */}
      <Rect x={colStartX - 4} y={y + HS + 1} width={BB_COLS * HS + 4} height={HS + 2} fill={RAIL_STRIPE_NEG} cornerRadius={1} />

      {/* Rail labels */}
      <Text x={colStartX - 18} y={y - 1} text="+" fontSize={8} fontStyle="bold" fill={RAIL_POS} />
      <Text x={colStartX - 18} y={y + HS + 1} text="−" fontSize={10} fontStyle="bold" fill={RAIL_NEG} />
      <Text x={colStartX + BB_COLS * HS + 6} y={y - 1} text="+" fontSize={8} fontStyle="bold" fill={RAIL_POS} />
      <Text x={colStartX + BB_COLS * HS + 6} y={y + HS + 1} text="−" fontSize={10} fontStyle="bold" fill={RAIL_NEG} />

      {/* Positive rail holes */}
      {Array.from({ length: BB_COLS }).map((_, c) => (
        <Circle key={`p${c}`} x={colStartX + c * HS} y={y} radius={HOLE_R} fill={HOLE_FILL} stroke={HOLE_STROKE} strokeWidth={0.3} />
      ))}
      {/* Negative rail holes */}
      {Array.from({ length: BB_COLS }).map((_, c) => (
        <Circle key={`n${c}`} x={colStartX + c * HS} y={y + HS} radius={HOLE_R} fill={HOLE_FILL} stroke={HOLE_STROKE} strokeWidth={0.3} />
      ))}

      {/* Rail break lines (split at midpoint) */}
      <Line points={[colStartX + 31 * HS + HS / 2, y - 4, colStartX + 31 * HS + HS / 2, y + HS * 2 + 4]} stroke={BODY_EDGE} strokeWidth={0.5} dash={[2, 2]} />
    </Group>
  );
});

/* ── Bus Group (5 rows) ── */
const BusGroup = React.memo(function BusGroup({ startY, rowOffset, colStartX }: { startY: number; rowOffset: number; colStartX: number }) {
  return (
    <Group>
      {Array.from({ length: BB_ROWS_PER_BUS }).map((_, r) => {
        const y = startY + r * HS;
        const label = ROW_LABELS[rowOffset + r];
        return (
          <Group key={r}>
            {/* Row label left */}
            <Text x={colStartX - 18} y={y - 4} text={label} fontSize={7} fontFamily="monospace" fill={LABEL_COLOR} />
            {/* Row label right */}
            <Text x={colStartX + BB_COLS * HS + 6} y={y - 4} text={label} fontSize={7} fontFamily="monospace" fill={LABEL_COLOR} />
            {/* Holes */}
            {Array.from({ length: BB_COLS }).map((_, c) => (
              <Circle key={c} x={colStartX + c * HS} y={y} radius={HOLE_R} fill={HOLE_FILL} stroke={HOLE_STROKE} strokeWidth={0.3} />
            ))}
          </Group>
        );
      })}
    </Group>
  );
});

/* ── Column Labels ── */
const ColumnLabels = React.memo(function ColumnLabels({ y, colStartX }: { y: number; colStartX: number }) {
  // Show every 5th column label to avoid clutter
  return (
    <Group>
      {Array.from({ length: BB_COLS }).map((_, c) => {
        const show = c === 0 || (c + 1) % 5 === 0 || c === BB_COLS - 1;
        if (!show) return null;
        return (
          <Text
            key={c}
            x={colStartX + c * HS - 5}
            y={y}
            text={String(c + 1)}
            fontSize={5.5}
            fontFamily="monospace"
            fill={LABEL_COLOR}
            width={10}
            align="center"
          />
        );
      })}
    </Group>
  );
});

/* ── Single Breadboard ── */
const SingleBreadboard = React.memo(function SingleBreadboard({
  id,
  x,
  y,
  onDragEnd,
  onDragMove,
}: {
  id: string;
  x: number;
  y: number;
  onDragEnd: (id: string, pos: { x: number; y: number }) => void;
  onDragMove: (id: string, pos: { x: number; y: number }) => void;
}) {
  const handleDrag = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>) => {
      onDragMove(id, { x: e.target.x(), y: e.target.y() });
    },
    [id, onDragMove]
  );
  const handleDragEnd = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>) => {
      onDragEnd(id, { x: e.target.x(), y: e.target.y() });
    },
    [id, onDragEnd]
  );

  return (
    <Group x={x} y={y} draggable onDragMove={handleDrag} onDragEnd={handleDragEnd}>
      {/* Drop shadow */}
      <Rect x={3} y={3} width={BB_WIDTH} height={BB_HEIGHT} fill="rgba(0,0,0,0.25)" cornerRadius={4} />

      {/* Body */}
      <Rect x={0} y={0} width={BB_WIDTH} height={BB_HEIGHT} fill={BODY} stroke={BODY_EDGE} strokeWidth={1.5} cornerRadius={3} />

      {/* Center gap / channel */}
      <Rect
        x={COL_START_X - 6}
        y={ROW_A_Y + BB_ROWS_PER_BUS * HS - 2}
        width={BB_COLS * HS + 12}
        height={GAP_Y + 4}
        fill={CENTER_STRIP}
        cornerRadius={2}
      />
      {/* Center notch line */}
      <Line
        points={[
          COL_START_X - 6, ROW_A_Y + BB_ROWS_PER_BUS * HS + GAP_Y / 2,
          COL_START_X + BB_COLS * HS + 6, ROW_A_Y + BB_ROWS_PER_BUS * HS + GAP_Y / 2,
        ]}
        stroke={BODY_EDGE}
        strokeWidth={0.8}
      />

      {/* Column labels top */}
      <ColumnLabels y={ROW_A_Y - 10} colStartX={COL_START_X} />

      {/* Top power rail */}
      <PowerRail y={RAIL_TOP_Y} colStartX={COL_START_X} />

      {/* Top bus (rows a-e) */}
      <BusGroup startY={ROW_A_Y} rowOffset={0} colStartX={COL_START_X} />

      {/* Bottom bus (rows f-j) */}
      <BusGroup startY={ROW_F_Y} rowOffset={5} colStartX={COL_START_X} />

      {/* Bottom power rail */}
      <PowerRail y={RAIL_BOT_Y} colStartX={COL_START_X} />

      {/* Column labels bottom */}
      <ColumnLabels y={RAIL_BOT_Y + HS * 2 + 4} colStartX={COL_START_X} />
    </Group>
  );
});

/* ══════════════════════════════════════════════════════════
   Main Breadboard Renderer — renders all breadboards
   ══════════════════════════════════════════════════════════ */
export default function BreadboardRenderer() {
  const breadboards = useProjectStore((s) => s.breadboards);
  const updateBreadboardPosition = useProjectStore((s) => s.updateBreadboardPosition);

  const handleDragEnd = useCallback(
    (id: string, pos: { x: number; y: number }) => {
      updateBreadboardPosition(id, pos);
    },
    [updateBreadboardPosition]
  );

  // Update store every drag frame so wires follow in real-time
  const handleDragMove = useCallback(
    (id: string, pos: { x: number; y: number }) => {
      updateBreadboardPosition(id, pos);
    },
    [updateBreadboardPosition]
  );

  const bbList = Object.values(breadboards);
  if (bbList.length === 0) return null;

  return (
    <>
      {bbList.map((bb) => (
        <SingleBreadboard
          key={bb.id}
          id={bb.id}
          x={bb.position.x}
          y={bb.position.y}
          onDragEnd={handleDragEnd}
          onDragMove={handleDragMove}
        />
      ))}
    </>
  );
}

// Re-export canonical constants for backwards compat / tests
export { BB_COLS, BB_ROWS_PER_BUS, HS as HOLE_STEP, COL_START_X, ROW_A_Y, ROW_F_Y, GAP_Y, S as SCALE, BB_WIDTH, BB_HEIGHT };
