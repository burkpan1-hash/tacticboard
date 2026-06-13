import { describe, it, expect } from 'vitest'
import { computeFitRect } from './composite'

describe('computeFitRect', () => {
  it('fits a portrait source into a 9:16 canvas, centered with letterbox', () => {
    const r = computeFitRect(800, 1000, 1080, 1920)
    // scale = min(1080/800, 1920/1000) = min(1.35, 1.92) = 1.35
    expect(r.w).toBe(1080)
    expect(r.h).toBe(1350)
    expect(r.x).toBe(0)
    expect(r.y).toBe(285) // (1920 - 1350) / 2
  })

  it('fits a wide source into a 1:1 canvas', () => {
    const r = computeFitRect(1600, 900, 1080, 1080)
    // scale = min(1080/1600, 1080/900) = 0.675
    expect(r.w).toBe(1080)
    expect(r.h).toBe(608) // round(900 * 0.675)
    expect(r.x).toBe(0)
    expect(r.y).toBe(236) // round((1080 - 608) / 2)
  })
})
