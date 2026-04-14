import type { ComponentDefinition } from './types';
import { validateComponentDefinition } from './schema';

import ledRedJson from './definitions/led-red.json';
import ledGreenJson from './definitions/led-green.json';
import ledBlueJson from './definitions/led-blue.json';
import rgbLedJson from './definitions/rgb-led.json';
import buttonJson from './definitions/button.json';
import resistorJson from './definitions/resistor.json';
import buzzerJson from './definitions/buzzer.json';
import touchscreen7Json from './definitions/touchscreen-7.json';
import servoJson from './definitions/servo.json';
import hcSr04Json from './definitions/hc-sr04.json';
import dht22Json from './definitions/dht22.json';
import dcMotorJson from './definitions/dc-motor.json';
import potentiometerJson from './definitions/potentiometer.json';
import pirSensorJson from './definitions/pir-sensor.json';

const rawDefinitions = [
  ledRedJson, ledGreenJson, ledBlueJson, rgbLedJson,
  buttonJson, resistorJson, buzzerJson,
  touchscreen7Json,
  servoJson, hcSr04Json, dht22Json, dcMotorJson, potentiometerJson, pirSensorJson,
];

function loadDefinitions(): ComponentDefinition[] {
  const defs: ComponentDefinition[] = [];
  for (const raw of rawDefinitions) {
    const result = validateComponentDefinition(raw);
    if (result.success) {
      defs.push(result.data as ComponentDefinition);
    } else {
      console.warn(`Invalid component definition: ${JSON.stringify(raw).slice(0, 80)}`, result.error);
    }
  }
  return defs;
}

export const componentDefinitions: ComponentDefinition[] = loadDefinitions();

export const componentsByCategory: Record<string, ComponentDefinition[]> = {};
for (const def of componentDefinitions) {
  if (!componentsByCategory[def.category]) {
    componentsByCategory[def.category] = [];
  }
  componentsByCategory[def.category].push(def);
}

export function getComponentDefinition(id: string): ComponentDefinition | undefined {
  return componentDefinitions.find((d) => d.id === id);
}

export function searchComponents(query: string): ComponentDefinition[] {
  if (!query.trim()) return componentDefinitions;
  const q = query.toLowerCase();
  return componentDefinitions.filter(
    (d) =>
      d.name.toLowerCase().includes(q) ||
      d.category.toLowerCase().includes(q)
  );
}

export type { ComponentDefinition, ComponentPinDef, ComponentCategory, SimulationBehavior } from './types';
