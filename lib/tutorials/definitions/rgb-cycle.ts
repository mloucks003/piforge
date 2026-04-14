import type { TutorialDefinition } from '../types';

export const rgbCycleTutorial: TutorialDefinition = {
  id: 'rgb-cycle',
  title: 'RGB LED Color Cycle',
  description: 'Use three LEDs as R, G, B channels and cycle through every color with a Python loop.',
  difficulty: 'intermediate',
  estimatedMinutes: 12,
  steps: [
    {
      id: 'add-red',
      title: 'Add a Red LED',
      content: 'Open the Parts tab and click "Red LED" to add it to the canvas.',
      completionCondition: { type: 'component-placed', definitionId: 'led-red' },
      hints: ['Parts tab → Output section → Red LED'],
    },
    {
      id: 'add-green',
      title: 'Add a Green LED',
      content: 'Add a Green LED from the Parts tab. Place it next to the red one on the breadboard.',
      completionCondition: { type: 'component-placed', definitionId: 'led-green' },
    },
    {
      id: 'add-blue',
      title: 'Add a Blue LED',
      content: 'Add a Blue LED. You now have all three primary colour channels.',
      completionCondition: { type: 'component-placed', definitionId: 'led-blue' },
    },
    {
      id: 'wire-all',
      title: 'Wire the LEDs',
      content: 'Enable Wire Mode. Wire:\n• GPIO17 → Red LED anode\n• GPIO27 → Green LED anode\n• GPIO22 → Blue LED anode\n• GND (pin 9) → all cathodes',
      completionCondition: { type: 'wire-created' },
      hints: ['You need 4 wires total. The cathode is the right (shorter) leg.'],
    },
    {
      id: 'code',
      title: 'Load the color cycle code',
      content: 'Go to the Projects tab in the sidebar, open "RGB Color Cycle", and click "Load Code into Editor".',
      completionCondition: { type: 'code-contains', snippet: 'COLORS' },
      hints: ['Projects tab → RGB Color Cycle → Load Code into Editor'],
    },
    {
      id: 'run',
      title: 'Run it!',
      content: 'Press ▶ Play. The LEDs will cycle through Red → Green → Blue → Yellow → Cyan → White and more.',
      completionCondition: { type: 'simulation-started' },
    },
  ],
};
