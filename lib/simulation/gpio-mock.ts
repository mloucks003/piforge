/**
 * GPIO Mock Layer — bridges Python GPIO calls to the Zustand store.
 *
 * For v1 we run in the main thread (no SharedArrayBuffer / Web Worker).
 * The mock maintains a simple in-memory pin state map and calls a
 * callback whenever a pin value changes so the store can be updated.
 */

export interface PinInfo {
  mode: 'input' | 'output' | 'pwm' | 'alt';
  value: 0 | 1;
  pwmDuty: number;
  pullMode: 'up' | 'down' | 'none';
  edgeDetect: 'none' | 'rising' | 'falling' | 'both';
}

export type PinChangeCallback = (gpioNumber: number, state: Partial<PinInfo>) => void;

const DEFAULT_PIN: PinInfo = {
  mode: 'input',
  value: 0,
  pwmDuty: 0,
  pullMode: 'none',
  edgeDetect: 'none',
};

export class GPIOMock {
  private pins: Map<number, PinInfo> = new Map();
  private onChange: PinChangeCallback | null = null;

  /** Register a callback that fires whenever a pin state changes. */
  setChangeCallback(cb: PinChangeCallback) {
    this.onChange = cb;
  }

  /** Set up a pin with a given mode. */
  setup(gpioNumber: number, mode: 'input' | 'output') {
    const pin: PinInfo = { ...DEFAULT_PIN, mode };
    this.pins.set(gpioNumber, pin);
    this.onChange?.(gpioNumber, { mode, value: 0 });
  }

  /** Write a digital value to an output pin. */
  output(gpioNumber: number, value: 0 | 1) {
    let pin = this.pins.get(gpioNumber);
    if (!pin) {
      pin = { ...DEFAULT_PIN, mode: 'output' };
      this.pins.set(gpioNumber, pin);
    }
    pin.value = value;
    this.onChange?.(gpioNumber, { value });
  }

  /** Read the current value of a pin. */
  input(gpioNumber: number): 0 | 1 {
    return this.pins.get(gpioNumber)?.value ?? 0;
  }

  /** Set a pin value from the UI side (e.g. button press). */
  setInputValue(gpioNumber: number, value: 0 | 1) {
    let pin = this.pins.get(gpioNumber);
    if (!pin) {
      pin = { ...DEFAULT_PIN };
      this.pins.set(gpioNumber, pin);
    }
    pin.value = value;
    // No onChange here — the UI already knows.
  }

  /** Get the full state of a pin. */
  getPin(gpioNumber: number): PinInfo {
    return this.pins.get(gpioNumber) ?? { ...DEFAULT_PIN };
  }

  /** Reset all pins to defaults. */
  cleanup() {
    this.pins.clear();
  }
}
