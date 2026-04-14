import type { TutorialDefinition } from '../types';

export const morseCodeTutorial: TutorialDefinition = {
  id: 'morse-code',
  title: 'Morse Code Blinker',
  description: 'Blink any message in Morse code using a single LED and a Python dictionary. Great for learning loops and data structures.',
  difficulty: 'intermediate',
  estimatedMinutes: 10,
  steps: [
    {
      id: 'intro',
      title: 'How Morse code works',
      content: 'Morse code uses short flashes (dots) and long flashes (dashes) to represent letters. A dot is 0.15s, a dash is 0.45s. Python dictionaries map each letter to its pattern.',
      completionCondition: { type: 'manual' },
    },
    {
      id: 'add-led',
      title: 'Add a Blue LED',
      content: 'Add a Blue LED from the Parts tab — blue looks great for a radio/transmission effect.',
      completionCondition: { type: 'component-placed', definitionId: 'led-blue' },
    },
    {
      id: 'wire',
      title: 'Wire to GPIO17',
      content: 'Enable Wire Mode:\n• GPIO17 (Pin 11) → LED anode (+, left leg)\n• GND (Pin 9) → LED cathode (−, right leg)',
      completionCondition: { type: 'wire-created' },
    },
    {
      id: 'load-code',
      title: 'Load the Morse Code project',
      content: 'Projects tab → "Morse Code Blinker" → Load Code into Editor. The code contains a full A-Z, 0-9 Morse dictionary.',
      completionCondition: { type: 'code-contains', snippet: 'MORSE' },
      hints: ['Look in the Projects tab in the left sidebar.'],
    },
    {
      id: 'customize',
      title: 'Customize your message',
      content: 'In the editor, find the line MESSAGE = "SOS" and change it to your name or any word. Only A-Z and 0-9 are supported.',
      completionCondition: { type: 'manual' },
      hints: ['Example: MESSAGE = "HELLO WORLD" — the LED will blink it out letter by letter.'],
    },
    {
      id: 'run',
      title: 'Send your message!',
      content: 'Press ▶ Play. Watch the LED blink in Morse code. The Console shows each letter and its pattern as it transmits.',
      completionCondition: { type: 'simulation-started' },
    },
  ],
};
