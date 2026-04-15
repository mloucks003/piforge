import type { BoardModel } from './types';
import pi4Data from './pi4.json';
import pi5Data from './pi5.json';

export const boards: Record<string, BoardModel> = {
  pi4: pi4Data as unknown as BoardModel,
  pi5: pi5Data as unknown as BoardModel,
};

/** Returns the board model — falls back to pi4 for unknown ids (e.g. arduino-uno uses its own renderer) */
export function getBoardModel(id: string): BoardModel {
  return boards[id] ?? boards['pi4'];
}

export type { BoardModel, PinDefinition, PortDefinition, Point } from './types';
