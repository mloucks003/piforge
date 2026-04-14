'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Group, Rect, Circle, Line, Text } from 'react-konva';
import { getDrawCommands, getVersion, sendTouch } from '@/lib/simulation/touchscreen';
import type { DrawCommand } from '@/lib/simulation/touchscreen';
import type Konva from 'konva';

const DW = 400;
const DH = 240;
const SX = DW / 800;
const SY = DH / 480;

function RenderCommand({ cmd }: { cmd: DrawCommand }) {
  const x = cmd.x * SX, y = cmd.y * SY, w = cmd.w * SX, h = cmd.h * SY;
  if (cmd.type === 'clear') return <Rect x={0} y={0} width={DW} height={DH} fill={cmd.color} />;
  if (cmd.type === 'rect') return <Rect x={x} y={y} width={w} height={h} fill={cmd.color} cornerRadius={cmd.extra * SX} />;
  if (cmd.type === 'circle') return <Circle x={x} y={y} radius={cmd.w * SX} fill={cmd.color} />;
  if (cmd.type === 'line') return <Line points={[x, y, w, h]} stroke={cmd.color} strokeWidth={cmd.extra || 1} />;
  if (cmd.type === 'text') return <Text x={x} y={y} text={cmd.text} fontSize={Math.max(8, cmd.w * SX)} fill={cmd.color} />;
  return null;
}

interface Props {
  x: number;
  y: number;
  onDragEnd?: (pos: { x: number; y: number }) => void;
}

export default function TouchscreenDisplay({ x, y, onDragEnd }: Props) {
  const [ver, setVer] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => { const v = getVersion(); if (v !== ver) setVer(v); }, 80);
    return () => clearInterval(iv);
  });
  const cmds = getDrawCommands();

  // Only fire touch on a real click — Konva's onClick does NOT fire if a drag occurred,
  // so this naturally separates "tap to interact" from "drag to move".
  const handleClick = useCallback((e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    const stage = e.target.getStage();
    if (!stage) return;
    const p = stage.getPointerPosition();
    if (!p) return;
    // Walk up to find the Group that has x/y position (the clip Group's parent — the outer draggable Group)
    const clipGroup = e.target.getParent();           // clip Group (no position offset)
    const outerGroup = clipGroup?.getParent();         // outer draggable Group (has x, y)
    const transform = (outerGroup ?? clipGroup)?.getAbsoluteTransform().copy().invert();
    if (!transform) return;
    const local = transform.point(p);
    // local is now relative to the outer Group origin which is exactly the screen [0,0]
    sendTouch(Math.round(local.x / SX), Math.round(local.y / SY));
  }, []);

  const handleDragEnd = useCallback((e: Konva.KonvaEventObject<DragEvent>) => {
    onDragEnd?.({ x: e.target.x(), y: e.target.y() });
  }, [onDragEnd]);

  return (
    <Group x={x} y={y} draggable onDragEnd={handleDragEnd}>
      {/* Bezel — also acts as the drag handle */}
      <Rect x={-8} y={-24} width={DW + 16} height={DH + 32} fill="#111" stroke="#444" strokeWidth={1.5} cornerRadius={4} />
      <Text x={0} y={-17} text='7" DSI Touchscreen  ✥ drag' fontSize={7} fontFamily="monospace" fill="#555" width={DW} align="center" />
      {/* Screen area — clipped so draw commands can't overflow */}
      <Group clipX={0} clipY={0} clipWidth={DW} clipHeight={DH}>
        {/* Background */}
        <Rect x={0} y={0} width={DW} height={DH} fill="#000" />
        {/* Pygame draw commands */}
        {cmds.map((cmd, i) => <RenderCommand key={i} cmd={cmd} />)}
        {/* Invisible overlay — must be LAST so it sits on top of all drawn shapes
            and captures clicks even when the user taps a pygame-drawn button */}
        <Rect
          x={0} y={0} width={DW} height={DH}
          fill="#000" opacity={0}
          onClick={handleClick} onTap={handleClick}
        />
      </Group>
    </Group>
  );
}
