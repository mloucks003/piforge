import type { TutorialDefinition } from '../types';

export const sensorDashboardTutorial: TutorialDefinition = {
  id: 'sensor-dashboard',
  title: 'Simon Says Game',
  description: 'Build a memory game with 4 LEDs and 4 buttons — the Pi plays a sequence, you repeat it.',
  difficulty: 'advanced',
  estimatedMinutes: 20,
  steps: [
    {
      id: 'intro',
      title: 'What you\'ll build',
      content: 'Simon Says is a classic memory game. The Pi lights up LEDs in a random sequence — you must press the matching buttons to repeat it. The sequence grows longer each round.',
      completionCondition: { type: 'manual' },
    },
    {
      id: 'add-parts',
      title: 'Add 4 LEDs and 4 Buttons',
      content: 'Add a breadboard, then from the **Parts** tab add:\n• 1× Red LED, 1× Green LED, 1× Blue LED, 1× Yellow LED\n• 4× Push Button\n\nArrange them in pairs: each LED beside its matching button.',
      completionCondition: { type: 'breadboard-added' },
      hints: ['You can click each part multiple times to add multiple copies.'],
    },
    {
      id: 'wire',
      title: 'Wire LEDs and Buttons',
      content: 'Enable **Wire Mode** and connect:\n• Red LED → GPIO17, Green → GPIO27, Blue → GPIO22, Yellow → GPIO5\n• Each LED cathode → GND\n• Buttons → GPIO6, GPIO13, GPIO19, GPIO26 (one each)\n• Each button → GND',
      completionCondition: { type: 'wire-created' },
      hints: ['That\'s 12 wires total. Take it step by step — wire all LED anodes first, then LED cathodes, then button inputs.'],
    },
    {
      id: 'load-code',
      title: 'Load the Simon Says code',
      content: 'Go to the **Projects** tab → **Simon Says Game** → **Load Code into Editor**.',
      completionCondition: { type: 'code-contains', snippet: 'simon' },
      hints: ['Simon Says is listed under Advanced projects.'],
    },
    {
      id: 'run',
      title: 'Play!',
      content: 'Press **▶ Play**. Watch the LED sequence light up in the console. Click the button components on the canvas in the same order. Get it right — the sequence gets longer each round!',
      completionCondition: { type: 'simulation-started' },
    },
  ],
};
