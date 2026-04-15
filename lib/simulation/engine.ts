import { GPIOMock } from './gpio-mock';
import { RPI_GPIO_MODULE, GPIOZERO_MODULE, ADAFRUIT_DHT_MODULE } from './python-modules';
import { PYGAME_MODULE } from './pygame-mock';
import { addDrawCommand, clearCommands, setTouchCallback } from './touchscreen';
import { useSensorStore } from '@/stores/sensorStore';

interface PyodideInterface {
  runPythonAsync: (code: string) => Promise<unknown>;
  runPython: (code: string) => unknown;
  globals: { set: (key: string, value: unknown) => void; get: (key: string) => unknown };
  setStdout: (opts: { batched: (text: string) => void }) => void;
  setStderr: (opts: { batched: (text: string) => void }) => void;
}

export type SimState = 'idle' | 'running' | 'paused' | 'error';

export interface EngineCallbacks {
  onStdout: (text: string) => void;
  onStderr: (text: string) => void;
  onStateChange: (state: SimState) => void;
  onPinChange: (gpioNumber: number, value: number) => void;
}

const PYODIDE_CDN = 'https://cdn.jsdelivr.net/pyodide/v0.27.5/full/';

export class SimulationEngine {
  private pyodide: PyodideInterface | null = null;
  private loading = false;
  private state: SimState = 'idle';
  private callbacks: EngineCallbacks;
  private gpio: GPIOMock;
  private stopped = false;

  constructor(gpio: GPIOMock, callbacks: EngineCallbacks) {
    this.gpio = gpio;
    this.callbacks = callbacks;
  }

  getState(): SimState { return this.state; }

  private setState(s: SimState) {
    this.state = s;
    this.callbacks.onStateChange(s);
  }

  private async ensurePyodide(): Promise<PyodideInterface> {
    if (this.pyodide) return this.pyodide;
    if (this.loading) {
      while (this.loading) await new Promise((r) => setTimeout(r, 100));
      return this.pyodide!;
    }
    this.loading = true;
    this.callbacks.onStdout('Loading Python runtime...');
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (typeof (globalThis as any).loadPyodide === 'undefined') {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = `${PYODIDE_CDN}pyodide.js`;
          script.crossOrigin = 'anonymous';
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Failed to load Pyodide script'));
          document.head.appendChild(script);
        });
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pyodide = await (globalThis as any).loadPyodide({ indexURL: PYODIDE_CDN });
      pyodide.setStdout({ batched: (text: string) => this.callbacks.onStdout(text) });
      pyodide.setStderr({ batched: (text: string) => this.callbacks.onStderr(text) });
      this.pyodide = pyodide;
      this.callbacks.onStdout('Python runtime ready.');
      return pyodide;
    } catch (err) {
      this.callbacks.onStderr(`Failed to load Python runtime: ${err}`);
      throw err;
    } finally {
      this.loading = false;
    }
  }

  private async injectMocks(pyodide: PyodideInterface) {
    const jsCallback = (pin: number, value: number, action: string, extra: number) => {
      if (action === 'cleanup') { this.gpio.cleanup(); return; }
      if (action === 'setup') { this.gpio.setup(pin, extra === 1 ? 'output' : 'input'); return; }
      this.gpio.output(pin, value as 0 | 1);
      this.callbacks.onPinChange(pin, value);
    };

    // Check stop flag — Python calls this before each sleep
    const jsCheckStop = () => this.stopped;

    // Touchscreen/pygame screen bridge
    clearCommands();
    const jsScreen = (...args: unknown[]) => {
      const type = String(args[0]) as 'clear' | 'rect' | 'circle' | 'line' | 'text';
      addDrawCommand({
        type,
        x: Number(args[1]) || 0,
        y: Number(args[2]) || 0,
        w: Number(args[3]) || 0,
        h: Number(args[4]) || 0,
        color: String(args[5] || '#fff'),
        extra: Number(args[6]) || 0,
        text: args[7] ? String(args[7]) : '',
      });
    };

    // Touch event bridge: JS queues touches → Python drains them via _js_touch_getter
    const touchQueue: Array<{ x: number; y: number }> = [];
    setTouchCallback((x: number, y: number) => touchQueue.push({ x, y }));
    const jsPollTouch = () => touchQueue.shift() ?? null;

    // GPIO input getter: Python calls this to read live button / input pin state
    const jsInputGetter = (pin: number): 0 | 1 | null => {
      return this.gpio.input(pin);
    };

    // Sensor store getters — called from Python each time a sensor is read
    const jsDistanceGetter = () => useSensorStore.getState().distanceCm;
    const jsDhtGetter      = () => {
      const s = useSensorStore.getState();
      return { temperature: s.temperatureC, humidity: s.humidityPct };
    };
    const jsPotGetter      = () => useSensorStore.getState().potentiometerPct;
    const jsPirGetter      = () => useSensorStore.getState().pirDetected;
    const jsServoCallback  = (pin: number, angle: number) =>
      useSensorStore.getState().setServoAngle(pin, angle);
    const jsMotorCallback  = (pin: number, dir: string, speed: number) =>
      useSensorStore.getState().setMotorState(pin, dir as 'forward' | 'backward' | 'stop', speed);

    pyodide.globals.set('_PYGAME_SRC', PYGAME_MODULE);
    pyodide.globals.set('_js_screen_callback', jsScreen);
    pyodide.globals.set('_js_touch_getter', jsPollTouch);
    pyodide.globals.set('_RPi_GPIO_SRC', RPI_GPIO_MODULE);
    pyodide.globals.set('_GPIOZERO_SRC', GPIOZERO_MODULE);
    pyodide.globals.set('_ADAFRUIT_DHT_SRC', ADAFRUIT_DHT_MODULE);
    pyodide.globals.set('_js_gpio_callback', jsCallback);
    pyodide.globals.set('_js_input_getter', jsInputGetter);
    pyodide.globals.set('_js_check_stop', jsCheckStop);
    pyodide.globals.set('_js_distance_getter',      jsDistanceGetter);
    pyodide.globals.set('_js_dht_getter',           jsDhtGetter);
    pyodide.globals.set('_js_potentiometer_getter', jsPotGetter);
    pyodide.globals.set('_js_pir_getter',           jsPirGetter);
    pyodide.globals.set('_js_servo_callback',       jsServoCallback);
    pyodide.globals.set('_js_motor_callback',       jsMotorCallback);

    await pyodide.runPythonAsync(`
import sys, types, asyncio

_rpi_mod = types.ModuleType('RPi')
_rpi_mod.__path__ = ['RPi']
sys.modules['RPi'] = _rpi_mod

_gpio_mod = types.ModuleType('RPi.GPIO')
exec(_RPi_GPIO_SRC, _gpio_mod.__dict__)
sys.modules['RPi.GPIO'] = _gpio_mod
_rpi_mod.GPIO = _gpio_mod

_gz_mod = types.ModuleType('gpiozero')
exec(_GPIOZERO_SRC, _gz_mod.__dict__)
sys.modules['gpiozero'] = _gz_mod
_gz_mod._set_js_servo_callback(_js_servo_callback)
_gz_mod._set_js_distance_getter(_js_distance_getter)
_gz_mod._set_js_dht_getter(_js_dht_getter)
_gz_mod._set_js_potentiometer_getter(_js_potentiometer_getter)
_gz_mod._set_js_pir_getter(_js_pir_getter)
_gz_mod._set_js_motor_callback(_js_motor_callback)

_adht_mod = types.ModuleType('Adafruit_DHT')
exec(_ADAFRUIT_DHT_SRC, _adht_mod.__dict__)
_adht_mod._set_js_dht_getter(_js_dht_getter)
sys.modules['Adafruit_DHT'] = _adht_mod

# --- Register pygame mock ---
_pg_mod = types.ModuleType('pygame')
exec(_PYGAME_SRC, _pg_mod.__dict__)
sys.modules['pygame'] = _pg_mod

if _js_screen_callback is not None:
    _pg_mod._set_js_screen(_js_screen_callback)

if _js_touch_getter is not None:
    _pg_mod._set_js_touch_getter(_js_touch_getter)

if _js_gpio_callback is not None:
    _gpio_mod._set_js_callback(_js_gpio_callback)

if _js_input_getter is not None:
    _gpio_mod._set_js_input_getter(_js_input_getter)
`);
  }

  private prepareCode(code: string): string {
    // Remove bare sleep imports — we inject our own async shim
    let patched = code
      .replace(/^from time import sleep(\s*,\s*\w+)*\s*$/gm, '')
      .replace(/^from time import \*\s*$/gm, '');

    // ── DEDUP: strip any existing 'await' before methods we're about to re-add it to ──
    patched = patched
      .replace(/\bawait\s+(\w+\.tick\s*\()/g, '$1')
      .replace(/\bawait\s+(\w+\.blink\s*\()/g, '$1')
      .replace(/\bawait\s+(\w+\.pulse\s*\()/g, '$1')
      .replace(/\bawait\s+(\w+\.beep\s*\()/g, '$1')
      .replace(/\bawait\s+(\w+\.wait_for_press\s*\()/g, '$1')
      .replace(/\bawait\s+(\w+\.wait_for_release\s*\()/g, '$1')
      .replace(/\bawait\s+(\w+\.wait_for_motion\s*\()/g, '$1')
      .replace(/\bawait\s+(pygame\.time\.delay\s*\()/g, '$1')
      .replace(/\bawait\s+(pygame\.time\.wait\s*\()/g, '$1');

    // ── time.sleep → async shim ──
    patched = patched
      .replace(/\btime\.sleep\s*\(/g, 'await __piforge_sleep__(')
      .replace(/(?<![.\w])sleep\s*\(/g, 'await __piforge_sleep__(');

    // ── pygame / gpiozero async methods → add await ──
    patched = patched.replace(/\b(\w+)\.tick\s*\(/g, 'await $1.tick(');
    patched = patched.replace(/\b(\w+)\.blink\s*\(/g, 'await $1.blink(');
    patched = patched.replace(/\b(\w+)\.pulse\s*\(/g, 'await $1.pulse(');
    patched = patched.replace(/\b(\w+)\.beep\s*\(/g, 'await $1.beep(');
    patched = patched.replace(/\b(\w+)\.wait_for_press\s*\(/g, 'await $1.wait_for_press(');
    patched = patched.replace(/\b(\w+)\.wait_for_release\s*\(/g, 'await $1.wait_for_release(');
    patched = patched.replace(/\b(\w+)\.wait_for_motion\s*\(/g, 'await $1.wait_for_motion(');
    patched = patched.replace(/\bpygame\.time\.delay\s*\(/g, 'await pygame.time.delay(');
    patched = patched.replace(/\bpygame\.time\.wait\s*\(/g, 'await pygame.time.wait(');

    // ── Fix: any user def that now contains 'await' must become 'async def' ──
    // 'await' injected above (e.g. time.sleep inside doorbell_ring) causes
    // SyntaxError if the enclosing def is not async.
    //
    // Strategy:
    //  1. Collect all user-defined function names.
    //  2. Make ALL of them async def (safe: async fns work fine without internal awaits).
    //  3. Strip then re-add 'await' before every top-level call to those functions
    //     so callers don't block without await.
    //  We skip method calls (preceded by '.') to avoid touching obj.method().

    // ── Make user helper functions async so injected 'await' inside them is valid ──
    //
    // Problem: time.sleep() → await __piforge_sleep__() is injected everywhere,
    // including inside plain `def` functions (e.g. doorbell_ring). Python requires
    // await to be inside an async def.
    //
    // Solution:
    //  1. Collect only module-level (non-method) function names.
    //     Class methods always have 'self' as first param — skip them.
    //     We only need to auto-await *calls* to standalone helpers.
    //  2. Convert ALL defs (including class methods) to async def so any
    //     injected await inside them is syntactically valid.
    //  3. For standalone helpers only: strip then re-add 'await' at call sites.
    //     Guard with (?<!def\s) so the 'def funcName(' declaration itself is
    //     never turned into 'def await funcName('.

    // ── Make standalone helper functions async ──────────────────────────────────
    // Rule: only convert `def name(` → `async def name(` when the first param
    // is NOT `self`. Class methods (publish, subscribe, read, etc.) stay as
    // regular def — they don't call time.sleep and must NOT return coroutines,
    // because their call sites `obj.method()` are never awaited.
    //
    // If a class method truly needs sleep we leave that as a known limitation.

    // 1. Collect standalone function names (first param is not 'self')
    const standaloneNames: string[] = [];
    for (const m of patched.matchAll(/^\s*def\s+(\w+)\s*\(\s*(?!self\b)/gm)) {
      standaloneNames.push(m[1]);
    }

    // 2. Only standalone defs → async def  (leave class methods untouched)
    //    Match: def name( where the ( is NOT immediately followed by self
    patched = patched.replace(
      /^(\s*)(def\s+\w+\s*\()(\s*)(?!self\b)/gm,
      '$1async $2$3'
    );

    // 3. Await call sites for standalone helpers
    for (const name of standaloneNames) {
      // Strip any existing 'await name(' first to avoid doubling on re-run
      patched = patched.replace(
        new RegExp(`\\bawait\\s+${name}\\s*\\(`, 'g'),
        `${name}(`
      );
      // Add await — guard: not on a def line, not a method call (preceded by .)
      patched = patched.replace(
        new RegExp(`(?<!def\\s)(?<![.\\w])\\b${name}\\s*\\(`, 'g'),
        `await ${name}(`
      );
    }

    const indented = patched.split('\n').map((line) => '    ' + line).join('\n');

    return `
import asyncio, sys as _sys, types as _types, time as _real_time

# ── PiForge async sleep shim ────────────────────────────────────────────────
async def __piforge_sleep__(seconds):
    if _js_check_stop():
        raise KeyboardInterrupt("Stopped by user")
    await asyncio.sleep(float(seconds))
    if _js_check_stop():
        raise KeyboardInterrupt("Stopped by user")

# Point time.sleep at our shim. Direct calls in user code are text-replaced to
# 'await __piforge_sleep__(...)'. Mock internals use asyncio.sleep directly.
import time as _time_module
_time_module.sleep = __piforge_sleep__

# Expose sleep globally so 'from time import sleep' works after our import strip
sleep = __piforge_sleep__

# ── User code ───────────────────────────────────────────────────────────────
async def __piforge_main__():
${indented}

await __piforge_main__()
`;
  }

  async start(code: string) {
    if (this.state === 'running') return;
    this.stopped = false;
    // Give a tick for any previous run to finish
    await new Promise(r => setTimeout(r, 50));
    this.stopped = false;
    this.setState('running');
    try {
      const pyodide = await this.ensurePyodide();
      await this.injectMocks(pyodide);
      const wrappedCode = this.prepareCode(code);
      await pyodide.runPythonAsync(wrappedCode);
      this.callbacks.onStdout('Program finished.');
      this.setState('idle');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('KeyboardInterrupt') || msg.includes('Stopped by user')) {
        this.callbacks.onStdout('Program stopped.');
        this.setState('idle');
      } else {
        this.callbacks.onStderr(`Error: ${msg}`);
        this.setState('error');
      }
    }
  }

  pause() {
    if (this.state !== 'running') return;
    this.stopped = true;
    this.setState('paused');
  }

  reset() {
    this.stopped = true;
    this.gpio.cleanup();
    this.setState('idle');
  }
}
