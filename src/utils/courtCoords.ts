import type { NormalizedPosition } from '../models/types'

export const COURT_SCALE = 1.4

export const HALF_COURT_W = 700   // 500 * 1.4
export const HALF_COURT_H = 658   // 470 * 1.4
export const FULL_COURT_W = 700
export const FULL_COURT_H = 1316  // 940 * 1.4
export const COURT_PADDING_X = 42 // 30 * 1.4
export const COURT_PADDING_Y = 70 // OOB zone above/below baselines (≈5ft at 1.4× scale)

export function normalize(
  px: number, py: number,
  canvasW: number, canvasH: number
): NormalizedPosition {
  return { x: px / canvasW, y: py / canvasH }
}

export function denormalize(
  nx: number, ny: number,
  canvasW: number, canvasH: number
): { x: number; y: number } {
  return { x: nx * canvasW, y: ny * canvasH }
}

// Half-court key measurements (pixels, for 700×658 canvas, 1.4× scale)
// Scale: 14px = 1ft (50ft wide, 47ft long)
export const HALF_COURT = {
  W: HALF_COURT_W,
  H: HALF_COURT_H,
  basket:       { x: 350, y:  42 },
  keyLeft:      238,
  keyRight:     462,
  keyBottom:    266,
  ftCircle:     { cx: 350, cy: 266, r:  84 },
  restricted:   { cx: 350, cy:  42, r:  40 },
  threeCornerX: { left: 42, right: 658 },
  threeCornerY: 202,
  threeArc:     { cx: 350, cy:  74, r: 333 },
} as const
