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

  it('each defense formation has 5 defense positions, and optionally 5 offense positions', () => {
    DEFENSE_FORMATIONS.forEach(f => {
      const defKeys = Object.keys(f.positions).filter(k => k.startsWith('d'))
      const offKeys = Object.keys(f.positions).filter(k => k.startsWith('o'))
      expect(defKeys).toHaveLength(5)
      expect([0, 5]).toContain(offKeys.length)
    })
  })

  it('all positions are within valid range (x: 0–1, y: -0.1–1.1 to allow out-of-bounds)', () => {
    [...OFFENSE_FORMATIONS, ...DEFENSE_FORMATIONS].forEach(f => {
      Object.values(f.positions).forEach(pos => {
        expect(pos.x).toBeGreaterThanOrEqual(0)
        expect(pos.x).toBeLessThanOrEqual(1)
        expect(pos.y).toBeGreaterThanOrEqual(-0.1)
        expect(pos.y).toBeLessThanOrEqual(1.1)
      })
    })
  })
})
