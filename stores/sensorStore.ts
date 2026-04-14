import { create } from 'zustand';

/** Live sensor readings — set by UI sliders, read by Python mocks via JS callbacks */
export interface SensorState {
  // HC-SR04 Distance Sensor (cm)
  distanceCm: number;
  // DHT22 Temperature & Humidity
  temperatureC: number;
  humidityPct: number;
  // Potentiometer (0–100 %)
  potentiometerPct: number;
  // PIR Motion Sensor
  pirDetected: boolean;
  // Servo angles per GPIO pin  (pin → degrees, -90 to 90)
  servoAngles: Record<number, number>;
  // Motor states per GPIO pair (forward_pin → { direction, speed })
  motorStates: Record<number, { direction: 'forward' | 'backward' | 'stop'; speed: number }>;

  setDistanceCm: (v: number) => void;
  setTemperatureC: (v: number) => void;
  setHumidityPct: (v: number) => void;
  setPotentiometerPct: (v: number) => void;
  setPirDetected: (v: boolean) => void;
  setServoAngle: (pin: number, angle: number) => void;
  setMotorState: (pin: number, direction: 'forward' | 'backward' | 'stop', speed: number) => void;
  reset: () => void;
}

const defaults = {
  distanceCm: 30,
  temperatureC: 22.5,
  humidityPct: 65,
  potentiometerPct: 50,
  pirDetected: false,
  servoAngles: {} as Record<number, number>,
  motorStates: {} as Record<number, { direction: 'forward' | 'backward' | 'stop'; speed: number }>,
};

export const useSensorStore = create<SensorState>((set) => ({
  ...defaults,

  setDistanceCm:       (v) => set({ distanceCm: Math.max(2, Math.min(400, v)) }),
  setTemperatureC:     (v) => set({ temperatureC: Math.max(-40, Math.min(80, v)) }),
  setHumidityPct:      (v) => set({ humidityPct: Math.max(0, Math.min(100, v)) }),
  setPotentiometerPct: (v) => set({ potentiometerPct: Math.max(0, Math.min(100, v)) }),
  setPirDetected:      (v) => set({ pirDetected: v }),

  setServoAngle: (pin, angle) =>
    set((s) => ({ servoAngles: { ...s.servoAngles, [pin]: Math.max(-90, Math.min(90, angle)) } })),

  setMotorState: (pin, direction, speed) =>
    set((s) => ({ motorStates: { ...s.motorStates, [pin]: { direction, speed } } })),

  reset: () => set({ ...defaults, servoAngles: {}, motorStates: {} }),
}));
