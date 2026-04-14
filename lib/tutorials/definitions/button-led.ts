import type { TutorialDefinition } from '../types';

export const buttonLedTutorial: TutorialDefinition = {
  id: 'button-led',
  title: 'Button + LED',
  description: 'Read button input and toggle an LED — your first interactive circuit.',
  difficulty: 'beginner',
  estimatedMinutes: 8,
  steps: [
    {
      id: 'bb',
      title: 'Add a Breadboard',
      content: 'Open the **Parts** tab in the left sidebar and click **Add Breadboard** near the top.',
      completionCondition: { type: 'breadboard-added' },
      hints: ['Parts tab → Add Breadboard button'],
    },
    {
      id: 'led',
      title: 'Place a Red LED',
      content: 'In the **Parts** tab under LEDs, click **Red LED**. Drag it onto the breadboard.',
      completionCondition: { type: 'component-placed', definitionId: 'led-red' },
    },
    {
      id: 'btn',
      title: 'Place a Push Button',
      content: 'In the **Parts** tab under Input, click **Push Button**. Drag it onto the breadboard with some space from the LED.',
      completionCondition: { type: 'component-placed', definitionId: 'button' },
      hints: ['Push Button is under the Input section in the Parts tab.'],
    },
    {
      id: 'wire',
      title: 'Wire Everything Up',
      content: 'Click **Wire Mode** (🔗) in the top bar. Wire:\n• GPIO17 (pin 11) → LED anode (+)\n• GND (pin 9) → LED cathode (−)\n• GPIO4 (pin 7) → Button pin 1\n• GND (pin 6) → Button pin 2',
      completionCondition: { type: 'wire-created' },
      hints: ['Each component needs a signal wire AND a ground wire. Wire Mode must be active (glowing) before clicking pins.'],
    },
    {
      id: 'code',
      title: 'Load the Code',
      content: 'Go to the **Projects** tab in the sidebar. Find **Button Toggle LED** and click **Load Code into Editor**.',
      completionCondition: { type: 'code-contains', snippet: 'GPIO' },
      hints: ['Projects tab is the middle tab in the sidebar.'],
    },
    {
      id: 'run',
      title: 'Run It!',
      content: 'Press **▶ Play**. When the console shows "Waiting for button...", click the **button component** on the canvas to simulate a press. The LED should toggle on and off.',
      completionCondition: { type: 'simulation-started' },
    },
  ],
};
