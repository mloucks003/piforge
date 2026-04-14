import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { snapToPosition } from '@/lib/canvas/snap';
import type { PlacedBreadboard } from '@/stores/projectStore';

// Feature: piforge, Property 5: Component Snap-to-Grid
// **Validates: Requirements 2.4**
describe('Property 5: Component Snap-to-Grid', () => {
  const GRID_SIZE = 10;
  const TOLERANCE = 15;

  const posArb = fc.record({
    x: fc.integer({ min: -1000, max: 5000 }),
    y: fc.integer({ min: -1000, max: 5000 }),
  });

  it('with no breadboards, always snaps to grid-aligned position', () => {
    fc.assert(
      fc.property(posArb, (dragPos) => {
        const result = snapToPosition(dragPos, {}, GRID_SIZE, TOLERANCE);

        // Result should be grid-aligned
        const xMod = ((result.x % GRID_SIZE) + GRID_SIZE) % GRID_SIZE;
        const yMod = ((result.y % GRID_SIZE) + GRID_SIZE) % GRID_SIZE;
        expect(xMod).toBe(0);
        expect(yMod).toBe(0);
        expect(result.snappedToBreadboard).toBe(false);
      }),
      { numRuns: 100 }
    );
  });

  it('grid-snapped position is the nearest grid point', () => {
    fc.assert(
      fc.property(posArb, (dragPos) => {
        const result = snapToPosition(dragPos, {}, GRID_SIZE, TOLERANCE);

        // The snapped position should be the nearest grid point
        const expectedX = Math.round(dragPos.x / GRID_SIZE) * GRID_SIZE;
        const expectedY = Math.round(dragPos.y / GRID_SIZE) * GRID_SIZE;

        expect(result.x).toBe(expectedX);
        expect(result.y).toBe(expectedY);
      }),
      { numRuns: 100 }
    );
  });

  it('when snapped to breadboard, distance is within tolerance', () => {
    // Create a breadboard at a known position
    const bb: Record<string, PlacedBreadboard> = {
      'bb-1': { id: 'bb-1', position: { x: 100, y: 100 }, type: '830-point' },
    };

    fc.assert(
      fc.property(posArb, (dragPos) => {
        const result = snapToPosition(dragPos, bb, GRID_SIZE, TOLERANCE);

        if (result.snappedToBreadboard) {
          // Distance from drag position to snapped position should be within tolerance
          const dx = dragPos.x - result.x;
          const dy = dragPos.y - result.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          expect(dist).toBeLessThanOrEqual(TOLERANCE);
          expect(result.breadboardId).toBe('bb-1');
        }
        // If not snapped to breadboard, it should be grid-aligned
        if (!result.snappedToBreadboard) {
          const xMod = ((result.x % GRID_SIZE) + GRID_SIZE) % GRID_SIZE;
          const yMod = ((result.y % GRID_SIZE) + GRID_SIZE) % GRID_SIZE;
          expect(xMod).toBe(0);
          expect(yMod).toBe(0);
        }
      }),
      { numRuns: 100 }
    );
  });
});
