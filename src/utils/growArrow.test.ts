import { describe, it, expect } from 'vitest'
import { truncatePath, shortenPathEnd, pathLength, type Pt } from './growArrow'

describe('truncatePath', () => {
  it('returns just the start at frac 0', () => {
    expect(truncatePath([{ x: 0, y: 0 }, { x: 100, y: 0 }], 0)).toEqual([{ x: 0, y: 0 }])
  })

  it('returns the half point at frac 0.5 on a straight line', () => {
    const r = truncatePath([{ x: 0, y: 0 }, { x: 100, y: 0 }], 0.5)
    expect(r[r.length - 1]).toEqual({ x: 50, y: 0 })
  })

  it('follows a multi-segment path by arc length', () => {
    // total length 200; 0.75 -> 150 -> through the corner, 50 into the second leg
    const path: Pt[] = [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 100 }]
    const r = truncatePath(path, 0.75)
    expect(r[r.length - 1]).toEqual({ x: 100, y: 50 })
    expect(r).toHaveLength(3)
  })

  it('returns the full path at frac 1', () => {
    const r = truncatePath([{ x: 0, y: 0 }, { x: 100, y: 0 }], 1)
    expect(r[r.length - 1]).toEqual({ x: 100, y: 0 })
  })
})

describe('shortenPathEnd', () => {
  it('trims the requested length off the end', () => {
    const r = shortenPathEnd([{ x: 0, y: 0 }, { x: 100, y: 0 }], 20)
    expect(r[r.length - 1]).toEqual({ x: 80, y: 0 })
  })

  it('drops whole segments when trimming past them', () => {
    const r = shortenPathEnd([{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 30 }], 40)
    expect(pathLength(r)).toBeCloseTo(90, 5) // 130 total - 40
  })
})
