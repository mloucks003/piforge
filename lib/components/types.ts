export interface ComponentPinDef {
  id: string;
  label: string;
  type: 'power' | 'ground' | 'signal' | 'data';
  position: { x: number; y: number };
  direction: 'in' | 'out' | 'bidirectional';
}

export type ComponentCategory =
  | 'led'
  | 'button'
  | 'switch'
  | 'potentiometer'
  | 'buzzer'
  | 'sensor'
  | 'motor'
  | 'display'
  | 'keypad'
  | 'touchscreen'
  | 'passive';

export interface SimulationBehavior {
  type:
    | 'digital-output'
    | 'digital-input'
    | 'analog-input'
    | 'pwm'
    | 'i2c-device'
    | 'spi-device'
    | 'display';
  handler: string;
  properties: Record<string, unknown>;
}

export interface ComponentDefinition {
  id: string;
  name: string;
  category: ComponentCategory;
  pins: ComponentPinDef[];
  visual: {
    width: number;
    height: number;
    states: Record<string, string>;
  };
  simulation: SimulationBehavior;
  defaultProperties: Record<string, number | string | boolean>;
}
