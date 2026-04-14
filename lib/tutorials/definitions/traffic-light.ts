import type { TutorialDefinition } from '../types';

export const trafficLightTutorial: TutorialDefinition = {
  id: 'traffic-light',
  title: 'Traffic Light Controller',
  description: 'Build a working traffic light with 3 LEDs. Learn proper wiring — nothing works unless connected correctly!',
  difficulty: 'intermediate',
  estimatedMinutes: 12,
  steps: [
    {
      id: 'intro',
      title: 'Welcome!',
      content: 'In this tutorial you will build a traffic light with Red, Green, and Blue LEDs. Each LED must be properly wired to a GPIO pin AND to ground — just like real electronics. If the wiring is wrong, the LEDs will NOT light up.',
      completionCondition: { type: 'manual' },
    },
    {
      id: 'add-breadboard',
      title: 'Step 1: Add a Breadboard',
      content: 'Open the **Parts** tab in the left sidebar and click **Add Breadboard** near the top. This gives you a place to plug in your components.',
      completionCondition: { type: 'breadboard-added' },
      hints: ['The Add Breadboard button is at the top of the sidebar.'],
    },
    {
      id: 'add-red',
      title: 'Step 2: Place the Red LED',
      content: 'Click "Red LED" in the sidebar. Drag it onto the breadboard. The LED has two legs — the longer one (anode, marked +) connects to power, the shorter one (cathode) connects to ground.',
      completionCondition: { type: 'component-placed', definitionId: 'led-red' },
      hints: ['LEDs are under the LEDs section in the sidebar.'],
    },
    {
      id: 'add-green',
      title: 'Step 3: Place the Green LED',
      content: 'Click "Green LED" and place it on the breadboard next to the red one. Leave some space between them.',
      completionCondition: { type: 'component-placed', definitionId: 'led-green' },
    },
    {
      id: 'add-blue',
      title: 'Step 4: Place the Blue LED',
      content: 'Click "Blue LED" and place it on the breadboard. Now you have all three traffic light colors.',
      completionCondition: { type: 'component-placed', definitionId: 'led-blue' },
    },
    {
      id: 'wire-red',
      title: 'Step 5: Wire the Red LED',
      content: 'Click the **Wire Mode** button (🔗) in the top bar. Click **GPIO17 (pin 11)** on the Pi board, then click the Red LED anode (+). Then wire the Red LED cathode (−) to any **GND** pin (e.g. pin 9).',
      completionCondition: { type: 'wire-created' },
      hints: ['Wire Mode must be active (button glowing) before clicking. Each LED needs TWO wires — one for the GPIO signal and one for ground.'],
    },
    {
      id: 'wire-others',
      title: 'Step 6: Wire Green and Blue LEDs',
      content: 'Continue in Wire Mode:\n• GPIO27 (pin 13) → Green LED anode\n• GND → Green LED cathode\n• GPIO22 (pin 15) → Blue LED anode\n• GND → Blue LED cathode\n\nEach LED must have BOTH a signal wire and a ground wire.',
      completionCondition: { type: 'wire-created' },
      hints: ['GPIO27 is physical pin 13. GPIO22 is physical pin 15. Ground pins are labelled GND on the board header.'],
    },
    {
      id: 'load-code',
      title: 'Step 7: Load the Code',
      content: 'Go to the **Projects** tab in the left sidebar. Find **Traffic Light Controller** and click **Load Code into Editor**. The code cycles Red → Green → Blue using GPIO 17, 27, 22.',
      completionCondition: { type: 'code-contains', snippet: 'red' },
      hints: ['Projects tab is the middle tab. Expand the Traffic Light card to see the Load button.'],
    },
    {
      id: 'run',
      title: 'Step 8: Run It!',
      content: 'Click the Play button (▶) in the top bar. If your wiring is correct, the LEDs will cycle: Red ON for 3 seconds → Green ON for 3 seconds → Blue ON for 1 second → repeat. If an LED does not light up, check its wiring — both the GPIO wire and the ground wire must be connected!',
      completionCondition: { type: 'simulation-started' },
      hints: ['If LEDs do not light up, make sure both the anode (to GPIO) and cathode (to GND) are wired.'],
    },
    {
      id: 'done',
      title: 'Congratulations!',
      content: 'You built a working traffic light controller! Key takeaway: in real electronics (and in PiForge), components only work when the circuit is complete — signal wire from GPIO to the component, and a return path to ground. Try modifying the code to change the timing or add a button to control the sequence.',
      completionCondition: { type: 'manual' },
    },
  ],
};
