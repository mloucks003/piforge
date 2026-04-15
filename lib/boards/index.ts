import type { BoardModel } from './types';
import pi4Data from './pi4.json';
import pi5Data from './pi5.json';
import piZero2wData from './pi-zero-2w.json';
import arduinoUnoData from './arduino-uno.json';
import picoData from './pico.json';

export const boards: Record<string, BoardModel> = {
  pi4:          pi4Data as unknown as BoardModel,
  pi5:          pi5Data as unknown as BoardModel,
  'pi-zero-2w': piZero2wData as unknown as BoardModel,
  'arduino-uno':arduinoUnoData as unknown as BoardModel,
  pico:         picoData as unknown as BoardModel,
};

export const BOARD_CATALOG = [
  { id: 'pi4',          name: 'Pi 4 Model B',   family: 'raspberry-pi', lang: 'python'      },
  { id: 'pi5',          name: 'Pi 5',            family: 'raspberry-pi', lang: 'python'      },
  { id: 'pi-zero-2w',   name: 'Pi Zero 2 W',    family: 'raspberry-pi', lang: 'python'      },
  { id: 'arduino-uno',  name: 'Arduino Uno R3',  family: 'arduino',      lang: 'cpp'         },
  { id: 'pico',         name: 'Pi Pico W',       family: 'pico',         lang: 'micropython' },
] as const;

/** Returns the board model — falls back to pi4 for unknown ids */
export function getBoardModel(id: string): BoardModel {
  return boards[id] ?? boards['pi4'];
}

export type { BoardModel, PinDefinition, PortDefinition, Point } from './types';
