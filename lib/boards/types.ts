export interface Point {
  x: number;
  y: number;
}

export interface PinDefinition {
  pinNumber: number;        // physical pin 1–40
  gpioNumber: number | null; // BCM GPIO number (null for power/ground)
  label: string;            // e.g. "GPIO17", "3V3", "GND"
  type: 'gpio' | 'power' | 'ground' | 'i2c' | 'spi' | 'uart' | 'pwm';
  altFunctions: string[];   // e.g. ["SPI0_MOSI", "PWM0"]
  position: Point;          // relative to board origin (mm)
}

export interface PortDefinition {
  id: string;
  label: string;
  type: 'usb-a' | 'usb-c' | 'hdmi-micro' | 'ethernet' | 'csi' | 'dsi' | 'pcie' | 'audio' | 'usb-3' | 'usb-2' | 'button';
  position: Point;
  dimensions: { width: number; height: number };
}

export interface BoardModel {
  id: 'pi4' | 'pi5';
  name: string;
  dimensions: { width: number; height: number }; // mm
  gpioHeader: PinDefinition[];
  ports: PortDefinition[];
  mountingHoles: Point[];
}
