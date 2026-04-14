import type { BoardModel } from './types';
import pi4Data from './pi4.json';
import pi5Data from './pi5.json';

export const boards: Record<string, BoardModel> = {
  pi4: pi4Data as unknown as BoardModel,
  pi5: pi5Data as unknown as BoardModel,
};

export function getBoardModel(id: 'pi4' | 'pi5'): BoardModel {
  return boards[id];
}

export type { BoardModel, PinDefinition, PortDefinition, Point } from './types';
