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
      hints: ['Parts tab → Add Breadboard button at the top of the sidebar'],
      tourTarget: 'sidebar',
    },
    {
      id: 'led',
      title: 'Place a Red LED',
      content: 'In the **Parts** tab, expand **Output** and click **+** next to **Red LED**. Drag it onto the breadboard.',
      completionCondition: { type: 'component-placed', definitionId: 'led-red' },
      tourTarget: 'sidebar',
    },
    {
      id: 'btn',
      title: 'Place a Push Button',
      content: 'In the **Parts** tab, expand **Input** and click **+** next to **Push Button**. Drag it onto the breadboard near the LED.',
      completionCondition: { type: 'component-placed', definitionId: 'button' },
      hints: ['Push Button is under the Input category in the Parts tab.'],
      tourTarget: 'sidebar',
    },
    {
      id: 'wire',
      title: 'Wire Everything Up',
      content: 'Enable **Wire Mode** from the canvas toolbar. Then wire:\n• GPIO17 (pin 11) → LED anode (+)\n• GND (pin 9) → LED cathode (−)\n• GPIO4 (pin 7) → Button pin 1\n• GND (pin 6) → Button pin 2',
      completionCondition: { type: 'wire-created' },
      hints: ['Each component needs a signal wire AND a ground wire. The Wire button is in the canvas bottom toolbar.'],
      tourTarget: 'canvas',
    },
    {
      id: 'code',
      title: 'Load the Code',
      content: 'Click the **Editor** tab in the right panel. Use the template dropdown to load a Button + LED template, or type your own GPIO code.',
      completionCondition: { type: 'code-contains', snippet: 'GPIO' },
      hints: ['Editor tab is the first tab in the right panel.'],
      tourTarget: 'code-editor',
    },
    {
      id: 'run',
      title: 'Run It!',
      content: 'Press **▶ Play**. When the console shows "Waiting for button...", click the **button component** on the canvas to simulate a press. The LED should toggle.',
      completionCondition: { type: 'simulation-started' },
      tourTarget: 'run-btn',
    },
  ],
};
