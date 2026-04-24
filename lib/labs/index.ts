import { useProjectStore } from '@/stores/projectStore';
import { getComponentDefinition } from '@/lib/components';

// ── Validation helper ─────────────────────────────────────────────────────────
// Checks if any wire connects the given board pin to a component of given type+pin
export function hasWire(
  wires: Record<string, { startPinRef: Record<string, unknown>; endPinRef: Record<string, unknown> }>,
  components: Record<string, { definitionId: string }>,
  defId: string,
  pinId: string,
  boardPin: number,
): boolean {
  const compIds = Object.entries(components)
    .filter(([, c]) => c.definitionId === defId)
    .map(([id]) => id);
  return Object.values(wires).some((w) => {
    const s = w.startPinRef as { type: string; pinNumber?: number; componentId?: string; pinId?: string };
    const e = w.endPinRef   as { type: string; pinNumber?: number; componentId?: string; pinId?: string };
    if (s.type === 'board' && e.type === 'component')
      return s.pinNumber === boardPin && compIds.includes(e.componentId ?? '') && e.pinId === pinId;
    if (e.type === 'board' && s.type === 'component')
      return e.pinNumber === boardPin && compIds.includes(s.componentId ?? '') && s.pinId === pinId;
    return false;
  });
}

// ── Lab step type ─────────────────────────────────────────────────────────────
export interface LabStep {
  id: string;
  label: string;       // Short: "LED anode → GPIO17 (Pin 11)"
  detail: string;      // Longer instruction
  wireColor: string;   // hex for UI dot
  validate: (
    wires: Record<string, { startPinRef: Record<string, unknown>; endPinRef: Record<string, unknown> }>,
    components: Record<string, { definitionId: string }>,
  ) => boolean;
}

export interface LabDefinition {
  id: string;
  emoji: string;
  title: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedMinutes: number;
  description: string;
  components: { definitionId: string; label: string }[];
  steps: LabStep[];
  code: string;
  /** Places only the components (no wires) so user wires themselves */
  placeComponents: () => void;
}

// ── Home Lab ──────────────────────────────────────────────────────────────────
const HOME_CODE = `from gpiozero import LED, MotionSensor
from Adafruit_DHT import read_retry, DHT22
import time

pir   = MotionSensor(4)
light = LED(17)
print("Smart Home running…")
while True:
    if pir.motion_detected:
        light.on()
        print("Motion → lights ON")
    else:
        light.off()
    time.sleep(1)
`;

export const homeLab: LabDefinition = {
  id: 'home',
  emoji: '🏠',
  title: 'Smart Home Wiring Lab',
  difficulty: 'beginner',
  estimatedMinutes: 10,
  description: 'Wire a PIR motion sensor and an LED to build a motion-activated light. Follow each step and watch for ✅ as you connect each wire.',
  components: [
    { definitionId: 'pir-sensor', label: 'PIR Motion Sensor' },
    { definitionId: 'led-green',  label: 'Green LED (room light)' },
  ],
  steps: [
    { id: 'pir-out', label: 'PIR OUT → GPIO4 (Pin 7)',      detail: 'Yellow signal wire from PIR OUT to board pin 7 (GPIO4).', wireColor: '#eab308',
      validate: (w, c) => hasWire(w as never, c, 'pir-sensor', 'out', 7) },
    { id: 'pir-vcc', label: 'PIR VCC → 3.3V (Pin 1)',       detail: 'Red power wire from PIR VCC to board pin 1 (3.3V).', wireColor: '#ef4444',
      validate: (w, c) => hasWire(w as never, c, 'pir-sensor', 'vcc', 1) },
    { id: 'pir-gnd', label: 'PIR GND → GND (Pin 6)',        detail: 'Black wire from PIR GND to board pin 6 (GND).', wireColor: '#6b7280',
      validate: (w, c) => hasWire(w as never, c, 'pir-sensor', 'gnd', 6) },
    { id: 'led-sig', label: 'LED Anode → GPIO17 (Pin 11)',  detail: 'Green wire from LED anode (+) to board pin 11 (GPIO17).', wireColor: '#22c55e',
      validate: (w, c) => hasWire(w as never, c, 'led-green', 'anode', 11) },
    { id: 'led-gnd', label: 'LED Cathode → GND (Pin 14)',   detail: 'Black wire from LED cathode (−) to board pin 14 (GND).', wireColor: '#6b7280',
      validate: (w, c) => hasWire(w as never, c, 'led-green', 'cathode', 14) },
  ],
  code: HOME_CODE,
  placeComponents() {
    useProjectStore.setState({ components: {}, wires: {}, breadboards: {}, past: [], future: [] });
    const { addComponent, boardPosition: bp } = useProjectStore.getState();
    addComponent(getComponentDefinition('pir-sensor')!, { x: bp.x + 330, y: bp.y + 20 });
    addComponent(getComponentDefinition('led-green')!,  { x: bp.x + 330, y: bp.y + 120 });
  },
};

// ── Farm Lab ──────────────────────────────────────────────────────────────────
const FARM_CODE = `from gpiozero import OutputDevice, LED
from Adafruit_DHT import read_retry, DHT22
import time, random

pump   = OutputDevice(27, active_high=True)
status = LED(17)
MOISTURE_THRESHOLD = 40

print("Smart Farm running…")
while True:
    moisture = random.randint(20, 80)
    _, temp  = read_retry(DHT22, 22)
    print(f"Moisture: {moisture}%  Temp: {temp:.1f}°C")
    if moisture < MOISTURE_THRESHOLD:
        pump.on(); status.on()
        print("💧 Pump ON")
        time.sleep(3)
        pump.off(); status.off()
    time.sleep(5)
`;

export const farmLab: LabDefinition = {
  id: 'farm',
  emoji: '🌱',
  title: 'Smart Farm Wiring Lab',
  difficulty: 'intermediate',
  estimatedMinutes: 12,
  description: 'Wire a DHT22 climate sensor, a relay for the water pump, and an LED status indicator. When soil moisture drops below 40%, the pump fires automatically.',
  components: [
    { definitionId: 'dht22',     label: 'DHT22 Temperature & Humidity' },
    { definitionId: 'relay',     label: 'Relay (water pump control)' },
    { definitionId: 'led-green', label: 'Green LED (pump status)' },
  ],
  steps: [
    { id: 'dht-data', label: 'DHT22 DATA → GPIO22 (Pin 15)', detail: 'White data wire from DHT22 DATA pin to board pin 15 (GPIO22).', wireColor: '#f8fafc',
      validate: (w, c) => hasWire(w as never, c, 'dht22', 'data', 15) },
    { id: 'dht-vcc',  label: 'DHT22 VCC → 3.3V (Pin 1)',    detail: 'Red power wire from DHT22 VCC to board pin 1 (3.3V).', wireColor: '#ef4444',
      validate: (w, c) => hasWire(w as never, c, 'dht22', 'vcc', 1) },
    { id: 'dht-gnd',  label: 'DHT22 GND → GND (Pin 6)',     detail: 'Black wire from DHT22 GND to board pin 6.', wireColor: '#6b7280',
      validate: (w, c) => hasWire(w as never, c, 'dht22', 'gnd', 6) },
    { id: 'rel-sig',  label: 'Relay SIGNAL → GPIO27 (Pin 13)', detail: 'Orange wire from relay SIGNAL to board pin 13 (GPIO27).', wireColor: '#f97316',
      validate: (w, c) => hasWire(w as never, c, 'relay', 'signal', 13) },
    { id: 'rel-vcc',  label: 'Relay VCC → 5V (Pin 2)',      detail: 'Red wire from relay VCC to board pin 2 (5V).', wireColor: '#ef4444',
      validate: (w, c) => hasWire(w as never, c, 'relay', 'vcc', 2) },
    { id: 'rel-gnd',  label: 'Relay GND → GND (Pin 14)',    detail: 'Black wire from relay GND to board pin 14.', wireColor: '#6b7280',
      validate: (w, c) => hasWire(w as never, c, 'relay', 'gnd', 14) },
    { id: 'led-sig',  label: 'LED Anode → GPIO17 (Pin 11)', detail: 'Green wire from LED anode to board pin 11 (GPIO17).', wireColor: '#22c55e',
      validate: (w, c) => hasWire(w as never, c, 'led-green', 'anode', 11) },
    { id: 'led-gnd',  label: 'LED Cathode → GND (Pin 9)',   detail: 'Black wire from LED cathode to board pin 9 (GND).', wireColor: '#6b7280',
      validate: (w, c) => hasWire(w as never, c, 'led-green', 'cathode', 9) },
  ],
  code: FARM_CODE,
  placeComponents() {
    useProjectStore.setState({ components: {}, wires: {}, breadboards: {}, past: [], future: [] });
    const { addComponent, boardPosition: bp } = useProjectStore.getState();
    addComponent(getComponentDefinition('dht22')!,     { x: bp.x + 330, y: bp.y });
    addComponent(getComponentDefinition('relay')!,     { x: bp.x + 330, y: bp.y + 100 });
    addComponent(getComponentDefinition('led-green')!, { x: bp.x + 330, y: bp.y + 195 });
  },
};

// ── Robot Lab ─────────────────────────────────────────────────────────────────
const ROBOT_CODE = `from gpiozero import Robot, DistanceSensor
import time

robot  = Robot(left=(20, 21), right=(16, 12))
sensor = DistanceSensor(echo=24, trigger=23, max_distance=1)

print("Obstacle Robot running…")
while True:
    dist = sensor.distance * 100  # cm
    print(f"Distance: {dist:.1f} cm")
    if dist < 25:
        robot.backward(0.5)
        time.sleep(0.4)
        robot.right(0.5)
        time.sleep(0.3)
    else:
        robot.forward(0.6)
    time.sleep(0.05)
`;

export const robotLab: LabDefinition = {
  id: 'robot',
  emoji: '🤖',
  title: 'Obstacle Robot Wiring Lab',
  difficulty: 'advanced',
  estimatedMinutes: 20,
  description: 'Wire an HC-SR04 ultrasonic sensor and two DC motors. When an obstacle is detected under 25 cm, the robot reverses and turns.',
  components: [
    { definitionId: 'hc-sr04',  label: 'HC-SR04 Ultrasonic Sensor' },
    { definitionId: 'dc-motor', label: 'DC Motor (Left wheel)' },
    { definitionId: 'dc-motor', label: 'DC Motor (Right wheel)' },
  ],
  steps: [
    { id: 'son-trig', label: 'Sonar TRIG → GPIO23 (Pin 16)', detail: 'Yellow wire from HC-SR04 TRIG to board pin 16 (GPIO23).', wireColor: '#eab308',
      validate: (w, c) => hasWire(w as never, c, 'hc-sr04', 'trig', 16) },
    { id: 'son-echo', label: 'Sonar ECHO → GPIO24 (Pin 18)', detail: 'Blue wire from HC-SR04 ECHO to board pin 18 (GPIO24).', wireColor: '#3b82f6',
      validate: (w, c) => hasWire(w as never, c, 'hc-sr04', 'echo', 18) },
    { id: 'son-vcc',  label: 'Sonar VCC → 5V (Pin 2)',       detail: 'Red wire from HC-SR04 VCC to board pin 2 (5V).', wireColor: '#ef4444',
      validate: (w, c) => hasWire(w as never, c, 'hc-sr04', 'vcc', 2) },
    { id: 'son-gnd',  label: 'Sonar GND → GND (Pin 6)',      detail: 'Black wire from HC-SR04 GND to board pin 6.', wireColor: '#6b7280',
      validate: (w, c) => hasWire(w as never, c, 'hc-sr04', 'gnd', 6) },
    { id: 'mot-in1',  label: 'Motor IN1 → GPIO20 (Pin 38)',  detail: 'Orange wire from left motor IN1 to board pin 38 (GPIO20).', wireColor: '#f97316',
      validate: (w, c) => hasWire(w as never, c, 'dc-motor', 'in1', 38) },
    { id: 'mot-in2',  label: 'Motor IN2 → GPIO21 (Pin 40)',  detail: 'Orange wire from left motor IN2 to board pin 40 (GPIO21).', wireColor: '#f97316',
      validate: (w, c) => hasWire(w as never, c, 'dc-motor', 'in2', 40) },
  ],
  code: ROBOT_CODE,
  placeComponents() {
    useProjectStore.setState({ components: {}, wires: {}, breadboards: {}, past: [], future: [] });
    const { addComponent, boardPosition: bp } = useProjectStore.getState();
    addComponent(getComponentDefinition('hc-sr04')!,  { x: bp.x + 330, y: bp.y });
    addComponent(getComponentDefinition('dc-motor')!, { x: bp.x + 330, y: bp.y + 100 });
    addComponent(getComponentDefinition('dc-motor')!, { x: bp.x + 330, y: bp.y + 190 });
  },
};

export const labs: LabDefinition[] = [homeLab, farmLab, robotLab];
export function getLab(id: string) { return labs.find(l => l.id === id); }
