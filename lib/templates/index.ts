/**
 * Template registry — starter code templates for the editor.
 */

export interface Template {
  id: string;
  name: string;
  language: 'python' | 'micropython' | 'cpp';
  code: string;
}

export const templates: Template[] = [
  {
    id: 'gpiozero-blink',
    name: 'GPIO Zero LED Blink',
    language: 'python',
    code: `from gpiozero import LED
from time import sleep

led = LED(17)

while True:
    led.on()
    print("LED ON")
    sleep(1)
    led.off()
    print("LED OFF")
    sleep(1)
`,
  },
  {
    id: 'rpigpio-blink',
    name: 'RPi.GPIO LED Blink',
    language: 'python',
    code: `import RPi.GPIO as GPIO
from time import sleep

GPIO.setmode(GPIO.BCM)
GPIO.setup(17, GPIO.OUT)

try:
    while True:
        GPIO.output(17, GPIO.HIGH)
        print("LED ON")
        sleep(1)
        GPIO.output(17, GPIO.LOW)
        print("LED OFF")
        sleep(1)
except KeyboardInterrupt:
    GPIO.cleanup()
`,
  },
  {
    id: 'rpigpio-button',
    name: 'RPi.GPIO Button Read',
    language: 'python',
    code: `import RPi.GPIO as GPIO
from time import sleep

GPIO.setmode(GPIO.BCM)
GPIO.setup(4, GPIO.IN, pull_up_down=GPIO.PUD_UP)

try:
    while True:
        if GPIO.input(4) == 1:
            print("Button pressed!")
        sleep(0.1)
except KeyboardInterrupt:
    GPIO.cleanup()
`,
  },
  {
    id: 'traffic-light',
    name: 'Traffic Light',
    language: 'python',
    code: `from gpiozero import LED
from time import sleep

red = LED(17)
green = LED(27)
blue = LED(22)

while True:
    red.on()
    print("RED")
    sleep(3)
    red.off()
    green.on()
    print("GREEN")
    sleep(3)
    green.off()
    blue.on()
    print("BLUE")
    sleep(1)
    blue.off()
`,
  },
  {
    id: 'pwm-led',
    name: 'PWM LED Fade',
    language: 'python',
    code: `import RPi.GPIO as GPIO
import time

GPIO.setmode(GPIO.BCM)
pwm = GPIO.PWM(18, 100)   # pin 18, 100 Hz
pwm.start(0)

try:
    while True:
        # Fade in
        for dc in range(0, 101, 5):
            pwm.ChangeDutyCycle(dc)
            print(f"Brightness: {dc}%")
            time.sleep(0.05)
        # Fade out
        for dc in range(100, -1, -5):
            pwm.ChangeDutyCycle(dc)
            time.sleep(0.05)
except KeyboardInterrupt:
    pwm.stop()
    GPIO.cleanup()
`,
  },
  {
    id: 'gpiozero-button-led',
    name: 'Button Controls LED (gpiozero)',
    language: 'python',
    code: `from gpiozero import LED, Button
from time import sleep

led = LED(17)
btn = Button(4)           # wire button pin1 → GPIO4

print("Press the button to toggle the LED")

while True:
    if btn.is_pressed:
        led.on()
        print("Button held — LED ON")
    else:
        led.off()
    sleep(0.05)
`,
  },
  {
    id: 'gpiozero-pwmled',
    name: 'PWMLED Pulse (gpiozero)',
    language: 'python',
    code: `from gpiozero import PWMLED
from time import sleep

led = PWMLED(18)

print("Pulsing LED on GPIO18…")
while True:
    # Ramp up
    for i in range(0, 11):
        led.value = i / 10
        print(f"Brightness {led.value:.1f}")
        sleep(0.1)
    # Ramp down
    for i in range(10, -1, -1):
        led.value = i / 10
        sleep(0.1)
`,
  },
  {
    id: 'touchscreen-demo',
    name: 'Touchscreen UI Demo',
    language: 'python',
    code: `import pygame

pygame.init()
screen = pygame.display.set_mode((800, 480))
clock = pygame.time.Clock()

BG     = (25, 25, 35)
BTN_R  = (200, 50, 50)
BTN_G  = (50, 180, 80)
BTN_B  = (50, 100, 220)
PANEL  = (40, 40, 55)
WHITE  = (255, 255, 255)

status = "Touch a button!"
count  = 0

def draw():
    screen.fill(BG)
    # Header
    pygame.draw.rect(screen, PANEL, (0, 0, 800, 60))
    # Buttons
    pygame.draw.rect(screen, BTN_R, (50,  100, 200, 80), border_radius=12)
    pygame.draw.rect(screen, BTN_G, (300, 100, 200, 80), border_radius=12)
    pygame.draw.rect(screen, BTN_B, (550, 100, 200, 80), border_radius=12)
    # Status bar
    pygame.draw.rect(screen, PANEL, (50, 220, 700, 60), border_radius=8)
    # Counters
    pygame.draw.circle(screen, BTN_R, (200, 380), 20)
    pygame.draw.circle(screen, BTN_G, (400, 380), 20)
    pygame.draw.circle(screen, BTN_B, (600, 380), 20)
    pygame.display.flip()

draw()
print("UI ready. Touch the screen!")

while True:
    for evt in pygame.event.get():
        if evt.type == pygame.MOUSEBUTTONDOWN:
            x, y = evt.pos
            count += 1
            if 50 < x < 250 and 100 < y < 180:
                print(f"[{count}] RED button touched at {evt.pos}")
            elif 300 < x < 500 and 100 < y < 180:
                print(f"[{count}] GREEN button touched at {evt.pos}")
            elif 550 < x < 750 and 100 < y < 180:
                print(f"[{count}] BLUE button touched at {evt.pos}")
            else:
                print(f"[{count}] Touch at {evt.pos}")
            draw()
    clock.tick(30)
`,
  },
  {
    id: 'multi-led',
    name: 'Multi-LED Sequence',
    language: 'python',
    code: `import RPi.GPIO as GPIO
import time

GPIO.setmode(GPIO.BCM)

PINS = [17, 27, 22]    # Red, Green, Blue LEDs
for p in PINS:
    GPIO.setup(p, GPIO.OUT)

patterns = [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
    [1, 1, 0],
    [0, 1, 1],
    [1, 0, 1],
    [1, 1, 1],
    [0, 0, 0],
]

try:
    step = 0
    while True:
        pat = patterns[step % len(patterns)]
        for pin, val in zip(PINS, pat):
            GPIO.output(pin, val)
        print(f"Pattern {step % len(patterns)}: {pat}")
        step += 1
        time.sleep(0.5)
except KeyboardInterrupt:
    GPIO.cleanup()
    print("Done")
`,
  },
  {
    id: 'hello-print',
    name: 'Hello World (print)',
    language: 'python',
    code: `import time

print("Hello from PiForge!")
print("Raspberry Pi Simulator running Python via Pyodide")
print()

for i in range(10):
    print(f"  Count: {i + 1}")
    time.sleep(0.5)

print()
print("Done!")
`,
  },
];

export function getTemplate(id: string): Template | undefined {
  return templates.find((t) => t.id === id);
}
