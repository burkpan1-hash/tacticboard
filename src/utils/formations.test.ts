import { describe, it, expect } from 'vitest'
import { OFFENSE_FORMATIONS, DEFENSE_FORMATIONS } from './formations'

describe('formations', () => {
  it('has 6 offense formations', () => {
    expect(OFFENSE_FORMATIONS).toHaveLength(6)
  })

  it('has 8 defense formations', () => {
    expect(DEFENSE_FORMATIONS).toHaveLength(8)
  })

  it('each offense formation has exactly 5 positions', () => {
    OFFENSE_FORMATIONS.forEach(f => {
      expect(Object.keys(f.positions)).toHaveLength(5)
    })
  })

  it('each defense formation has exactly 5 positions', () => {
    DEFENSE_FORMATIONS.forEach(f => {
      expect(Object.keys(f.positions)).toHaveLength(5)
    })
  })

  it('all positions are normalized (0–1)', () => {
    [...OFFENSE_FORMATIONS, ...DEFENSE_FORMATIONS].forEach(f => {
      Object.values(f.positions).forEach(pos => {
        expect(pos.x).toBeGreaterThanOrEqual(0)
        expect(pos.x).toBeLessThanOrEqual(1)
        expect(pos.y).toBeGreaterThanOrEqual(0)
        expect(pos.y).toBeLessThanOrEqual(1)
      })
    })
  })
})
