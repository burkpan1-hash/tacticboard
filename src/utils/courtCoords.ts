import type { NormalizedPosition } from '../models/types'

export const HALF_COURT_W = 500
export const HALF_COURT_H = 470
export const FULL_COURT_W = 500
export const FULL_COURT_H = 940
export const COURT_PADDING_X = 30

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

// Half-court key measurements (pixels, for 500×470 canvas)
// Scale: 10px = 1ft (50ft wide, 47ft long)
export const HALF_COURT = {
  W: HALF_COURT_W,
  H: HALF_COURT_H,
  basket:       { x: 250, y: 53  },
  keyLeft:      170,
  keyRight:     330,
  keyBottom:    190,
  ftCircle:     { cx: 250, cy: 190, r: 60  },
  restricted:   { cx: 250, cy: 53,  r: 40  },
  threeCornerX: { left: 30, right: 470 },
  threeCornerY: 144,
  threeArc:     { cx: 250, cy: 53,  r: 238 },
} as const
