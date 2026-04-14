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
      content: 'Your Raspberry Pi 4 board should already be on the canvas. If not, it appears automatically when you open the lab.',
      completionCondition: { type: 'manual' },
      hints: ['The board is the green PCB on the canvas. You can drag it to reposition it.'],
    },
    {
      id: 'add-breadboard',
      title: 'Add a breadboard',
      content: 'Click "Add Breadboard" in the Parts tab. A breadboard lets you connect components without soldering.',
      completionCondition: { type: 'breadboard-added' },
      hints: ['Go to the Parts tab in the left sidebar and click the "Add Breadboard" button at the top.'],
    },
    {
      id: 'add-led',
      title: 'Place a Red LED',
      content: 'In the Parts tab, click "Red LED" to add one to the canvas. Drag it onto the breadboard so the legs sit in the holes.',
      completionCondition: { type: 'component-placed', definitionId: 'led-red' },
      hints: ['The left (longer) leg is the anode (+). Place it in column 10, row e of the breadboard.'],
    },
    {
      id: 'wire-gpio18',
      title: 'Wire GPIO18 to the LED anode',
      content: 'GPIO18 supports hardware PWM. Enable Wire Mode (bottom toolbar), then click GPIO18 (Pin 12) on the board, then click the LED\'s left (anode) leg.',
      completionCondition: { type: 'wire-created' },
      hints: ['GPIO18 is physical pin 12 on the board — look for "GPIO18" label. The anode is the left leg of the LED.'],
    },
    {
      id: 'write-code',
      title: 'Write the PWM fade code',
      content: 'In the Editor tab, paste this code:\n\nimport RPi.GPIO as GPIO\nimport time\n\nGPIO.setmode(GPIO.BCM)\nGPIO.setup(18, GPIO.OUT)\npwm = GPIO.PWM(18, 100)\npwm.start(0)\n\nwhile True:\n    for dc in range(0, 101, 5):\n        pwm.ChangeDutyCycle(dc)\n        time.sleep(0.05)\n    for dc in range(100, -1, -5):\n        pwm.ChangeDutyCycle(dc)\n        time.sleep(0.05)',
      completionCondition: { type: 'code-contains', snippet: 'GPIO.PWM' },
      hints: ['Copy the code from the Projects tab "PWM LED Fade" entry, or type it manually in the Editor tab.'],
    },
    {
      id: 'run',
      title: 'Run and watch it fade!',
      content: 'Click the ▶ Play button. The first run downloads the Python runtime (~5 sec). Then watch the LED on the canvas fade in and out smoothly.',
      completionCondition: { type: 'simulation-started' },
      hints: ['The LED icon on the canvas should glow when the duty cycle is above 50%. Check the Console for output.'],
    },
  ],
};
