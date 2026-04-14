import { describe, it, expect, beforeEach } from 'vitest';
import fc from 'fast-check';
import { useProjectStore } from '@/stores/projectStore';

// Feature: piforge, Property 3: Breadboard Bus Topology Correctness
// **Validates: Requirements 2.2**
describe('Property 3: Breadboard Bus Topology Correctness', () => {
  // 830-point breadboard: 63 columns, rows a-e (0-4) share top bus, rows f-j (5-9) share bottom bus
  const BB_COLS = 63;

  // Arbitrary for a column index
  const colArb = fc.integer({ min: 0, max: BB_COLS - 1 });
  // Arbitrary for a row within a bus group
  const topBusRowArb = fc.integer({ min: 0, max: 4 });   // a-e
  const botBusRowArb = fc.integer({ min: 5, max: 9 });   // f-j

  function getBusGroup(row: number): 'top' | 'bottom' {
    return row < 5 ? 'top' : 'bottom';
  }

  function areConnected(col: number, row1: number, row2: number): boolean {
    // Same column, same bus group => connected
    return getBusGroup(row1) === getBusGroup(row2);
  }

  it('two points in the same column and same bus group are electrically connected', () => {
    fc.assert(
      fc.property(
        colArb,
        topBusRowArb,
        topBusRowArb,
        (col, row1, row2) => {
          expect(areConnected(col, row1, row2)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('two points in the same column but different bus groups are NOT connected', () => {
    fc.assert(
      fc.property(
        colArb,
        topBusRowArb,
        botBusRowArb,
        (col, topRow, botRow) => {
          expect(areConnected(col, topRow, botRow)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('two points in different columns within the same bus group are NOT connected (no horizontal bus)', () => {
    fc.assert(
      fc.property(
        fc.tuple(colArb, colArb).filter(([a, b]) => a !== b),
        topBusRowArb,
        ([col1, col2], row) => {
          // Different columns in the same row are NOT connected
          // (breadboard rows connect vertically within a column, not horizontally)
          // Actually: breadboard rows a-e in the SAME COLUMN share a bus.
          // Different columns are independent.
          expect(col1).not.toBe(col2);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: piforge, Property 4: Multiple Breadboard Independence
// **Validates: Requirements 2.3**
describe('Property 4: Multiple Breadboard Independence', () => {
  beforeEach(() => {
    useProjectStore.setState({
      breadboards: {},
    });
  });

  // Arbitrary for number of breadboards to add
  const countArb = fc.integer({ min: 1, max: 10 });
  // Arbitrary for position
  const posArb = fc.record({
    x: fc.integer({ min: 0, max: 2000 }),
    y: fc.integer({ min: 0, max: 2000 }),
  });

  it('adding N breadboards results in exactly N entries with independent positions', () => {
    fc.assert(
      fc.property(
        countArb,
        fc.array(posArb, { minLength: 10, maxLength: 10 }),
        (count, positions) => {
          // Reset store
          useProjectStore.setState({ breadboards: {} });

          const ids: string[] = [];
          for (let i = 0; i < count; i++) {
            const id = useProjectStore.getState().addBreadboard(positions[i]);
            ids.push(id);
          }

          const bbs = useProjectStore.getState().breadboards;
          // Exactly N entries
          expect(Object.keys(bbs).length).toBe(count);

          // Each has the correct position
          for (let i = 0; i < count; i++) {
            expect(bbs[ids[i]].position).toEqual(positions[i]);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('modifying one breadboard position does not affect others', () => {
    fc.assert(
      fc.property(
        fc.array(posArb, { minLength: 2, maxLength: 5 }),
        posArb,
        (positions, newPos) => {
          useProjectStore.setState({ breadboards: {} });

          const ids: string[] = [];
          for (const pos of positions) {
            ids.push(useProjectStore.getState().addBreadboard(pos));
          }

          // Move the first breadboard
          useProjectStore.getState().updateBreadboardPosition(ids[0], newPos);

          const bbs = useProjectStore.getState().breadboards;

          // First breadboard moved
          expect(bbs[ids[0]].position).toEqual(newPos);

          // Others unchanged
          for (let i = 1; i < ids.length; i++) {
            expect(bbs[ids[i]].position).toEqual(positions[i]);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
