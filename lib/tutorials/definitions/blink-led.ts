import type { TutorialDefinition } from '../types';

export const blinkLedTutorial: TutorialDefinition = {
  id: 'blink-led',
  title: 'Blink an LED',
  description: 'Your first circuit — wire an LED to GPIO 17 and make it blink with Python.',
  difficulty: 'beginner',
  estimatedMinutes: 5,
  steps: [
    {
      id: 'add-breadboard',
      title: 'Add a Breadboard',
      content: 'In the left sidebar, open the **Parts** tab and click **Add Breadboard** at the top. A breadboard will appear on the canvas — it is your component platform.',
      completionCondition: { type: 'breadboard-added' },
      hints: ['The Parts tab is the leftmost tab in the sidebar. The Add Breadboard button is near the top.'],
    },
    {
      id: 'add-led',
      title: 'Place a Red LED',
      content: 'Still in the **Parts** tab, find the **Red LED** under the LEDs section and click it. The LED appears on the canvas — drag it onto the breadboard.',
      completionCondition: { type: 'component-placed', definitionId: 'led-red' },
      hints: ['Click the LED name in the sidebar to add it. Then drag it to sit over the breadboard holes.'],
    },
    {
      id: 'wire-it',
      title: 'Wire the LED',
      content: 'Click the **Wire Mode** button (🔗) in the top bar to enable wiring. Then click **GPIO 17** (physical pin 11) on the Pi board, then click the LED\'s **anode (+ leg)**. Next wire the LED\'s **cathode (− leg)** to any **GND** pin (e.g. pin 9).',
      completionCondition: { type: 'wire-created' },
      hints: ['Wire Mode turns your cursor into a wire-drawing tool. Click one endpoint, then the other to connect them. Each LED needs TWO wires: signal + ground.'],
    },
    {
      id: 'write-code',
      title: 'Load the Blink Code',
      content: 'Go to the **Projects** tab in the left sidebar. Find the **Blink an LED** project and click **Load Code into Editor**. The Python blink code will appear in the right panel editor.',
      completionCondition: { type: 'code-contains', snippet: 'LED(17)' },
      hints: ['Projects tab is the middle tab in the sidebar. Expand the "Blink an LED" card to see the Load button.'],
    },
    {
      id: 'run-it',
      title: 'Run the Simulation',
      content: 'Click the **▶ Play** button in the top bar. Python runs in your browser! Watch the red LED on the canvas glow and dim as it blinks. Check the Console panel at the bottom for output.',
      completionCondition: { type: 'simulation-started' },
      hints: ['The Play button is in the centre of the top navigation bar. First run downloads Python (~6 MB) — be patient.'],
    },
  ],
};
