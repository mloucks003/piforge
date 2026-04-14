import type { PlacedBreadboard } from '@/stores/projectStore';
import {
  BB_COLS,
  BB_ROWS,
  HOLE_STEP,
  COL_START_X,
  RAIL_TOP_Y,
  ROW_A_Y as ROW_START_Y,
  BB_ROWS_PER_BUS,
  GAP_Y,
} from '@/lib/canvas/breadboard-layout';

export interface SnapResult {
  x: number;
  y: number;
  snappedToBreadboard: boolean;
  breadboardId?: string;
  row?: number;
  col?: number;
}

/**
 * Given a drag position, snap to the nearest breadboard hole or grid position.
 * - If a breadboard hole is within `tolerance`, snap to it.
 * - Otherwise, snap to the nearest grid-aligned position.
 */
export function snapToPosition(
  dragPos: { x: number; y: number },
  breadboards: Record<string, PlacedBreadboard>,
  gridSize: number = 10,
  tolerance: number = 15
): SnapResult {
  let bestDist = Infinity;
  let bestResult: SnapResult | null = null;

  for (const bb of Object.values(breadboards)) {
    // Check each hole on this breadboard
    for (let col = 0; col < BB_COLS; col++) {
      for (let row = 0; row < BB_ROWS; row++) {
        const holeX = bb.position.x + COL_START_X + col * HOLE_STEP;
        // Rows 0–(BB_ROWS_PER_BUS-1) = a-e (top bus), rest = f-j (bottom bus)
        const rowOffset = row < BB_ROWS_PER_BUS
          ? row * HOLE_STEP
          : row * HOLE_STEP + GAP_Y;
        const holeY = bb.position.y + ROW_START_Y + rowOffset;

        const dx = dragPos.x - holeX;
        const dy = dragPos.y - holeY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < tolerance && dist < bestDist) {
          bestDist = dist;
          bestResult = {
            x: holeX,
            y: holeY,
            snappedToBreadboard: true,
            breadboardId: bb.id,
            row,
            col,
          };
        }
      }
    }
  }

  if (bestResult) return bestResult;

  // Fall back to grid snap
  return {
    x: Math.round(dragPos.x / gridSize) * gridSize,
    y: Math.round(dragPos.y / gridSize) * gridSize,
    snappedToBreadboard: false,
  };
}
