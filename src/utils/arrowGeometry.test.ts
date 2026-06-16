import { describe, it, expect } from 'vitest'
import { wavyAlongPath } from './arrowGeometry'

// Pull the y components out of a flat [x,y,x,y,...] point list.
function ys(flat: number[]): number[] {
  return flat.filter((_, i) => i % 2 === 1)
}

describe('wavyAlongPath', () => {
  it('produces a visible wave on a straight path sampled at the old alias spacing (15px)', () => {
    // Dribble waypoints are recorded every 15px; the wave period is 30px. The old
    // per-input-point sampling put every point on a sine zero-crossing → dead straight.
    const pts = Array.from({ length: 9 }, (_, i) => ({ x: i * 15, y: 0 }))
    const maxOffset = Math.max(...ys(wavyAlongPath(pts)).map(Math.abs))
    expect(maxOffset).toBeGreaterThan(3) // clearly off the straight line
  })

  it('returns a degenerate segment when the path has zero length', () => {
    const flat = wavyAlongPath([{ x: 5, y: 5 }, { x: 5, y: 5 }])
    expect(flat).toEqual([5, 5, 5, 5])
  })
})
