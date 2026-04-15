import type { TutorialDefinition } from '../types';

export const pwmFadeTutorial: TutorialDefinition = {
  id: 'pwm-fade',
  title: 'PWM LED Fade',
  description: 'Learn Pulse Width Modulation to smoothly dim and brighten an LED using GPIO.PWM.',
  difficulty: 'intermediate',
  estimatedMinutes: 10,
  steps: [
    {
      id: 'add-board',
      title: 'Start with the Pi board',
      content: 'Your Raspberry Pi 4 board should already be on the canvas. You can drag it to reposition it.',
      completionCondition: { type: 'manual' },
      hints: ['The board is the green PCB on the canvas.'],
      tourTarget: 'canvas',
    },
    {
      id: 'add-breadboard',
      title: 'Add a breadboard',
      content: 'Click **Add Breadboard** in the **Parts** tab. A breadboard lets you connect components without soldering.',
      completionCondition: { type: 'breadboard-added' },
      hints: ['Parts tab → Add Breadboard button at the top.'],
      tourTarget: 'sidebar',
    },
    {
      id: 'add-led',
      title: 'Place a Red LED',
      content: 'In the **Output** category, click **+** next to **Red LED**. Drag it onto the breadboard.',
      completionCondition: { type: 'component-placed', definitionId: 'led-red' },
      hints: ['The longer leg is the anode (+).'],
      tourTarget: 'sidebar',
    },
    {
      id: 'wire-gpio18',
      title: 'Wire GPIO18 to the LED',
      content: 'Enable **Wire Mode** from the canvas toolbar. Click **GPIO18 (Pin 12)** on the board, then click the LED anode (+). Wire the cathode (−) to GND.',
      completionCondition: { type: 'wire-created' },
      hints: ['GPIO18 is physical pin 12 — look for the GPIO18 label on the board.'],
      tourTarget: 'canvas',
    },
    {
      id: 'write-code',
      title: 'Write the PWM fade code',
      content: 'In the **Editor** tab, write this code:\n\n```python\nimport RPi.GPIO as GPIO, time\nGPIO.setmode(GPIO.BCM)\nGPIO.setup(18, GPIO.OUT)\npwm = GPIO.PWM(18, 100)\npwm.start(0)\nwhile True:\n    for dc in range(0,101,5):\n        pwm.ChangeDutyCycle(dc); time.sleep(0.05)\n    for dc in range(100,-1,-5):\n        pwm.ChangeDutyCycle(dc); time.sleep(0.05)\n```',
      completionCondition: { type: 'code-contains', snippet: 'GPIO.PWM' },
      hints: ['Copy-paste into the Editor tab (right panel, first tab).'],
      tourTarget: 'code-editor',
    },
    {
      id: 'run',
      title: 'Run and watch it fade!',
      content: 'Click **▶ Play**. Watch the LED on the canvas fade in and out smoothly as the duty cycle changes.',
      completionCondition: { type: 'simulation-started' },
      hints: ['The LED glows brighter as duty cycle increases above 50%.'],
      tourTarget: 'run-btn',
    },
  ],
};
