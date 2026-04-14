'use client';

import React, { useCallback } from 'react';
import { Group, Circle, Text, Line, Ellipse, Rect, Arc } from 'react-konva';
import { useSensorStore } from '@/stores/sensorStore';
import { useProjectStore } from '@/stores/projectStore';
import { useCanvasStore } from '@/stores/canvasStore';
import { snapToPosition } from '@/lib/canvas/snap';
import type Konva from 'konva';
import type { PlacedComponent } from '@/stores/projectStore';
import { HOLE_STEP } from '@/lib/canvas/breadboard-layout';
import { resolveCircuit } from '@/lib/simulation/circuit-resolver';
import { getSimulationGpio } from '@/components/layout/TopBar';

/** Distance between anode and cathode pins — exactly 1 breadboard hole */
const LEG_SPACING = HOLE_STEP; // ≈ 7.62 px

const LED_COLORS: Record<string, { body: string; glow: string; lens: string }> = {
  red:   { body: '#cc2222', glow: '#ff4444', lens: '#ff8888' },
  green: { body: '#22aa22', glow: '#44ff44', lens: '#88ff88' },
  blue:  { body: '#2244cc', glow: '#4488ff', lens: '#88aaff' },
};

/**
 * LED rendered so that:
 *  - origin (0, 0) = anode leg tip  → goes into breadboard hole (pin "anode")
 *  - (LEG_SPACING, 0) = cathode leg tip → adjacent hole    (pin "cathode")
 * The dome and body render ABOVE (negative y).
 */
function LEDShape({ comp }: { comp: PlacedComponent }) {
  const isOn = comp.pinStates?.['anode']?.value === 1;
  const colorName = comp.definitionId.replace('led-', '') || 'red';
  const c = LED_COLORS[colorName] || LED_COLORS.red;

  // Centre between the two legs
  const cx = LEG_SPACING / 2;
  const LEG_LEN = 14; // how far legs extend below body

  return (
    <Group>
      {/* Ambient glow when lit */}
      {isOn && (
        <>
          <Circle x={cx} y={-LEG_LEN - 8} radius={22} fill={c.glow} opacity={0.10} listening={false} />
          <Circle x={cx} y={-LEG_LEN - 8} radius={13} fill={c.glow} opacity={0.20} listening={false} />
        </>
      )}

      {/* Anode leg (left, longer) — tip at (0, 0) */}
      <Line points={[0, 0, 0, -LEG_LEN]} stroke="#c0c0c0" strokeWidth={1.2} lineCap="round" />
      {/* Cathode leg (right, slightly shorter) — tip at (LEG_SPACING, 0) */}
      <Line points={[LEG_SPACING, 0, LEG_SPACING, -LEG_LEN + 2]} stroke="#c0c0c0" strokeWidth={1.2} lineCap="round" />

      {/* Flat base / flange of the LED */}
      <Rect x={cx - 5} y={-LEG_LEN - 2} width={10} height={3} fill="#3a3a3a" cornerRadius={0.5} />

      {/* LED dome */}
      <Ellipse
        x={cx} y={-LEG_LEN - 9}
        radiusX={5} radiusY={7}
        fill={isOn ? c.glow : c.body}
        stroke={isOn ? c.lens : '#444'}
        strokeWidth={0.7}
      />
      {/* Specular highlight */}
      <Ellipse x={cx - 1.5} y={-LEG_LEN - 11} radiusX={1.8} radiusY={2.5} fill="rgba(255,255,255,0.30)" listening={false} />
      {isOn && (
        <Ellipse x={cx} y={-LEG_LEN - 9} radiusX={4} radiusY={5.5} fill={c.lens} opacity={0.45} listening={false} />
      )}

      {/* + / − labels */}
      <Text x={-8} y={2} text="+" fontSize={5} fill="#888" listening={false} />
      <Text x={LEG_SPACING + 2} y={2} text="−" fontSize={6} fill="#888" listening={false} />
    </Group>
  );
}

/**
 * Button rendered so:
 *  - (0, 0)          = pin1 leg tip → anode hole
 *  - (LEG_SPACING*2, 0) = pin2 leg tip → 2 holes to the right (standard 6×6mm tactile button)
 * The body renders centred between the four legs.
 */
function ButtonShape({ comp, onPress, onRelease }: { comp: PlacedComponent; onPress: () => void; onRelease: () => void }) {
  const isPressed = comp.pinStates?.['pin1']?.value === 1;
  // A 6×6 mm tactile button straddles 2 columns on each side (5.08mm = 2 × 2.54mm pitch)
  const span = LEG_SPACING * 2; // distance between pin1 and pin2 legs ≈ 15.24px
  const cx = span / 2;
  const LEG_LEN = 4;

  return (
    <Group>
      {/* 4 legs at corners; pin1 = left pair, pin2 = right pair */}
      {[0, span].map((lx, i) => (
        <React.Fragment key={i}>
          <Line points={[lx, 0, lx, -LEG_LEN]} stroke="#c0c0c0" strokeWidth={1.2} lineCap="round" />
        </React.Fragment>
      ))}
      {/* Housing body */}
      <Rect
        x={cx - 7} y={-LEG_LEN - 14}
        width={14} height={14}
        fill="#1a1a1a" stroke="#3a3a3a" strokeWidth={0.8} cornerRadius={1.5}
      />
      {/* Button cap */}
      <Circle
        x={cx} y={-LEG_LEN - 7}
        radius={5}
        fill={isPressed ? '#4a4a4a' : '#6a6a6a'}
        stroke={isPressed ? '#333' : '#555'}
        strokeWidth={0.8}
        onMouseDown={onPress} onMouseUp={onRelease}
        onMouseLeave={onRelease}
        onTouchStart={onPress} onTouchEnd={onRelease}
      />
      {!isPressed && (
        <Circle x={cx - 1.2} y={-LEG_LEN - 8.2} radius={1.8} fill="rgba(255,255,255,0.18)" listening={false} />
      )}
      <Text x={cx - 6} y={2} text="BTN" fontSize={4} fill="#666" listening={false} />
    </Group>
  );
}

/**
 * Resistor: origin at pin1 leg, pin2 at (pin2.x, 0) = (15.24, 0)
 * Body renders centred between the two legs, above the breadboard surface.
 */
/** Buzzer: cylindrical piezo. Origin = positive (+) leg tip. */
function BuzzerShape({ comp }: { comp: PlacedComponent }) {
  const isOn = comp.pinStates?.['positive']?.value === 1;
  const cx = LEG_SPACING / 2;
  const LEG_LEN = 6;
  return (
    <Group>
      {isOn && <Circle x={cx} y={-LEG_LEN - 8} radius={14} fill="#f59e0b" opacity={0.12} listening={false} />}
      <Line points={[0, 0, 0, -LEG_LEN]} stroke="#c0c0c0" strokeWidth={1.2} lineCap="round" />
      <Line points={[LEG_SPACING, 0, LEG_SPACING, -LEG_LEN]} stroke="#c0c0c0" strokeWidth={1.2} lineCap="round" />
      {/* Body */}
      <Ellipse x={cx} y={-LEG_LEN - 6} radiusX={6} radiusY={6} fill={isOn ? '#f59e0b' : '#1a1a1a'} stroke="#333" strokeWidth={0.8} />
      <Ellipse x={cx} y={-LEG_LEN - 6} radiusX={4} radiusY={4} fill={isOn ? '#fbbf24' : '#222'} />
      <Line points={[cx - 2, -LEG_LEN - 6, cx + 2, -LEG_LEN - 6]} stroke={isOn ? '#fff' : '#444'} strokeWidth={0.8} />
      <Line points={[cx, -LEG_LEN - 8, cx, -LEG_LEN - 4]} stroke={isOn ? '#fff' : '#444'} strokeWidth={0.8} />
      <Text x={cx - 6} y={2} text="BUZ" fontSize={4} fill="#666" listening={false} />
    </Group>
  );
}

function ResistorShape() {
  const span = 15.24; // distance between legs (2 holes × 7.62px)
  const cx = span / 2;
  const LEG_LEN = 6;
  // Standard 5-band resistor color bands (330Ω = orange, orange, black, black, gold)
  const BANDS = ['#f97316', '#f97316', '#1a1a1a', '#1a1a1a', '#d4a843'];
  const bodyW = 10;
  const bodyH = 5;
  const bodyX = cx - bodyW / 2;
  const bodyY = -LEG_LEN - bodyH;

  return (
    <Group>
      {/* Legs */}
      <Line points={[0, 0, 0, -LEG_LEN]} stroke="#c0c0c0" strokeWidth={1.2} lineCap="round" />
      <Line points={[span, 0, span, -LEG_LEN]} stroke="#c0c0c0" strokeWidth={1.2} lineCap="round" />
      {/* Body */}
      <Rect x={bodyX} y={bodyY} width={bodyW} height={bodyH} fill="#d4c4a0" stroke="#a08040" strokeWidth={0.5} cornerRadius={1} />
      {/* Color bands */}
      {BANDS.map((color, i) => (
        <Rect key={i} x={bodyX + 1.2 + i * 1.5} y={bodyY + 0.5} width={1.1} height={bodyH - 1} fill={color} />
      ))}
    </Group>
  );
}

// ─── Servo Motor Shape ────────────────────────────────────────────────────────
function ServoShape({ comp }: { comp: PlacedComponent }) {
  const servoAngles = useSensorStore((s) => s.servoAngles);
  // Find which GPIO the signal pin resolves to (or fall back to 0°)
  const angle = Object.values(servoAngles)[0] ?? 0;
  const rad = (angle * Math.PI) / 180;
  const armLen = 22;
  const cx = 24, cy = 12;
  return (
    <Group>
      {/* Body */}
      <Rect x={0} y={0} width={48} height={24} fill="#e8c84a" stroke="#b89a30" strokeWidth={1} cornerRadius={3} />
      <Text x={0} y={6} text="SERVO" fontSize={6} fontFamily="monospace" fill="#333" width={48} align="center" listening={false} />
      {/* Pivot boss */}
      <Circle x={cx} y={cy} radius={6} fill="#888" stroke="#555" strokeWidth={1} />
      {/* Rotating arm */}
      <Line
        points={[cx, cy, cx + Math.sin(rad) * armLen, cy - Math.cos(rad) * armLen]}
        stroke="#333" strokeWidth={3} lineCap="round"
      />
      <Circle x={cx + Math.sin(rad) * armLen} y={cy - Math.cos(rad) * armLen} radius={3} fill="#333" />
      {/* Angle label */}
      <Text x={0} y={26} text={`${angle.toFixed(0)}°`} fontSize={5} fontFamily="monospace" fill="#888" width={48} align="center" listening={false} />
      {/* Wires */}
      <Line points={[4,  24, 4,  30]} stroke="#cc4444" strokeWidth={1.5} />
      <Line points={[24, 24, 24, 30]} stroke="#cc4444" strokeWidth={1.5} />
      <Line points={[44, 24, 44, 30]} stroke="#ffaa00" strokeWidth={1.5} />
    </Group>
  );
}

// ─── HC-SR04 Ultrasonic Sensor Shape ─────────────────────────────────────────
function UltrasonicShape() {
  const dist = useSensorStore((s) => s.distanceCm);
  return (
    <Group>
      <Rect x={0} y={0} width={48} height={20} fill="#2255cc" stroke="#1133aa" strokeWidth={1} cornerRadius={2} />
      {/* Sensor eyes */}
      <Circle x={14} y={10} radius={7} fill="#aaddff" stroke="#88bbdd" strokeWidth={1} />
      <Circle x={34} y={10} radius={7} fill="#aaddff" stroke="#88bbdd" strokeWidth={1} />
      <Circle x={14} y={10} radius={4} fill="#224488" />
      <Circle x={34} y={10} radius={4} fill="#224488" />
      <Text x={0} y={22} text={`${dist.toFixed(0)} cm`} fontSize={5} fontFamily="monospace" fill="#88aaff" width={48} align="center" listening={false} />
    </Group>
  );
}

// ─── DHT22 Temp/Humidity Sensor ────────────────────────────────────────────────
function DHT22Shape() {
  const temp = useSensorStore((s) => s.temperatureC);
  const hum  = useSensorStore((s) => s.humidityPct);
  return (
    <Group>
      <Rect x={0} y={0} width={36} height={36} fill="#1a1a2e" stroke="#4444aa" strokeWidth={1} cornerRadius={3} />
      <Text x={0} y={3}  text="DHT22" fontSize={5.5} fontFamily="monospace" fill="#6688ff" width={36} align="center" listening={false} />
      <Text x={0} y={12} text={`${temp.toFixed(1)}°C`} fontSize={5} fontFamily="monospace" fill="#ff8844" width={36} align="center" listening={false} />
      <Text x={0} y={20} text={`${hum.toFixed(0)}% RH`} fontSize={5} fontFamily="monospace" fill="#44aaff" width={36} align="center" listening={false} />
      {/* Vent holes */}
      {[6,14,22,30].map((x) => <Circle key={x} x={x} y={31} radius={1.2} fill="#444" />)}
    </Group>
  );
}

// ─── DC Motor Shape ────────────────────────────────────────────────────────────
function DCMotorShape({ comp }: { comp: PlacedComponent }) {
  const motorStates = useSensorStore((s) => s.motorStates);
  const state = Object.values(motorStates)[0];
  const dir   = state?.direction ?? 'stop';
  const color = dir === 'forward' ? '#44ff88' : dir === 'backward' ? '#ff8844' : '#666';
  return (
    <Group>
      <Circle x={20} y={20} radius={19} fill="#444" stroke="#666" strokeWidth={1.5} />
      <Circle x={20} y={20} radius={13} fill="#333" />
      <Text x={0} y={14} text="M" fontSize={14} fontFamily="monospace" fill="#ccc" fontStyle="bold" width={40} align="center" listening={false} />
      {/* Shaft */}
      <Rect x={38} y={17} width={8} height={6} fill="#999" cornerRadius={1} />
      {/* Status ring */}
      <Circle x={20} y={20} radius={19} stroke={color} strokeWidth={2} fill="transparent" opacity={dir !== 'stop' ? 0.8 : 0.2} />
      <Text x={0} y={40} text={dir} fontSize={4.5} fontFamily="monospace" fill={color} width={40} align="center" listening={false} />
    </Group>
  );
}

// ─── RGB LED Shape ────────────────────────────────────────────────────────────
function RGBLedShape({ comp }: { comp: PlacedComponent }) {
  const r = comp.pinStates?.['red']?.value   === 1 ? 255 : 40;
  const g = comp.pinStates?.['green']?.value === 1 ? 255 : 40;
  const b = comp.pinStates?.['blue']?.value  === 1 ? 255 : 40;
  const color = `rgb(${r},${g},${b})`;
  const isOn  = r > 40 || g > 40 || b > 40;
  return (
    <Group>
      {isOn && <Circle x={18} y={-12} radius={20} fill={color} opacity={0.15} listening={false} />}
      {/* Body */}
      <Rect x={0} y={-18} width={36} height={16} fill="#222" stroke="#555" strokeWidth={1} cornerRadius={2} />
      <Circle x={18} y={-10} radius={7} fill={color} stroke="#888" strokeWidth={0.5} />
      {/* Legs */}
      {[4, 12, 20, 30].map((x, i) => (
        <Line key={i} points={[x, 0, x, 8]} stroke={['#cc3333','#33cc33','#3366ff','#888888'][i]} strokeWidth={1.5} />
      ))}
      <Text x={0} y={9} text="R G B GND" fontSize={4} fontFamily="monospace" fill="#666" width={36} align="center" listening={false} />
    </Group>
  );
}

// ─── Potentiometer Shape ───────────────────────────────────────────────────────
function PotentiometerShape() {
  const pct = useSensorStore((s) => s.potentiometerPct);
  const angle = ((pct / 100) * 270 - 135) * (Math.PI / 180);
  const r = 12, cx = 16, cy = 16;
  return (
    <Group>
      <Circle x={cx} y={cy} radius={16} fill="#555" stroke="#777" strokeWidth={1} />
      <Circle x={cx} y={cy} radius={10} fill="#333" />
      {/* Knob indicator line */}
      <Line
        points={[cx, cy, cx + Math.cos(angle) * r, cy + Math.sin(angle) * r]}
        stroke="#ffcc00" strokeWidth={2} lineCap="round"
      />
      <Text x={0} y={33} text={`${pct.toFixed(0)}%`} fontSize={5} fontFamily="monospace" fill="#ffcc00" width={32} align="center" listening={false} />
    </Group>
  );
}

// ─── PIR Motion Sensor Shape ───────────────────────────────────────────────────
function PIRShape() {
  const detected = useSensorStore((s) => s.pirDetected);
  return (
    <Group>
      {/* Dome */}
      <Ellipse x={16} y={14} radiusX={15} radiusY={13} fill={detected ? '#ffdd44' : '#eeeedd'} stroke="#aaa" strokeWidth={1} />
      <Ellipse x={16} y={14} radiusX={10} radiusY={8}  fill={detected ? '#ffaa00' : '#ddddc0'} />
      <Text x={0} y={28} text={detected ? '⚡ MOTION' : 'PIR'} fontSize={5} fontFamily="monospace" fill={detected ? '#ff6600' : '#888'} width={32} align="center" listening={false} />
    </Group>
  );
}

// Touchscreen display is fully handled by TouchscreenDisplayWrapper in KonvaCanvas
// (draggable, interactive). Nothing rendered here.

function SingleComponent({ comp }: { comp: PlacedComponent }) {
  const breadboards = useProjectStore((s) => s.breadboards);
  const updateComponentPosition = useProjectStore((s) => s.updateComponentPosition);
  const setComponentPinState = useProjectStore((s) => s.setComponentPinState);
  const gridSize              = useCanvasStore((s) => s.gridSize);
  const selectedComponentId   = useCanvasStore((s) => s.selectedComponentId);
  const setSelectedComponentId = useCanvasStore((s) => s.setSelectedComponentId);
  const setContextMenu        = useCanvasStore((s) => s.setContextMenu);

  const isSelected = selectedComponentId === comp.id;

  // Touchscreen is rendered and dragged entirely by TouchscreenDisplayWrapper in KonvaCanvas
  if (comp.definitionId === 'touchscreen-7') return null;

  const isLED          = comp.definitionId.startsWith('led-');
  const isRGBLed       = comp.definitionId === 'rgb-led';
  const isButton       = comp.definitionId === 'button';
  const isResistor     = comp.definitionId === 'resistor';
  const isBuzzer       = comp.definitionId === 'buzzer';
  const isServo        = comp.definitionId === 'servo';
  const isUltrasonic   = comp.definitionId === 'hc-sr04';
  const isDHT22        = comp.definitionId === 'dht22';
  const isDCMotor      = comp.definitionId === 'dc-motor';
  const isPotentiometer= comp.definitionId === 'potentiometer';
  const isPIR          = comp.definitionId === 'pir-sensor';

  const handleDragEnd = useCallback((e: Konva.KonvaEventObject<DragEvent>) => {
    const pos = { x: e.target.x(), y: e.target.y() };
    const snapped = snapToPosition(pos, breadboards, gridSize, 15);
    e.target.x(snapped.x);
    e.target.y(snapped.y);
    updateComponentPosition(comp.id, { x: snapped.x, y: snapped.y });
  }, [comp.id, breadboards, gridSize, updateComponentPosition]);

  const handleClick = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true; // prevent stage click from immediately deselecting
    setSelectedComponentId(isSelected ? null : comp.id);
    setContextMenu(null);
  }, [comp.id, isSelected, setSelectedComponentId, setContextMenu]);

  const handleContextMenu = useCallback((e: Konva.KonvaEventObject<PointerEvent>) => {
    e.evt.preventDefault();
    e.cancelBubble = true;
    setSelectedComponentId(comp.id);
    const stage = e.target.getStage();
    if (!stage) return;
    const container = stage.container().getBoundingClientRect();
    setContextMenu({
      x: e.evt.clientX - container.left,
      y: e.evt.clientY - container.top,
      componentId: comp.id,
    });
  }, [comp.id, setSelectedComponentId, setContextMenu]);

  /** Find which GPIO pin is connected to this button via wires/breadboard and update the mock */
  const updateButtonGpio = useCallback((value: 0 | 1) => {
    const s = useProjectStore.getState();
    const circuit = resolveCircuit(s.components, s.wires, s.boardModel);
    const conn = circuit.get(comp.id);
    if (conn?.gpioPin != null) {
      getSimulationGpio()?.setInputValue(conn.gpioPin, value);
    }
  }, [comp.id]);

  const handlePress = useCallback(() => {
    setComponentPinState(comp.id, 'pin1', { value: 1 });
    setComponentPinState(comp.id, 'pin2', { value: 1 });
    updateButtonGpio(1);
  }, [comp.id, setComponentPinState, updateButtonGpio]);

  const handleRelease = useCallback(() => {
    setComponentPinState(comp.id, 'pin1', { value: 0 });
    setComponentPinState(comp.id, 'pin2', { value: 0 });
    updateButtonGpio(0);
  }, [comp.id, setComponentPinState, updateButtonGpio]);

  return (
    <Group
      x={comp.position.x} y={comp.position.y}
      draggable
      onDragEnd={handleDragEnd}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
    >
      {/* Selection highlight ring — drawn behind everything */}
      {isSelected && (
        <Rect
          x={-10} y={-30} width={60} height={60}
          stroke="#22c55e" strokeWidth={1.5}
          dash={[4, 3]} cornerRadius={4}
          fill="rgba(34,197,94,0.06)"
          listening={false}
        />
      )}
      {isLED           && <LEDShape comp={comp} />}
      {isRGBLed        && <RGBLedShape comp={comp} />}
      {isButton        && <ButtonShape comp={comp} onPress={handlePress} onRelease={handleRelease} />}
      {isResistor      && <ResistorShape />}
      {isBuzzer        && <BuzzerShape comp={comp} />}
      {isServo         && <ServoShape comp={comp} />}
      {isUltrasonic    && <UltrasonicShape />}
      {isDHT22         && <DHT22Shape />}
      {isDCMotor       && <DCMotorShape comp={comp} />}
      {isPotentiometer && <PotentiometerShape />}
      {isPIR           && <PIRShape />}
      {isLED && (
        <Text
          x={LEG_SPACING / 2 - 12} y={6}
          text={comp.definitionId.replace('led-', '').toUpperCase()}
          fontSize={4.5} fontFamily="monospace" fill="#666" width={24} align="center"
          listening={false}
        />
      )}
    </Group>
  );
}

export default function ComponentRenderer() {
  const components = useProjectStore((s) => s.components);
  const compList = Object.values(components);
  if (compList.length === 0) return null;
  return <>{compList.map((comp) => <SingleComponent key={comp.id} comp={comp} />)}</>;
}
