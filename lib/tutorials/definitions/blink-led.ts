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
      hints: ['The Parts tab is the leftmost tab in the sidebar. The "Add Breadboard" button is near the top.'],
      tourTarget: 'sidebar',
    },
    {
      id: 'add-led',
      title: 'Place a Red LED',
      content: 'Still in the **Parts** tab, expand the Output category and click the **+ icon** next to **Red LED**. The LED appears on the canvas — drag it near the breadboard.',
      completionCondition: { type: 'component-placed', definitionId: 'led-red' },
      hints: ['Expand the "Output" category in the sidebar. Hover over "Red LED" and click the + that appears.'],
      tourTarget: 'sidebar',
    },
    {
      id: 'wire-it',
      title: 'Wire the LED',
      content: 'Click the **Wire** button in the canvas toolbar at the bottom. Then click **GPIO17 (Pin 11)** on the board, then click the LED\'s **anode (+)**. Then wire the LED\'s **cathode (−)** to any **GND** pin.',
      completionCondition: { type: 'wire-created' },
      hints: ['Wire Mode button is in the bottom toolbar of the canvas area. Each LED needs TWO wires: one signal + one ground.'],
      tourTarget: 'canvas',
    },
    {
      id: 'write-code',
      title: 'Load the Blink Code',
      content: 'Click the **Editor** tab in the right panel. Use the template dropdown at the top of the editor to pick **Blink an LED** and load the starter code.',
      completionCondition: { type: 'code-contains', snippet: 'GPIO' },
      hints: ['The Editor tab is the first tab in the right panel. The template dropdown is the selector near the top.'],
      tourTarget: 'code-editor',
    },
    {
      id: 'run-it',
      title: 'Run the Simulation',
      content: 'Click the **▶ Play** button in the top bar. Python runs in your browser! Watch the red LED on the canvas glow and dim as it blinks. Check the Console panel at the bottom for output.',
      completionCondition: { type: 'simulation-started' },
      hints: ['The Play button is the ▶ icon in the centre of the top bar. First run downloads Python (~6 MB) — give it a moment.'],
      tourTarget: 'run-btn',
    },
  ],
};
