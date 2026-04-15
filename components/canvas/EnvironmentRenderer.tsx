'use client';

/**
 * EnvironmentRenderer — draws a smart-home or office floor plan on the Konva canvas.
 * Positioned as a background Layer so circuit components render on top.
 */

import React from 'react';
import { Group, Rect, Text, Line } from 'react-konva';

// ── palette ──────────────────────────────────────────────────────────────────
const WALL      = '#334155';
const WALL_W    = 6;
const FLOOR_FILL: Record<string, string> = {
  living:  'rgba(34,197,94,0.06)',
  kitchen: 'rgba(251,191,36,0.06)',
  bedroom: 'rgba(99,102,241,0.06)',
  office:  'rgba(59,130,246,0.06)',
  bath:    'rgba(14,165,233,0.06)',
  hall:    'rgba(156,163,175,0.04)',
};
const LABEL_CLR = 'rgba(148,163,184,0.7)';

interface Room {
  key: string;
  label: string;
  x: number; y: number; w: number; h: number;
}

// ── HOME layout (px) — placed at canvas origin, scale-independent ─────────
const HOME_ROOMS: Room[] = [
  { key: 'living',  label: '🛋️ Living Room',  x: 20,  y: 20,  w: 260, h: 200 },
  { key: 'kitchen', label: '🍳 Kitchen',       x: 290, y: 20,  w: 160, h: 120 },
  { key: 'bedroom', label: '🛏️ Bedroom',        x: 20,  y: 230, w: 180, h: 160 },
  { key: 'bath',    label: '🚿 Bathroom',       x: 210, y: 230, w: 100, h: 80  },
  { key: 'hall',    label: '⬛ Hallway',        x: 210, y: 320, w: 100, h: 70  },
  { key: 'office',  label: '💻 Office',         x: 320, y: 150, w: 130, h: 100 },
];

const HOME_DOORS = [
  // [x1,y1, x2,y2] — door gap lines
  [20,  220, 80,  220],  // living → hallway
  [310, 20,  310, 80],   // living → kitchen
  [210, 270, 210, 310],  // bedroom → hallway
  [320, 200, 320, 250],  // office entrance
];

// ── OFFICE layout ─────────────────────────────────────────────────────────
const OFFICE_ROOMS: Room[] = [
  { key: 'office',  label: '💼 Open Plan',     x: 20,  y: 20,  w: 300, h: 200 },
  { key: 'kitchen', label: '☕ Break Room',     x: 330, y: 20,  w: 120, h: 100 },
  { key: 'bath',    label: '🚿 Restroom',       x: 330, y: 130, w: 120, h: 90  },
  { key: 'hall',    label: '🔒 Server Room',    x: 20,  y: 230, w: 140, h: 100 },
  { key: 'living',  label: '🤝 Meeting Room',   x: 170, y: 230, w: 180, h: 100 },
];

const OFFICE_DOORS = [
  [320, 80,  320, 130],
  [160, 230, 160, 280],
  [170, 280, 170, 330],
];

// ── Room component ─────────────────────────────────────────────────────────
function RoomShape({ room }: { room: Room }) {
  return (
    <Group>
      <Rect
        x={room.x} y={room.y} width={room.w} height={room.h}
        fill={FLOOR_FILL[room.key] ?? 'rgba(100,100,100,0.04)'}
        stroke={WALL} strokeWidth={WALL_W}
        cornerRadius={4}
      />
      <Text
        x={room.x + 8} y={room.y + 8}
        text={room.label}
        fontSize={11} fontFamily="sans-serif"
        fill={LABEL_CLR}
        listening={false}
      />
    </Group>
  );
}

// ── Device dots (decorative icons placed in rooms) ─────────────────────────
interface DeviceDot { x: number; y: number; label: string; color: string }

const HOME_DEVICES: DeviceDot[] = [
  { x: 80,  y: 80,  label: '💡', color: '#fbbf24' },
  { x: 200, y: 90,  label: '📡', color: '#60a5fa' },
  { x: 350, y: 60,  label: '🌡️', color: '#34d399' },
  { x: 80,  y: 300, label: '💡', color: '#fbbf24' },
  { x: 370, y: 190, label: '💻', color: '#818cf8' },
];

const OFFICE_DEVICES: DeviceDot[] = [
  { x: 80,  y: 80,  label: '📷', color: '#f87171' },
  { x: 200, y: 100, label: '💡', color: '#fbbf24' },
  { x: 380, y: 60,  label: '☕', color: '#d97706' },
  { x: 70,  y: 280, label: '🖥️', color: '#818cf8' },
  { x: 250, y: 280, label: '📊', color: '#34d399' },
];

function DeviceMarkers({ devices }: { devices: DeviceDot[] }) {
  return (
    <>
      {devices.map((d, i) => (
        <Text key={i} x={d.x - 10} y={d.y - 10} text={d.label} fontSize={18} listening={false} />
      ))}
    </>
  );
}

// ── Main export ─────────────────────────────────────────────────────────────
interface Props {
  type: 'home' | 'office';
  offsetX?: number;
  offsetY?: number;
}

export default function EnvironmentRenderer({ type, offsetX = 600, offsetY = 30 }: Props) {
  const rooms   = type === 'home' ? HOME_ROOMS   : OFFICE_ROOMS;
  const doors   = type === 'home' ? HOME_DOORS   : OFFICE_DOORS;
  const devices = type === 'home' ? HOME_DEVICES : OFFICE_DEVICES;

  return (
    <Group x={offsetX} y={offsetY} listening={false}>
      {/* Floor plan label */}
      <Text
        x={0} y={-22}
        text={type === 'home' ? '🏠 Smart Home — Floor Plan' : '🏢 Smart Office — Floor Plan'}
        fontSize={13} fontFamily="sans-serif" fontStyle="bold"
        fill="rgba(148,163,184,0.9)"
      />

      {/* Rooms */}
      {rooms.map(r => <RoomShape key={r.key} room={r} />)}

      {/* Door gaps */}
      {doors.map((d, i) => (
        <Line key={i} points={d} stroke="rgba(30,41,59,1)" strokeWidth={8} listening={false} />
      ))}

      {/* Device markers */}
      <DeviceMarkers devices={devices} />
    </Group>
  );
}
