import { describe, it, expect } from 'vitest'
import { normalize, denormalize, HALF_COURT_W, HALF_COURT_H } from './courtCoords'

describe('normalize', () => {
  it('converts center pixel to (0.5, 0.5)', () => {
    const result = normalize(HALF_COURT_W / 2, HALF_COURT_H / 2, HALF_COURT_W, HALF_COURT_H)
    expect(result).toEqual({ x: 0.5, y: 0.5 })
  })

  it('converts top-left pixel to (0, 0)', () => {
    expect(normalize(0, 0, HALF_COURT_W, HALF_COURT_H)).toEqual({ x: 0, y: 0 })
  })

  it('converts bottom-right pixel to (1, 1)', () => {
    expect(normalize(HALF_COURT_W, HALF_COURT_H, HALF_COURT_W, HALF_COURT_H)).toEqual({ x: 1, y: 1 })
  })
})

describe('denormalize', () => {
  it('converts (0.5, 0.5) to canvas center', () => {
    const result = denormalize(0.5, 0.5, HALF_COURT_W, HALF_COURT_H)
    expect(result).toEqual({ x: HALF_COURT_W / 2, y: HALF_COURT_H / 2 })
  })

  it('is the inverse of normalize', () => {
    const px = { x: 123, y: 89 }
    const norm = normalize(px.x, px.y, HALF_COURT_W, HALF_COURT_H)
    const back = denormalize(norm.x, norm.y, HALF_COURT_W, HALF_COURT_H)
    expect(back.x).toBeCloseTo(px.x)
    expect(back.y).toBeCloseTo(px.y)
  })
})
