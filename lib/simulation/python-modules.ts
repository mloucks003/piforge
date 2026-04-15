/**
 * Python source strings injected into Pyodide before user code runs.
 * These provide mock RPi.GPIO and gpiozero modules that call back
 * into the TypeScript GPIO mock via js_callback.
 */

export const RPI_GPIO_MODULE = `
# Full mock RPi.GPIO module for PiForge simulator
BCM   = 11
BOARD = 10
OUT   = 0
IN    = 1
HIGH  = 1
LOW   = 0
PUD_UP   = 22
PUD_DOWN = 21
PUD_OFF  = 20
RISING  = 31
FALLING = 32
BOTH    = 33
UNKNOWN = -1
SERIAL  = 40
SPI     = 41
I2C     = 42
HARD_PWM = 43

_mode = None
_pins = {}          # pin -> {'mode': IN/OUT, 'value': 0/1, 'pull': PUD_OFF}
_edge_callbacks = {}
_js_callback = None
_js_input_getter = None   # JS fn: (pin) -> 0 | 1

def _set_js_callback(cb):
    global _js_callback
    _js_callback = cb

def _set_js_input_getter(fn):
    global _js_input_getter
    _js_input_getter = fn

def getmode():
    return _mode

def setmode(mode):
    global _mode
    _mode = mode

def setwarnings(flag):
    pass

def setup(pin, mode, pull_up_down=PUD_OFF, initial=LOW):
    pins = pin if isinstance(pin, (list, tuple)) else [pin]
    for p in pins:
        _pins[p] = {'mode': mode, 'value': int(initial), 'pull': pull_up_down}
        if _js_callback:
            _js_callback(p, int(initial), 'setup', 1 if mode == OUT else 0)

def output(pin, value):
    val = 1 if value else 0
    pins = pin if isinstance(pin, (list, tuple)) else [pin]
    for p in pins:
        if p in _pins:
            _pins[p]['value'] = val
        else:
            _pins[p] = {'mode': OUT, 'value': val, 'pull': PUD_OFF}
        if _js_callback:
            _js_callback(p, val, 'output', 0)

def input(pin):
    # Ask JS side for the live button state first
    if _js_input_getter is not None:
        live = _js_input_getter(pin)
        if live is not None:
            v = int(live)
            if pin in _pins:
                _pins[pin]['value'] = v
            return v
    return _pins.get(pin, {}).get('value', 0)

def cleanup(pin=None):
    global _pins, _mode, _edge_callbacks
    if pin is None:
        _pins = {}
        _edge_callbacks = {}
        _mode = None
        if _js_callback:
            _js_callback(-1, 0, 'cleanup', 0)
    else:
        _pins.pop(pin, None)
        _edge_callbacks.pop(pin, None)
        if _js_callback:
            _js_callback(pin, 0, 'cleanup_pin', 0)

def gpio_function(pin):
    info = _pins.get(pin)
    if not info:
        return UNKNOWN
    return OUT if info['mode'] == OUT else IN

def add_event_detect(pin, edge, callback=None, bouncetime=200):
    if callback:
        _edge_callbacks[pin] = {'edge': edge, 'callback': callback, 'bounce': bouncetime}

def remove_event_detect(pin):
    _edge_callbacks.pop(pin, None)

def event_detected(pin):
    return False  # Simplified: real edge detection would need async polling

def wait_for_edge(pin, edge, timeout=None):
    # In the simulator we return immediately (non-blocking stub)
    return pin

class PWM:
    """Software PWM — duty_cycle updates go to JS for display purposes."""
    def __init__(self, pin, frequency):
        self.pin = pin
        self.frequency = frequency
        self._duty = 0
        self._running = False
        setup(pin, OUT)

    def start(self, duty_cycle):
        self._running = True
        self._duty = max(0.0, min(100.0, float(duty_cycle)))
        self._push()

    def stop(self):
        self._running = False
        output(self.pin, 0)

    def ChangeFrequency(self, freq):
        self.frequency = freq

    def ChangeDutyCycle(self, duty_cycle):
        self._duty = max(0.0, min(100.0, float(duty_cycle)))
        if self._running:
            self._push()

    def _push(self):
        # Map duty 0-100 → value 0 or 1 for the LED (>50% = on for visual)
        val = 1 if self._duty > 50 else 0
        if _js_callback:
            _js_callback(self.pin, val, 'pwm', int(self._duty))
`;

export const GPIOZERO_MODULE = `
# Full gpiozero mock for PiForge simulator
import RPi.GPIO as GPIO

# ---------------------------------------------------------------------------
# LED
# ---------------------------------------------------------------------------
class LED:
    def __init__(self, pin, active_high=True, initial_value=False):
        self.pin = pin
        self._lit = bool(initial_value)
        self.active_high = active_high
        GPIO.setup(pin, GPIO.OUT)
        if initial_value:
            self.on()

    def on(self):
        self._lit = True
        GPIO.output(self.pin, GPIO.HIGH if self.active_high else GPIO.LOW)

    def off(self):
        self._lit = False
        GPIO.output(self.pin, GPIO.LOW if self.active_high else GPIO.HIGH)

    def toggle(self):
        self.off() if self._lit else self.on()

    @property
    def is_lit(self):
        return self._lit

    @property
    def value(self):
        return 1 if self._lit else 0

    @value.setter
    def value(self, v):
        self.on() if v else self.off()

    async def blink(self, on_time=1, off_time=1, n=None, background=True):
        import asyncio
        count = 0
        while n is None or count < n:
            if _js_check_stop and _js_check_stop(): break
            self.on()
            await asyncio.sleep(float(on_time))
            self.off()
            await asyncio.sleep(float(off_time))
            count += 1

    def close(self):
        self.off()
        GPIO.cleanup(self.pin)

# ---------------------------------------------------------------------------
# PWMLED (software PWM via GPIO.PWM)
# ---------------------------------------------------------------------------
class PWMLED:
    def __init__(self, pin, active_high=True, initial_value=0, frequency=100):
        self.pin = pin
        self._pwm = GPIO.PWM(pin, frequency)
        self._value = float(initial_value)
        self._pwm.start(self._value * 100)

    @property
    def value(self):
        return self._value

    @value.setter
    def value(self, v):
        self._value = max(0.0, min(1.0, float(v)))
        self._pwm.ChangeDutyCycle(self._value * 100)

    def on(self):
        self.value = 1.0

    def off(self):
        self.value = 0.0

    def toggle(self):
        self.value = 0.0 if self._value > 0.5 else 1.0

    @property
    def is_lit(self):
        return self._value > 0

    async def pulse(self, fade_in_time=1, fade_out_time=1, n=None, background=True):
        import asyncio
        count = 0
        steps = 20
        while n is None or count < n:
            if _js_check_stop and _js_check_stop(): break
            for i in range(steps + 1):
                self.value = i / steps
                await asyncio.sleep(float(fade_in_time) / steps)
            for i in range(steps, -1, -1):
                self.value = i / steps
                await asyncio.sleep(float(fade_out_time) / steps)
            count += 1

    async def blink(self, on_time=1, off_time=1, n=None, background=True):
        import asyncio
        count = 0
        while n is None or count < n:
            if _js_check_stop and _js_check_stop(): break
            self.on()
            await asyncio.sleep(float(on_time))
            self.off()
            await asyncio.sleep(float(off_time))
            count += 1

    def close(self):
        self._pwm.stop()

# ---------------------------------------------------------------------------
# Button
# ---------------------------------------------------------------------------
class Button:
    def __init__(self, pin, pull_up=True, active_state=None, bounce_time=None):
        self.pin = pin
        self.pull_up = pull_up
        GPIO.setup(pin, GPIO.IN, pull_up_down=GPIO.PUD_UP if pull_up else GPIO.PUD_DOWN)
        self._when_pressed = None
        self._when_released = None
        self._last = 0

    @property
    def is_pressed(self):
        raw = GPIO.input(self.pin)
        # pull_up=True means active low (pressed = 0 on pin)
        pressed = (raw == 0) if self.pull_up else (raw == 1)
        # Fire callbacks when state changes
        cur = 1 if pressed else 0
        if cur != self._last:
            if cur and self._when_pressed:
                self._when_pressed()
            elif not cur and self._when_released:
                self._when_released()
            self._last = cur
        return pressed

    @property
    def is_held(self):
        return self.is_pressed

    @property
    def value(self):
        return 1 if self.is_pressed else 0

    @property
    def when_pressed(self):
        return self._when_pressed

    @when_pressed.setter
    def when_pressed(self, cb):
        self._when_pressed = cb

    @property
    def when_released(self):
        return self._when_released

    @when_released.setter
    def when_released(self, cb):
        self._when_released = cb

    async def wait_for_press(self, timeout=None):
        import asyncio, time as _t
        start = _t.time()
        while not self.is_pressed:
            if _js_check_stop and _js_check_stop(): return
            if timeout and (_t.time() - start) > timeout: return
            await asyncio.sleep(0.05)

    async def wait_for_release(self, timeout=None):
        import asyncio, time as _t
        start = _t.time()
        while self.is_pressed:
            if _js_check_stop and _js_check_stop(): return
            if timeout and (_t.time() - start) > timeout: return
            await asyncio.sleep(0.05)

    def close(self):
        GPIO.cleanup(self.pin)

# ---------------------------------------------------------------------------
# Buzzer
# ---------------------------------------------------------------------------
class Buzzer:
    def __init__(self, pin, active_high=True, initial_value=False):
        self.pin = pin
        GPIO.setup(pin, GPIO.OUT)
        if initial_value:
            self.on()

    def on(self):
        GPIO.output(self.pin, GPIO.HIGH)

    def off(self):
        GPIO.output(self.pin, GPIO.LOW)

    def toggle(self):
        pass

    async def beep(self, on_time=1, off_time=1, n=None, background=True):
        import asyncio
        count = 0
        while n is None or count < n:
            if _js_check_stop and _js_check_stop(): break
            self.on()
            await asyncio.sleep(float(on_time))
            self.off()
            await asyncio.sleep(float(off_time))
            count += 1

    def close(self):
        self.off()

# ---------------------------------------------------------------------------
# Servo (stub)
# ---------------------------------------------------------------------------
class Servo:
    def __init__(self, pin, initial_value=0, min_pulse_width=1/1000, max_pulse_width=2/1000, frame_width=20/1000):
        self.pin = pin
        self._value = float(initial_value)
        self._pwm = GPIO.PWM(pin, 50)
        self._pwm.start(7.5)

    @property
    def value(self):
        return self._value

    @value.setter
    def value(self, v):
        self._value = max(-1.0, min(1.0, float(v)))
        duty = 7.5 + self._value * 5.0
        self._pwm.ChangeDutyCycle(duty)

    def min(self):
        self.value = -1.0

    def mid(self):
        self.value = 0.0

    def max(self):
        self.value = 1.0

    def close(self):
        self._pwm.stop()

# ---------------------------------------------------------------------------
# DistanceSensor / MotionSensor / LightSensor (stubs)
# ---------------------------------------------------------------------------
class DistanceSensor:
    def __init__(self, echo, trigger, max_distance=1, threshold_distance=0.3):
        self.echo = echo
        self.trigger = trigger
        self._distance = 0.5

    @property
    def distance(self):
        return self._distance

    @property
    def value(self):
        return self._distance

    def close(self):
        pass

class MotionSensor:
    def __init__(self, pin, queue_len=1, sample_rate=10, threshold=0.5, partial=False):
        self.pin = pin
        GPIO.setup(pin, GPIO.IN)

    @property
    def motion_detected(self):
        return GPIO.input(self.pin) == 1

    @property
    def value(self):
        return 1 if self.motion_detected else 0

    async def wait_for_motion(self, timeout=None):
        import asyncio, time as _t
        start = _t.time()
        while not self.motion_detected:
            if _js_check_stop and _js_check_stop(): return
            if timeout and (_t.time() - start) > timeout: return
            await asyncio.sleep(0.1)

    def close(self):
        pass

class LightSensor:
    def __init__(self, pin, queue_len=5, charge_time_limit=0.01, threshold=0.1, partial=False):
        self.pin = pin
        self._value = 0.5

    @property
    def value(self):
        return self._value

    @property
    def light_detected(self):
        return self._value > 0.1

    def close(self):
        pass

# Convenience aliases
TrafficHat = None  # stub

# ---------------------------------------------------------------------------
# Servo / AngularServo  (gpiozero API)
# ---------------------------------------------------------------------------
_js_servo_callback = None   # set by engine: (pin, angle_degrees) -> None

def _set_js_servo_callback(fn):
    global _js_servo_callback
    _js_servo_callback = fn

class Servo:
    """Servo with value in -1..1 range (maps to -90..90 degrees)."""
    def __init__(self, pin, initial_value=0, min_pulse_width=1/1000,
                 max_pulse_width=2/1000, frame_width=20/1000):
        self.pin = pin
        self._value = max(-1.0, min(1.0, float(initial_value)))
        self._push()

    def _push(self):
        if _js_servo_callback:
            _js_servo_callback(self.pin, self._value * 90)

    @property
    def value(self):
        return self._value

    @value.setter
    def value(self, v):
        self._value = max(-1.0, min(1.0, float(v)))
        self._push()

    def min(self):   self.value = -1
    def max(self):   self.value = 1
    def mid(self):   self.value = 0
    def detach(self): pass
    def close(self):  pass

class AngularServo(Servo):
    """Servo with angle in degrees."""
    def __init__(self, pin, initial_angle=0, min_angle=-90, max_angle=90,
                 min_pulse_width=1/1000, max_pulse_width=2/1000, frame_width=20/1000):
        self.pin = pin
        self.min_angle = float(min_angle)
        self.max_angle = float(max_angle)
        self._angle = max(self.min_angle, min(self.max_angle, float(initial_angle)))
        self._push_angle()

    def _push_angle(self):
        if _js_servo_callback:
            _js_servo_callback(self.pin, self._angle)
        print(f"Servo GPIO{self.pin}: angle={self._angle:.1f}°")

    @property
    def angle(self):
        return self._angle

    @angle.setter
    def angle(self, a):
        self._angle = max(self.min_angle, min(self.max_angle, float(a)))
        self._push_angle()

    @property
    def value(self):
        span = self.max_angle - self.min_angle
        return (self._angle - self.min_angle) / span * 2 - 1 if span else 0

    @value.setter
    def value(self, v):
        span = self.max_angle - self.min_angle
        self.angle = self.min_angle + (float(v) + 1) / 2 * span

    def min(self):  self.angle = self.min_angle
    def max(self):  self.angle = self.max_angle
    def mid(self):  self.angle = (self.min_angle + self.max_angle) / 2

# ---------------------------------------------------------------------------
# DistanceSensor  (HC-SR04)
# ---------------------------------------------------------------------------
_js_distance_getter = None  # set by engine: () -> cm (float)

def _set_js_distance_getter(fn):
    global _js_distance_getter
    _js_distance_getter = fn

class DistanceSensor:
    def __init__(self, echo, trigger, max_distance=1, partial=False):
        self.echo = echo
        self.trigger = trigger
        self.max_distance = float(max_distance)

    def _read_cm(self):
        if _js_distance_getter:
            return float(_js_distance_getter() or 30)
        return 30.0

    @property
    def distance(self):
        return min(self._read_cm() / 100.0, self.max_distance)

    @property
    def value(self):
        return self.distance / self.max_distance

    def in_range(self, threshold=0.3):
        return self.distance < threshold

    async def wait_for_in_range(self, threshold=0.3, timeout=None):
        import asyncio, time as _t
        start = _t.time()
        while self.distance >= threshold:
            if _js_check_stop and _js_check_stop(): return
            if timeout and (_t.time() - start) > timeout: return
            await asyncio.sleep(0.1)

    async def wait_for_out_of_range(self, threshold=0.3, timeout=None):
        import asyncio, time as _t
        start = _t.time()
        while self.distance < threshold:
            if _js_check_stop and _js_check_stop(): return
            if timeout and (_t.time() - start) > timeout: return
            await asyncio.sleep(0.1)

    def close(self): pass

# ---------------------------------------------------------------------------
# Motor  (L298N H-bridge style)
# ---------------------------------------------------------------------------
_js_motor_callback = None   # set by engine: (pin, direction, speed) -> None

def _set_js_motor_callback(fn):
    global _js_motor_callback
    _js_motor_callback = fn

class Motor:
    def __init__(self, forward=None, backward=None, enable=None, pwm=True):
        self.forward_pin  = forward
        self.backward_pin = backward
        self._speed = 0
        self._dir   = 'stop'

    def _push(self):
        if _js_motor_callback and self.forward_pin:
            _js_motor_callback(self.forward_pin, self._dir, self._speed)

    def forward(self, speed=1):
        self._dir = 'forward'; self._speed = max(0, min(1, float(speed)))
        if _js_gpio_callback:
            if self.forward_pin:  _js_gpio_callback(self.forward_pin,  1)
            if self.backward_pin: _js_gpio_callback(self.backward_pin, 0)
        self._push()
        print(f"Motor: FORWARD speed={self._speed:.1f}")

    def backward(self, speed=1):
        self._dir = 'backward'; self._speed = max(0, min(1, float(speed)))
        if _js_gpio_callback:
            if self.forward_pin:  _js_gpio_callback(self.forward_pin,  0)
            if self.backward_pin: _js_gpio_callback(self.backward_pin, 1)
        self._push()
        print(f"Motor: BACKWARD speed={self._speed:.1f}")

    def stop(self):
        self._dir = 'stop'; self._speed = 0
        if _js_gpio_callback:
            for pin in [self.forward_pin, self.backward_pin]:
                if pin: _js_gpio_callback(pin, 0)
        self._push()
        print("Motor: STOP")

    @property
    def value(self):
        return (1 if self._dir == 'forward' else -1 if self._dir == 'backward' else 0) * self._speed

    @value.setter
    def value(self, v):
        if v > 0:   self.forward(v)
        elif v < 0: self.backward(-v)
        else:       self.stop()

    def close(self): self.stop()

# ---------------------------------------------------------------------------
# Robot  (two Motor gpiozero API)
# ---------------------------------------------------------------------------
class Robot:
    def __init__(self, left, right):
        def _unpack(m):
            return (m[0], m[1]) if (isinstance(m, (list, tuple)) and len(m) == 2) else (m, None)
        lf, lb = _unpack(left)
        rf, rb = _unpack(right)
        self.left_motor  = Motor(forward=lf, backward=lb)
        self.right_motor = Motor(forward=rf, backward=rb)

    def forward(self, speed=1):
        self.left_motor.forward(speed); self.right_motor.forward(speed)
        print(f"Robot: FORWARD speed={speed:.1f}")

    def backward(self, speed=1):
        self.left_motor.backward(speed); self.right_motor.backward(speed)
        print(f"Robot: BACKWARD speed={speed:.1f}")

    def left(self, speed=1):
        self.left_motor.backward(speed * 0.5); self.right_motor.forward(speed)
        print("Robot: LEFT")

    def right(self, speed=1):
        self.left_motor.forward(speed); self.right_motor.backward(speed * 0.5)
        print("Robot: RIGHT")

    def stop(self):
        self.left_motor.stop(); self.right_motor.stop()
        print("Robot: STOP")

    def curve_left(self, speed=1):
        self.left_motor.forward(speed * 0.4); self.right_motor.forward(speed)

    def curve_right(self, speed=1):
        self.left_motor.forward(speed); self.right_motor.forward(speed * 0.4)

    def close(self): self.stop()

# ---------------------------------------------------------------------------
# DHT22  (temperature + humidity sensor)
# ---------------------------------------------------------------------------
_js_dht_getter = None   # set by engine: () -> {temperature, humidity}

def _set_js_dht_getter(fn):
    global _js_dht_getter
    _js_dht_getter = fn

class DHT22:
    def __init__(self, pin):
        self.pin = pin

    def _read(self):
        if _js_dht_getter:
            v = _js_dht_getter()
            return float(getattr(v, 'temperature', 22.5)), float(getattr(v, 'humidity', 65.0))
        return 22.5, 65.0

    @property
    def temperature(self):
        return self._read()[0]

    @property
    def humidity(self):
        return self._read()[1]

# Alias
DHT11 = DHT22

# ---------------------------------------------------------------------------
# PIR Motion Sensor
# ---------------------------------------------------------------------------
_js_pir_getter = None   # set by engine: () -> bool

def _set_js_pir_getter(fn):
    global _js_pir_getter
    _js_pir_getter = fn

class MotionSensor:
    def __init__(self, pin, queue_len=1, sample_rate=10, partial=False, pin_factory=None):
        self.pin = pin

    @property
    def motion_detected(self):
        if _js_pir_getter:
            return bool(_js_pir_getter())
        return False

    @property
    def value(self):
        return 1 if self.motion_detected else 0

    async def wait_for_motion(self, timeout=None):
        import asyncio, time as _t
        start = _t.time()
        while not self.motion_detected:
            if _js_check_stop and _js_check_stop(): return
            if timeout and (_t.time() - start) > timeout: return
            await asyncio.sleep(0.1)

    async def wait_for_no_motion(self, timeout=None):
        import asyncio, time as _t
        start = _t.time()
        while self.motion_detected:
            if _js_check_stop and _js_check_stop(): return
            if timeout and (_t.time() - start) > timeout: return
            await asyncio.sleep(0.1)

    def close(self): pass

PIR = MotionSensor   # common alias

# ---------------------------------------------------------------------------
# Potentiometer / analog input
# ---------------------------------------------------------------------------
_js_potentiometer_getter = None   # set by engine: () -> 0-100

def _set_js_potentiometer_getter(fn):
    global _js_potentiometer_getter
    _js_potentiometer_getter = fn

class MCP3008:
    """Stub ADC — reads potentiometer value from sensor store."""
    def __init__(self, channel=0, clock_pin=None, mosi_pin=None, miso_pin=None, select_pin=None):
        self.channel = channel

    @property
    def value(self):
        if _js_potentiometer_getter:
            return float(_js_potentiometer_getter()) / 100.0
        return 0.5

    @property
    def voltage(self):
        return self.value * 3.3

Potentiometer = MCP3008   # convenience alias
`;

// ---------------------------------------------------------------------------
// Adafruit_DHT module (separate from gpiozero, widely used)
// ---------------------------------------------------------------------------
export const ADAFRUIT_DHT_MODULE = `
DHT22 = 22
DHT11 = 11
AM2302 = 22

_js_dht_getter = None

def _set_js_dht_getter(fn):
    global _js_dht_getter
    _js_dht_getter = fn

def read_retry(sensor, pin, retries=15, delay_seconds=2, platform=None):
    if _js_dht_getter:
        v = _js_dht_getter()
        return float(getattr(v, 'humidity', 65.0)), float(getattr(v, 'temperature', 22.5))
    return 65.0, 22.5

def read(sensor, pin, platform=None):
    return read_retry(sensor, pin)
`;

/**
 * Bootstrap code that:
 * 1. Registers the mock modules in sys.modules
 * 2. Patches time.sleep to be async-friendly
 * 3. Sets up the JS callback bridge
 */
export const BOOTSTRAP_CODE = `
import sys, types, asyncio

# --- Register RPi.GPIO mock ---
_rpi_mod = types.ModuleType('RPi')
_rpi_mod.__path__ = ['RPi']
sys.modules['RPi'] = _rpi_mod

_gpio_mod = types.ModuleType('RPi.GPIO')
exec(_RPi_GPIO_SRC, _gpio_mod.__dict__)
sys.modules['RPi.GPIO'] = _gpio_mod
_rpi_mod.GPIO = _gpio_mod

# --- Register gpiozero mock ---
_gz_mod = types.ModuleType('gpiozero')
exec(_GPIOZERO_SRC, _gz_mod.__dict__)
sys.modules['gpiozero'] = _gz_mod

# --- Patch time.sleep to yield to the event loop ---
import time as _time_mod
_original_sleep = _time_mod.sleep

def _patched_sleep(seconds):
    import asyncio
    loop = asyncio.get_event_loop()
    if loop.is_running():
        import pyodide
        # Use Pyodide's built-in async sleep that yields to JS
        pyodide.ffi.run_sync(asyncio.sleep(seconds))
    else:
        _original_sleep(seconds)

_time_mod.sleep = _patched_sleep

# --- Wire up JS callback ---
if _js_gpio_callback is not None:
    _gpio_mod._set_js_callback(_js_gpio_callback)
`;
