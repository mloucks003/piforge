'use client';

import React from 'react';
import { Group, Rect, Circle, Text, Line, RegularPolygon } from 'react-konva';
import { useProjectStore } from '@/stores/projectStore';
import { getBoardModel } from '@/lib/boards';
import type { PinDefinition, PortDefinition } from '@/lib/boards/types';

const S = 5; // px per mm

/* ── palette ── */
const PCB = '#1a6b3c';
const PCB2 = '#176335';
const PCB_EDGE = '#0e3a1f';
const SOLDER_MASK = '#1d7a44';
const SILK = '#c8dbbe';
const SILK_DIM = 'rgba(200,219,190,0.3)';
const COPPER = '#c87533';
const GOLD = '#d4a843';
const IC_BLACK = '#1a1a1e';
const IC_GRAY = '#2a2a30';
const CAP_TAN = '#c4a35a';
const CAP_DARK = '#3a3a3a';
const METAL = '#3a3a40';
const METAL_HI = '#5a5a62';
const METAL_LO = '#222228';

/* ── helpers ── */
function pinFill(t: PinDefinition['type']) {
  const m: Record<string, string> = { power: '#ef4444', ground: '#333', i2c: '#22c55e', spi: '#22c55e', gpio: GOLD, uart: '#a855f7', pwm: '#f59e0b' };
  return m[t] ?? GOLD;
}
function pinEdge(t: PinDefinition['type']) {
  const m: Record<string, string> = { power: '#b91c1c', ground: '#111' };
  return m[t] ?? '#8b6914';
}
function pinLabel(p: PinDefinition) {
  if (p.type === 'power') return p.label;
  if (p.type === 'ground') return 'GND';
  return p.label;
}

const PR = 3.2; // pin radius

/* ── IC Chip component ── */
const ICChip = React.memo(function ICChip({ x, y, w, h, label, sublabel }: { x: number; y: number; w: number; h: number; label: string; sublabel?: string }) {
  return (
    <Group>
      {/* shadow */}
      <Rect x={x + 1.5} y={y + 1.5} width={w} height={h} fill="rgba(0,0,0,0.35)" cornerRadius={2} />
      {/* body */}
      <Rect x={x} y={y} width={w} height={h} fill={IC_BLACK} stroke={IC_GRAY} strokeWidth={1} cornerRadius={2} />
      {/* top bevel */}
      <Rect x={x + 1} y={y + 1} width={w - 2} height={2} fill="rgba(255,255,255,0.06)" />
      {/* pin 1 dot */}
      <Circle x={x + 5} y={y + 5} radius={1.5} fill="rgba(255,255,255,0.15)" />
      {/* label */}
      <Text x={x + 3} y={y + h / 2 - 6} text={label} fontSize={6} fontFamily="monospace" fontStyle="bold" fill="rgba(255,255,255,0.4)" width={w - 6} align="center" />
      {sublabel && <Text x={x + 3} y={y + h / 2 + 2} text={sublabel} fontSize={4.5} fontFamily="monospace" fill="rgba(255,255,255,0.2)" width={w - 6} align="center" />}
      {/* side pads */}
      {Array.from({ length: Math.floor(h / 4) }).map((_, i) => (
        <React.Fragment key={i}>
          <Rect x={x - 2} y={y + 3 + i * 4} width={2.5} height={1.5} fill={COPPER} opacity={0.5} />
          <Rect x={x + w - 0.5} y={y + 3 + i * 4} width={2.5} height={1.5} fill={COPPER} opacity={0.5} />
        </React.Fragment>
      ))}
    </Group>
  );
});

/* ── SMD Capacitor ── */
const Cap = React.memo(function Cap({ x, y, vertical }: { x: number; y: number; vertical?: boolean }) {
  const w = vertical ? 3 : 5;
  const h = vertical ? 5 : 3;
  return (
    <Group>
      <Rect x={x} y={y} width={w} height={h} fill={CAP_TAN} stroke="#a08030" strokeWidth={0.5} cornerRadius={0.5} />
      {vertical
        ? <><Rect x={x} y={y} width={w} height={1.2} fill={COPPER} opacity={0.6} /><Rect x={x} y={y + h - 1.2} width={w} height={1.2} fill={COPPER} opacity={0.6} /></>
        : <><Rect x={x} y={y} width={1.2} height={h} fill={COPPER} opacity={0.6} /><Rect x={x + w - 1.2} y={y} width={1.2} height={h} fill={COPPER} opacity={0.6} /></>
      }
    </Group>
  );
});

/* ── SMD Resistor ── */
const Res = React.memo(function Res({ x, y, vertical }: { x: number; y: number; vertical?: boolean }) {
  const w = vertical ? 2.5 : 4;
  const h = vertical ? 4 : 2.5;
  return (
    <Rect x={x} y={y} width={w} height={h} fill={CAP_DARK} stroke="#555" strokeWidth={0.3} cornerRadius={0.3} />
  );
});

/* ── LED indicator ── */
const BoardLED = React.memo(function BoardLED({ x, y, color, label }: { x: number; y: number; color: string; label: string }) {
  return (
    <Group>
      <Rect x={x} y={y} width={4} height={3} fill={color} opacity={0.7} cornerRadius={0.5} stroke={color} strokeWidth={0.3} />
      <Text x={x - 2} y={y + 5} text={label} fontSize={3.5} fontFamily="monospace" fill={SILK_DIM} width={8} align="center" />
    </Group>
  );
});

/* ── GPIO Pin ── */
const PinGroup = React.memo(function PinGroup({ pin, isLeft }: { pin: PinDefinition; isLeft: boolean }) {
  const x = pin.position.x * S;
  const y = pin.position.y * S;
  return (
    <Group>
      <Circle x={x} y={y} radius={PR + 1.5} fill={COPPER} opacity={0.45} />
      <Circle x={x} y={y} radius={PR} fill={pinFill(pin.type)} stroke={pinEdge(pin.type)} strokeWidth={0.8} />
      <Circle x={x - 0.8} y={y - 0.8} radius={0.8} fill="rgba(255,255,255,0.3)" />
      <Text x={isLeft ? x - PR - 15 : x + PR + 3} y={y - 3.5} text={String(pin.pinNumber)} fontSize={5} fontFamily="monospace" fill={SILK_DIM} align={isLeft ? 'right' : 'left'} width={11} />
      <Text x={isLeft ? x - PR - 54 : x + PR + 15} y={y - 4} text={pinLabel(pin)} fontSize={6} fontFamily="monospace" fontStyle="bold" fill={SILK} align={isLeft ? 'right' : 'left'} width={38} />
    </Group>
  );
});

/* ── Port ── */
const PortGroup = React.memo(function PortGroup({ port }: { port: PortDefinition }) {
  const x = port.position.x * S;
  const y = port.position.y * S;
  const w = port.dimensions.width * S;
  const h = port.dimensions.height * S;
  const isUSB = port.type === 'usb-a' || port.type === 'usb-3' || port.type === 'usb-2';
  const isEth = port.type === 'ethernet';
  const isHDMI = port.type === 'hdmi-micro';
  const isUSBC = port.type === 'usb-c';
  const isFlat = port.type === 'csi' || port.type === 'dsi';

  return (
    <Group>
      {/* shadow */}
      <Rect x={x + 2} y={y + 2} width={w} height={h} fill="rgba(0,0,0,0.35)" cornerRadius={isFlat ? 1 : 2} />
      {/* metal shell */}
      <Rect x={x} y={y} width={w} height={h} fill={isFlat ? '#1a1a1a' : METAL_LO} stroke={isFlat ? '#444' : METAL_HI} strokeWidth={isFlat ? 0.8 : 1.5} cornerRadius={isFlat ? 1 : 2} />
      {/* top highlight */}
      {!isFlat && <Rect x={x + 1} y={y + 1} width={w - 2} height={2} fill="rgba(255,255,255,0.08)" cornerRadius={1} />}

      {/* USB inner cavity */}
      {isUSB && (
        <>
          <Rect x={x + 4} y={y + 4} width={w - 8} height={h - 8} fill={port.type === 'usb-3' ? '#0f2a5c' : '#1a1a20'} cornerRadius={1} />
          <Rect x={x + 5} y={y + h / 2 - 1} width={w - 10} height={2} fill={port.type === 'usb-3' ? '#2563eb' : '#555'} cornerRadius={0.5} />
        </>
      )}

      {/* USB-C oval shape */}
      {isUSBC && (
        <Rect x={x + 2} y={y + 2} width={w - 4} height={h - 4} fill="#111" cornerRadius={Math.min(w, h) / 3} />
      )}

      {/* HDMI inner */}
      {isHDMI && (
        <Rect x={x + 3} y={y + 3} width={w - 6} height={h - 6} fill="#0a0a10" cornerRadius={1} />
      )}

      {/* Ethernet LEDs + inner */}
      {isEth && (
        <>
          <Rect x={x + 4} y={y + 4} width={w - 8} height={h - 16} fill="#111" cornerRadius={1} />
          <Circle x={x + 8} y={y + h - 8} radius={3} fill="#22c55e" opacity={0.5} />
          <Circle x={x + 8} y={y + h - 8} radius={1.5} fill="#22c55e" opacity={0.8} />
          <Circle x={x + w - 8} y={y + h - 8} radius={3} fill="#f59e0b" opacity={0.5} />
          <Circle x={x + w - 8} y={y + h - 8} radius={1.5} fill="#f59e0b" opacity={0.8} />
        </>
      )}

      {/* flat connector latch */}
      {isFlat && (
        <Rect x={x + 2} y={y + h * 0.3} width={w - 4} height={h * 0.4} fill="#333" cornerRadius={0.5} />
      )}

      {/* label */}
      <Text x={x} y={y + h + 3} text={port.label} fontSize={4.5} fontFamily="monospace" fill={SILK_DIM} width={w} align="center" />
    </Group>
  );
});

/* ── Copper trace network (decorative) ── */
function TraceNetwork({ W, H }: { W: number; H: number }) {
  const traces: { points: number[]; w: number }[] = [];
  // horizontal bus lines
  for (let i = 0; i < 12; i++) {
    const yy = 15 + i * (H / 13);
    const x1 = 15 + (i % 3) * 20;
    const x2 = W - 15 - (i % 4) * 15;
    traces.push({ points: [x1, yy, x2, yy], w: 0.4 + (i % 3) * 0.2 });
  }
  // vertical bus lines
  for (let i = 0; i < 8; i++) {
    const xx = 70 + i * (W / 10);
    const y1 = 10 + (i % 2) * 15;
    const y2 = H - 10 - (i % 3) * 10;
    traces.push({ points: [xx, y1, xx, y2], w: 0.3 + (i % 2) * 0.2 });
  }
  // diagonal traces near SoC
  traces.push({ points: [W * 0.4, H * 0.3, W * 0.55, H * 0.15], w: 0.3 });
  traces.push({ points: [W * 0.45, H * 0.35, W * 0.6, H * 0.2], w: 0.3 });
  traces.push({ points: [W * 0.35, H * 0.6, W * 0.5, H * 0.75], w: 0.3 });

  return (
    <Group listening={false}>
      {traces.map((t, i) => (
        <Line key={i} points={t.points} stroke={PCB2} strokeWidth={t.w} opacity={0.5} />
      ))}
    </Group>
  );
}

/* ── Via holes (decorative) ── */
function Vias({ W, H }: { W: number; H: number }) {
  const vias: { x: number; y: number }[] = [];
  for (let i = 0; i < 20; i++) {
    vias.push({
      x: 25 + ((i * 37 + 13) % (W - 50)),
      y: 15 + ((i * 53 + 7) % (H - 30)),
    });
  }
  return (
    <Group listening={false}>
      {vias.map((v, i) => (
        <Group key={i}>
          <Circle x={v.x} y={v.y} radius={2} fill={COPPER} opacity={0.25} />
          <Circle x={v.x} y={v.y} radius={0.8} fill={PCB_EDGE} />
        </Group>
      ))}
    </Group>
  );
}

/* ── Board-specific ICs and components ── */
function BoardComponents({ id, W, H }: { id: string; W: number; H: number }) {
  const isPi5 = id === 'pi5';
  return (
    <Group>
      {/* SoC (BCM2711 for Pi4, BCM2712 for Pi5) */}
      <ICChip
        x={W * 0.32} y={H * 0.25}
        w={isPi5 ? 70 : 65} h={isPi5 ? 70 : 65}
        label={isPi5 ? 'BCM2712' : 'BCM2711'}
        sublabel={isPi5 ? 'Cortex-A76' : 'Cortex-A72'}
      />

      {/* RAM (on Pi4 it's on top of SoC, on Pi5 it's separate) */}
      {isPi5 ? (
        <ICChip x={W * 0.32} y={H * 0.02 + 10} w={55} h={30} label="LPDDR4X" sublabel="4GB" />
      ) : (
        /* Pi4 has PoP RAM on SoC — show a label */
        <Text x={W * 0.32 + 5} y={H * 0.25 + 50} text="LPDDR4" fontSize={4} fontFamily="monospace" fill="rgba(255,255,255,0.15)" />
      )}

      {/* RP1 southbridge (Pi5 only) */}
      {isPi5 && (
        <ICChip x={W * 0.55} y={H * 0.35} w={45} h={45} label="RP1" sublabel="I/O Controller" />
      )}

      {/* USB/Ethernet controller */}
      <ICChip
        x={W * 0.58} y={isPi5 ? H * 0.08 : H * 0.08}
        w={35} h={35}
        label={isPi5 ? 'VL805' : 'VL805'}
        sublabel="USB 3.0"
      />

      {/* Ethernet PHY */}
      <ICChip
        x={W * 0.58} y={H * 0.65}
        w={30} h={25}
        label={isPi5 ? 'BCM54213' : 'BCM54213'}
        sublabel="GbE PHY"
      />

      {/* PMIC (Pi5) / voltage regulators */}
      {isPi5 ? (
        <ICChip x={W * 0.15} y={H * 0.65} w={25} h={20} label="DA9091" sublabel="PMIC" />
      ) : (
        <>
          <ICChip x={W * 0.15} y={H * 0.65} w={20} h={15} label="MxL7704" sublabel="PMIC" />
        </>
      )}

      {/* Scattered SMD capacitors */}
      <Cap x={W * 0.28} y={H * 0.15} />
      <Cap x={W * 0.50} y={H * 0.18} vertical />
      <Cap x={W * 0.25} y={H * 0.55} />
      <Cap x={W * 0.48} y={H * 0.70} vertical />
      <Cap x={W * 0.62} y={H * 0.55} />
      <Cap x={W * 0.70} y={H * 0.30} vertical />
      <Cap x={W * 0.20} y={H * 0.40} />
      <Cap x={W * 0.55} y={H * 0.82} />
      <Cap x={W * 0.38} y={H * 0.78} vertical />
      <Cap x={W * 0.15} y={H * 0.30} vertical />

      {/* SMD resistors */}
      <Res x={W * 0.30} y={H * 0.12} />
      <Res x={W * 0.45} y={H * 0.80} vertical />
      <Res x={W * 0.65} y={H * 0.48} />
      <Res x={W * 0.22} y={H * 0.72} vertical />
      <Res x={W * 0.52} y={H * 0.60} />
      <Res x={W * 0.40} y={H * 0.15} vertical />

      {/* Board LEDs */}
      <BoardLED x={W * 0.12} y={H * 0.82} color="#22c55e" label="ACT" />
      <BoardLED x={W * 0.18} y={H * 0.82} color="#ef4444" label="PWR" />

      {/* Crystal oscillator */}
      <Rect x={W * 0.42} y={H * 0.55} width={10} height={6} fill={METAL} stroke={METAL_HI} strokeWidth={0.5} cornerRadius={1} />
      <Text x={W * 0.42} y={H * 0.55 + 1} text="19.2M" fontSize={3.5} fontFamily="monospace" fill="rgba(255,255,255,0.3)" width={10} align="center" />
    </Group>
  );
}

/* ══════════════════════════════════════════════════════════
   Main Board Renderer
   ══════════════════════════════════════════════════════════ */
export default function BoardRenderer() {
  const boardModelId = useProjectStore((s) => s.boardModel);
  const boardPosition = useProjectStore((s) => s.boardPosition);
  const board = getBoardModel(boardModelId);

  const W = board.dimensions.width * S;
  const H = board.dimensions.height * S;

  const hdr = board.gpioHeader;
  const hdrX = hdr[0].position.x * S;
  const hdrY = hdr[0].position.y * S;
  const hdrX2 = hdr[1].position.x * S;
  const hdrY2 = hdr[38].position.y * S;
  const hdrW = (hdrX2 - hdrX) + PR * 2 + 10;
  const hdrH = (hdrY2 - hdrY) + PR * 2 + 10;

  return (
    <Group x={boardPosition.x} y={boardPosition.y} draggable onDragEnd={(e) => { useProjectStore.getState().setBoardPosition({ x: e.target.x(), y: e.target.y() }); }}>
      {/* ── drop shadow ── */}
      <Rect x={4} y={4} width={W} height={H} fill="rgba(0,0,0,0.5)" cornerRadius={5} />

      {/* ── PCB substrate (darker edge) ── */}
      <Rect x={-1} y={-1} width={W + 2} height={H + 2} fill={PCB_EDGE} cornerRadius={5} />

      {/* ── PCB solder mask ── */}
      <Rect x={0} y={0} width={W} height={H} fill={PCB} cornerRadius={4} />

      {/* ── solder mask texture (subtle noise) ── */}
      <Rect x={0} y={0} width={W} height={H} fill={SOLDER_MASK} opacity={0.15} cornerRadius={4} />

      {/* ── copper trace network ── */}
      <TraceNetwork W={W} H={H} />

      {/* ── via holes ── */}
      <Vias W={W} H={H} />

      {/* ── ground plane hatching (subtle) ── */}
      {Array.from({ length: Math.floor(W / 12) }).map((_, i) => (
        <Line key={`gp-${i}`} points={[i * 12, 0, i * 12 + H * 0.3, H]} stroke={PCB2} strokeWidth={0.2} opacity={0.2} listening={false} />
      ))}

      {/* ── silkscreen board outline ── */}
      <Rect x={3} y={3} width={W - 6} height={H - 6} fill="transparent" stroke={SILK} strokeWidth={0.3} opacity={0.15} cornerRadius={3} />

      {/* ── Board-specific ICs and passives ── */}
      <BoardComponents id={board.id} W={W} H={H} />

      {/* ── Silkscreen text ── */}
      <Text x={W * 0.13} y={H * 0.92} text={board.name} fontSize={7} fontFamily="monospace" fontStyle="bold" fill={SILK} opacity={0.35} />
      <Text x={W * 0.13} y={H * 0.92 + 9} text="© Raspberry Pi Ltd" fontSize={4.5} fontFamily="monospace" fill={SILK} opacity={0.2} />
      {/* FCC / CE marks */}
      <Text x={W * 0.65} y={H * 0.92} text="FCC" fontSize={4} fontFamily="monospace" fill={SILK} opacity={0.12} />
      <Text x={W * 0.72} y={H * 0.92} text="CE" fontSize={4} fontFamily="monospace" fill={SILK} opacity={0.12} />

      {/* ── GPIO header ── */}
      {/* plastic housing */}
      <Rect x={hdrX - PR - 5} y={hdrY - PR - 5} width={hdrW} height={hdrH} fill="#0c0c12" stroke="#1a1a24" strokeWidth={1.5} cornerRadius={2} />
      {/* housing inner bevel */}
      <Rect x={hdrX - PR - 4} y={hdrY - PR - 4} width={hdrW - 2} height={1.5} fill="rgba(255,255,255,0.04)" cornerRadius={1} />
      {/* header silkscreen label */}
      <Text x={hdrX - PR - 5} y={hdrY - PR - 17} text="J8" fontSize={5.5} fontFamily="monospace" fontStyle="bold" fill={SILK} opacity={0.5} />
      {/* Pin 1 triangle marker */}
      <RegularPolygon x={hdr[0].position.x * S - PR - 10} y={hdr[0].position.y * S} sides={3} radius={3} fill={SILK} opacity={0.3} rotation={90} />

      {/* GPIO pins */}
      {hdr.map((pin) => (
        <PinGroup key={pin.pinNumber} pin={pin} isLeft={pin.pinNumber % 2 === 1} />
      ))}

      {/* ── Ports ── */}
      {board.ports.map((port) => (
        <PortGroup key={port.id} port={port} />
      ))}

      {/* ── Mounting holes ── */}
      {board.mountingHoles.map((hole, i) => (
        <Group key={`hole-${i}`}>
          <Circle x={hole.x * S} y={hole.y * S} radius={S * 2.0} fill={PCB_EDGE} />
          <Circle x={hole.x * S} y={hole.y * S} radius={S * 1.7} fill={COPPER} opacity={0.5} />
          <Circle x={hole.x * S} y={hole.y * S} radius={S * 1.7} fill="transparent" stroke={SILK} strokeWidth={0.3} opacity={0.3} />
          <Circle x={hole.x * S} y={hole.y * S} radius={S * 1.1} fill="#080808" />
          <Circle x={hole.x * S} y={hole.y * S} radius={S * 0.8} fill="#151515" stroke="#2a2a2a" strokeWidth={0.5} />
          {/* highlight */}
          <Circle x={hole.x * S - 1} y={hole.y * S - 1} radius={S * 0.4} fill="rgba(255,255,255,0.05)" />
        </Group>
      ))}
    </Group>
  );
}
