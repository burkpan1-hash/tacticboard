import { describe, it, expect } from 'vitest'
import { placeActionLabel, pointSegDist, type Segment } from './labelPlacement'

// Horizontal arrow; its perpendicular is vertical, so labels sit above/below at y = 100 ± 20.
const arrow: Segment = { x1: 0, y1: 100, x2: 100, y2: 100 }
const playerR = 24

describe('placeActionLabel', () => {
  it('never places the label on the arrow (always offset off the line)', () => {
    const { cx, cy } = placeActionLabel(arrow, [], [arrow], playerR)
    // distance from the chosen point to the arrow line must be clearly non-zero
    expect(pointSegDist(cx, cy, arrow)).toBeGreaterThanOrEqual(19)
    // default lands at the nearest offset on one side
    expect(cx).toBeCloseTo(50, 5)
    expect(Math.abs(cy - 100)).toBeCloseTo(20, 5)
  })

  it('moves to the opposite side when a player blocks the default spot', () => {
    // default spot is (50, 120); put a player exactly there
    const blocked = placeActionLabel(arrow, [{ x: 50, y: 120 }], [arrow], playerR)
    expect(blocked.cy).toBeCloseTo(80, 5) // flipped above the arrow
  })

  it('moves away when another arrow overlaps the default spot', () => {
    // another arrow lying along y = 120 across the midpoint blocks the (50,120) spot
    const other: Segment = { x1: 30, y1: 120, x2: 70, y2: 120 }
    const moved = placeActionLabel(arrow, [], [arrow, other], playerR)
    expect(pointSegDist(moved.cx, moved.cy, other)).toBeGreaterThanOrEqual(14)
    expect(moved.cy).toBeCloseTo(80, 5) // chose the free side
  })
})
