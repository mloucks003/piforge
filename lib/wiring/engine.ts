import type { PinRef, Wire, WireColor, Point } from '@/stores/projectStore';
import { assignWireColor, boardPinRole, componentPinRole } from './color';
import type { PinRole } from './color';
import { getBoardModel } from '@/lib/boards';
import { getComponentDefinition } from '@/lib/components';
import type { PlacedComponent, PlacedBreadboard } from '@/stores/projectStore';
import type { BoardModelId } from '@/stores/projectStore';
import {
  HOLE_STEP as BB_HS,
  BB_COLS as BB_NCOLS,
  BB_ROWS_PER_BUS,
  COL_START_X as BB_COL_X,
  RAIL_TOP_Y as BB_RAIL_TOP,
  RAIL_BOT_Y as BB_RAIL_BOT,
  ROW_A_Y as BB_ROW_A,
  GAP_Y as BB_GAP,
} from '@/lib/canvas/breadboard-layout';

/** Board scale: px per mm — matches BoardRenderer */
const S = 5;

let wireCounter = 0;

function wireId(): string {
  return `wire-${++wireCounter}-${Date.now().toString(36)}`;
}

/**
 * Resolve the canvas position (px) of a PinRef.
 */
export function resolvePinPosition(
  ref: PinRef,
  boardModel: BoardModelId,
  boardPosition: Point,
  components: Record<string, PlacedComponent>,
  breadboards: Record<string, PlacedBreadboard>,
): Point | null {
  if (ref.type === 'board') {
    const board = getBoardModel(boardModel);
    const pin = board.gpioHeader.find((p) => p.pinNumber === ref.pinNumber);
    if (!pin) return null;
    return {
      x: boardPosition.x + pin.position.x * S,
      y: boardPosition.y + pin.position.y * S,
    };
  }

  if (ref.type === 'component') {
    const comp = components[ref.componentId];
    if (!comp) return null;
    const def = getComponentDefinition(comp.definitionId);
    if (!def) return null;
    const pin = def.pins.find((p) => p.id === ref.pinId);
    if (!pin) return null;
    return {
      x: comp.position.x + pin.position.x,
      y: comp.position.y + pin.position.y,
    };
  }

  if (ref.type === 'breadboard') {
    const bb = breadboards[ref.breadboardId];
    if (!bb) return null;

    if (ref.rail) {
      // Power rail hole — negative rail is one hole below positive
      const railY = ref.rail === 'positive'
        ? (ref.row < 2 ? BB_RAIL_TOP : BB_RAIL_BOT)
        : (ref.row < 2 ? BB_RAIL_TOP + BB_HS : BB_RAIL_BOT + BB_HS);
      return {
        x: bb.position.x + BB_COL_X + ref.col * BB_HS,
        y: bb.position.y + railY,
      };
    }

    // Regular bus hole
    const rowY = ref.row < BB_ROWS_PER_BUS
      ? BB_ROW_A + ref.row * BB_HS
      : BB_ROW_A + BB_ROWS_PER_BUS * BB_HS + BB_GAP + (ref.row - BB_ROWS_PER_BUS) * BB_HS;

    return {
      x: bb.position.x + BB_COL_X + ref.col * BB_HS,
      y: bb.position.y + rowY,
    };
  }

  return null;
}

/**
 * Resolve the PinRole for a PinRef.
 */
export function resolvePinRole(
  ref: PinRef,
  boardModel: BoardModelId,
  components: Record<string, PlacedComponent>,
): PinRole {
  if (ref.type === 'board') {
    const board = getBoardModel(boardModel);
    const pin = board.gpioHeader.find((p) => p.pinNumber === ref.pinNumber);
    if (pin) return boardPinRole(pin);
    return 'signal';
  }

  if (ref.type === 'component') {
    const comp = components[ref.componentId];
    if (!comp) return 'signal';
    const def = getComponentDefinition(comp.definitionId);
    if (!def) return 'signal';
    const pin = def.pins.find((p) => p.id === ref.pinId);
    if (pin) return componentPinRole(pin);
    return 'signal';
  }

  if (ref.type === 'breadboard') {
    if (ref.rail === 'positive') return 'power';
    if (ref.rail === 'negative') return 'ground';
    return 'signal';
  }

  return 'signal';
}

/**
 * Generate smooth bezier control points between two positions.
 * Returns an array of points: [start, cp1, cp2, end] for a cubic bezier.
 */
export function generateBezierPath(start: Point, end: Point): Point[] {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const offset = Math.max(30, dist * 0.3);

  // Control points create a gentle S-curve
  const cp1: Point = {
    x: start.x,
    y: start.y + offset,
  };
  const cp2: Point = {
    x: end.x,
    y: end.y - offset,
  };

  return [start, cp1, cp2, end];
}

/**
 * Snap a position to the nearest valid pin within tolerance.
 * Returns the PinRef and position if found, null otherwise.
 */
export function snapToPin(
  pos: Point,
  boardModel: BoardModelId,
  boardPosition: Point,
  components: Record<string, PlacedComponent>,
  breadboards: Record<string, PlacedBreadboard>,
  tolerance: number = 10,
): { ref: PinRef; position: Point } | null {
  let bestDist = Infinity;
  let bestResult: { ref: PinRef; position: Point } | null = null;

  // Check board GPIO pins
  const board = getBoardModel(boardModel);
  for (const pin of board.gpioHeader) {
    const px = boardPosition.x + pin.position.x * S;
    const py = boardPosition.y + pin.position.y * S;
    const dist = Math.sqrt((pos.x - px) ** 2 + (pos.y - py) ** 2);
    if (dist <= tolerance && dist < bestDist) {
      bestDist = dist;
      bestResult = {
        ref: { type: 'board', boardId: board.id, pinNumber: pin.pinNumber },
        position: { x: px, y: py },
      };
    }
  }

  // Check component pins
  for (const comp of Object.values(components)) {
    const def = getComponentDefinition(comp.definitionId);
    if (!def) continue;
    for (const pin of def.pins) {
      const px = comp.position.x + pin.position.x;
      const py = comp.position.y + pin.position.y;
      const dist = Math.sqrt((pos.x - px) ** 2 + (pos.y - py) ** 2);
      if (dist <= tolerance && dist < bestDist) {
        bestDist = dist;
        bestResult = {
          ref: { type: 'component', componentId: comp.id, pinId: pin.id },
          position: { x: px, y: py },
        };
      }
    }
  }

  // Check breadboard holes
  for (const bb of Object.values(breadboards)) {
    // Power rail holes (top and bottom, positive and negative)
    for (const railY of [BB_RAIL_TOP, BB_RAIL_BOT]) {
      for (let c = 0; c < BB_NCOLS; c++) {
        const ppx = bb.position.x + BB_COL_X + c * BB_HS;
        const ppy = bb.position.y + railY;
        let dist = Math.sqrt((pos.x - ppx) ** 2 + (pos.y - ppy) ** 2);
        if (dist <= tolerance && dist < bestDist) {
          bestDist = dist;
          bestResult = {
            ref: { type: 'breadboard', breadboardId: bb.id, row: railY === BB_RAIL_TOP ? 0 : 2, col: c, rail: 'positive' },
            position: { x: ppx, y: ppy },
          };
        }
        // Negative rail (one hole below positive)
        const npy = bb.position.y + railY + BB_HS;
        dist = Math.sqrt((pos.x - ppx) ** 2 + (pos.y - npy) ** 2);
        if (dist <= tolerance && dist < bestDist) {
          bestDist = dist;
          bestResult = {
            ref: { type: 'breadboard', breadboardId: bb.id, row: railY === BB_RAIL_TOP ? 0 : 2, col: c, rail: 'negative' },
            position: { x: ppx, y: npy },
          };
        }
      }
    }

    // Bus holes (rows 0-9, cols 0-62)
    for (let row = 0; row < 10; row++) {
      for (let c = 0; c < BB_NCOLS; c++) {
        const hx = bb.position.x + BB_COL_X + c * BB_HS;
        const hy = row < BB_ROWS_PER_BUS
          ? bb.position.y + BB_ROW_A + row * BB_HS
          : bb.position.y + BB_ROW_A + BB_ROWS_PER_BUS * BB_HS + BB_GAP + (row - BB_ROWS_PER_BUS) * BB_HS;
        const dist = Math.sqrt((pos.x - hx) ** 2 + (pos.y - hy) ** 2);
        if (dist <= tolerance && dist < bestDist) {
          bestDist = dist;
          bestResult = {
            ref: { type: 'breadboard', breadboardId: bb.id, row, col: c },
            position: { x: hx, y: hy },
          };
        }
      }
    }
  }

  return bestResult;
}

/**
 * Create a wire between two pin references.
 * Generates bezier path, assigns color, and returns a Wire object.
 */
export function createWire(
  startRef: PinRef,
  endRef: PinRef,
  boardModel: BoardModelId,
  boardPosition: Point,
  components: Record<string, PlacedComponent>,
  breadboards: Record<string, PlacedBreadboard>,
): Wire | null {
  const startPos = resolvePinPosition(startRef, boardModel, boardPosition, components, breadboards);
  const endPos = resolvePinPosition(endRef, boardModel, boardPosition, components, breadboards);

  if (!startPos || !endPos) return null;

  const startRole = resolvePinRole(startRef, boardModel, components);
  const endRole = resolvePinRole(endRef, boardModel, components);
  const color = assignWireColor(startRole, endRole);
  const path = generateBezierPath(startPos, endPos);

  return {
    id: wireId(),
    startPinRef: startRef,
    endPinRef: endRef,
    color,
    path,
    validated: false,
    warnings: [],
  };
}
