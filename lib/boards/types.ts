export interface Point {
  x: number;
  y: number;
}

export interface PinDefinition {
  pinNumber: number;        // physical pin number
  gpioNumber: number | null; // BCM/GPIO number (null for power/ground)
  label: string;            // e.g. "GPIO17", "3V3", "GND", "D13", "A0"
  type: 'gpio' | 'power' | 'ground' | 'i2c' | 'spi' | 'uart' | 'pwm' | 'analog';
  altFunctions: string[];   // e.g. ["SPI0_MOSI", "PWM0"]
  position: Point;          // relative to board origin (mm)
}

export interface PortDefinition {
  id: string;
  label: string;
  type: 'usb-a' | 'usb-b' | 'usb-c' | 'micro-usb' | 'hdmi-micro' | 'ethernet' | 'csi' | 'dsi' | 'pcie' | 'audio' | 'usb-3' | 'usb-2' | 'button';
  position: Point;
  dimensions: { width: number; height: number };
}

export interface BoardModel {
  id: string;
  name: string;
  family?: 'raspberry-pi' | 'arduino' | 'pico';
  dimensions: { width: number; height: number }; // mm
  gpioHeader: PinDefinition[];
  ports: PortDefinition[];
  mountingHoles: Point[];
}
