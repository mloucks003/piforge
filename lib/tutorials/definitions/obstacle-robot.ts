import type { TutorialDefinition } from '../types';
import { useProjectStore } from '@/stores/projectStore';
import { getComponentDefinition } from '@/lib/components';

const uid = () => Math.random().toString(36).slice(2, 9);

function setupObstacleRobotCircuit() {
  useProjectStore.setState({ components: {}, wires: {}, breadboards: {}, past: [], future: [] });

  const { addComponent, addWire, boardPosition: bp, boardModel } = useProjectStore.getState();
  const boardId = boardModel;

  // Place components
  const sonarId  = addComponent(getComponentDefinition('hc-sr04')!,  { x: bp.x + 320, y: bp.y });
  const motor1Id = addComponent(getComponentDefinition('dc-motor')!, { x: bp.x + 320, y: bp.y + 90 });
  const motor2Id = addComponent(getComponentDefinition('dc-motor')!, { x: bp.x + 320, y: bp.y + 180 });

  const w = (color: string, pinNum: number, compId: string, pinId: string) =>
    addWire({ id: uid(), color: color as never, path: [], validated: true, warnings: [],
      startPinRef: { type: 'board', boardId, pinNumber: pinNum },
      endPinRef:   { type: 'component', componentId: compId, pinId } });

  // HC-SR04 — trig→GPIO23(16), echo→GPIO24(18), vcc→5V(2), gnd→GND(6)
  w('yellow', 16, sonarId,  'trig');
  w('green',  18, sonarId,  'echo');
  w('red',     2, sonarId,  'vcc');
  w('black',   6, sonarId,  'gnd');

  // Left Motor — in1→GPIO17(11), in2→GPIO18(12), vcc→5V(4), gnd→GND(9)
  w('red',    11, motor1Id, 'in1');
  w('orange', 12, motor1Id, 'in2');
  w('red',     4, motor1Id, 'vcc');
  w('black',   9, motor1Id, 'gnd');

  // Right Motor — in1→GPIO22(15), in2→GPIO27(13), vcc→5V(4), gnd→GND(14)
  w('blue',   15, motor2Id, 'in1');
  w('purple', 13, motor2Id, 'in2');
  w('red',     4, motor2Id, 'vcc');
  w('black',  14, motor2Id, 'gnd');
}

export const obstacleRobotTutorial: TutorialDefinition = {
  id: 'obstacle-robot-tutorial',
  title: '🤖 Obstacle Avoiding Robot',
  description: 'Build a robot that detects walls with an HC-SR04 ultrasonic sensor and steers around them. Circuit is auto-wired — use the distance slider to simulate obstacles.',
  difficulty: 'advanced',
  estimatedMinutes: 20,
  onStart: setupObstacleRobotCircuit,
  steps: [
    {
      id: 'welcome',
      title: '🤖 Robot Circuit Ready!',
      content: 'The robot circuit is wired and ready:\n\n• 📡 HC-SR04 → GPIO23 (trig) + GPIO24 (echo)\n• ⚙️ Left Motor → GPIO17 + GPIO18\n• ⚙️ Right Motor → GPIO22 + GPIO27\n\nThe HC-SR04 fires ultrasonic pulses and measures the echo — if something is closer than 25 cm the robot backs up and turns.',
      completionCondition: { type: 'manual' },
      hints: ['Zoom the canvas to see both motors and the sonar sensor.'],
      tourTarget: 'canvas',
    },
    {
      id: 'understand-sensor',
      title: '📡 How the Ultrasonic Sensor Works',
      content: 'The HC-SR04 sends a 40 kHz ultrasonic burst and times the echo return:\n\n• **Trig** pin → GPIO23 (you trigger the pulse)\n• **Echo** pin → GPIO24 (you measure echo width)\n• Distance = (echo time × 343 m/s) / 2\n\nIn PiForge you control the simulated distance with the **Distance slider** in the Sensor Controls panel (right side).',
      completionCondition: { type: 'manual' },
      hints: ['Look for "Sensor Controls" in the right panel — it has a Distance slider for the HC-SR04.'],
      tourTarget: 'canvas',
    },
    {
      id: 'understand-motors',
      title: '⚙️ How the DC Motors Work',
      content: 'Each DC motor has two signal pins that control direction:\n\n• **IN1 HIGH + IN2 LOW** → forward\n• **IN1 LOW + IN2 HIGH** → backward\n• **Both LOW** → stop\n\ngpiozero\'s `Robot` class handles this automatically — `robot.forward()`, `robot.backward()`, `robot.left()`, `robot.right()`.',
      completionCondition: { type: 'manual' },
      hints: ['No slider for DC motors — their behaviour shows in the console output.'],
      tourTarget: 'canvas',
    },
    {
      id: 'load-code',
      title: 'Load the Robot Code',
      content: 'Open the **Projects** tab in the left sidebar. Find **🤖 Obstacle Avoiding Robot** and click **Load Code**.\n\nThe Python script:\n• Reads distance every 50 ms\n• Drives forward when path is clear (> 25 cm)\n• Reverses + turns when obstacle detected (< 25 cm)\n• Prints distance and action to the console',
      completionCondition: { type: 'code-contains', snippet: 'DistanceSensor' },
      hints: ['Projects tab is the 3rd icon in the left sidebar. Scroll to the Robotics section.'],
      tourTarget: 'sidebar',
    },
    {
      id: 'run',
      title: '▶ Run the Robot!',
      content: 'Click ▶ Play in the top bar. The robot drives forward and prints distance readings.\n\n**Simulate an obstacle:** drag the Distance slider below 25 cm — watch the robot reverse and turn!\n\nDrag it back above 25 cm and the robot resumes forward.',
      completionCondition: { type: 'simulation-started' },
      hints: ['First run downloads the Python runtime (~6 MB). Wait for "Loading Python runtime…" to finish.'],
      tourTarget: 'run-btn',
    },
  ],
};
