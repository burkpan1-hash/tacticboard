import { describe, it, expect } from 'vitest'
import { arrowLine } from './actionArrows'
import type { Action, PositionMap } from '../models/types'
import { HALF_COURT_W } from './courtCoords'

const cH = 658

describe('arrowLine', () => {
  it('returns endpoints between two players for a pass', () => {
    const positions: PositionMap = {
      o1: { x: 0.25, y: 0.5 },
      o2: { x: 0.75, y: 0.5 },
    }
    const action = { id: 'a', type: 'pass', fromId: 'o1', toId: 'o2' } as Action
    const line = arrowLine(action, positions, cH, 42)
    expect(line).not.toBeNull()
    // x is denormalized against HALF_COURT_W; from < to
    expect(line!.x1).toBeLessThan(line!.x2)
    expect(line!.x1).toBeCloseTo(0.25 * HALF_COURT_W, 0)
  })

  it('returns null when a referenced player is missing', () => {
    const action = { id: 'a', type: 'pass', fromId: 'o1', toId: 'o2' } as Action
    expect(arrowLine(action, { o1: { x: 0.5, y: 0.5 } }, cH, 42)).toBeNull()
  })
})
