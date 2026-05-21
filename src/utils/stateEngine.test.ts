import { describe, it, expect } from 'vitest'
import { applyAction, computeStateAtStep } from './stateEngine'
import type { PositionMap, BallState, Action } from '../models/types'

const P: PositionMap = {
  o1: { x: 0.5, y: 0.7 },
  o2: { x: 0.8, y: 0.5 },
  o3: { x: 0.2, y: 0.5 },
}
const B: BallState = { holderId: 'o1' }

describe('applyAction', () => {
  it('pass: transfers ball, no position change', () => {
    const s = applyAction({ id: '1', type: 'pass', fromId: 'o1', toId: 'o2' }, { positions: P, ball: B })
    expect(s.ball.holderId).toBe('o2')
    expect(s.positions).toEqual(P)
  })

  it('cut: moves player, no ball change', () => {
    const s = applyAction({ id: '1', type: 'cut', playerId: 'o2', toPosition: { x: 0.3, y: 0.3 } }, { positions: P, ball: B })
    expect(s.positions.o2).toEqual({ x: 0.3, y: 0.3 })
    expect(s.positions.o1).toEqual(P.o1)
    expect(s.ball).toEqual(B)
  })

  it('dribble: moves ball holder, ball stays on them', () => {
    const s = applyAction({ id: '1', type: 'dribble', playerId: 'o1', toPosition: { x: 0.6, y: 0.6 } }, { positions: P, ball: B })
    expect(s.positions.o1).toEqual({ x: 0.6, y: 0.6 })
    expect(s.ball.holderId).toBe('o1')
  })

  it('screen: moves screener, no ball change', () => {
    const s = applyAction({ id: '1', type: 'screen', screenerId: 'o3', screenPosition: { x: 0.45, y: 0.45 } }, { positions: P, ball: B })
    expect(s.positions.o3).toEqual({ x: 0.45, y: 0.45 })
    expect(s.ball).toEqual(B)
  })

  it('shot: clears ball holder', () => {
    const s = applyAction({ id: '1', type: 'shot', shooterId: 'o1' }, { positions: P, ball: B })
    expect(s.ball.holderId).toBe('')
    expect(s.positions).toEqual(P)
  })

  it('handoff: receiver moves to meetPosition, giver overshoots, ball transfers', () => {
    const s = applyAction({ id: '1', type: 'handoff', fromId: 'o1', toId: 'o2', meetPosition: { x: 0.65, y: 0.6 } }, { positions: P, ball: B })
    expect(s.positions.o2).toEqual({ x: 0.65, y: 0.6 })
    expect(s.positions.o1.x).toBeGreaterThan(0.65)
    expect(s.ball.holderId).toBe('o2')
  })

  it('does not mutate input state', () => {
    const original = { positions: { ...P, o1: { ...P.o1 } }, ball: { ...B } }
    applyAction({ id: '1', type: 'pass', fromId: 'o1', toId: 'o2' }, original)
    expect(original.ball.holderId).toBe('o1')
  })
})

describe('computeStateAtStep', () => {
  const actions: Action[] = [
    { id: '1', type: 'pass',    fromId: 'o1', toId: 'o2' },
    { id: '2', type: 'dribble', playerId: 'o2', toPosition: { x: 0.5, y: 0.5 } },
    { id: '3', type: 'shot',    shooterId: 'o2' },
  ]

  it('step 0 = initial state', () => {
    const s = computeStateAtStep(actions, 0, P, B)
    expect(s.positions).toEqual(P)
    expect(s.ball).toEqual(B)
  })

  it('step 1: ball moved to o2', () => {
    const s = computeStateAtStep(actions, 1, P, B)
    expect(s.ball.holderId).toBe('o2')
    expect(s.positions.o2).toEqual(P.o2)
  })

  it('step 2: o2 moved, still has ball', () => {
    const s = computeStateAtStep(actions, 2, P, B)
    expect(s.positions.o2).toEqual({ x: 0.5, y: 0.5 })
    expect(s.ball.holderId).toBe('o2')
  })

  it('step 3: ball cleared after shot', () => {
    const s = computeStateAtStep(actions, 3, P, B)
    expect(s.ball.holderId).toBe('')
  })

  it('step beyond actions = final state', () => {
    const s = computeStateAtStep(actions, 99, P, B)
    expect(s.ball.holderId).toBe('')
  })
})
