import { describe, it, expect } from 'vitest'
import { computeFrameState } from './frameState'
import { HALF_COURT_H } from './courtCoords'
import type { PlaySet } from '../models/types'

const basketY = 42 / HALF_COURT_H
const cH = HALF_COURT_H

function baseSet(): PlaySet {
  return {
    id: 's1', name: 'test', courtType: 'half',
    players: [{ id: 'o1', number: 1, team: 'offense' }],
    initialPositions: { o1: { x: 0.2, y: 0.5 } },
    initialBall: { holderId: 'o1' },
    actions: [{ id: 'a1', type: 'cut', playerId: 'o1', toPosition: { x: 0.8, y: 0.5 } }],
  } as unknown as PlaySet
}

describe('computeFrameState', () => {
  it('returns the static position when not playing', () => {
    const f = computeFrameState(baseSet(), 0, 0, false, basketY, cH)
    expect(f.displayPositions.o1.x).toBeCloseTo(0.2)
  })

  it('interpolates linearly to the midpoint at fraction 0.5', () => {
    const f = computeFrameState(baseSet(), 0, 0.5, true, basketY, cH)
    expect(f.displayPositions.o1.x).toBeCloseTo(0.5, 5) // 0.2 -> 0.8 midpoint
  })

  it('clamps to the static end state past the last step', () => {
    const f = computeFrameState(baseSet(), 1, 1, true, basketY, cH)
    expect(f.displayPositions.o1.x).toBeCloseTo(0.8)
  })

  // Regression: a multi-waypoint cut's animated path must end exactly at
  // toPosition. If the path array omits it, the animation stalls at the last
  // waypoint and the player visibly teleports to toPosition the instant the
  // step completes and computeStateAtStep takes over.
  it('reaches toPosition (not the last waypoint) at the end of a multi-waypoint cut', () => {
    const set: PlaySet = {
      id: 's1', name: 'test', courtType: 'half',
      players: [{ id: 'o1', number: 1, team: 'offense' }],
      initialPositions: { o1: { x: 0.2, y: 0.5 } },
      initialBall: { holderId: 'o1' },
      actions: [{
        id: 'a1', type: 'cut', playerId: 'o1',
        waypoints: [{ x: 0.4, y: 0.5 }, { x: 0.6, y: 0.5 }],
        toPosition: { x: 0.8, y: 0.5 },
      }],
    } as unknown as PlaySet
    const f = computeFrameState(set, 0, 1, true, basketY, cH)
    expect(f.displayPositions.o1.x).toBeCloseTo(0.8, 5)
  })
})
