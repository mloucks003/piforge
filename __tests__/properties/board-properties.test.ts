import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { boards } from '@/lib/boards';
import type { BoardModel } from '@/lib/boards/types';

// Feature: piforge, Property 1: Board Dimension Proportionality
// **Validates: Requirements 1.3**
describe('Property 1: Board Dimension Proportionality', () => {
  const SCALE = 5; // px per mm, matching the renderer

  const boardModelArb = fc.constantFrom(...(Object.keys(boards) as Array<keyof typeof boards>));

  it('rendered width/height ratio equals physical dimension ratio within 1% tolerance', () => {
    fc.assert(
      fc.property(boardModelArb, (boardId) => {
        const board: BoardModel = boards[boardId];
        const physicalRatio = board.dimensions.width / board.dimensions.height;
        const renderedWidth = board.dimensions.width * SCALE;
        const renderedHeight = board.dimensions.height * SCALE;
        const renderedRatio = renderedWidth / renderedHeight;

        const tolerance = 0.01;
        expect(Math.abs(renderedRatio - physicalRatio) / physicalRatio).toBeLessThanOrEqual(tolerance);
      }),
      { numRuns: 100 }
    );
  });
});

// Feature: piforge, Property 2: GPIO Header Identity Across Models
// **Validates: Requirements 1.4**
describe('Property 2: GPIO Header Identity Across Models', () => {
  const boardIds = Object.keys(boards) as Array<keyof typeof boards>;

  const boardPairArb = fc.tuple(
    fc.constantFrom(...boardIds),
    fc.constantFrom(...boardIds)
  );

  it('40-pin GPIO header definitions are identical across all board models', () => {
    fc.assert(
      fc.property(boardPairArb, ([idA, idB]) => {
        const boardA: BoardModel = boards[idA];
        const boardB: BoardModel = boards[idB];

        expect(boardA.gpioHeader.length).toBe(40);
        expect(boardB.gpioHeader.length).toBe(40);

        for (let i = 0; i < 40; i++) {
          const pinA = boardA.gpioHeader[i];
          const pinB = boardB.gpioHeader[i];

          expect(pinA.pinNumber).toBe(pinB.pinNumber);
          expect(pinA.gpioNumber).toBe(pinB.gpioNumber);
          expect(pinA.label).toBe(pinB.label);
          expect(pinA.type).toBe(pinB.type);
          expect(pinA.position.x).toBe(pinB.position.x);
          expect(pinA.position.y).toBe(pinB.position.y);
        }
      }),
      { numRuns: 100 }
    );
  });
});
