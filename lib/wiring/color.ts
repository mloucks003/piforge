import type { PinRef, WireColor } from '@/stores/projectStore';
import type { PinDefinition } from '@/lib/boards/types';
import type { ComponentPinDef } from '@/lib/components/types';

/**
 * Pin type classification for wire color assignment.
 * Resolves the "electrical role" of a pin reference.
 */
export type PinRole = 'power' | 'ground' | 'i2c' | 'spi' | 'signal';

/**
 * Determine the electrical role of a board GPIO pin.
 */
export function boardPinRole(pin: PinDefinition): PinRole {
  if (pin.type === 'power') return 'power';
  if (pin.type === 'ground') return 'ground';
  if (pin.type === 'i2c') return 'i2c';
  if (pin.type === 'spi') return 'spi';
  return 'signal';
}

/**
 * Determine the electrical role of a component pin.
 */
export function componentPinRole(pin: ComponentPinDef): PinRole {
  if (pin.type === 'power') return 'power';
  if (pin.type === 'ground') return 'ground';
  if (pin.type === 'data') return 'i2c'; // data pins treated as bus
  return 'signal';
}

/**
 * Wire color hex values.
 */
export const WIRE_COLORS: Record<string, string> = {
  red: '#ef4444',
  black: '#333333',
  green: '#22c55e',
  blue: '#3b82f6',
};

/**
 * Assign a wire color based on the roles of the two connected pins.
 *
 * Priority order:
 * 1. Power (red) — if either pin is power
 * 2. Ground (black) — if either pin is ground
 * 3. I2C/SPI (green) — if either pin is i2c or spi
 * 4. Signal (blue) — everything else
 */
export function assignWireColor(startRole: PinRole, endRole: PinRole): WireColor {
  if (startRole === 'power' || endRole === 'power') return 'red';
  if (startRole === 'ground' || endRole === 'ground') return 'black';
  if (startRole === 'i2c' || endRole === 'i2c' || startRole === 'spi' || endRole === 'spi') return 'green';
  return 'blue';
}

/**
 * Get the wire color hex string for rendering.
 */
export function wireColorHex(color: WireColor): string {
  return WIRE_COLORS[color] ?? WIRE_COLORS.blue;
}
