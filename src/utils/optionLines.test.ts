import { describe, it, expect } from 'vitest'
import { composeOptionLine, branchOffset, primaryLabel, hasOptions } from './optionLines'
import type { PlaySet, ActionItem } from '../models/types'

function pass(id: string): ActionItem {
  return { id, type: 'pass', fromId: 'o1', toId: 'o2' }
}

const base: PlaySet = {
  id: 's1',
  name: 'Test',
  courtType: 'half',
  players: [],
  initialPositions: {},
  initialBall: { holderId: 'o1' },
  actions: [pass('a1'), pass('a2'), pass('a3'), pass('a4')],
}

describe('composeOptionLine', () => {
  it('returns the primary line unchanged for null', () => {
    expect(composeOptionLine(base, null).map((a) => a.id)).toEqual(['a1', 'a2', 'a3', 'a4'])
  })

  it('shares the primary prefix and appends the option tail', () => {
    const set: PlaySet = {
      ...base,
      options: [{ id: 'opt1', name: 'Layup', branchAfter: 2, actions: [pass('b1'), pass('b2')] }],
    }
    // branchAfter 2 → share a1,a2 then the option's own b1,b2
    expect(composeOptionLine(set, 'opt1').map((a) => a.id)).toEqual(['a1', 'a2', 'b1', 'b2'])
  })

  it('falls back to the primary line for an unknown option id', () => {
    expect(composeOptionLine(base, 'nope').map((a) => a.id)).toEqual(['a1', 'a2', 'a3', 'a4'])
  })
})

describe('branchOffset', () => {
  it('is 0 for the primary line', () => {
    expect(branchOffset(base, null)).toBe(0)
  })
  it('is the option branchAfter for an option', () => {
    const set: PlaySet = { ...base, options: [{ id: 'opt1', name: 'x', branchAfter: 3, actions: [] }] }
    expect(branchOffset(set, 'opt1')).toBe(3)
  })
})

describe('primaryLabel / hasOptions', () => {
  it('defaults the primary label to "Option 1"', () => {
    expect(primaryLabel(base)).toBe('Option 1')
    expect(primaryLabel({ ...base, primaryName: 'UCLA cut layup' })).toBe('UCLA cut layup')
  })
  it('detects presence of options', () => {
    expect(hasOptions(base)).toBe(false)
    expect(hasOptions({ ...base, options: [{ id: 'o', name: 'x', branchAfter: 1, actions: [] }] })).toBe(true)
  })
})
