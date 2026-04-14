import type { TutorialDefinition } from '../types';

export const reactionTimerTutorial: TutorialDefinition = {
  id: 'reaction-timer',
  title: 'Reaction Timer Game',
  description: 'Build an LED + button game that measures how fast you react in milliseconds.',
  difficulty: 'intermediate',
  estimatedMinutes: 15,
  steps: [
    {
      id: 'intro',
      title: 'What you\'ll build',
      content: 'An LED lights up at a random time. Press the button as fast as you can — the simulator measures your reaction time in milliseconds over 5 rounds and shows your best score.',
      completionCondition: { type: 'manual' },
    },
    {
      id: 'add-led',
      title: 'Add a Green LED',
      content: 'Parts tab → Green LED. This is your "GO" signal.',
      completionCondition: { type: 'component-placed', definitionId: 'led-green' },
    },
    {
      id: 'add-button',
      title: 'Add a Push Button',
      content: 'Parts tab → Input → Push Button. This is what you\'ll press when the LED turns on.',
      completionCondition: { type: 'component-placed', definitionId: 'button' },
    },
    {
      id: 'wire',
      title: 'Wire everything up',
      content: 'Wire Mode:\n• GPIO17 (Pin 11) → LED anode (+)\n• GND (Pin 9) → LED cathode (−)\n• GPIO4 (Pin 7) → Button pin1\n• GND (Pin 6) → Button pin2',
      completionCondition: { type: 'wire-created' },
      hints: ['The button needs an input pin AND a ground connection.'],
    },
    {
      id: 'load-code',
      title: 'Load the Reaction Timer code',
      content: 'Go to Projects tab → "Reaction Timer" → Load Code into Editor. The code runs 5 rounds automatically.',
      completionCondition: { type: 'code-contains', snippet: 'reaction_ms' },
    },
    {
      id: 'run',
      title: 'Play!',
      content: 'Hit ▶ Play. Wait for "GO!" in the console, then press the canvas button as fast as you can. Your time in milliseconds prints after each round.',
      completionCondition: { type: 'simulation-started' },
      hints: ['Click the button component on the canvas to simulate a press. Watch the Console panel for "GO!" cues.'],
    },
  ],
};
