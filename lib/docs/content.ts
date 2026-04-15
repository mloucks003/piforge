export interface DocSection {
  id: string;
  icon: string;
  title: string;
  articles: DocArticle[];
}

export interface DocArticle {
  id: string;
  title: string;
  body: string; // markdown-like plain text, newlines preserved
}

export const DOC_SECTIONS: DocSection[] = [
  {
    id: 'quick-start',
    icon: '🚀',
    title: 'Quick Start',
    articles: [
      {
        id: 'what-is-piforge',
        title: 'What is PiForge?',
        body: `PiForge is a browser-based Virtual Hardware Laboratory. You build real circuits — wiring components to a Raspberry Pi, Arduino, or Pi Pico — and run actual Python, MicroPython, or C++ code without any physical hardware.

Everything runs in your browser using WebAssembly (Pyodide for Python). No installs, no cloud VMs, no waiting.

The lab has five main areas:
• Left Sidebar — drag components onto the canvas and browse projects
• Canvas — the circuit board + your placed components + wires
• Right Panel — code editor, circuit inspector, AI assistant, and this docs tab
• Top Bar — board selector, run controls, export, and settings
• Console — live output from your running code`,
      },
      {
        id: 'first-circuit',
        title: 'Your First Circuit (2 minutes)',
        body: `1. The Raspberry Pi 4 board loads automatically on the canvas.
2. In the Left Sidebar → Parts tab, click "Add Breadboard".
3. Expand the Output category and click + next to Red LED.
4. Click the Wire button in the canvas toolbar (bottom centre).
5. Click GPIO17 (Pin 11) on the board, then click the LED anode (+).
6. Wire the LED cathode (−) to any GND pin.
7. In the Editor tab (right panel), paste: import RPi.GPIO as GPIO, time; GPIO.setmode(GPIO.BCM); GPIO.setup(17,GPIO.OUT); [GPIO.output(17,v) or time.sleep(0.5) for v in [1,0]*10]
8. Click ▶ Play. The LED blinks.

Tip: Use the Tutorials tab for step-by-step guided walkthroughs with completion tracking.`,
      },
    ],
  },
  {
    id: 'boards',
    icon: '🖥️',
    title: 'Boards',
    articles: [
      {
        id: 'raspberry-pi-4',
        title: 'Raspberry Pi 4 / 5',
        body: `40-pin GPIO header. Default board. Language: Python (RPi.GPIO / gpiozero).

Key pins:
• GPIO2/3 — I2C SDA/SCL (displays, sensors)
• GPIO14/15 — UART TX/RX (serial comms)
• GPIO18 — Hardware PWM (LED fade, servo)
• GPIO9/10/11 — SPI MISO/MOSI/CLK
• 3V3 (pins 1, 17) — 50 mA max per pin
• 5V (pins 2, 4) — direct from USB power
• GND (pins 6, 9, 14, 20, 25, 30, 34, 39)

GPIO numbering: use BCM mode (GPIO.setmode(GPIO.BCM)). BCM numbers match the labels (GPIO17, GPIO27, etc.), NOT the physical pin numbers.`,
      },
      {
        id: 'pi-zero-2w',
        title: 'Raspberry Pi Zero 2 W',
        body: `Same 40-pin GPIO as Pi 4/5, smaller form factor. Language: Python.

All the same GPIO capabilities as Pi 4. Use it when designing compact, low-power projects. The Zero 2 W has built-in WiFi/Bluetooth just like the Pi 4.

In PiForge: select Pi Zero 2 W from the board dropdown. The canvas shows a smaller board; all GPIO pins, SPI, I2C, and PWM pins are the same as Pi 4.`,
      },
      {
        id: 'arduino-uno',
        title: 'Arduino Uno',
        body: `14 digital I/O pins, 6 analog inputs. Language: C++ (Arduino framework).

Key pins:
• D0/D1 — UART RX/TX (Serial Monitor)
• D3, D5, D6, D9, D10, D11 — PWM capable (marked ~)
• D10/11/12/13 — SPI SS/MOSI/MISO/SCK
• A4/A5 — I2C SDA/SCL
• A0-A5 — Analog input (analogRead, 0-1023)
• VIN, 5V, 3.3V, GND — power rails

Key functions: digitalWrite(pin, HIGH/LOW), digitalRead(pin), analogWrite(pin, 0-255), analogRead(pin), Serial.println(), delay(ms)`,
      },
      {
        id: 'pico-w',
        title: 'Raspberry Pi Pico W',
        body: `26 GPIO pins, 3 ADC inputs. Language: MicroPython.

Key pins:
• GP0/1 — UART0 TX/RX
• GP4/5 — I2C0 SDA/SCL (default)
• GP2/3 — SPI0 SCK/TX
• GP26/27/28 — ADC0/1/2 (analog input)
• GP15 — built-in LED
• 3V3, GND — power

MicroPython basics:
  from machine import Pin, PWM, ADC
  led = Pin(15, Pin.OUT)
  led.value(1)           # on
  adc = ADC(26)
  val = adc.read_u16()   # 0-65535

WiFi (Pico W only):
  import network
  wlan = network.WLAN(network.STA_IF)
  wlan.active(True)
  wlan.connect("SSID", "password")`,
      },
    ],
  },
  {
    id: 'components',
    icon: '🧩',
    title: 'Components',
    articles: [
      {
        id: 'output-components',
        title: 'Output Components',
        body: `LED (Red / Green / Blue / RGB)
  Pins: anode (+) → GPIO signal, cathode (−) → GND
  Always wire both! An LED with only one wire will not work.
  RGB LED has 4 legs: R, G, B anodes + common cathode.

Piezo Buzzer
  Pins: + → GPIO (use PWM for tones), − → GND
  GPIO.PWM(pin, frequency) to play a tone.
  Arduino: tone(pin, frequency, duration)

Servo Motor (SG90)
  Pins: Signal (orange) → PWM pin, VCC (red) → 5V, GND (brown) → GND
  Python: use gpiozero.Servo or set PWM duty cycle (1ms=0°, 2ms=180°)
  Arduino: #include <Servo.h>; Servo s; s.attach(9); s.write(90);

NeoPixel Strip (8 LEDs)
  Pins: DIN → any GPIO, 5V, GND
  Python: from rpi_ws281x import PixelStrip; strip.setPixelColor(n, Color(r,g,b))`,
      },
      {
        id: 'input-components',
        title: 'Input Components',
        body: `Push Button
  Pins: one leg → GPIO (with pull-up), other leg → GND
  Python: GPIO.setup(pin, GPIO.IN, pull_up_down=GPIO.PUD_UP)
          pressed when GPIO.input(pin) == False (active low)
  Arduino: pinMode(pin, INPUT_PULLUP); pressed when digitalRead(pin) == LOW

Potentiometer
  Pins: left → 3V3, wiper (middle) → ADC pin, right → GND
  Gives analog value. Pi: requires MCP3008 ADC chip (SPI)
  Arduino/Pico: analogRead(A0) → 0-1023 (Arduino) / 0-65535 (Pico)

Analog Joystick
  X-axis → ADC, Y-axis → ADC, SW (button) → GPIO with pull-up`,
      },
      {
        id: 'sensor-components',
        title: 'Sensors',
        body: `DHT22 — Temperature & Humidity
  Pins: VCC → 3V3, Data → GPIO, GND
  Python: import adafruit_dht; d=adafruit_dht.DHT22(board.D4); d.temperature, d.humidity
  Readings every 2 seconds minimum.

PIR Motion Sensor
  Pins: VCC → 5V, OUT → GPIO input, GND
  Output goes HIGH when motion detected. 3-30 second hold time (adjustable).
  Python: GPIO.setup(pin, GPIO.IN); motion = GPIO.input(pin)

HC-SR04 Ultrasonic
  Pins: VCC → 5V, TRIG → GPIO out, ECHO → GPIO in, GND
  Send 10µs pulse on TRIG. Measure ECHO high duration.
  Distance (cm) = duration × 17150

5V Relay
  Pins: IN → GPIO, VCC → 5V, GND. Isolates high-voltage loads.
  GPIO.output(pin, GPIO.HIGH) closes the relay.`,
      },
      {
        id: 'display-components',
        title: 'Displays',
        body: `OLED SSD1306 (128×64)
  Interface: I2C. Pins: SDA → GPIO2 (Pi) / GP4 (Pico), SCL → GPIO3 / GP5, VCC → 3V3
  Python: from luma.oled import device; d=device.ssd1306(serial)

LCD 16×2 (I2C)
  Interface: I2C (PCF8574 backpack). Pins: SDA, SCL, VCC (5V), GND
  Python: from RPLCD.i2c import CharLCD; lcd=CharLCD('PCF8574',0x27); lcd.write_string("Hello!")

7-Segment Display
  Pins: segments a-g + dp → GPIO (through 330Ω resistors), common cathode → GND

7" Touchscreen (Pi official)
  Connects via DSI ribbon cable + USB power. Runs pygame or tkinter apps.
  Enable in PiForge: place the component and use touchscreen-related code templates.`,
      },
    ],
  },
  {
    id: 'wiring',
    icon: '⚡',
    title: 'Wiring Guide',
    articles: [
      {
        id: 'how-to-wire',
        title: 'How to Wire Components',
        body: `1. Click the Wire button in the canvas toolbar (bottom centre of the canvas area).
   The button turns blue — you are now in Wire Mode.

2. Click a pin on the board (e.g. GPIO17) or on a component.
   The pin highlights green — that is your wire start point.

3. Click the destination pin (e.g. the LED anode).
   A coloured wire is drawn connecting them.

4. Repeat for every connection you need.

5. To exit Wire Mode: click the Wire button again or press Escape.

Wire colours are auto-assigned. To delete a wire:
  • Click the wire to select it (it turns red)
  • Click the Delete Wire button in the canvas toolbar
  • Or press the Delete / Backspace key`,
      },
      {
        id: 'common-mistakes',
        title: 'Common Wiring Mistakes',
        body: `❌ Only wiring the signal pin — LEDs need BOTH anode (GPIO) AND cathode (GND)
✅ Every component needs a complete circuit: power → component → ground

❌ Connecting to 5V when a sensor needs 3.3V
✅ Check component datasheet: most sensors (DHT22, PIR) run on 3.3V

❌ Using the wrong GPIO number
✅ PiForge uses BCM numbering by default. GPIO17 = physical pin 11

❌ Multiple components sharing the same GPIO pin
✅ Each output device needs its own GPIO pin

Circuit Inspector: switch to the Circuit tab in the right panel to see which
pins are connected and whether each component is fully wired. Green = ready, 
Yellow = partially wired, Grey = disconnected.`,
      },
    ],
  },
  {
    id: 'code',
    icon: '✏️',
    title: 'Code Reference',
    articles: [
      {
        id: 'python-gpio',
        title: 'Python — RPi.GPIO',
        body: `import RPi.GPIO as GPIO
import time

GPIO.setmode(GPIO.BCM)          # use BCM numbering
GPIO.setup(17, GPIO.OUT)        # set pin as output
GPIO.setup(4,  GPIO.IN, pull_up_down=GPIO.PUD_UP)  # input with pull-up

GPIO.output(17, GPIO.HIGH)      # set HIGH (3.3V)
GPIO.output(17, GPIO.LOW)       # set LOW (0V)
GPIO.input(4)                   # read: True=HIGH, False=LOW

# PWM
pwm = GPIO.PWM(18, 1000)        # pin 18, 1kHz frequency
pwm.start(50)                   # 50% duty cycle
pwm.ChangeDutyCycle(75)         # change to 75%
pwm.stop()

# Interrupts
GPIO.add_event_detect(4, GPIO.FALLING, callback=my_fn, bouncetime=200)

GPIO.cleanup()                  # always clean up on exit`,
      },
      {
        id: 'micropython',
        title: 'MicroPython (Pico)',
        body: `from machine import Pin, PWM, ADC, I2C
import time

# Digital I/O
led = Pin(15, Pin.OUT)
btn = Pin(14, Pin.IN, Pin.PULL_UP)
led.value(1)                    # set HIGH
led.toggle()                    # flip state
btn.value()                     # read pin

# PWM
pwm = PWM(Pin(16))
pwm.freq(1000)
pwm.duty_u16(32768)             # 50% — range 0-65535

# ADC (analog)
adc = ADC(26)                   # GP26 = ADC0
raw = adc.read_u16()            # 0–65535
volts = raw * 3.3 / 65535

# I2C
i2c = I2C(0, sda=Pin(4), scl=Pin(5), freq=400000)
devices = i2c.scan()            # list of addresses

# WiFi (Pico W)
import network
wlan = network.WLAN(network.STA_IF)
wlan.active(True)
wlan.connect("SSID", "pass")
while not wlan.isconnected(): time.sleep(0.1)
print(wlan.ifconfig())`,
      },
      {
        id: 'arduino-cpp',
        title: 'Arduino C++',
        body: `// setup() runs once, loop() runs forever

void setup() {
  Serial.begin(9600);
  pinMode(9, OUTPUT);           // digital output
  pinMode(2, INPUT_PULLUP);     // button with pullup
}

void loop() {
  // Digital I/O
  digitalWrite(9, HIGH);        // set HIGH
  int val = digitalRead(2);     // read: HIGH or LOW

  // PWM (only ~ pins)
  analogWrite(9, 128);          // 0-255, ~50% duty cycle

  // Analog read
  int pot = analogRead(A0);     // 0-1023
  float volts = pot * (5.0/1023.0);

  // Serial Monitor
  Serial.print("Value: ");
  Serial.println(val);

  // Servo
  // #include <Servo.h>
  // Servo myServo; myServo.attach(9); myServo.write(90);

  delay(100);                   // ms
}`,
      },
    ],
  },
  {
    id: 'ai',
    icon: '🤖',
    title: 'AI Assistant',
    articles: [
      {
        id: 'ai-overview',
        title: 'What the AI Can Do',
        body: `The AI assistant (right panel → AI tab) has four modes:

💬 Chat
  Ask anything: "How do I read a DHT22 sensor?", "What resistor do I need for an LED?"
  Full conversation memory within your session.

🔍 Analyze
  One click → AI reads your current code and circuit wiring, then gives a detailed review:
  potential bugs, missing connections, logic errors, and improvement suggestions.

🔧 Fix
  Paste or describe an error. AI reads your console output and code, then returns corrected
  code with an explanation of what was wrong.

⚡ Generate
  Describe what you want in plain English: "blink an LED every 500ms and print ON/OFF"
  AI generates ready-to-run code for your active board language (Python/C++/MicroPython).

No API key needed — the AI runs on PiForge's server key. Status indicator shows green when ready.`,
      },
    ],
  },
  {
    id: 'shortcuts',
    icon: '⌨️',
    title: 'Keyboard Shortcuts',
    articles: [
      {
        id: 'keyboard-shortcuts',
        title: 'All Shortcuts',
        body: `General
  Ctrl/Cmd + Z          Undo last action
  Ctrl/Cmd + Y          Redo
  Ctrl/Cmd + Shift + Z  Redo (alternate)
  Ctrl/Cmd + S          Quick save project

Canvas
  Scroll wheel          Zoom in / out
  Click + drag stage    Pan the canvas (when not in wire mode)
  Delete / Backspace    Delete selected wire
  Escape                Exit wire mode / cancel wire in progress

Simulation
  ▶ Play button         Start simulation
  ⏸ Pause button        Pause simulation
  ⏹ Stop button         Stop and reset simulation

Right-click on a component → Delete Component context menu
  
Pro tip: hold Ctrl while scrolling for fine zoom control.`,
      },
    ],
  },
];
