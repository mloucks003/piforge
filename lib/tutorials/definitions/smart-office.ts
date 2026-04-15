import type { TutorialDefinition } from '../types';
import { useProjectStore } from '@/stores/projectStore';
import { useCanvasStore } from '@/stores/canvasStore';
import { getComponentDefinition } from '@/lib/components';

const uid = () => Math.random().toString(36).slice(2, 9);

function setupSmartOfficeCircuit() {
  // Clear canvas and start fresh
  useProjectStore.setState({ components: {}, wires: {}, breadboards: {}, past: [], future: [] });

  // Enable office floor plan
  useCanvasStore.getState().setActiveEnvironment('office');

  const { addComponent, addWire, boardPosition: bp, boardModel } = useProjectStore.getState();
  const boardId = boardModel;

  // Place components to the right of the board
  const pirId    = addComponent(getComponentDefinition('pir-sensor')!, { x: bp.x + 300, y: bp.y });
  const btnId    = addComponent(getComponentDefinition('button')!,     { x: bp.x + 300, y: bp.y + 60 });
  const ledGrId  = addComponent(getComponentDefinition('led-green')!,  { x: bp.x + 300, y: bp.y + 120 });
  const ledBlId  = addComponent(getComponentDefinition('led-blue')!,   { x: bp.x + 300, y: bp.y + 180 });
  const dht22Id  = addComponent(getComponentDefinition('dht22')!,      { x: bp.x + 300, y: bp.y + 240 });
  const relayId  = addComponent(getComponentDefinition('relay')!,      { x: bp.x + 300, y: bp.y + 310 });

  const w = (color: string, pinNum: number, compId: string, pinId: string) =>
    addWire({ id: uid(), color: color as never, path: [], validated: true, warnings: [],
      startPinRef: { type: 'board', boardId, pinNumber: pinNum },
      endPinRef:   { type: 'component', componentId: compId, pinId } });

  // PIR sensor — OUT→GPIO4(7), VCC→3V3(1), GND→GND(6)
  w('yellow', 7,  pirId,   'out');
  w('red',    1,  pirId,   'vcc');
  w('black',  6,  pirId,   'gnd');

  // Button (manual override) — pin1→GPIO2(3), pin2→GND(9)
  w('orange', 3,  btnId,   'pin1');
  w('black',  9,  btnId,   'pin2');

  // Green LED (main office light) — anode→GPIO17(11), cathode→GND(14)
  w('green',  11, ledGrId, 'anode');
  w('black',  14, ledGrId, 'cathode');

  // Blue LED (status indicator) — anode→GPIO18(12), cathode→GND(20)
  w('blue',   12, ledBlId, 'anode');
  w('black',  20, ledBlId, 'cathode');

  // DHT22 (climate) — data→GPIO22(15), VCC→3V3(17), GND→GND(25)
  w('white',  15, dht22Id, 'data');
  w('red',    17, dht22Id, 'vcc');
  w('black',  25, dht22Id, 'gnd');

  // Relay (HVAC) — signal→GPIO27(13), VCC→5V(2), GND→GND(30)
  w('yellow', 13, relayId, 'signal');
  w('red',    2,  relayId, 'vcc');
  w('black',  30, relayId, 'gnd');
}

export const smartOfficeTutorial: TutorialDefinition = {
  id: 'smart-office-tutorial',
  title: '🏢 Smart Office Automation',
  description: 'Automate a full office: PIR occupancy detection, lighting control, a manual override button, climate monitoring, and HVAC relay. Circuit is auto-wired — follow along to run it.',
  difficulty: 'advanced',
  estimatedMinutes: 15,
  onStart: setupSmartOfficeCircuit,
  steps: [
    {
      id: 'welcome',
      title: '🏢 Circuit Auto-Built!',
      content: 'The Smart Office circuit is wired and ready:\n\n• 🔴 PIR sensor → GPIO4 (occupancy detection)\n• 🔘 Button → GPIO2 (manual light override)\n• 🟢 Green LED → GPIO17 (main office light)\n• 🔵 Blue LED → GPIO18 (status indicator)\n• 🌡️ DHT22 → GPIO22 (climate monitoring)\n• ⚡ Relay → GPIO27 (HVAC control)\n\nAll power and ground connections are in place.',
      completionCondition: { type: 'manual' },
      hints: ['Scroll and zoom the canvas to explore all six components.'],
      tourTarget: 'canvas',
    },
    {
      id: 'floor-plan',
      title: 'Enable the Office Floor Plan',
      content: 'Click the 🏢 building icon in the top bar to enable the office floor plan. You\'ll see Open Plan, Server Room, Break Room, and Meeting Room.\n\nTry dragging your components into context — PIR in the open-plan area, relay in the server room.',
      completionCondition: { type: 'manual' },
      hints: ['The 🏠 and 🏢 icons are in the top bar, near the centre-right.'],
      tourTarget: 'env-picker',
    },
    {
      id: 'understand-logic',
      title: 'How the Automation Works',
      content: 'The office controller has two modes:\n\n**AUTO mode** — PIR detects presence → lights on. No motion for 5 minutes → lights off. Saves energy automatically.\n\n**MANUAL mode** — Press the button to toggle lights regardless of occupancy. Useful for meetings, cleaners, or presentations.\n\nThe DHT22 triggers the HVAC relay when temperature rises above threshold.',
      completionCondition: { type: 'manual' },
      hints: ['In the simulation the button state is toggled via the Circuit Inspector or by clicking the component on the canvas.'],
      tourTarget: 'canvas',
    },
    {
      id: 'load-code',
      title: 'Load the Office Code',
      content: 'Open the **Projects** tab in the left sidebar. Find **🏢 Smart Office Automation** and click **Load Code**. The Python script includes:\n\n• Occupancy auto-mode\n• Button manual override\n• Climate reading every 20 cycles\n• HVAC relay trigger\n• HTTP API logging',
      completionCondition: { type: 'code-contains', snippet: 'Smart Office' },
      hints: ['Projects tab is the third icon in the left sidebar. Look in the Advanced / IoT section.'],
      tourTarget: 'sidebar',
    },
    {
      id: 'run',
      title: '▶ Run the Simulation!',
      content: 'Click ▶ Play to start. Watch the console:\n\n• 🏢 System startup message\n• 🚶 Motion detected → lights on\n• 💡 No motion → lights off\n• 🌡️ Climate reported every 20 cycles\n• 🌬️ HVAC trigger when temp is high\n• 🔘 Override button toggles AUTO/MANUAL',
      completionCondition: { type: 'simulation-started' },
      hints: ['First run downloads Python runtime (~6 MB). If the console says "Loading Python runtime…" just wait.'],
      tourTarget: 'run-btn',
    },
  ],
};
