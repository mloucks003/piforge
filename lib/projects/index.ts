import type { Project } from './types';

export const projects: Project[] = [
  // ── BEGINNER ────────────────────────────────────────────────────────────
  {
    id: 'blink-led',
    title: 'Blink an LED',
    description: 'The classic first circuit. Wire a red LED to GPIO17 and write 5 lines of Python to make it blink forever.',
    difficulty: 'beginner',
    estimatedMinutes: 5,
    tags: ['GPIO'],
    emoji: '💡',
    components: [
      { definitionId: 'led-red', quantity: 1, label: 'Red LED' },
      { definitionId: 'resistor', quantity: 1, label: '330Ω Resistor' },
    ],
    wiring: [
      { from: 'GPIO17 (Pin 11)', to: 'LED anode (+, left leg)', color: 'red', note: 'Signal wire' },
      { from: 'GND (Pin 9)', to: 'LED cathode (−, right leg)', color: 'black', note: 'Ground return' },
    ],
    code: `import RPi.GPIO as GPIO
import time

GPIO.setmode(GPIO.BCM)
GPIO.setup(17, GPIO.OUT)

print("Blinking! Press Stop to quit.")
while True:
    GPIO.output(17, GPIO.HIGH)
    print("ON")
    time.sleep(1)
    GPIO.output(17, GPIO.LOW)
    print("OFF")
    time.sleep(1)
`,
  },

  {
    id: 'button-toggle',
    title: 'Button Toggle LED',
    description: 'Press a button to toggle an LED on and off. Learn digital input with pull-up resistors.',
    difficulty: 'beginner',
    estimatedMinutes: 8,
    tags: ['GPIO'],
    emoji: '🔘',
    components: [
      { definitionId: 'led-green', quantity: 1, label: 'Green LED' },
      { definitionId: 'button', quantity: 1, label: 'Push Button' },
      { definitionId: 'resistor', quantity: 1, label: '330Ω Resistor' },
    ],
    wiring: [
      { from: 'GPIO17 (Pin 11)', to: 'LED anode (+)', color: 'green', note: 'LED signal' },
      { from: 'GND (Pin 9)', to: 'LED cathode (−)', color: 'black' },
      { from: 'GPIO4 (Pin 7)', to: 'Button pin1', color: 'yellow', note: 'Button input (internal pull-up)' },
      { from: 'GND (Pin 6)', to: 'Button pin2', color: 'black' },
    ],
    code: `from gpiozero import LED, Button
from time import sleep

led    = LED(17)
button = Button(4)

state = False
print("Press the button to toggle the LED.")

while True:
    if button.is_pressed:
        state = not state
        led.value = state
        print("LED", "ON" if state else "OFF")
        sleep(0.3)   # debounce
    sleep(0.05)
`,
  },

  {
    id: 'traffic-light',
    title: 'Traffic Light',
    description: 'Three LEDs simulate a real traffic light sequence: red → green → amber. Classic Python state machine.',
    difficulty: 'beginner',
    estimatedMinutes: 12,
    tags: ['GPIO'],
    emoji: '🚦',
    components: [
      { definitionId: 'led-red',   quantity: 1, label: 'Red LED'   },
      { definitionId: 'led-green', quantity: 1, label: 'Green LED' },
      { definitionId: 'led-blue',  quantity: 1, label: 'Blue LED (Amber)' },
      { definitionId: 'resistor',  quantity: 3, label: '330Ω Resistors' },
    ],
    wiring: [
      { from: 'GPIO17 (Pin 11)', to: 'Red LED anode',   color: 'red'   },
      { from: 'GPIO27 (Pin 13)', to: 'Green LED anode', color: 'green' },
      { from: 'GPIO22 (Pin 15)', to: 'Blue LED anode',  color: 'blue', note: 'Used as amber' },
      { from: 'GND (Pin 9)',    to: 'All LED cathodes', color: 'black' },
    ],
    code: `import RPi.GPIO as GPIO
import time

GPIO.setmode(GPIO.BCM)
RED, GREEN, AMBER = 17, 27, 22
for pin in (RED, GREEN, AMBER):
    GPIO.setup(pin, GPIO.OUT)

def all_off():
    for pin in (RED, GREEN, AMBER):
        GPIO.output(pin, GPIO.LOW)

print("Traffic light running — press Stop to quit.")
while True:
    all_off()
    GPIO.output(RED, GPIO.HIGH)
    print("RED   — Stop")
    time.sleep(3)

    all_off()
    GPIO.output(GREEN, GPIO.HIGH)
    print("GREEN — Go")
    time.sleep(3)

    all_off()
    GPIO.output(AMBER, GPIO.HIGH)
    print("AMBER — Slow down")
    time.sleep(1)
`,
  },

  {
    id: 'button-counter',
    title: 'Button Press Counter',
    description: 'Count how many times you press a button and display the tally. Add an LED that lights every 5 presses.',
    difficulty: 'beginner',
    estimatedMinutes: 10,
    tags: ['GPIO'],
    emoji: '🔢',
    components: [
      { definitionId: 'button',   quantity: 1, label: 'Push Button' },
      { definitionId: 'led-blue', quantity: 1, label: 'Blue LED'    },
      { definitionId: 'resistor', quantity: 1, label: '330Ω Resistor' },
    ],
    wiring: [
      { from: 'GPIO4 (Pin 7)',  to: 'Button pin1',     color: 'yellow' },
      { from: 'GND (Pin 6)',   to: 'Button pin2',     color: 'black'  },
      { from: 'GPIO17 (Pin 11)', to: 'LED anode (+)', color: 'blue'   },
      { from: 'GND (Pin 9)',  to: 'LED cathode (−)', color: 'black'  },
    ],
    code: `from gpiozero import Button, LED
from time import sleep

button = Button(4)
led    = LED(17)
count  = 0

print("Press the button. Every 5 presses the LED lights up!")

while True:
    if button.is_pressed:
        count += 1
        print(f"Press #{count}")
        if count % 5 == 0:
            led.on()
            print("  ★ Milestone! LED ON")
            sleep(0.5)
            led.off()
        sleep(0.25)  # debounce
    sleep(0.02)
`,
  },

  // ── INTERMEDIATE ─────────────────────────────────────────────────────────
  {
    id: 'pwm-fade',
    title: 'PWM LED Fade',
    description: 'Use hardware PWM to smoothly fade an LED in and out. Great intro to analog-style output on digital pins.',
    difficulty: 'intermediate',
    estimatedMinutes: 8,
    tags: ['GPIO', 'PWM'],
    emoji: '🌅',
    components: [
      { definitionId: 'led-red', quantity: 1, label: 'Red LED' },
      { definitionId: 'resistor', quantity: 1, label: '330Ω Resistor' },
    ],
    wiring: [
      { from: 'GPIO18 (Pin 12)', to: 'LED anode (+)', color: 'orange', note: 'GPIO18 supports hardware PWM' },
      { from: 'GND (Pin 14)',  to: 'LED cathode (−)', color: 'black' },
    ],
    code: `import RPi.GPIO as GPIO
import time

GPIO.setmode(GPIO.BCM)
pwm_pin = 18
GPIO.setup(pwm_pin, GPIO.OUT)
pwm = GPIO.PWM(pwm_pin, 100)   # 100 Hz
pwm.start(0)

print("Fading LED on GPIO18…")
try:
    while True:
        for dc in range(0, 101, 2):
            pwm.ChangeDutyCycle(dc)
            time.sleep(0.02)
        for dc in range(100, -1, -2):
            pwm.ChangeDutyCycle(dc)
            time.sleep(0.02)
except KeyboardInterrupt:
    pass
finally:
    pwm.stop()
    GPIO.cleanup()
    print("Done.")
`,
  },

  {
    id: 'reaction-timer',
    title: 'Reaction Timer',
    description: 'LED turns on at a random time — press the button as fast as you can! Your reaction time is printed to the console.',
    difficulty: 'intermediate',
    estimatedMinutes: 12,
    tags: ['GPIO', 'Games'],
    emoji: '⚡',
    components: [
      { definitionId: 'led-green', quantity: 1, label: 'Green LED'  },
      { definitionId: 'button',    quantity: 1, label: 'Push Button' },
      { definitionId: 'resistor',  quantity: 1, label: '330Ω Resistor' },
    ],
    wiring: [
      { from: 'GPIO17 (Pin 11)', to: 'LED anode (+)',  color: 'green'  },
      { from: 'GND (Pin 9)',    to: 'LED cathode (−)', color: 'black'  },
      { from: 'GPIO4 (Pin 7)', to: 'Button pin1',     color: 'yellow' },
      { from: 'GND (Pin 6)',  to: 'Button pin2',      color: 'black'  },
    ],
    code: `from gpiozero import LED, Button
from time import sleep, time
import random

led    = LED(17)
button = Button(4)
scores = []

print("=== REACTION TIMER ===")
print("Wait for the LED to turn on, then press the button FAST!")
print()

for round_num in range(5):
    sleep(random.uniform(1.5, 4.0))   # random delay
    led.on()
    t_start = time()
    print(f"Round {round_num + 1}: GO!")

    while not button.is_pressed:
        sleep(0.005)

    reaction_ms = int((time() - t_start) * 1000)
    led.off()
    scores.append(reaction_ms)
    print(f"  ➜ {reaction_ms} ms")
    sleep(0.5)

avg = sum(scores) // len(scores)
best = min(scores)
print()
print(f"Results: avg={avg}ms  best={best}ms")
if best < 200:
    print("🏆 Lightning fast!")
elif best < 350:
    print("👍 Nice reflexes!")
else:
    print("Keep practicing!")
`,
  },

  {
    id: 'morse-blinker',
    title: 'Morse Code Blinker',
    description: 'Type any message and the LED blinks it in Morse code. Great for learning Python strings and dictionaries.',
    difficulty: 'intermediate',
    estimatedMinutes: 10,
    tags: ['GPIO'],
    emoji: '📡',
    components: [
      { definitionId: 'led-blue', quantity: 1, label: 'Blue LED'    },
      { definitionId: 'resistor', quantity: 1, label: '330Ω Resistor' },
    ],
    wiring: [
      { from: 'GPIO17 (Pin 11)', to: 'LED anode (+)', color: 'blue' },
      { from: 'GND (Pin 9)',    to: 'LED cathode (−)', color: 'black' },
    ],
    code: `import RPi.GPIO as GPIO
import time

MORSE = {
    'A':'.-','B':'-...','C':'-.-.','D':'-..','E':'.','F':'..-.','G':'--.','H':'....','I':'..','J':'.---',
    'K':'-.-','L':'.-..','M':'--','N':'-.','O':'---','P':'.--.','Q':'--.-','R':'.-.','S':'...','T':'-',
    'U':'..-','V':'...-','W':'.--','X':'-..-','Y':'-.--','Z':'--..',
    '0':'-----','1':'.----','2':'..---','3':'...--','4':'....-','5':'.....',
    '6':'-....','7':'--...','8':'---..','9':'----.',
}
DOT, DASH, GAP, LETTER_GAP, WORD_GAP = 0.15, 0.45, 0.15, 0.45, 1.0

GPIO.setmode(GPIO.BCM)
GPIO.setup(17, GPIO.OUT)

def flash(secs):
    GPIO.output(17, GPIO.HIGH)
    time.sleep(secs)
    GPIO.output(17, GPIO.LOW)

def blink_message(msg):
    for word in msg.upper().split():
        for ch in word:
            if ch in MORSE:
                print(f"  {ch}: {MORSE[ch]}")
                for sym in MORSE[ch]:
                    flash(DOT if sym == '.' else DASH)
                    time.sleep(GAP)
                time.sleep(LETTER_GAP)
        time.sleep(WORD_GAP)

MESSAGE = "SOS"
print(f"Blinking: {MESSAGE}")
blink_message(MESSAGE)

MESSAGE = "PI FORGE"
print(f"Blinking: {MESSAGE}")
blink_message(MESSAGE)

GPIO.cleanup()
print("Done!")
`,
  },

  {
    id: 'rgb-color-cycle',
    title: 'RGB Color Cycle',
    description: 'Three LEDs represent R, G, B channels. Cycle through colors and mix them for a rainbow effect.',
    difficulty: 'intermediate',
    estimatedMinutes: 12,
    tags: ['GPIO', 'PWM'],
    emoji: '🌈',
    components: [
      { definitionId: 'led-red',   quantity: 1, label: 'Red LED'   },
      { definitionId: 'led-green', quantity: 1, label: 'Green LED' },
      { definitionId: 'led-blue',  quantity: 1, label: 'Blue LED'  },
      { definitionId: 'resistor',  quantity: 3, label: '330Ω Resistors' },
    ],
    wiring: [
      { from: 'GPIO17 (Pin 11)', to: 'Red LED anode',   color: 'red'   },
      { from: 'GPIO27 (Pin 13)', to: 'Green LED anode', color: 'green' },
      { from: 'GPIO22 (Pin 15)', to: 'Blue LED anode',  color: 'blue'  },
      { from: 'GND (Pin 9)',    to: 'All LED cathodes', color: 'black' },
    ],
    code: `import RPi.GPIO as GPIO
import time

GPIO.setmode(GPIO.BCM)
R, G, B = 17, 27, 22
for p in (R, G, B):
    GPIO.setup(p, GPIO.OUT)

COLORS = [
    ("Red",     (1,0,0)), ("Green",   (0,1,0)), ("Blue",  (0,0,1)),
    ("Yellow",  (1,1,0)), ("Cyan",    (0,1,1)), ("White", (1,1,1)),
    ("Magenta", (1,0,1)), ("Off",     (0,0,0)),
]

print("RGB Color Cycle — press Stop to quit")
while True:
    for name, (r, g, b) in COLORS:
        GPIO.output(R, r); GPIO.output(G, g); GPIO.output(B, b)
        print(f"Color: {name}")
        time.sleep(1)
`,
  },

  // ── ADVANCED ─────────────────────────────────────────────────────────────
  {
    id: 'simon-says',
    title: 'Simon Says Game',
    description: 'Three LEDs flash a pattern — press buttons in the same order. Sequence grows each round. Classic memory game!',
    difficulty: 'advanced',
    estimatedMinutes: 20,
    tags: ['GPIO', 'Games'],
    emoji: '🧠',
    components: [
      { definitionId: 'led-red',   quantity: 1, label: 'Red LED'    },
      { definitionId: 'led-green', quantity: 1, label: 'Green LED'  },
      { definitionId: 'led-blue',  quantity: 1, label: 'Blue LED'   },
      { definitionId: 'button',    quantity: 1, label: 'Button (use for all 3)' },
      { definitionId: 'resistor',  quantity: 3, label: '330Ω Resistors' },
    ],
    wiring: [
      { from: 'GPIO17', to: 'Red LED anode',   color: 'red'    },
      { from: 'GPIO27', to: 'Green LED anode', color: 'green'  },
      { from: 'GPIO22', to: 'Blue LED anode',  color: 'blue'   },
      { from: 'GPIO4',  to: 'Button pin1',     color: 'yellow' },
      { from: 'GND',    to: 'All cathodes & button pin2', color: 'black' },
    ],
    code: `from gpiozero import LED, Button
from time import sleep
import random

leds = [LED(17), LED(27), LED(22)]
btn  = Button(4)
names = ["RED", "GREEN", "BLUE"]

def flash(idx, t=0.4):
    leds[idx].on()
    sleep(t)
    leds[idx].off()
    sleep(0.1)

def show_sequence(seq):
    for i in seq:
        flash(i)

def wait_input(seq):
    """Simplified: button presses cycle through LED choices."""
    for expected in seq:
        # Wait for button press — cycles through R/G/B each press
        print(f"  Expected: {names[expected]} — press button")
        btn.wait_for_press()
        btn.wait_for_release()
        flash(expected, 0.2)
        sleep(0.1)
    return True

sequence = []
print("=== SIMON SAYS ===")
print("Watch the pattern, then press the button for each step.")
print()

for round_num in range(1, 8):
    sequence.append(random.randint(0, 2))
    print(f"Round {round_num}: Watch!")
    sleep(0.5)
    show_sequence(sequence)
    print("Your turn!")
    wait_input(sequence)
    print(f"✓ Round {round_num} complete!")
    sleep(0.5)

print("🏆 You won all 7 rounds!")
`,
  },

  {
    id: 'pwm-buzzer',
    title: 'Musical Buzzer',
    description: 'Play a melody using PWM frequency control on a buzzer. Outputs tones for each note of Twinkle Twinkle.',
    difficulty: 'intermediate',
    estimatedMinutes: 10,
    tags: ['GPIO', 'PWM', 'Audio'],
    emoji: '🎵',
    components: [
      { definitionId: 'led-green', quantity: 1, label: 'Green LED (proxy for buzzer)' },
      { definitionId: 'resistor',  quantity: 1, label: '330Ω Resistor' },
    ],
    wiring: [
      { from: 'GPIO18 (Pin 12)', to: 'LED/Buzzer +', color: 'green', note: 'GPIO18 has hardware PWM' },
      { from: 'GND (Pin 14)',   to: 'LED/Buzzer −',  color: 'black' },
    ],
    code: `import RPi.GPIO as GPIO
import time

GPIO.setmode(GPIO.BCM)
GPIO.setup(18, GPIO.OUT)
pwm = GPIO.PWM(18, 440)
pwm.start(0)

# Note frequencies (Hz)
NOTES = {'C4':262,'D4':294,'E4':330,'F4':349,'G4':392,'A4':440,'B4':494,'C5':523,'R':0}

def play(note, duration):
    freq = NOTES[note]
    if freq == 0:
        pwm.ChangeDutyCycle(0)
    else:
        pwm.ChangeFrequency(freq)
        pwm.ChangeDutyCycle(50)
    print(f"  {note} ({freq}Hz)" if freq else "  [rest]")
    time.sleep(duration * 0.9)
    pwm.ChangeDutyCycle(0)
    time.sleep(duration * 0.1)

# Twinkle Twinkle Little Star
song = [
    ('C4',0.4),('C4',0.4),('G4',0.4),('G4',0.4),('A4',0.4),('A4',0.4),('G4',0.8),
    ('F4',0.4),('F4',0.4),('E4',0.4),('E4',0.4),('D4',0.4),('D4',0.4),('C4',0.8),
    ('G4',0.4),('G4',0.4),('F4',0.4),('F4',0.4),('E4',0.4),('E4',0.4),('D4',0.8),
    ('G4',0.4),('G4',0.4),('F4',0.4),('F4',0.4),('E4',0.4),('E4',0.4),('D4',0.8),
    ('C4',0.4),('C4',0.4),('G4',0.4),('G4',0.4),('A4',0.4),('A4',0.4),('G4',0.8),
    ('F4',0.4),('F4',0.4),('E4',0.4),('E4',0.4),('D4',0.4),('D4',0.4),('C4',0.8),
]

print("🎵 Playing Twinkle Twinkle Little Star…")
for note, dur in song:
    play(note, dur)

pwm.stop()
GPIO.cleanup()
print("Done!")
`,
  },
  // ── ADVANCED ────────────────────────────────────────────────────────────
  {
    id: 'touchscreen-dashboard',
    title: 'Touchscreen GPIO Dashboard',
    description: 'Build a touchscreen UI with pygame. Tap ON/OFF buttons on the virtual 7" display to control a real GPIO LED.',
    difficulty: 'advanced',
    estimatedMinutes: 15,
    tags: ['pygame', 'touchscreen', 'GPIO'],
    emoji: '🖥️',
    components: [
      { definitionId: 'touchscreen-7', quantity: 1, label: '7" DSI Touchscreen' },
      { definitionId: 'led-red', quantity: 1, label: 'Red LED' },
    ],
    wiring: [
      { from: 'GPIO17 (Pin 11)', to: 'LED anode (+)', color: 'red', note: 'Controlled by dashboard' },
      { from: 'GND (Pin 9)', to: 'LED cathode (−)', color: 'black' },
    ],
    code: `import pygame
import RPi.GPIO as GPIO

# ── GPIO setup ──────────────────────────────────────────────────────────────
GPIO.setmode(GPIO.BCM)
GPIO.setup(17, GPIO.OUT)
GPIO.output(17, GPIO.LOW)

# ── Display setup ────────────────────────────────────────────────────────────
pygame.init()
screen = pygame.display.set_mode((800, 480))
pygame.display.set_caption("GPIO Dashboard")

# Fonts (None = built-in bitmap font, sizes are in pygame units)
font_lg = pygame.font.Font(None, 72)
font_md = pygame.font.Font(None, 48)
font_sm = pygame.font.Font(None, 32)

led_on  = False
running = True
clock   = pygame.time.Clock()

# ── Button regions (x, y, w, h) ──────────────────────────────────────────────
BTN_ON  = (460, 160, 280, 100)
BTN_OFF = (460, 290, 280, 100)

def draw_rounded_rect(surface, color, rect, radius=20):
    pygame.draw.rect(surface, color, rect, border_radius=radius)

def draw():
    # Background
    screen.fill((15, 15, 20))

    # ── Title bar ────────────────────────────────────────────────────────────
    pygame.draw.rect(screen, (25, 25, 45), (0, 0, 800, 80))
    pygame.draw.line(screen, (60, 60, 100), (0, 80), (800, 80), 2)
    title = font_md.render("PiForge  GPIO Dashboard", True, (160, 180, 255))
    screen.blit(title, (30, 22))

    # ── LED status panel ─────────────────────────────────────────────────────
    panel_col = (20, 20, 30)
    draw_rounded_rect(screen, panel_col, (30, 110, 380, 330), 16)

    label = font_sm.render("LED  GPIO 17", True, (120, 120, 160))
    screen.blit(label, (140, 130))

    # Glowing circle indicator
    glow  = (40, 220, 40) if led_on else (50, 50, 60)
    ring  = (80, 255, 80) if led_on else (70, 70, 80)
    pygame.draw.circle(screen, glow, (220, 280), 90)
    pygame.draw.circle(screen, ring, (220, 280), 90, 4)

    # Status text inside circle
    status_txt = font_md.render("ON" if led_on else "OFF", True, (255, 255, 255))
    screen.blit(status_txt, (220 - status_txt.get_width()//2, 260))

    # ── Control buttons ───────────────────────────────────────────────────────
    # ON button
    on_col  = (0, 170, 60)  if not led_on else (0, 100, 35)
    draw_rounded_rect(screen, on_col, BTN_ON, 18)
    on_lbl = font_lg.render("ON",  True, (255, 255, 255))
    screen.blit(on_lbl, (BTN_ON[0] + BTN_ON[2]//2 - on_lbl.get_width()//2,
                          BTN_ON[1] + BTN_ON[3]//2 - on_lbl.get_height()//2))

    # OFF button
    off_col = (200, 40, 40) if led_on else (110, 20, 20)
    draw_rounded_rect(screen, off_col, BTN_OFF, 18)
    off_lbl = font_lg.render("OFF", True, (255, 255, 255))
    screen.blit(off_lbl, (BTN_OFF[0] + BTN_OFF[2]//2 - off_lbl.get_width()//2,
                           BTN_OFF[1] + BTN_OFF[3]//2 - off_lbl.get_height()//2))

    # Tap hint
    hint = font_sm.render("Tap buttons to toggle LED", True, (60, 60, 80))
    screen.blit(hint, (800//2 - hint.get_width()//2, 430))

    pygame.display.flip()

print("=== GPIO Dashboard started ===")
print("Tap ON / OFF on the canvas display to control the LED.")

while running:
    draw()
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False
        elif event.type == pygame.MOUSEBUTTONDOWN:
            mx, my = event.pos
            if BTN_ON[0] <= mx <= BTN_ON[0]+BTN_ON[2] and BTN_ON[1] <= my <= BTN_ON[1]+BTN_ON[3]:
                led_on = True
                GPIO.output(17, GPIO.HIGH)
                print("LED ON ✓")
            elif BTN_OFF[0] <= mx <= BTN_OFF[0]+BTN_OFF[2] and BTN_OFF[1] <= my <= BTN_OFF[1]+BTN_OFF[3]:
                led_on = False
                GPIO.output(17, GPIO.LOW)
                print("LED OFF ✓")
    clock.tick(30)

GPIO.cleanup()
pygame.quit()
print("Dashboard closed.")
`,
  },
  // ── ROBOTICS ──────────────────────────────────────────────────────────────
  {
    id: 'obstacle-robot',
    title: '🤖 Obstacle Avoiding Robot',
    description: 'A robot that detects walls with an ultrasonic sensor and steers around them automatically.',
    difficulty: 'advanced',
    estimatedMinutes: 25,
    tags: ['GPIO', 'Motors', 'Sensors'],
    emoji: '🤖',
    components: [
      { definitionId: 'hc-sr04', quantity: 1, label: 'HC-SR04 Ultrasonic' },
      { definitionId: 'dc-motor', quantity: 2, label: 'DC Motor ×2' },
    ],
    wiring: [
      { from: 'GPIO23 (Pin 16)', to: 'HC-SR04 Trig', color: 'yellow' },
      { from: 'GPIO24 (Pin 18)', to: 'HC-SR04 Echo', color: 'green' },
      { from: 'GPIO17 (Pin 11)', to: 'Left Motor IN1', color: 'red' },
      { from: 'GPIO18 (Pin 12)', to: 'Left Motor IN2', color: 'orange' },
      { from: 'GPIO22 (Pin 15)', to: 'Right Motor IN1', color: 'blue' },
      { from: 'GPIO27 (Pin 13)', to: 'Right Motor IN2', color: 'purple' },
      { from: 'GND (Pin 6)', to: 'HC-SR04 GND + Motor GND', color: 'black' },
    ],
    code: `from gpiozero import Robot, DistanceSensor
import time

# Adjust the distance slider in Sensor Controls to simulate obstacles
sensor = DistanceSensor(echo=24, trigger=23, max_distance=1)
robot  = Robot(left=(17, 18), right=(22, 27))

DANGER_CM  = 25   # turn away if closer than this
BACKUP_SEC = 0.4  # reverse duration
TURN_SEC   = 0.5  # turn duration

print("=== Obstacle Avoiding Robot ===")
print("Drag the Distance slider to simulate walls!")
print("< 25 cm = OBSTACLE — robot will turn\\n")

try:
    while True:
        dist_cm = sensor.distance * 100
        print(f"Distance: {dist_cm:.1f} cm", end="\\r")

        if dist_cm < DANGER_CM:
            print(f"\\n⚠️  Obstacle at {dist_cm:.1f} cm!")
            robot.backward(0.7)
            time.sleep(BACKUP_SEC)
            robot.right(0.8)
            time.sleep(TURN_SEC)
        else:
            robot.forward(0.9)

        time.sleep(0.05)

except KeyboardInterrupt:
    robot.stop()
    print("\\nRobot stopped.")
`,
  },
  {
    id: 'servo-radar',
    title: '📡 Servo Radar Scanner',
    description: 'Mount an ultrasonic sensor on a servo and sweep 180° to build a radar that maps nearby obstacles.',
    difficulty: 'advanced',
    estimatedMinutes: 20,
    tags: ['GPIO', 'Motors', 'Sensors'],
    emoji: '📡',
    components: [
      { definitionId: 'servo', quantity: 1, label: 'Servo Motor (SG90)' },
      { definitionId: 'hc-sr04', quantity: 1, label: 'HC-SR04 Ultrasonic' },
    ],
    wiring: [
      { from: 'GPIO18 (Pin 12)', to: 'Servo PWM signal', color: 'orange' },
      { from: 'GPIO23 (Pin 16)', to: 'HC-SR04 Trig', color: 'yellow' },
      { from: 'GPIO24 (Pin 18)', to: 'HC-SR04 Echo', color: 'green' },
      { from: 'GND (Pin 6)', to: 'Servo GND + Sensor GND', color: 'black' },
    ],
    code: `from gpiozero import AngularServo, DistanceSensor
import time

servo  = AngularServo(18, min_angle=-90, max_angle=90)
sensor = DistanceSensor(echo=24, trigger=23, max_distance=4)

print("=== Servo Radar Scanner ===")
print("Watch the servo arm sweep! Adjust distance slider to place obstacles.\\n")

radar_map = {}

def scan(direction=1):
    for angle in range(-90, 91, 5) if direction == 1 else range(90, -91, -5):
        servo.angle = angle
        time.sleep(0.05)
        dist_cm = sensor.distance * 100
        radar_map[angle] = dist_cm
        bar = '█' * int((400 - min(dist_cm, 400)) / 20)
        flag = ' ⚠️' if dist_cm < 30 else ''
        print(f"  {angle:+4d}° | {dist_cm:5.1f} cm | {bar}{flag}")

sweep = 0
try:
    while True:
        print(f"\\n── Sweep #{sweep + 1} ──────────────────────────────")
        scan(1 if sweep % 2 == 0 else -1)
        sweep += 1
        time.sleep(0.3)
except KeyboardInterrupt:
    servo.mid()
    print("\\nRadar stopped.")
`,
  },
  {
    id: 'weather-station',
    title: '🌡️ Weather Station',
    description: 'Log live temperature and humidity with a DHT22 sensor. Alerts when it gets too hot or humid.',
    difficulty: 'intermediate',
    estimatedMinutes: 12,
    tags: ['Sensors', 'GPIO'],
    emoji: '🌡️',
    components: [
      { definitionId: 'dht22', quantity: 1, label: 'DHT22 Temp/Humidity' },
      { definitionId: 'led-red', quantity: 1, label: 'Alert LED' },
    ],
    wiring: [
      { from: 'GPIO4 (Pin 7)',  to: 'DHT22 Data',     color: 'yellow' },
      { from: 'GPIO17 (Pin 11)', to: 'LED anode',     color: 'red' },
      { from: 'GND (Pin 9)',    to: 'DHT22 GND + LED cathode', color: 'black' },
    ],
    code: `from gpiozero import DHT22, LED
import time

sensor = DHT22(pin=4)
alert  = LED(17)

TEMP_MAX = 28.0   # °C — alert above this
HUM_MAX  = 75.0   # % — alert above this

print("=== PiForge Weather Station ===")
print("Drag Temperature / Humidity sliders in Sensor Controls to simulate conditions.\\n")
print(f"{'Time':>8}  {'Temp (°C)':>10}  {'Humidity':>10}  {'Status':>12}")
print("-" * 50)

readings = 0
try:
    while True:
        temp = sensor.temperature
        hum  = sensor.humidity
        ts   = time.strftime("%H:%M:%S")

        too_hot  = temp > TEMP_MAX
        too_humid= hum  > HUM_MAX
        alert_on = too_hot or too_humid
        alert.on() if alert_on else alert.off()

        status = ""
        if too_hot:   status += "🔥 HOT "
        if too_humid: status += "💧 HUMID"
        if not status: status = "✅ OK"

        print(f"{ts:>8}  {temp:>9.1f}°  {hum:>9.1f}%  {status}")
        readings += 1
        time.sleep(2)

except KeyboardInterrupt:
    alert.off()
    print(f"\\n{readings} readings logged. Done.")
`,
  },
  {
    id: 'touchscreen-piano',
    title: '🎵 Touchscreen Piano',
    description: 'A full octave piano keyboard on the 7" display. Tap keys to play real buzzer tones.',
    difficulty: 'advanced',
    estimatedMinutes: 20,
    tags: ['pygame', 'touchscreen', 'Audio'],
    emoji: '🎵',
    components: [
      { definitionId: 'touchscreen-7', quantity: 1, label: '7" DSI Touchscreen' },
      { definitionId: 'buzzer', quantity: 1, label: 'Piezo Buzzer' },
    ],
    wiring: [
      { from: 'GPIO18 (Pin 12)', to: 'Buzzer +', color: 'red', note: 'PWM pin' },
      { from: 'GND (Pin 6)', to: 'Buzzer −', color: 'black' },
    ],
    code: `import pygame
import RPi.GPIO as GPIO
import time, math

GPIO.setmode(GPIO.BCM)
GPIO.setup(18, GPIO.OUT)
buzzer = GPIO.PWM(18, 440)

pygame.init()
screen = pygame.display.set_mode((800, 480))
pygame.display.set_caption("PiForge Piano")
clock  = pygame.time.Clock()

# C4 major scale + octave
NOTES = [
    ('C4',262),('D4',294),('E4',330),('F4',349),
    ('G4',392),('A4',440),('B4',494),('C5',523),
]
BLACK_KEYS = [
    ('C#',277, 1),('D#',311,2),('F#',370,4),('G#',415,5),('A#',466,6)
]

KEY_W, KEY_H = 90, 300
MARGIN = 20
active_note = None

def draw():
    screen.fill((20, 20, 20))
    # Title
    font_t = pygame.font.Font(None, 42)
    screen.blit(font_t.render("PiForge Piano 🎵", True, (200,200,255)), (260, 10))

    # White keys
    for i,(name,freq) in enumerate(NOTES):
        x = MARGIN + i * KEY_W
        col = (255,230,200) if active_note == freq else (250,250,240)
        pygame.draw.rect(screen, col,       (x, 140, KEY_W-3, KEY_H), border_radius=6)
        pygame.draw.rect(screen, (100,100,100),(x, 140, KEY_W-3, KEY_H), 2, border_radius=6)
        lbl = pygame.font.Font(None,28).render(name,True,(50,50,50))
        screen.blit(lbl, (x + KEY_W//2 - lbl.get_width()//2, 400))

    # Black keys
    for name,freq,idx in BLACK_KEYS:
        x = MARGIN + idx * KEY_W - 27
        col = (80,20,120) if active_note == freq else (30,30,30)
        pygame.draw.rect(screen, col, (x, 140, 52, 190), border_radius=4)
        lbl = pygame.font.Font(None,22).render(name,True,(200,180,255))
        screen.blit(lbl, (x+8, 300))

    pygame.display.flip()

def play(freq):
    global active_note
    active_note = freq
    buzzer.start(50)
    buzzer.ChangeFrequency(freq)

def stop():
    global active_note
    active_note = None
    buzzer.stop()

print("=== Piano ready! Tap keys on the canvas display ===")
running = True
while running:
    draw()
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False
        elif event.type == pygame.MOUSEBUTTONDOWN:
            mx, my = event.pos
            if 140 <= my <= 340:
                # Check black keys first (higher z-order)
                hit = False
                for name,freq,idx in BLACK_KEYS:
                    x = MARGIN + idx * KEY_W - 27
                    if x <= mx <= x+52:
                        play(freq); hit = True; break
                if not hit:
                    for i,(_,freq) in enumerate(NOTES):
                        x = MARGIN + i * KEY_W
                        if x <= mx <= x + KEY_W - 3:
                            play(freq); break
            elif my > 340:
                stop()
        elif event.type == pygame.MOUSEBUTTONUP:
            stop()
    clock.tick(30)

buzzer.stop()
GPIO.cleanup()
pygame.quit()
print("Piano closed.")
`,
  },
  {
    id: 'security-system',
    title: '🔒 Smart Security System',
    description: 'A PIR motion detector alarm — detects movement, triggers a buzzer and flashes LEDs.',
    difficulty: 'intermediate',
    estimatedMinutes: 15,
    tags: ['Sensors', 'GPIO', 'Audio'],
    emoji: '🔒',
    components: [
      { definitionId: 'pir-sensor', quantity: 1, label: 'PIR Motion Sensor' },
      { definitionId: 'led-red', quantity: 1, label: 'Alarm LED' },
      { definitionId: 'buzzer', quantity: 1, label: 'Piezo Buzzer' },
    ],
    wiring: [
      { from: 'GPIO4 (Pin 7)',  to: 'PIR OUT',      color: 'yellow' },
      { from: 'GPIO17 (Pin 11)', to: 'LED anode',   color: 'red' },
      { from: 'GPIO18 (Pin 12)', to: 'Buzzer +',    color: 'orange' },
      { from: 'GND (Pin 9)',    to: 'PIR GND + LED cathode + Buzzer −', color: 'black' },
    ],
    code: `from gpiozero import MotionSensor, LED, Buzzer
import time

pir    = MotionSensor(4)
alarm  = LED(17)
buzzer = Buzzer(18)

ARMED   = True
COOLDOWN = 5  # seconds before re-arming

print("=== PiForge Security System ===")
print("Toggle the PIR switch in Sensor Controls to trigger the alarm!\\n")
print("System ARMED. Monitoring...\\n")

last_trigger = 0
alerts = 0

try:
    while True:
        if pir.motion_detected and ARMED:
            now = time.time()
            if now - last_trigger > COOLDOWN:
                alerts += 1
                last_trigger = now
                print(f"🚨 INTRUDER ALERT #{alerts}! {time.strftime('%H:%M:%S')}")

                for _ in range(6):
                    alarm.on()
                    buzzer.on()
                    time.sleep(0.15)
                    alarm.off()
                    buzzer.off()
                    time.sleep(0.1)

                print("   Re-arming in 5 seconds...")
                time.sleep(COOLDOWN)
                print("   System re-armed.\\n")
        else:
            alarm.off()
            buzzer.off()

        time.sleep(0.1)

except KeyboardInterrupt:
    alarm.off()
    buzzer.off()
    print(f"\\nSystem disarmed. {alerts} alerts triggered.")
`,
  },
  {
    id: 'rc-car-dashboard',
    title: '🚗 RC Car Dashboard',
    description: 'Control two DC motors from a touchscreen interface. Drive a virtual RC car with on-screen D-pad.',
    difficulty: 'advanced',
    estimatedMinutes: 25,
    tags: ['pygame', 'touchscreen', 'Motors'],
    emoji: '🚗',
    components: [
      { definitionId: 'touchscreen-7', quantity: 1, label: '7" DSI Touchscreen' },
      { definitionId: 'dc-motor', quantity: 2, label: 'DC Motor ×2' },
    ],
    wiring: [
      { from: 'GPIO17 (Pin 11)', to: 'Left Motor IN1',  color: 'red' },
      { from: 'GPIO18 (Pin 12)', to: 'Left Motor IN2',  color: 'orange' },
      { from: 'GPIO22 (Pin 15)', to: 'Right Motor IN1', color: 'blue' },
      { from: 'GPIO27 (Pin 13)', to: 'Right Motor IN2', color: 'purple' },
      { from: 'GND (Pin 6)',    to: 'Both Motor GNDs',  color: 'black' },
    ],
    code: `import pygame
from gpiozero import Robot
import time

robot = Robot(left=(17,18), right=(22,27))

pygame.init()
screen = pygame.display.set_mode((800, 480))
pygame.display.set_caption("RC Car")
clock  = pygame.time.Clock()

SPEED = 0.8
direction = "STOP"

BTN = {
    "FWD":  (300, 140, 200, 90),
    "BACK": (300, 330, 200, 90),
    "LEFT": (80,  240, 180, 90),
    "RIGHT":(540, 240, 180, 90),
    "STOP": (300, 240, 200, 90),
}
BTN_COLORS = {"FWD":"#226622","BACK":"#662222","LEFT":"#224488","RIGHT":"#224488","STOP":"#555555"}

font_lg = pygame.font.Font(None, 52)
font_sm = pygame.font.Font(None, 36)

def draw():
    screen.fill((15,15,25))
    screen.blit(pygame.font.Font(None,42).render("🚗  RC Car Controller",True,(200,200,255)),(220,20))

    for name,(x,y,w,h) in BTN.items():
        col_hex = BTN_COLORS[name]
        r,g,b = int(col_hex[1:3],16),int(col_hex[3:5],16),int(col_hex[5:7],16)
        active = direction == name
        col = (min(r+60,255),min(g+60,255),min(b+60,255)) if active else (r,g,b)
        pygame.draw.rect(screen,col,(x,y,w,h),border_radius=16)
        lbl = {"FWD":"▲ FORWARD","BACK":"▼ REVERSE","LEFT":"◀ LEFT","RIGHT":"RIGHT ▶","STOP":"■ STOP"}[name]
        txt = font_sm.render(lbl,True,(255,255,255))
        screen.blit(txt,(x+w//2-txt.get_width()//2, y+h//2-txt.get_height()//2))

    # Speed bar
    speed_txt = font_sm.render(f"Speed: {SPEED*100:.0f}%  |  {direction}",True,(150,200,255))
    screen.blit(speed_txt,(250,440))
    pygame.display.flip()

def hit(mx,my,rect):
    x,y,w,h = rect
    return x<=mx<=x+w and y<=my<=y+h

running = True
while running:
    draw()
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False
        elif event.type == pygame.MOUSEBUTTONDOWN:
            mx,my = event.pos
            if hit(mx,my,BTN["FWD"]):   robot.forward(SPEED);  direction="FWD";   print("▲ FORWARD")
            elif hit(mx,my,BTN["BACK"]): robot.backward(SPEED); direction="BACK";  print("▼ REVERSE")
            elif hit(mx,my,BTN["LEFT"]): robot.left(SPEED);     direction="LEFT";  print("◀ LEFT")
            elif hit(mx,my,BTN["RIGHT"]):robot.right(SPEED);    direction="RIGHT"; print("▶ RIGHT")
            elif hit(mx,my,BTN["STOP"]): robot.stop();          direction="STOP";  print("■ STOP")
        elif event.type == pygame.MOUSEBUTTONUP:
            robot.stop(); direction="STOP"
    clock.tick(30)

robot.stop()
pygame.quit()
print("RC Car stopped.")
`,
  },
  {
    id: 'plant-monitor',
    title: '🌿 Smart Plant Monitor',
    description: 'Monitor soil moisture (potentiometer) and temperature (DHT22). Alerts when your plant needs water.',
    difficulty: 'intermediate',
    estimatedMinutes: 15,
    tags: ['Sensors', 'GPIO'],
    emoji: '🌿',
    components: [
      { definitionId: 'dht22', quantity: 1, label: 'DHT22 Temp/Humidity' },
      { definitionId: 'potentiometer', quantity: 1, label: 'Soil Moisture (Potentiometer)' },
      { definitionId: 'led-red', quantity: 1, label: 'Alert LED' },
      { definitionId: 'led-green', quantity: 1, label: 'Healthy LED' },
    ],
    wiring: [
      { from: 'GPIO4 (Pin 7)',   to: 'DHT22 Data',         color: 'yellow' },
      { from: 'GPIO17 (Pin 11)', to: 'Alert LED anode',    color: 'red' },
      { from: 'GPIO27 (Pin 13)', to: 'Healthy LED anode',  color: 'green' },
      { from: 'GND (Pin 9)',    to: 'All cathodes',         color: 'black' },
    ],
    code: `from gpiozero import DHT22, LED, MCP3008
import time

sensor    = DHT22(pin=4)
soil      = MCP3008(channel=0)   # 0% = dry, 100% = wet (use Potentiometer slider)
alert_led = LED(17)
ok_led    = LED(27)

DRY_THRESHOLD  = 30   # % below this = needs water
HOT_THRESHOLD  = 30   # °C above this = too hot

print("=== 🌿 Smart Plant Monitor ===")
print("Adjust Soil Moisture and Temperature sliders in Sensor Controls")
print(f"{'Time':>8}  {'Temp':>7}  {'Moisture':>10}  Status")
print("─" * 45)

try:
    while True:
        temp     = sensor.temperature
        moisture = soil.value * 100   # 0-100%
        ts       = time.strftime("%H:%M:%S")

        needs_water = moisture < DRY_THRESHOLD
        too_hot     = temp > HOT_THRESHOLD

        if needs_water or too_hot:
            alert_led.on(); ok_led.off()
            status = ("💧 WATER ME" if needs_water else "") + (" 🔥 TOO HOT" if too_hot else "")
        else:
            alert_led.off(); ok_led.on()
            status = "✅ Happy plant"

        print(f"{ts:>8}  {temp:>6.1f}°C  {moisture:>8.0f}%  {status}")
        time.sleep(3)

except KeyboardInterrupt:
    alert_led.off(); ok_led.off()
    print("\\nMonitor stopped.")
`,
  },
  {
    id: 'servo-arm',
    title: '🦾 Servo Arm Controller',
    description: 'Control 3 servo motors with a touchscreen sliders panel to create a robotic arm.',
    difficulty: 'advanced',
    estimatedMinutes: 30,
    tags: ['Motors', 'pygame', 'touchscreen'],
    emoji: '🦾',
    components: [
      { definitionId: 'servo', quantity: 3, label: 'Servo Motor ×3 (SG90)' },
      { definitionId: 'touchscreen-7', quantity: 1, label: '7" DSI Touchscreen' },
    ],
    wiring: [
      { from: 'GPIO18 (Pin 12)', to: 'Base Servo PWM',    color: 'orange' },
      { from: 'GPIO17 (Pin 11)', to: 'Shoulder Servo PWM',color: 'yellow' },
      { from: 'GPIO27 (Pin 13)', to: 'Gripper Servo PWM', color: 'green' },
      { from: 'GND (Pin 6)',    to: 'All Servo GNDs',      color: 'black' },
    ],
    code: `import pygame
from gpiozero import AngularServo
import time

base     = AngularServo(18, min_angle=-90, max_angle=90)
shoulder = AngularServo(17, min_angle=-60, max_angle=60)
gripper  = AngularServo(27, min_angle=0,   max_angle=60)

pygame.init()
screen = pygame.display.set_mode((800, 480))
pygame.display.set_caption("Servo Arm Controller")
clock  = pygame.time.Clock()

SERVOS = [
    {"name":"Base",     "servo":base,     "min":-90,"max":90,  "val":0,  "color":(255,100,100)},
    {"name":"Shoulder", "servo":shoulder, "min":-60,"max":60,  "val":0,  "color":(100,255,100)},
    {"name":"Gripper",  "servo":gripper,  "min":0,  "max":60,  "val":30, "color":(100,150,255)},
]
PRESETS = [
    ("Home",    [0,  0, 30]),
    ("Pickup",  [-45,-30, 0]),
    ("Drop",    [45, -30, 60]),
    ("Wave",    [0,  60, 30]),
]
dragging = None
font_md  = pygame.font.Font(None, 38)
font_sm  = pygame.font.Font(None, 30)

def slider_rect(i):
    return (100, 130 + i*100, 500, 30)

def draw():
    screen.fill((12,12,20))
    screen.blit(pygame.font.Font(None,42).render("🦾 Robotic Arm Controller",True,(200,180,255)),(180,20))

    for i,s in enumerate(SERVOS):
        x,y,w,h = slider_rect(i)
        pct = (s["val"] - s["min"]) / (s["max"] - s["min"])
        # Track
        pygame.draw.rect(screen,(40,40,60),(x,y,w,h),border_radius=8)
        # Fill
        pygame.draw.rect(screen,s["color"],(x,y,int(w*pct),h),border_radius=8)
        # Handle
        hx = x + int(w*pct)
        pygame.draw.circle(screen,(255,255,255),(hx,y+h//2),16)
        # Labels
        screen.blit(font_md.render(s["name"],True,s["color"]),(x-90,y))
        screen.blit(font_sm.render(f"{s['val']:+.0f}°",True,(220,220,220)),(x+w+10,y))

    # Preset buttons
    for i,(name,_) in enumerate(PRESETS):
        bx = 620 + (i//2)*85
        by = 130 + (i%2)*55
        pygame.draw.rect(screen,(40,40,80),(bx,by,78,44),border_radius=10)
        screen.blit(font_sm.render(name,True,(200,220,255)),(bx+6,by+12))

    pygame.display.flip()

def apply_preset(angles):
    for s,a in zip(SERVOS,angles):
        s["val"] = max(s["min"],min(s["max"],a))
        s["servo"].angle = s["val"]

apply_preset([s["val"] for s in SERVOS])  # initial positions
print("=== Servo Arm Ready ===")
print("Drag sliders on the canvas to move each joint!\\n")

running = True
while running:
    draw()
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False
        elif event.type == pygame.MOUSEBUTTONDOWN:
            mx,my = event.pos
            # Check preset buttons
            for i,(name,angles) in enumerate(PRESETS):
                bx = 620 + (i//2)*85
                by = 130 + (i%2)*55
                if bx<=mx<=bx+78 and by<=my<=by+44:
                    apply_preset(angles)
                    print(f"Preset: {name}")
                    break
            # Check sliders
            for i,s in enumerate(SERVOS):
                x,y,w,h = slider_rect(i)
                if x<=mx<=x+w and y-10<=my<=y+h+10:
                    dragging = i
        elif event.type == pygame.MOUSEBUTTONUP:
            dragging = None
        elif event.type == pygame.MOUSEMOVE and dragging is not None:
            s = SERVOS[dragging]
            x,_,w,_ = slider_rect(dragging)
            pct = max(0,min(1,(event.pos[0]-x)/w))
            s["val"] = s["min"] + pct * (s["max"]-s["min"])
            s["servo"].angle = s["val"]
    clock.tick(30)

pygame.quit()
print("Arm parked.")
`,
  },
];

// ── ADVANCED: SMART HOME & NETWORKING ──────────────────────────────────────

projects.push(
  {
    id: 'smart-home-hub',
    title: '🏠 Smart Home Hub',
    description: 'Build a full MQTT-based smart home controller. Motion detection auto-controls lights, a DHT22 reports temperature, and everything publishes to a simulated MQTT broker — just like Home Assistant.',
    difficulty: 'advanced',
    estimatedMinutes: 30,
    tags: ['IoT', 'SmartHome', 'Sensors', 'GPIO'],
    emoji: '🏠',
    components: [
      { definitionId: 'pir-sensor',    quantity: 1, label: 'PIR Motion Sensor' },
      { definitionId: 'dht22',         quantity: 1, label: 'DHT22 Temp/Humidity' },
      { definitionId: 'led-green',     quantity: 1, label: 'Living Room Light (LED)' },
      { definitionId: 'led-blue',      quantity: 1, label: 'Bedroom Light (LED)' },
      { definitionId: 'buzzer',        quantity: 1, label: 'Doorbell Buzzer' },
      { definitionId: 'relay',         quantity: 1, label: '5V Relay (Main Power)' },
    ],
    wiring: [
      { from: 'GPIO4  (Pin 7)',  to: 'PIR OUT',          color: 'yellow', note: 'Motion signal' },
      { from: 'GPIO17 (Pin 11)', to: 'Green LED anode',  color: 'green',  note: 'Living room' },
      { from: 'GPIO27 (Pin 13)', to: 'Blue LED anode',   color: 'blue',   note: 'Bedroom' },
      { from: 'GPIO18 (Pin 12)', to: 'Buzzer +',         color: 'orange', note: 'Doorbell' },
      { from: 'GPIO22 (Pin 15)', to: 'DHT22 data',       color: 'white'  },
      { from: '3V3   (Pin 1)',  to: 'PIR VCC + DHT VCC', color: 'red'   },
      { from: 'GND   (Pin 6)',  to: 'All grounds',       color: 'black' },
    ],
    code: `import RPi.GPIO as GPIO
import time, json, math

# ── Pin map ──────────────────────────────────────────
PIR       = 4
LIGHT_LR  = 17   # Living room
LIGHT_BR  = 27   # Bedroom
DOORBELL  = 18
DHT_PIN   = 22

GPIO.setmode(GPIO.BCM)
GPIO.setup([LIGHT_LR, LIGHT_BR, DOORBELL], GPIO.OUT, initial=GPIO.LOW)
GPIO.setup(PIR, GPIO.IN)

# ── Simulated MQTT broker ─────────────────────────────
class MQTT:
    def publish(self, topic, payload):
        print(f"📤 [{topic}]  {json.dumps(payload)}")
    def subscribe(self, topic):
        print(f"📥 Subscribed: {topic}")

mqtt = MQTT()
mqtt.subscribe("home/#")

# ── Simulated sensor readings ─────────────────────────
def read_dht22():
    t = time.time()
    temp     = round(20.0 + 3 * math.sin(t / 120), 1)
    humidity = round(50.0 + 15 * math.sin(t / 200), 1)
    return temp, humidity

def doorbell_ring():
    print("🔔 Doorbell!")
    for _ in range(3):
        GPIO.output(DOORBELL, GPIO.HIGH); time.sleep(0.15)
        GPIO.output(DOORBELL, GPIO.LOW);  time.sleep(0.15)
    mqtt.publish("home/doorbell", {"event": "pressed"})

print("🏠 Smart Home Hub — Online")
print("Rooms: Living Room · Bedroom")
print("Sensors: Motion · Temperature · Humidity")
mqtt.publish("home/status", {"state": "online", "rooms": 2})

last_motion = False
cycle = 0
try:
    while True:
        cycle += 1
        motion = bool(GPIO.input(PIR))

        # Motion → living room light
        if motion and not last_motion:
            GPIO.output(LIGHT_LR, GPIO.HIGH)
            mqtt.publish("home/living_room/light", {"state": "ON", "trigger": "motion"})
            print("🚶 Motion detected — Living room lights ON")
        elif not motion and last_motion:
            GPIO.output(LIGHT_LR, GPIO.LOW)
            mqtt.publish("home/living_room/light", {"state": "OFF"})
            print("💤 No motion — lights OFF")
        last_motion = motion

        # Temperature every 10 cycles
        if cycle % 10 == 0:
            temp, hum = read_dht22()
            mqtt.publish("home/sensors/climate", {"temp_c": temp, "humidity": hum})
            print(f"🌡️  {temp}°C  💧 {hum}%")
            if temp > 24:
                print("🌬️  AC trigger: temperature above threshold")
                mqtt.publish("home/hvac/ac", {"state": "cooling"})

        # Simulated doorbell every 30 cycles
        if cycle % 30 == 0:
            doorbell_ring()

        time.sleep(0.5)
except KeyboardInterrupt:
    GPIO.cleanup()
    mqtt.publish("home/status", {"state": "offline"})
    print("\\n🏠 Hub shut down.")
`,
  },
  {
    id: 'iot-weather-station',
    title: '🌦️ IoT Weather Station',
    description: 'A networked weather station that reads temperature & humidity every 30 seconds and POSTs readings to a cloud API. Includes data averaging, alert thresholds, and a rolling 24h history log.',
    difficulty: 'advanced',
    estimatedMinutes: 25,
    tags: ['IoT', 'Networking', 'Sensors'],
    emoji: '🌦️',
    components: [
      { definitionId: 'dht22',     quantity: 1, label: 'DHT22 Primary Sensor' },
      { definitionId: 'led-green', quantity: 1, label: 'Status LED (green=ok)' },
      { definitionId: 'led-red',   quantity: 1, label: 'Alert LED (red=threshold)' },
      { definitionId: 'oled-ssd1306', quantity: 1, label: 'OLED Display' },
    ],
    wiring: [
      { from: 'GPIO22 (Pin 15)', to: 'DHT22 data',      color: 'yellow' },
      { from: 'GPIO17 (Pin 11)', to: 'Green LED anode', color: 'green' },
      { from: 'GPIO27 (Pin 13)', to: 'Red LED anode',   color: 'red' },
      { from: 'SDA (Pin 3)',     to: 'OLED SDA',        color: 'blue',  note: 'I2C data' },
      { from: 'SCL (Pin 5)',     to: 'OLED SCL',        color: 'white', note: 'I2C clock' },
      { from: '3V3 (Pin 1)',     to: 'DHT22 VCC',       color: 'red' },
      { from: 'GND (Pin 6)',     to: 'All grounds',     color: 'black' },
    ],
    code: `import RPi.GPIO as GPIO
import time, json, math, statistics

STATUS_LED = 17
ALERT_LED  = 27
TEMP_MAX   = 28.0    # °C alert threshold
HUM_MIN    = 30.0    # % alert threshold

GPIO.setmode(GPIO.BCM)
GPIO.setup([STATUS_LED, ALERT_LED], GPIO.OUT, initial=GPIO.LOW)
GPIO.output(STATUS_LED, GPIO.HIGH)   # powered on

# ── Cloud API simulator ───────────────────────────────
def post_to_cloud(payload):
    url = "https://api.weatherhub.io/v1/readings"
    print(f"☁️  POST → {url}")
    print(f"   {json.dumps(payload)}")
    return {"status": 200, "id": f"rdg_{int(time.time())}"}

# ── Sensor simulator ──────────────────────────────────
def read_sensor():
    t = time.time()
    temp = round(18.0 + 8 * math.sin(t / 180) + (hash(int(t)) % 10) * 0.1, 1)
    hum  = round(45.0 + 20 * math.sin(t / 300), 1)
    return temp, hum

history = []
alerts  = 0
print("🌦️  Weather Station Online — Device: piforge-ws-001")
print(f"Thresholds: Temp > {TEMP_MAX}°C | Humidity < {HUM_MIN}%")
print("-" * 48)

cycle = 0
try:
    while True:
        cycle += 1
        temp, hum = read_sensor()
        history.append({"temp": temp, "hum": hum, "ts": int(time.time())})
        if len(history) > 48: history.pop(0)   # 24 h rolling window

        # Averages
        avg_t = round(statistics.mean(r["temp"] for r in history), 2)
        avg_h = round(statistics.mean(r["hum"]  for r in history), 2)

        # Alert check
        alert = temp > TEMP_MAX or hum < HUM_MIN
        GPIO.output(ALERT_LED, GPIO.HIGH if alert else GPIO.LOW)
        if alert:
            alerts += 1
            print(f"🚨 ALERT #{alerts}: Temp={temp}°C Hum={hum}%")

        print(f"📊 #{cycle:>3}  Temp:{temp:>5}°C  Hum:{hum:>5}%  "
              f"(avg {avg_t}°C / {avg_h}%)  samples={len(history)}")

        # Upload every 6 cycles (simulates 30 s interval)
        if cycle % 6 == 0:
            resp = post_to_cloud({
                "device": "piforge-ws-001",
                "temp_c": temp, "humidity_pct": hum,
                "avg_temp_c": avg_t, "avg_hum_pct": avg_h,
                "alerts_total": alerts,
                "timestamp": int(time.time()),
            })
            print(f"   ✅ Stored: {resp['id']}")

        time.sleep(1)
except KeyboardInterrupt:
    GPIO.output([STATUS_LED, ALERT_LED], GPIO.LOW)
    GPIO.cleanup()
    print(f"\\n✅ Session: {cycle} readings · {alerts} alerts · avg {avg_t}°C")
`,
  },
  {
    id: 'smart-office',
    title: '🏢 Smart Office Automation',
    description: 'Automate a full office: PIR occupancy detection, automatic lighting, energy monitoring, a manual override button, and HTTP logging to a facilities management API.',
    difficulty: 'advanced',
    estimatedMinutes: 35,
    tags: ['IoT', 'SmartHome', 'Networking', 'Sensors', 'GPIO'],
    emoji: '🏢',
    components: [
      { definitionId: 'pir-sensor',  quantity: 1, label: 'PIR Occupancy Sensor' },
      { definitionId: 'button',      quantity: 1, label: 'Manual Override Button' },
      { definitionId: 'led-green',   quantity: 1, label: 'Main Office Light' },
      { definitionId: 'led-blue',    quantity: 1, label: 'Status Indicator' },
      { definitionId: 'dht22',       quantity: 1, label: 'Climate Sensor' },
      { definitionId: 'relay',       quantity: 1, label: 'HVAC Relay' },
    ],
    wiring: [
      { from: 'GPIO4  (Pin 7)',  to: 'PIR OUT',           color: 'yellow' },
      { from: 'GPIO2  (Pin 3)',  to: 'Button one leg',    color: 'orange', note: 'Other leg to GND' },
      { from: 'GPIO17 (Pin 11)', to: 'Green LED anode',   color: 'green' },
      { from: 'GPIO18 (Pin 12)', to: 'Blue LED anode',    color: 'blue' },
      { from: 'GPIO22 (Pin 15)', to: 'DHT22 data',        color: 'white' },
      { from: 'GPIO27 (Pin 13)', to: 'Relay IN',          color: 'purple', note: 'Controls HVAC' },
      { from: '3V3   (Pin 1)',  to: 'PIR VCC + DHT VCC',  color: 'red' },
      { from: 'GND   (Pin 6)',  to: 'All grounds',        color: 'black' },
    ],
    code: `import RPi.GPIO as GPIO
import time, json, math

PIR     = 4
BUTTON  = 2
LIGHT   = 17
STATUS  = 18
DHT     = 22
HVAC    = 27

GPIO.setmode(GPIO.BCM)
GPIO.setup([LIGHT, STATUS, HVAC], GPIO.OUT, initial=GPIO.LOW)
GPIO.setup(PIR, GPIO.IN)
GPIO.setup(BUTTON, GPIO.IN, pull_up_down=GPIO.PUD_UP)

# ── Facilities API ────────────────────────────────────
class FacilitiesAPI:
    def log(self, event, data):
        payload = {"event": event, "data": data, "ts": int(time.time())}
        print(f"🏢 API → /facilities/log  {json.dumps(payload)}")

api = FacilitiesAPI()

# ── Energy tracking ───────────────────────────────────
energy_kwh  = 0.0
on_since    = None
auto_mode   = True
occupied    = False

def set_light(state: bool, reason: str):
    global on_since, energy_kwh
    GPIO.output(LIGHT, GPIO.HIGH if state else GPIO.LOW)
    if state and on_since is None:
        on_since = time.time()
    elif not state and on_since:
        h = (time.time() - on_since) / 3600
        energy_kwh += h * 0.06          # 60 W bulb
        on_since = None
        api.log("light_off", {"reason": reason, "energy_kwh": round(energy_kwh, 5)})
    status = "ON" if state else "OFF"
    print(f"💡 Light {status} ({reason}) | Energy used: {energy_kwh:.4f} kWh")

def read_climate():
    t = time.time()
    return round(21 + 3 * math.sin(t / 200), 1), round(45 + 10 * math.sin(t / 300), 1)

print("🏢 Smart Office System Active")
print("Auto-mode: ON | Energy monitoring: ON")
api.log("system_start", {"auto_mode": True})
GPIO.output(STATUS, GPIO.HIGH)

last_motion = False
cycle = 0
try:
    while True:
        cycle += 1
        # Override button toggle
        if not GPIO.input(BUTTON):
            auto_mode = not auto_mode
            print(f"🔘 Manual override — mode: {'AUTO' if auto_mode else 'MANUAL'}")
            api.log("mode_change", {"auto": auto_mode})
            time.sleep(0.4)

        motion = bool(GPIO.input(PIR))
        if auto_mode and motion != last_motion:
            set_light(motion, "occupancy" if motion else "vacancy timeout")
            last_motion = motion

        # Climate check every 15 s (30 cycles)
        if cycle % 30 == 0:
            temp, hum = read_climate()
            hvac_on = temp > 23.5
            GPIO.output(HVAC, GPIO.HIGH if hvac_on else GPIO.LOW)
            api.log("climate", {"temp_c": temp, "humidity": hum, "hvac": hvac_on})
            print(f"🌡️  {temp}°C  💧 {hum}%  HVAC: {'ON' if hvac_on else 'OFF'}")

        time.sleep(0.5)
except KeyboardInterrupt:
    set_light(False, "shutdown")
    GPIO.cleanup()
    print(f"\\n✅ Session: {cycle} cycles | Total energy: {energy_kwh:.4f} kWh")
`,
  },
  {
    id: 'network-robot',
    title: '🤖 Network-Controlled Robot',
    description: 'Control a 2-wheel robot over HTTP. A lightweight Flask web server runs on the Pi, accepting /forward /backward /left /right /stop commands. Use any browser or curl to drive it remotely.',
    difficulty: 'advanced',
    estimatedMinutes: 30,
    tags: ['Networking', 'Motors', 'IoT', 'Advanced'],
    emoji: '🤖',
    components: [
      { definitionId: 'dc-motor',  quantity: 2, label: 'DC Motors (L + R wheel)' },
      { definitionId: 'hc-sr04',   quantity: 1, label: 'HC-SR04 (obstacle guard)' },
      { definitionId: 'led-red',   quantity: 1, label: 'Status LED' },
    ],
    wiring: [
      { from: 'GPIO17 (Pin 11)', to: 'Left motor IN1',  color: 'green' },
      { from: 'GPIO18 (Pin 12)', to: 'Left motor IN2',  color: 'green' },
      { from: 'GPIO22 (Pin 15)', to: 'Right motor IN1', color: 'blue' },
      { from: 'GPIO23 (Pin 16)', to: 'Right motor IN2', color: 'blue' },
      { from: 'GPIO24 (Pin 18)', to: 'HC-SR04 TRIG',   color: 'yellow' },
      { from: 'GPIO25 (Pin 22)', to: 'HC-SR04 ECHO',   color: 'orange' },
      { from: 'GND   (Pin 6)',  to: 'All grounds',     color: 'black' },
    ],
    code: `import RPi.GPIO as GPIO
import time, math

# ── Motor driver pins ─────────────────────────────────
L1, L2 = 17, 18   # Left  wheel
R1, R2 = 22, 23   # Right wheel
TRIG, ECHO = 24, 25

GPIO.setmode(GPIO.BCM)
GPIO.setup([L1, L2, R1, R2, TRIG], GPIO.OUT, initial=GPIO.LOW)
GPIO.setup(ECHO, GPIO.IN)

def drive(l1, l2, r1, r2):
    GPIO.output(L1, l1); GPIO.output(L2, l2)
    GPIO.output(R1, r1); GPIO.output(R2, r2)

def stop():    drive(0,0,0,0); print("⏹  STOP")
def forward(): drive(1,0,1,0); print("⬆  FORWARD")
def backward():drive(0,1,0,1); print("⬇  BACKWARD")
def left():    drive(0,1,1,0); print("⬅  LEFT")
def right():   drive(1,0,0,1); print("➡  RIGHT")

def measure_distance():
    GPIO.output(TRIG, GPIO.HIGH); time.sleep(0.00001); GPIO.output(TRIG, GPIO.LOW)
    start = end = time.time()
    while not GPIO.input(ECHO): start = time.time()
    while GPIO.input(ECHO):     end   = time.time()
    return round((end - start) * 17150, 1)

# ── Simulated HTTP server ─────────────────────────────
class HTTPRobotServer:
    def __init__(self):
        self.routes = {
            "/forward":  forward,
            "/backward": backward,
            "/left":     left,
            "/right":    right,
            "/stop":     stop,
        }
    def handle(self, path):
        fn = self.routes.get(path)
        if fn:
            dist = measure_distance()
            if path == "/forward" and dist < 15:
                print(f"🚧 Obstacle at {dist} cm — blocked!")
                return {"error": "obstacle", "distance_cm": dist}
            fn()
            return {"ok": True, "distance_cm": dist}
        return {"error": "not found"}

server = HTTPRobotServer()
print("🤖 Robot Server on http://pi.local:5000")
print("Routes: /forward /backward /left /right /stop")
print("Simulating command sequence...")
print()

# Demo sequence
for cmd, delay in [("/forward",0.8),("/right",0.4),("/forward",0.6),("/left",0.4),("/stop",0)]:
    resp = server.handle(cmd)
    print(f"   GET {cmd} → {resp}")
    time.sleep(delay)

print("\\nRobot ready. In real deployment: pip install flask")
GPIO.cleanup()
`,
  },
  {
    id: 'arduino-smart-controller',
    title: '🔵 Arduino Smart LED Controller',
    description: 'An Arduino Uno project: a potentiometer controls LED brightness (PWM), a button toggles between auto-breathing and manual modes, and everything reports to Serial Monitor. Great intro to Arduino C++.',
    difficulty: 'intermediate',
    estimatedMinutes: 15,
    tags: ['Arduino', 'PWM', 'GPIO'],
    emoji: '🔵',
    components: [
      { definitionId: 'led-blue',      quantity: 1, label: 'Blue LED (PWM output)' },
      { definitionId: 'potentiometer', quantity: 1, label: 'Potentiometer (brightness)' },
      { definitionId: 'button',        quantity: 1, label: 'Mode Toggle Button' },
      { definitionId: 'resistor',      quantity: 2, label: '330Ω Resistors' },
    ],
    wiring: [
      { from: 'D9~  (PWM)',  to: 'LED anode (+)',     color: 'blue', note: 'PWM pin for dimming' },
      { from: 'GND',         to: 'LED cathode (−)',   color: 'black' },
      { from: 'A0',          to: 'Potentiometer wiper',color: 'orange', note: 'Middle pin' },
      { from: '5V',          to: 'Pot left pin',      color: 'red' },
      { from: 'GND',         to: 'Pot right pin',     color: 'black' },
      { from: 'D2',          to: 'Button one leg',    color: 'yellow', note: 'Other leg to GND' },
    ],
    code: `// Arduino Smart LED Controller
// Potentiometer dims LED · Button toggles modes

const int LED_PIN    = 9;   // PWM
const int POT_PIN    = A0;
const int BTN_PIN    = 2;

bool  manualMode  = false;
int   brightness  = 0;
bool  lastBtn     = HIGH;
unsigned long lastMsg = 0;

void setup() {
  Serial.begin(9600);
  pinMode(LED_PIN, OUTPUT);
  pinMode(BTN_PIN, INPUT_PULLUP);
  Serial.println("=== Smart LED Controller ===");
  Serial.println("Hold button to toggle Auto / Manual mode");
}

void loop() {
  // Button press detection
  bool btn = digitalRead(BTN_PIN);
  if (btn == LOW && lastBtn == HIGH) {
    manualMode = !manualMode;
    Serial.print("Mode switched → ");
    Serial.println(manualMode ? "MANUAL (pot)" : "AUTO (breathe)");
    delay(50);
  }
  lastBtn = btn;

  if (manualMode) {
    // Pot controls brightness
    int raw = analogRead(POT_PIN);
    brightness = map(raw, 0, 1023, 0, 255);
  } else {
    // Sine-wave breathing effect
    float t = millis() / 1000.0;
    brightness = (int)((sin(t * 1.8) + 1.0) * 127.5);
  }

  analogWrite(LED_PIN, brightness);

  // Serial log every 250 ms
  if (millis() - lastMsg > 250) {
    lastMsg = millis();
    Serial.print("Brightness: ");
    Serial.print(brightness);
    Serial.print(" / 255   Mode: ");
    Serial.println(manualMode ? "Manual" : "Auto");
  }
}
`,
  },
  {
    id: 'pico-env-monitor',
    title: '🟣 Pico Environmental Monitor',
    description: 'Run MicroPython on a Pi Pico W. Read two analog sensors, calculate air quality index, and broadcast readings over WiFi using the built-in CYW43439 wireless chip.',
    difficulty: 'advanced',
    estimatedMinutes: 25,
    tags: ['MicroPython', 'IoT', 'Networking', 'Sensors'],
    emoji: '🟣',
    components: [
      { definitionId: 'potentiometer', quantity: 2, label: 'Analog sensors (GP26 + GP27)' },
      { definitionId: 'led-green',     quantity: 1, label: 'Status LED (GP15)' },
      { definitionId: 'led-red',       quantity: 1, label: 'Alert LED (GP14)' },
      { definitionId: 'oled-ssd1306',  quantity: 1, label: 'OLED (I2C SDA=GP4 SCL=GP5)' },
    ],
    wiring: [
      { from: 'GP26 (ADC0)', to: 'Sensor 1 wiper',   color: 'yellow', note: 'Temperature analog' },
      { from: 'GP27 (ADC1)', to: 'Sensor 2 wiper',   color: 'orange', note: 'Air quality analog' },
      { from: 'GP15',        to: 'Green LED anode',  color: 'green' },
      { from: 'GP14',        to: 'Red LED anode',    color: 'red' },
      { from: 'GP4 (SDA)',   to: 'OLED SDA',         color: 'blue' },
      { from: 'GP5 (SCL)',   to: 'OLED SCL',         color: 'white' },
      { from: '3V3',         to: 'Sensor VCC',       color: 'red' },
      { from: 'GND',         to: 'All grounds',      color: 'black' },
    ],
    code: `# MicroPython — Pi Pico W Environmental Monitor
# Reads analog sensors, calculates AQI, broadcasts over WiFi

import machine, time, math, json

# ── Hardware setup ────────────────────────────────────
adc_temp = machine.ADC(26)      # GP26
adc_aqi  = machine.ADC(27)      # GP27
led_ok   = machine.Pin(15, machine.Pin.OUT)
led_alert= machine.Pin(14, machine.Pin.OUT)

# ── WiFi (simulated) ──────────────────────────────────
class WiFi:
    ssid = "SmartHome-2.4G"
    def connect(self):
        print(f"📶 Connecting to '{self.ssid}'...")
        time.sleep(0.5)
        print(f"✅ Connected — IP: 192.168.1.42")
    def post(self, url, data):
        print(f"☁️  POST {url}")
        print(f"   {json.dumps(data)}")

wifi = WiFi()
wifi.connect()

def read_sensors():
    raw_t = adc_temp.read_u16()
    raw_a = adc_aqi.read_u16()
    t = time.time()
    # Simulate realistic values with slow drift
    temp = round(18 + 8 * math.sin(t / 120), 1)
    aqi  = int(20 + 180 * math.sin(t / 300) ** 2)
    return temp, aqi

def aqi_category(aqi):
    if aqi <  50: return "Good",      led_ok, False
    if aqi < 100: return "Moderate",  led_ok, False
    if aqi < 150: return "Unhealthy", led_alert, True
    return "Hazardous", led_alert, True

print("🌍 Pico W Environmental Monitor v1.0")
print(f"Sampling: ADC0=temp ADC1=air_quality")
print("-" * 44)

readings = []
cycle = 0
while True:
    cycle += 1
    temp, aqi = read_sensors()
    category, active_led, alert = aqi_category(aqi)

    led_ok.value(0);    led_alert.value(0)
    active_led.value(1)

    readings.append({"temp": temp, "aqi": aqi})
    if len(readings) > 60: readings.pop(0)

    avg_temp = round(sum(r["temp"] for r in readings) / len(readings), 1)
    avg_aqi  = round(sum(r["aqi"]  for r in readings) / len(readings))

    print(f"#{cycle:>3}  🌡️ {temp}°C (avg {avg_temp})  "
          f"💨 AQI {aqi:>3} [{category}] (avg {avg_aqi})")

    if alert:
        print(f"     🚨 Air quality alert! AQI={aqi}")

    # Upload every 10 cycles
    if cycle % 10 == 0:
        wifi.post("https://env.piforge.io/v1/reading", {
            "device": "pico-env-001",
            "temp_c": temp, "aqi": aqi,
            "avg_temp": avg_temp, "avg_aqi": avg_aqi,
            "alert": alert,
        })

    time.sleep(1)
`,
  },
  {
    id: 'home-security-pro',
    title: '🔐 Home Security System Pro',
    description: 'A production-grade multi-zone security system: PIR detects motion, a button simulates a door sensor, a buzzer sounds the alarm, and the system sends SMS/email alerts — with arm/disarm and entry delay.',
    difficulty: 'advanced',
    estimatedMinutes: 30,
    tags: ['SmartHome', 'IoT', 'Networking', 'Sensors', 'Advanced'],
    emoji: '🔐',
    components: [
      { definitionId: 'pir-sensor', quantity: 1, label: 'PIR (Zone 1: Front door)' },
      { definitionId: 'button',     quantity: 1, label: 'Door Reed Switch (Zone 2)' },
      { definitionId: 'buzzer',     quantity: 1, label: 'Siren / Buzzer' },
      { definitionId: 'led-red',    quantity: 1, label: 'Armed LED' },
      { definitionId: 'led-green',  quantity: 1, label: 'Disarmed / OK LED' },
    ],
    wiring: [
      { from: 'GPIO4  (Pin 7)',  to: 'PIR OUT',        color: 'yellow' },
      { from: 'GPIO2  (Pin 3)',  to: 'Door switch',    color: 'orange', note: 'Pulled up — LOW = open' },
      { from: 'GPIO18 (Pin 12)', to: 'Buzzer +',       color: 'red' },
      { from: 'GPIO17 (Pin 11)', to: 'Red LED anode',  color: 'red' },
      { from: 'GPIO27 (Pin 13)', to: 'Green LED anode',color: 'green' },
      { from: '3V3   (Pin 1)',  to: 'PIR VCC',        color: 'red' },
      { from: 'GND   (Pin 6)',  to: 'All grounds',    color: 'black' },
    ],
    code: `import RPi.GPIO as GPIO
import time, json

PIR   = 4;  DOOR  = 2
SIREN = 18; LED_A = 17; LED_OK = 27

ENTRY_DELAY   = 5    # seconds
ZONES = {"PIR Front": PIR, "Door Zone 2": DOOR}

GPIO.setmode(GPIO.BCM)
GPIO.setup([SIREN, LED_A, LED_OK], GPIO.OUT, initial=GPIO.LOW)
GPIO.setup(PIR, GPIO.IN)
GPIO.setup(DOOR, GPIO.IN, pull_up_down=GPIO.PUD_UP)

# ── Notification hub ──────────────────────────────────
def notify(channel, msg, data=None):
    payload = {"channel": channel, "message": msg, "data": data or {}}
    print(f"📱 {channel.upper()} → {msg}  {json.dumps(data or {})}")

# ── Alarm ─────────────────────────────────────────────
armed = False
alarm_active = False

def arm(exit_delay=5):
    global armed
    GPIO.output(LED_OK, GPIO.LOW)
    print(f"🔒 Arming in {exit_delay}s — please leave...")
    for i in range(exit_delay, 0, -1):
        GPIO.output(SIREN, GPIO.HIGH); time.sleep(0.05)
        GPIO.output(SIREN, GPIO.LOW);  time.sleep(0.95)
        print(f"   {i}...")
    armed = True
    GPIO.output(LED_A, GPIO.HIGH)
    notify("app", "System ARMED", {"zones": list(ZONES.keys())})
    print("🔒 ARMED — all zones active")

def disarm():
    global armed, alarm_active
    armed = alarm_active = False
    GPIO.output(SIREN, GPIO.LOW)
    GPIO.output(LED_A, GPIO.LOW)
    GPIO.output(LED_OK, GPIO.HIGH)
    notify("app", "System DISARMED")
    print("🔓 DISARMED")

def trigger(zone):
    global alarm_active
    if alarm_active: return
    alarm_active = True
    notify("sms",   f"ALARM — {zone}", {"zone": zone, "ts": int(time.time())})
    notify("email", f"Intrusion detected: {zone}")
    notify("call",  "Emergency contact dialing...")
    print(f"\\n🚨🚨🚨  ALARM — {zone}  🚨🚨🚨")

GPIO.output(LED_OK, GPIO.HIGH)
print("🔐 Security System Pro — Standby")
arm(exit_delay=3)

try:
    while True:
        if armed:
            motion    = bool(GPIO.input(PIR))
            door_open = not bool(GPIO.input(DOOR))

            if door_open:
                print(f"⚠️  Door opened — {ENTRY_DELAY}s entry delay")
                for _ in range(ENTRY_DELAY * 2):
                    GPIO.output(SIREN, GPIO.HIGH); time.sleep(0.1)
                    GPIO.output(SIREN, GPIO.LOW);  time.sleep(0.4)
                if door_open:          # still open after delay?
                    trigger("Door Zone 2")

            if motion and not alarm_active:
                trigger("PIR Front")

            if alarm_active:
                GPIO.output(SIREN, GPIO.HIGH)
                time.sleep(0.3)
                GPIO.output(SIREN, GPIO.LOW)
                time.sleep(0.2)
        time.sleep(0.3)
except KeyboardInterrupt:
    disarm(); GPIO.cleanup()
    print("System shut down.")
`,
  },
);

export function getProject(id: string): Project | undefined {
  return projects.find(p => p.id === id);
}

export function getProjectsByDifficulty(d: Project['difficulty']): Project[] {
  return projects.filter(p => p.difficulty === d);
}

export function getProjectsByTag(tag: Project['tags'][number]): Project[] {
  return projects.filter(p => p.tags.includes(tag));
}
