import type { TutorialDefinition } from '../types';
import { useProjectStore } from '@/stores/projectStore';
import { useCanvasStore } from '@/stores/canvasStore';
import { getComponentDefinition } from '@/lib/components';

const uid = () => Math.random().toString(36).slice(2, 9);

function setupSmartHomeCircuit() {
  // Clear canvas and start fresh
  useProjectStore.setState({ components: {}, wires: {}, breadboards: {}, past: [], future: [] });

  // Enable home floor plan
  useCanvasStore.getState().setActiveEnvironment('home');

  const { addComponent, addWire, boardPosition: bp, boardModel } = useProjectStore.getState();
  const boardId = boardModel;

  // Place components to the right of the board
  const pirId    = addComponent(getComponentDefinition('pir-sensor')!, { x: bp.x + 300, y: bp.y });
  const dht22Id  = addComponent(getComponentDefinition('dht22')!,      { x: bp.x + 300, y: bp.y + 70 });
  const ledGrId  = addComponent(getComponentDefinition('led-green')!,  { x: bp.x + 300, y: bp.y + 140 });
  const ledBlId  = addComponent(getComponentDefinition('led-blue')!,   { x: bp.x + 300, y: bp.y + 200 });
  const buzzId   = addComponent(getComponentDefinition('buzzer')!,     { x: bp.x + 300, y: bp.y + 260 });

  const w = (color: string, pinNum: number, compId: string, pinId: string) =>
    addWire({ id: uid(), color: color as never, path: [], validated: true, warnings: [],
      startPinRef: { type: 'board', boardId, pinNumber: pinNum },
      endPinRef:   { type: 'component', componentId: compId, pinId } });

  // PIR sensor — OUT→GPIO4(7), VCC→3V3(1), GND→GND(6)
  w('yellow', 7,  pirId,   'out');
  w('red',    1,  pirId,   'vcc');
  w('black',  6,  pirId,   'gnd');

  // DHT22 — data→GPIO22(15), VCC→3V3(17), GND→GND(9)
  w('white',  15, dht22Id, 'data');
  w('red',    17, dht22Id, 'vcc');
  w('black',  9,  dht22Id, 'gnd');

  // Green LED (living room) — anode→GPIO17(11), cathode→GND(14)
  w('green',  11, ledGrId, 'anode');
  w('black',  14, ledGrId, 'cathode');

  // Blue LED (bedroom) — anode→GPIO27(13), cathode→GND(20)
  w('blue',   13, ledBlId, 'anode');
  w('black',  20, ledBlId, 'cathode');

  // Buzzer (doorbell) — positive→GPIO18(12), negative→GND(25)
  w('orange', 12, buzzId,  'positive');
  w('black',  25, buzzId,  'negative');
}

export const smartHomeTutorial: TutorialDefinition = {
  id: 'smart-home-hub-tutorial',
  title: '🏠 Smart Home Hub',
  description: 'Build a full Smart Home controller with motion detection, climate monitoring, and a doorbell. The circuit is auto-wired for you — follow along to understand and run it.',
  difficulty: 'advanced',
  estimatedMinutes: 15,
  onStart: setupSmartHomeCircuit,
  steps: [
    {
      id: 'welcome',
      title: '🏠 Circuit Auto-Built!',
      content: 'The Smart Home Hub circuit has been automatically placed and wired:\n\n• 🔴 PIR sensor → GPIO4 (motion detection)\n• 🌡️ DHT22 → GPIO22 (temperature + humidity)\n• 🟢 Green LED → GPIO17 (living room light)\n• 🔵 Blue LED → GPIO27 (bedroom light)\n• 🔔 Buzzer → GPIO18 (doorbell)\n\nAll power and ground wires are connected. Explore the canvas!',
      completionCondition: { type: 'manual' },
      hints: ['Scroll and zoom the canvas to see all the components and wires.'],
      tourTarget: 'canvas',
    },
    {
      id: 'floor-plan',
      title: 'Enable the Home Floor Plan',
      content: 'Click the 🏠 house icon in the top bar (the small icon group near the centre-right). The floor plan overlay appears — you can see Living Room, Bedroom, Kitchen, and Hallway.\n\nDrag the sensors into their rooms: PIR near the front door, DHT22 in the bedroom.',
      completionCondition: { type: 'manual' },
      hints: ['The 🏠 and 🏢 icons are in the top bar, next to the ? button.'],
      tourTarget: 'env-picker',
    },
    {
      id: 'circuit-inspector',
      title: 'Inspect the Wiring',
      content: 'Open the **Circuit** tab in the right panel to see every wire listed and colour-coded:\n\n• Yellow = signal (PIR → GPIO)\n• Red = 3.3V power\n• Black = ground\n• White = DHT22 data\n• Green / Blue = LED signal\n• Orange = buzzer\n\nAll wires should show as ✅ validated.',
      completionCondition: { type: 'manual' },
      hints: ['Click "Circuit" in the right panel header to see wire details.'],
      tourTarget: 'canvas',
    },
    {
      id: 'load-code',
      title: 'Load the Smart Home Code',
      content: 'Open the **Projects** tab in the left sidebar. Find **🏠 Smart Home Hub** and click **Load Code**. The full Python script will appear in the Editor — it uses MQTT, DHT22 readings, motion lighting, and a doorbell cycle.',
      completionCondition: { type: 'code-contains', snippet: 'Smart Home Hub' },
      hints: ['Projects tab is the third icon in the left sidebar. Scroll down to the Advanced section to find Smart Home Hub.'],
      tourTarget: 'sidebar',
    },
    {
      id: 'run',
      title: '▶ Run the Simulation!',
      content: 'Click ▶ Play in the top bar. Watch the console:\n\n• 🚶 Motion detected → living room light turns on\n• 💤 No motion → lights off after timeout\n• 🌡️ Temperature printed every 10 cycles\n• 🔔 Doorbell rings every 30 cycles\n\nThe simulation runs entirely in your browser — no Pi required!',
      completionCondition: { type: 'simulation-started' },
      hints: ['First run downloads the Python runtime (~6 MB). Give it 10–15 seconds on first launch.'],
      tourTarget: 'run-btn',
    },
  ],
};
