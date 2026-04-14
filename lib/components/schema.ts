import { z } from 'zod';

const PointSchema = z.object({ x: z.number(), y: z.number() });

export const ComponentPinDefSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  type: z.enum(['power', 'ground', 'signal', 'data']),
  position: PointSchema,
  direction: z.enum(['in', 'out', 'bidirectional']),
});

export const SimulationBehaviorSchema = z.object({
  type: z.enum([
    'digital-output',
    'digital-input',
    'analog-input',
    'pwm',
    'i2c-device',
    'spi-device',
    'display',
    'passive',
  ]),
  handler: z.string(),
  properties: z.record(z.string(), z.unknown()),
});

export const ComponentDefinitionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  category: z.enum([
    'led',
    'button',
    'switch',
    'potentiometer',
    'buzzer',
    'sensor',
    'motor',
    'display',
    'keypad',
    'touchscreen',
    'passive',
  ]),
  pins: z.array(ComponentPinDefSchema).min(1),
  visual: z.object({
    width: z.number().positive(),
    height: z.number().positive(),
    states: z.record(z.string(), z.string()),
  }),
  simulation: SimulationBehaviorSchema,
  defaultProperties: z.record(z.string(), z.union([z.number(), z.string(), z.boolean()])),
});

export function validateComponentDefinition(data: unknown) {
  return ComponentDefinitionSchema.safeParse(data);
}
