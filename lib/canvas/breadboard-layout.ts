/**
 * Canonical breadboard layout constants.
 * These are the single source of truth used by:
 *  - BreadboardRenderer (drawing)
 *  - wiring/engine.ts (position resolution)
 *  - canvas/snap.ts (snap-to-hole)
 *
 * All measurements are in pixels unless suffixed _MM.
 */

/** px per mm for breadboard rendering */
export const BB_S = 3;

/** Hole pitch in mm (standard 0.1" / 2.54mm) */
export const HOLE_SPACING_MM = 2.54;

/** Hole pitch in pixels */
export const HOLE_STEP = HOLE_SPACING_MM * BB_S; // ≈ 7.62 px

/** Number of tie-point columns */
export const BB_COLS = 63;

/** Number of rows per bus group (a-e  or  f-j) */
export const BB_ROWS_PER_BUS = 5;

/** Total hole rows (a–j) */
export const BB_ROWS = BB_ROWS_PER_BUS * 2;

// ── Pixel offsets from the breadboard Group origin ──────────────────────────

/** X of the first column of holes */
export const COL_START_X = 10 * BB_S; // 30 px

/** Y of the top positive power rail */
export const RAIL_TOP_Y = 5 * BB_S; // 15 px

/** Y of the bottom positive power rail */
export const RAIL_BOT_Y = 48 * BB_S; // 144 px

/** Y of the first bus row (row a) */
export const ROW_A_Y = 15 * BB_S; // 45 px

/** Height of the center gap between bus groups */
export const GAP_Y = 5 * BB_S; // 15 px

/** Y of the first bottom bus row (row f) */
export const ROW_F_Y = ROW_A_Y + BB_ROWS_PER_BUS * HOLE_STEP + GAP_Y;

// ── Board pixel dimensions ───────────────────────────────────────────────────

export const BB_WIDTH = 165 * BB_S; // 495 px
export const BB_HEIGHT = 55 * BB_S; // 165 px

// ── Hole appearance ──────────────────────────────────────────────────────────
export const HOLE_RADIUS = 1.8; // px
