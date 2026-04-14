import type { TutorialDefinition } from '../types';

export const touchscreenDashboardTutorial: TutorialDefinition = {
  id: 'touchscreen-dashboard',
  title: 'Touchscreen GPIO Dashboard',
  description: 'Build a live touchscreen UI with pygame — tap virtual buttons on the display to control a GPIO LED.',
  difficulty: 'advanced',
  estimatedMinutes: 15,
  steps: [
    {
      id: 'intro',
      title: 'What you\'ll build',
      content: 'You\'ll create a pygame GUI that runs entirely in the browser. The virtual 7" DSI display shows ON/OFF buttons — clicking them controls a GPIO17 LED on the canvas. This is exactly how a real Pi + touchscreen dashboard works.',
      completionCondition: { type: 'manual' },
    },
    {
      id: 'add-screen',
      title: 'Add the 7" DSI Touchscreen',
      content: 'In the **Parts** tab, scroll to the Display section and click **7" DSI Touchscreen**. It appears on the canvas as a large black panel. Drag it to a comfortable position.',
      completionCondition: { type: 'component-placed', definitionId: 'touchscreen-7' },
      hints: ['The display is under the Display section in the Parts tab. It renders pygame draw calls in real-time.'],
    },
    {
      id: 'add-led',
      title: 'Add a Red LED',
      content: 'From the **Parts** tab, click **Red LED** and drag it onto the breadboard. This is the LED the dashboard will control.',
      completionCondition: { type: 'component-placed', definitionId: 'led-red' },
    },
    {
      id: 'add-breadboard',
      title: 'Add a Breadboard (if not already present)',
      content: 'If there\'s no breadboard on the canvas yet, click **Add Breadboard** in the Parts tab and drag the LED onto it.',
      completionCondition: { type: 'breadboard-added' },
      hints: ['If a breadboard is already on the canvas you can click Next to continue.'],
    },
    {
      id: 'wire',
      title: 'Wire the LED',
      content: 'Click **Wire Mode** (🔗) in the top bar:\n• GPIO17 (pin 11) → LED anode (+, left leg)\n• GND (pin 9) → LED cathode (−, right leg)\n\nThe touchscreen display does not need wiring — it connects via DSI (handled automatically).',
      completionCondition: { type: 'wire-created' },
      hints: ['The display itself needs no wires. Just wire the LED as you normally would.'],
    },
    {
      id: 'load-code',
      title: 'Load the Dashboard Code',
      content: 'Go to the **Projects** tab → **Touchscreen GPIO Dashboard** → **Load Code into Editor**. The code creates a pygame window with ON/OFF buttons.',
      completionCondition: { type: 'code-contains', snippet: 'pygame.display.set_mode' },
      hints: ['The project is listed under Advanced projects in the Projects tab.'],
    },
    {
      id: 'run',
      title: 'Run and Interact!',
      content: 'Press **▶ Play**. The black touchscreen panel on the canvas will light up with the dashboard UI. Click the **ON** button on the display — the red LED should glow. Click **OFF** to turn it off.',
      completionCondition: { type: 'simulation-started' },
      hints: ['Click directly on the ON/OFF buttons drawn inside the black display panel. The console will print "LED ON ✓" or "LED OFF ✓" confirming each press.'],
    },
  ],
};
